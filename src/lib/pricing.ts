import type { MenuItem, OptionGroup } from "@/data/menu-types";
import { getItem } from "@/data/menu";

/** What the customer configured for one line in the basket. */
export type LineSelections = {
  /** Group id -> selected choice id, for `single` groups. */
  single: Record<string, string>;
  /** Group id -> selected choice ids, for `multi` groups. */
  multi: Record<string, string[]>;
  /** Group id -> count, for `counter` groups. */
  counters: Record<string, number>;
  /** Ingredient labels (English key) the customer asked us to leave out. */
  removed: string[];
  notes: string;
};

export type CartLine = {
  /** Stable per-line id — the same dish configured twice makes two lines. */
  lineId: string;
  itemId: string;
  quantity: number;
  selections: LineSelections;
};

export const emptySelections = (): LineSelections => ({
  single: {},
  multi: {},
  counters: {},
  removed: [],
  notes: "",
});

/** Defaults for a dish: preselects every `isDefault` choice on single groups. */
export const defaultSelections = (item: MenuItem): LineSelections => {
  const selections = emptySelections();
  for (const group of item.optionGroups) {
    if (group.kind === "single") {
      const preset = group.choices.find((c) => c.isDefault);
      if (preset) selections.single[group.id] = preset.id;
    }
  }
  return selections;
};

/**
 * Unit price in AED = base price + every selected delta + counted extras.
 * All menu prices are whole or half dirhams, so we round to 2 decimals to
 * keep floating point out of the totals.
 */
export const unitPrice = (item: MenuItem, selections: LineSelections): number => {
  let total = item.basePrice;

  for (const group of item.optionGroups) {
    if (group.kind === "single") {
      const choiceId = selections.single[group.id];
      const choice = group.choices.find((c) => c.id === choiceId);
      if (choice) total += choice.priceDelta;
    } else if (group.kind === "multi") {
      for (const choiceId of selections.multi[group.id] ?? []) {
        const choice = group.choices.find((c) => c.id === choiceId);
        if (choice) total += choice.priceDelta;
      }
    } else {
      const count = clampCounter(group, selections.counters[group.id] ?? 0);
      total += count * group.unitPrice;
    }
  }

  return round2(total);
};

export const linePrice = (item: MenuItem, line: CartLine): number =>
  round2(unitPrice(item, line.selections) * line.quantity);

export const round2 = (n: number): number => Math.round(n * 100) / 100;

export const clampCounter = (
  group: Extract<OptionGroup, { kind: "counter" }>,
  value: number,
): number => Math.max(0, Math.min(group.max, Math.trunc(value) || 0));

/** Every required `single` group must have a valid selection. */
export const missingRequired = (item: MenuItem, selections: LineSelections): string[] =>
  item.optionGroups
    .filter(
      (g): g is Extract<OptionGroup, { kind: "single" }> =>
        g.kind === "single" && g.required,
    )
    .filter((g) => {
      const chosen = selections.single[g.id];
      return !chosen || !g.choices.some((c) => c.id === chosen);
    })
    .map((g) => g.id);

export const isValidLine = (item: MenuItem, selections: LineSelections): boolean =>
  missingRequired(item, selections).length === 0;

export const cartSubtotal = (lines: CartLine[]): number =>
  round2(
    lines.reduce((sum, line) => {
      const item = getItem(line.itemId);
      return item ? sum + linePrice(item, line) : sum;
    }, 0),
  );

export const cartCount = (lines: CartLine[]): number =>
  lines.reduce((n, line) => n + line.quantity, 0);

/**
 * A signature for a configuration. Two lines with identical dish + options +
 * removals + notes merge instead of stacking, which is what customers expect
 * when they quick-add the same thing twice.
 */
export const selectionSignature = (itemId: string, s: LineSelections): string =>
  JSON.stringify([
    itemId,
    Object.entries(s.single).sort(),
    Object.entries(s.multi)
      .map(([k, v]) => [k, [...v].sort()] as const)
      .sort(),
    Object.entries(s.counters)
      .filter(([, v]) => v > 0)
      .sort(),
    [...s.removed].sort(),
    s.notes.trim(),
  ]);

export const MAX_NOTE_LENGTH = 280;
export const MAX_QUANTITY = 50;
