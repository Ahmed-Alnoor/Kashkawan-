"use client";

import type { MenuItem } from "@/data/menu-types";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n";
import { fill } from "@/i18n";
import { formatMoney } from "@/lib/format";
import { DishImage } from "./DishImage";
import { IconPlus } from "@/components/ui/Icons";

/**
 * One dish in the menu grid. The whole card opens the detail drawer; the
 * quick-add button is a separate control layered on top, so keyboard users get
 * two distinct, clearly-labelled actions rather than one ambiguous target.
 */
export function DishCard({
  item,
  locale,
  dict,
  onOpen,
  onQuickAdd,
  index = 0,
}: {
  item: MenuItem;
  locale: Locale;
  dict: Dictionary;
  onOpen: () => void;
  onQuickAdd: () => void;
  index?: number;
}) {
  const hasChoices = item.optionGroups.some((g) => g.kind === "single" && g.required);
  const priceLabel = hasChoices
    ? `${dict.common.from} ${formatMoney(item.basePrice, locale)}`
    : formatMoney(item.basePrice, locale);

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-card border border-paper-edge bg-white/70 shadow-warm-sm transition-[box-shadow,border-color,transform] duration-300 ease-out hover:-translate-y-0.5 hover:border-heritage/25 hover:shadow-warm focus-within:border-heritage/40">
      <div className="relative aspect-[4/3] overflow-hidden">
        <DishImage
          item={item}
          locale={locale}
          sizes="(min-width: 1280px) 20rem, (min-width: 768px) 33vw, 50vw"
          rounded="rounded-none"
          priority={index < 4}
        />
        {item.signature && (
          <span className="absolute start-3 top-3 rounded-full bg-toast/95 px-2.5 py-1 text-[10px] font-bold tracking-wide text-heritage-900 uppercase shadow-warm-sm">
            {dict.common.signature}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="h-card font-semibold text-ink">
          {/* The card surface is the primary target — the stretched link keeps
              the hit area large on mobile without nesting interactive nodes. */}
          <button
            type="button"
            onClick={onOpen}
            className="text-start after:absolute after:inset-0 after:content-[''] focus:outline-none"
            aria-label={fill(dict.dish.openDetails, { name: item.name[locale] })}
          >
            {item.name[locale]}
          </button>
        </h3>

        <p
          lang={locale === "en" ? "ar" : "en"}
          dir={locale === "en" ? "rtl" : "ltr"}
          className={`mt-1 text-sm text-ink-faint ${locale === "en" ? "font-arabic" : "font-sans"}`}
        >
          {locale === "en" ? item.name.ar : item.name.en}
        </p>

        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-muted">
          {item.description[locale]}
        </p>

        {item.portion && (
          <p className="mt-2 text-xs font-medium text-ink-faint">{item.portion[locale]}</p>
        )}

        <div className="mt-4 flex items-end justify-between gap-3 pt-1">
          <p className="tabular text-[1.05rem] font-bold text-heritage">{priceLabel}</p>

          <button
            type="button"
            onClick={onQuickAdd}
            aria-label={fill(dict.dish.quickAdd, { name: item.name[locale] })}
            className="relative z-10 inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-heritage text-paper shadow-warm-sm transition-all duration-200 hover:bg-heritage-700 hover:shadow-warm active:scale-92"
          >
            <IconPlus className="size-5" />
          </button>
        </div>
      </div>
    </article>
  );
}
