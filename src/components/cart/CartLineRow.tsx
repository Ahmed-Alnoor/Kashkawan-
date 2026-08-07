"use client";

import type { MenuItem } from "@/data/menu-types";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n";
import { fill } from "@/i18n";
import { formatMoney, listJoin } from "@/lib/format";
import { unitPrice, type CartLine } from "@/lib/pricing";
import { DishImage } from "@/components/menu/DishImage";
import { QuantityStepper } from "@/components/menu/DishDrawer";
import { IconClose } from "@/components/ui/Icons";

/** Human-readable summary of everything the customer chose for one line. */
export function describeSelections(
  item: MenuItem,
  line: CartLine,
  locale: Locale,
): { options: string[]; removed: string[]; notes: string } {
  const options: string[] = [];

  for (const group of item.optionGroups) {
    if (group.kind === "single") {
      const choice = group.choices.find((c) => c.id === line.selections.single[group.id]);
      // Skip the neutral default (regular dough, medium size shows anyway).
      if (choice) options.push(`${group.label[locale]}: ${choice.label[locale]}`);
    } else if (group.kind === "multi") {
      for (const id of line.selections.multi[group.id] ?? []) {
        const choice = group.choices.find((c) => c.id === id);
        if (choice) options.push(choice.label[locale]);
      }
    } else {
      const count = line.selections.counters[group.id] ?? 0;
      if (count > 0) options.push(`${group.label[locale]} × ${count}`);
    }
  }

  const removed = line.selections.removed
    .map((key) => item.removable.find((r) => r.en === key)?.[locale])
    .filter((value): value is string => Boolean(value));

  return { options, removed, notes: line.selections.notes.trim() };
}

export function CartLineRow({
  item,
  line,
  locale,
  dict,
  onQuantity,
  onRemove,
  onEdit,
}: {
  item: MenuItem;
  line: CartLine;
  locale: Locale;
  dict: Dictionary;
  onQuantity: (quantity: number) => void;
  onRemove: () => void;
  onEdit: () => void;
}) {
  const { options, removed, notes } = describeSelections(item, line, locale);
  const each = unitPrice(item, line.selections);

  return (
    <li className="flex gap-4 py-5">
      <button
        type="button"
        onClick={onEdit}
        aria-label={fill(dict.cart.editItem, { name: item.name[locale] })}
        className="group relative size-20 shrink-0 overflow-hidden rounded-xl sm:size-24"
      >
        <DishImage
          item={item}
          locale={locale}
          sizes="96px"
          rounded="rounded-xl"
        />
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-semibold text-ink">
              <button
                type="button"
                onClick={onEdit}
                className="text-start hover:text-heritage hover:underline hover:underline-offset-4"
              >
                {item.name[locale]}
              </button>
            </h3>
            {item.portion && (
              <p className="mt-0.5 text-xs text-ink-faint">{item.portion[locale]}</p>
            )}
          </div>

          <button
            type="button"
            onClick={onRemove}
            aria-label={fill(dict.cart.removeItem, { name: item.name[locale] })}
            className="-me-1.5 -mt-1 inline-flex size-8 shrink-0 items-center justify-center rounded-full text-ink-faint transition-colors duration-200 hover:bg-danger/8 hover:text-danger"
          >
            <IconClose className="size-4" />
          </button>
        </div>

        {options.length > 0 && (
          <ul className="mt-2 space-y-0.5 text-sm text-ink-muted">
            {options.map((option) => (
              <li key={option}>{option}</li>
            ))}
          </ul>
        )}

        {removed.length > 0 && (
          <p className="mt-1.5 text-sm text-danger">
            {dict.cart.without}: {listJoin(removed, locale)}
          </p>
        )}

        {notes && (
          <p className="mt-1.5 text-sm text-ink-muted italic">
            {dict.cart.notes}: {notes}
          </p>
        )}

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <QuantityStepper
            value={line.quantity}
            onChange={onQuantity}
            dict={dict}
            label={item.name[locale]}
            min={1}
            compact
          />
          <div className="text-end">
            <p className="tabular font-bold text-heritage">
              {formatMoney(each * line.quantity, locale)}
            </p>
            {line.quantity > 1 && (
              <p className="tabular text-xs text-ink-faint">
                {formatMoney(each, locale)} {dict.common.each}
              </p>
            )}
          </div>
        </div>
      </div>
    </li>
  );
}
