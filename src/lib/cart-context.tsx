"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  cartCount,
  cartSubtotal,
  MAX_QUANTITY,
  selectionSignature,
  type CartLine,
  type LineSelections,
} from "./pricing";
import { getItem } from "@/data/menu";

const STORAGE_KEY = "kashkawan.cart.v1";

type State = { lines: CartLine[]; hydrated: boolean };

type Action =
  | { type: "hydrate"; lines: CartLine[] }
  | { type: "add"; itemId: string; selections: LineSelections; quantity: number }
  | { type: "setQuantity"; lineId: string; quantity: number }
  | { type: "update"; lineId: string; selections: LineSelections; quantity: number }
  | { type: "remove"; lineId: string }
  | { type: "restore"; index: number; line: CartLine }
  | { type: "clear" };

const newLineId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `line-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const clampQty = (n: number) => Math.max(1, Math.min(MAX_QUANTITY, Math.trunc(n) || 1));

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "hydrate":
      return { lines: action.lines, hydrated: true };

    case "add": {
      const signature = selectionSignature(action.itemId, action.selections);
      const existing = state.lines.findIndex(
        (l) => selectionSignature(l.itemId, l.selections) === signature,
      );
      if (existing !== -1) {
        const lines = [...state.lines];
        lines[existing] = {
          ...lines[existing],
          quantity: clampQty(lines[existing].quantity + action.quantity),
        };
        return { ...state, lines };
      }
      return {
        ...state,
        lines: [
          ...state.lines,
          {
            lineId: newLineId(),
            itemId: action.itemId,
            quantity: clampQty(action.quantity),
            selections: action.selections,
          },
        ],
      };
    }

    case "setQuantity": {
      if (action.quantity < 1) {
        return { ...state, lines: state.lines.filter((l) => l.lineId !== action.lineId) };
      }
      return {
        ...state,
        lines: state.lines.map((l) =>
          l.lineId === action.lineId ? { ...l, quantity: clampQty(action.quantity) } : l,
        ),
      };
    }

    case "update": {
      const target = state.lines.find((l) => l.lineId === action.lineId);
      if (!target) return state;
      const signature = selectionSignature(target.itemId, action.selections);
      // Editing a line into an existing configuration merges the two.
      const twin = state.lines.find(
        (l) =>
          l.lineId !== action.lineId &&
          selectionSignature(l.itemId, l.selections) === signature,
      );
      if (twin) {
        return {
          ...state,
          lines: state.lines
            .filter((l) => l.lineId !== action.lineId)
            .map((l) =>
              l.lineId === twin.lineId
                ? { ...l, quantity: clampQty(l.quantity + action.quantity) }
                : l,
            ),
        };
      }
      return {
        ...state,
        lines: state.lines.map((l) =>
          l.lineId === action.lineId
            ? { ...l, selections: action.selections, quantity: clampQty(action.quantity) }
            : l,
        ),
      };
    }

    case "remove":
      return { ...state, lines: state.lines.filter((l) => l.lineId !== action.lineId) };

    case "restore": {
      const lines = [...state.lines];
      lines.splice(Math.min(action.index, lines.length), 0, action.line);
      return { ...state, lines };
    }

    case "clear":
      return { ...state, lines: [] };

    default:
      return state;
  }
}

/** Only keeps lines whose dish still exists on the menu. */
function parseStored(raw: string | null): CartLine[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap((entry): CartLine[] => {
      if (typeof entry !== "object" || entry === null) return [];
      const line = entry as Partial<CartLine>;
      if (typeof line.itemId !== "string" || !getItem(line.itemId)) return [];
      const s = line.selections;
      if (typeof s !== "object" || s === null) return [];
      return [
        {
          lineId: typeof line.lineId === "string" ? line.lineId : newLineId(),
          itemId: line.itemId,
          quantity: clampQty(Number(line.quantity)),
          selections: {
            single: (s.single as Record<string, string>) ?? {},
            multi: (s.multi as Record<string, string[]>) ?? {},
            counters: (s.counters as Record<string, number>) ?? {},
            removed: Array.isArray(s.removed) ? (s.removed as string[]) : [],
            notes: typeof s.notes === "string" ? s.notes : "",
          },
        },
      ];
    });
  } catch {
    return [];
  }
}

type RemovedLine = { line: CartLine; index: number; name: string } | null;

type CartValue = {
  lines: CartLine[];
  hydrated: boolean;
  count: number;
  subtotal: number;
  isOpen: boolean;
  lastRemoved: RemovedLine;
  /** Increments whenever something is added — drives the cart-button pulse. */
  addPulse: number;
  addLine: (itemId: string, selections: LineSelections, quantity?: number) => void;
  updateLine: (lineId: string, selections: LineSelections, quantity: number) => void;
  setQuantity: (lineId: string, quantity: number) => void;
  removeLine: (lineId: string, name: string) => void;
  undoRemove: () => void;
  clear: () => void;
  openCart: () => void;
  closeCart: () => void;
};

const CartContext = createContext<CartValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { lines: [], hydrated: false });
  const [isOpen, setIsOpen] = useState(false);
  const [lastRemoved, setLastRemoved] = useState<RemovedLine>(null);
  const [addPulse, setAddPulse] = useState(0);
  const undoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Hydrate from localStorage once, after mount, so SSR markup matches.
  useEffect(() => {
    dispatch({ type: "hydrate", lines: parseStored(window.localStorage.getItem(STORAGE_KEY)) });
  }, []);

  // Persist after every change (but never before hydration, or we would
  // overwrite a stored basket with an empty one).
  useEffect(() => {
    if (!state.hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.lines));
    } catch {
      // Storage can be full or blocked (private mode). The basket still works
      // for this session; there is nothing useful to tell the customer.
    }
  }, [state.lines, state.hydrated]);

  // Keep the basket in step across tabs.
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) return;
      dispatch({ type: "hydrate", lines: parseStored(event.newValue) });
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => () => { if (undoTimer.current) clearTimeout(undoTimer.current); }, []);

  const addLine = useCallback(
    (itemId: string, selections: LineSelections, quantity = 1) => {
      dispatch({ type: "add", itemId, selections, quantity });
      setAddPulse((n) => n + 1);
    },
    [],
  );

  const removeLine = useCallback(
    (lineId: string, name: string) => {
      const index = state.lines.findIndex((l) => l.lineId === lineId);
      const line = state.lines[index];
      dispatch({ type: "remove", lineId });
      if (line) {
        setLastRemoved({ line, index, name });
        if (undoTimer.current) clearTimeout(undoTimer.current);
        undoTimer.current = setTimeout(() => setLastRemoved(null), 8000);
      }
    },
    [state.lines],
  );

  const undoRemove = useCallback(() => {
    setLastRemoved((current) => {
      if (current) dispatch({ type: "restore", index: current.index, line: current.line });
      return null;
    });
    if (undoTimer.current) clearTimeout(undoTimer.current);
  }, []);

  const value = useMemo<CartValue>(
    () => ({
      lines: state.lines,
      hydrated: state.hydrated,
      count: cartCount(state.lines),
      subtotal: cartSubtotal(state.lines),
      isOpen,
      lastRemoved,
      addPulse,
      addLine,
      updateLine: (lineId, selections, quantity) =>
        dispatch({ type: "update", lineId, selections, quantity }),
      setQuantity: (lineId, quantity) => dispatch({ type: "setQuantity", lineId, quantity }),
      removeLine,
      undoRemove,
      clear: () => {
        dispatch({ type: "clear" });
        setLastRemoved(null);
      },
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
    }),
    [state.lines, state.hydrated, isOpen, lastRemoved, addPulse, addLine, removeLine, undoRemove],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartValue {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside <CartProvider>");
  return context;
}

/** Clears the basket after a successful order. Exported for the API flow. */
export const CART_STORAGE_KEY = STORAGE_KEY;
