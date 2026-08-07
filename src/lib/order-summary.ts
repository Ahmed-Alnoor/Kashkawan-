import { getItem } from "@/data/menu";
import { AREA_INDEX, feeForArea, PAYMENT_METHODS } from "@/data/delivery";
import type { Locale } from "@/i18n/config";
import { formatPrice } from "./format";
import { round2, unitPrice } from "./pricing";
import type { OrderInput, OrderLineInput } from "./order-schema";

/**
 * Turns a validated order into a priced, human-readable summary.
 *
 * Prices are recomputed here from the menu data — the client's numbers are
 * never used. This is the single place both the emails and the confirmation
 * page get their totals from, so the customer, the branch and the screen can
 * never disagree.
 */

export type PricedLine = {
  itemId: string;
  name: { en: string; ar: string };
  quantity: number;
  unit: number;
  total: number;
  options: { en: string[]; ar: string[] };
  removed: { en: string[]; ar: string[] };
  notes: string;
};

export type PricedOrder = {
  lines: PricedLine[];
  subtotal: number;
  /** null when the fee has not been published for that area. */
  deliveryFee: number | null;
  /** subtotal + fee when known; otherwise the subtotal alone. */
  total: number;
  feeIsPending: boolean;
};

const describeLine = (line: OrderLineInput): PricedLine | null => {
  const item = getItem(line.itemId);
  if (!item) return null;

  const options = { en: [] as string[], ar: [] as string[] };

  for (const group of item.optionGroups) {
    if (group.kind === "single") {
      const choice = group.choices.find((c) => c.id === line.selections.single[group.id]);
      if (choice) {
        options.en.push(`${group.label.en}: ${choice.label.en}`);
        options.ar.push(`${group.label.ar}: ${choice.label.ar}`);
      }
    } else if (group.kind === "multi") {
      for (const id of line.selections.multi[group.id] ?? []) {
        const choice = group.choices.find((c) => c.id === id);
        if (choice) {
          options.en.push(choice.label.en);
          options.ar.push(choice.label.ar);
        }
      }
    } else {
      const count = line.selections.counters[group.id] ?? 0;
      if (count > 0) {
        options.en.push(`${group.label.en} × ${count}`);
        options.ar.push(`${group.label.ar} × ${count}`);
      }
    }
  }

  const removed = { en: [] as string[], ar: [] as string[] };
  for (const key of line.selections.removed) {
    const ingredient = item.removable.find((r) => r.en === key);
    if (ingredient) {
      removed.en.push(ingredient.en);
      removed.ar.push(ingredient.ar);
    }
  }

  const unit = unitPrice(item, {
    single: line.selections.single,
    multi: line.selections.multi,
    counters: line.selections.counters,
    removed: line.selections.removed,
    notes: line.selections.notes,
  });

  return {
    itemId: item.id,
    name: { en: item.name.en, ar: item.name.ar },
    quantity: line.quantity,
    unit,
    total: round2(unit * line.quantity),
    options,
    removed,
    notes: line.selections.notes.trim(),
  };
};

export const priceOrder = (order: OrderInput): PricedOrder => {
  const lines = order.lines
    .map(describeLine)
    .filter((line): line is PricedLine => line !== null);

  const subtotal = round2(lines.reduce((sum, line) => sum + line.total, 0));

  const deliveryFee =
    order.fulfilment === "delivery" && order.address
      ? feeForArea(order.address.areaId)
      : 0;

  const feeIsPending = order.fulfilment === "delivery" && deliveryFee === null;

  return {
    lines,
    subtotal,
    deliveryFee,
    total: round2(subtotal + (deliveryFee ?? 0)),
    feeIsPending,
  };
};

export const areaName = (areaId: string, locale: Locale): string =>
  AREA_INDEX.get(areaId)?.name[locale] ?? areaId;

export const paymentLabel = (id: string, locale: Locale): string =>
  PAYMENT_METHODS.find((p) => p.id === id)?.label[locale] ?? id;

/** "12 AED" — used inside the plain-text email bodies. */
export const money = (amount: number, locale: Locale): string =>
  locale === "ar" ? `${formatPrice(amount)} درهم` : `${formatPrice(amount)} AED`;
