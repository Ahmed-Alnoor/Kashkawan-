"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { MenuItem, OptionGroup } from "@/data/menu-types";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n";
import { formatMoney } from "@/lib/format";
import {
  clampCounter,
  defaultSelections,
  MAX_NOTE_LENGTH,
  MAX_QUANTITY,
  missingRequired,
  unitPrice,
  type LineSelections,
} from "@/lib/pricing";
import { DishImage } from "./DishImage";
import { Button } from "@/components/ui/Button";
import {
  IconCheck,
  IconClose,
  IconInfo,
  IconMinus,
  IconPlus,
} from "@/components/ui/Icons";

export type DrawerTarget = {
  item: MenuItem;
  /** Present when editing an existing basket line. */
  lineId?: string;
  selections?: LineSelections;
  quantity?: number;
};

export function DishDrawer({
  target,
  locale,
  dict,
  onClose,
  onSubmit,
}: {
  target: DrawerTarget | null;
  locale: Locale;
  dict: Dictionary;
  onClose: () => void;
  onSubmit: (selections: LineSelections, quantity: number) => void;
}) {
  /**
   * The panel is keyed on which dish (or which basket line) is open, so React
   * remounts it with fresh state instead of us resetting state from an effect.
   */
  return (
    <AnimatePresence>
      {target && (
        <DishPanel
          key={`${target.item.id}:${target.lineId ?? "new"}`}
          target={target}
          locale={locale}
          dict={dict}
          onClose={onClose}
          onSubmit={onSubmit}
        />
      )}
    </AnimatePresence>
  );
}

function DishPanel({
  target,
  locale,
  dict,
  onClose,
  onSubmit,
}: {
  target: DrawerTarget;
  locale: Locale;
  dict: Dictionary;
  onClose: () => void;
  onSubmit: (selections: LineSelections, quantity: number) => void;
}) {
  const reduced = useReducedMotion();
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const restoreFocusTo = useRef<Element | null>(null);

  const item = target.item;
  const isEditing = Boolean(target.lineId);

  const [selections, setSelections] = useState<LineSelections>(
    () => target.selections ?? defaultSelections(item),
  );
  const [quantity, setQuantity] = useState(target.quantity ?? 1);
  const [showErrors, setShowErrors] = useState(false);

  // Focus management: remember what opened the drawer, restore it on close.
  useEffect(() => {
    restoreFocusTo.current = document.activeElement;
    const timer = setTimeout(() => closeRef.current?.focus(), 60);
    return () => {
      clearTimeout(timer);
      if (restoreFocusTo.current instanceof HTMLElement)
        restoreFocusTo.current.focus();
    };
  }, []);

  // Lock the page and trap the tab order while the drawer is open.
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previousPadding = document.body.style.paddingInlineEnd;
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (scrollbar > 0) document.body.style.paddingInlineEnd = `${scrollbar}px`;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;
      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingInlineEnd = previousPadding;
      window.removeEventListener("keydown", onKeyDown, true);
    };
  }, [onClose]);

  const missing = useMemo(
    () => missingRequired(item, selections),
    [item, selections],
  );
  const total = unitPrice(item, selections) * quantity;

  const handleSubmit = () => {
    if (missing.length > 0) {
      setShowErrors(true);
      const firstGroup = panelRef.current?.querySelector<HTMLElement>(
        `[data-group="${missing[0]}"]`,
      );
      firstGroup?.scrollIntoView({
        behavior: reduced ? "auto" : "smooth",
        block: "center",
      });
      firstGroup?.querySelector<HTMLElement>("input")?.focus();
      return;
    }
    onSubmit({ ...selections, notes: selections.notes.trim() }, quantity);
  };

  const setSingle = (groupId: string, choiceId: string) =>
    setSelections((s) => ({
      ...s,
      single: { ...s.single, [groupId]: choiceId },
    }));

  const toggleMulti = (groupId: string, choiceId: string) =>
    setSelections((s) => {
      const current = s.multi[groupId] ?? [];
      const next = current.includes(choiceId)
        ? current.filter((id) => id !== choiceId)
        : [...current, choiceId];
      return { ...s, multi: { ...s.multi, [groupId]: next } };
    });

  const setCounter = (
    group: Extract<OptionGroup, { kind: "counter" }>,
    value: number,
  ) =>
    setSelections((s) => ({
      ...s,
      counters: { ...s.counters, [group.id]: clampCounter(group, value) },
    }));

  const toggleRemoved = (key: string) =>
    setSelections((s) => ({
      ...s,
      removed: s.removed.includes(key)
        ? s.removed.filter((r) => r !== key)
        : [...s.removed, key],
    }));

  return (
    <div className="fixed inset-0 z-70" role="presentation">
      <motion.div
        className="absolute inset-0 bg-heritage-900/55 backdrop-blur-[3px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: reduced ? 0.15 : 0.3 }}
        onClick={onClose}
        aria-hidden
      />

      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        initial={reduced ? { opacity: 0 } : { opacity: 0, y: "100%" }}
        animate={{ opacity: 1, y: 0 }}
        exit={reduced ? { opacity: 0 } : { opacity: 0, y: "100%" }}
        transition={{
          duration: reduced ? 0.15 : 0.42,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="absolute inset-x-0 bottom-0 flex max-h-[92dvh] flex-col overflow-hidden rounded-t-3xl bg-paper shadow-warm-lg sm:inset-y-0 sm:end-0 sm:start-auto sm:max-h-none sm:w-[min(30rem,100vw)] sm:rounded-none sm:rounded-s-3xl"
      >
        {/* Header --------------------------------------------------- */}
        <div className="relative shrink-0">
          <div className="relative h-44 sm:h-56">
            <DishImage
              item={item}
              locale={locale}
              sizes="(min-width: 640px) 30rem, 100vw"
              rounded="rounded-none"
              priority
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-heritage-900/78 via-heritage-900/12 to-transparent"
              aria-hidden
            />
          </div>

          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label={dict.common.close}
            className="absolute end-3 top-3 inline-flex size-10 items-center justify-center rounded-full bg-paper/92 text-ink shadow-warm backdrop-blur transition-colors duration-200 hover:bg-paper"
          >
            <IconClose className="size-5" />
          </button>

          <div className="absolute inset-x-0 bottom-0 p-5 pb-4">
            {item.signature && (
              <span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-toast/95 px-2.5 py-1 text-[11px] font-bold tracking-wide text-heritage-900 uppercase">
                {dict.common.signature}
              </span>
            )}
            <h2 id={titleId} className="h-card font-bold text-paper">
              {item.name[locale]}
            </h2>
            <p
              lang={locale === "en" ? "ar" : "en"}
              dir={locale === "en" ? "rtl" : "ltr"}
              className={`mt-1 text-sm text-paper/75 ${locale === "en" ? "font-arabic" : "font-sans"}`}
            >
              {locale === "en" ? item.name.ar : item.name.en}
            </p>
          </div>
        </div>

        {/* Body ----------------------------------------------------- */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-6">
          <p className="text-[0.95rem] leading-relaxed text-ink-muted">
            {item.description[locale]}
          </p>

          {item.portion && (
            <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-paper-dim px-3 py-1.5 text-sm font-medium text-ink">
              <span className="text-ink-faint">{dict.dish.portion}:</span>
              {item.portion[locale]}
            </p>
          )}

          {/* Ingredients */}
          {item.ingredients.length > 0 && (
            <section className="mt-7">
              <h3 className="eyebrow text-heritage">{dict.dish.ingredients}</h3>
              <ul className="mt-3 flex flex-wrap gap-2">
                {item.ingredients.map((ingredient) => (
                  <li
                    key={ingredient.en}
                    className="rounded-full border border-paper-edge bg-white/60 px-3 py-1.5 text-sm text-ink"
                  >
                    {ingredient[locale]}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Allergens & dietary */}
          <section className="mt-7">
            <h3 className="eyebrow text-heritage">{dict.dish.allergens}</h3>
            <ul className="mt-3 flex flex-wrap gap-2">
              {item.allergens.length > 0 ? (
                item.allergens.map((allergen) => (
                  <li
                    key={allergen}
                    className="rounded-full bg-toast/18 px-3 py-1.5 text-sm font-medium text-wheat"
                  >
                    {dict.allergens[allergen]}
                  </li>
                ))
              ) : (
                <li className="text-sm text-ink-muted">
                  {dict.dish.noAllergens}
                </li>
              )}
              {item.dietary.map((flag) => (
                <li
                  key={flag}
                  className="rounded-full bg-heritage/12 px-3 py-1.5 text-sm font-medium text-heritage"
                >
                  {dict.dietary[flag]}
                </li>
              ))}
            </ul>
            <p className="mt-3 flex gap-2 text-xs leading-relaxed text-ink-faint">
              <IconInfo className="mt-px size-4 shrink-0" />
              <span>{dict.menu.allergenNote}</span>
            </p>
          </section>

          {/* Option groups */}
          {item.optionGroups.map((group) => (
            <OptionGroupField
              key={group.id}
              group={group}
              locale={locale}
              dict={dict}
              selections={selections}
              invalid={showErrors && missing.includes(group.id)}
              onSingle={setSingle}
              onMulti={toggleMulti}
              onCounter={setCounter}
            />
          ))}

          {/* Removable ingredients */}
          {item.removable.length > 0 && (
            <fieldset className="mt-7">
              <legend className="eyebrow text-heritage">
                {dict.dish.removeIngredients}
              </legend>
              <p className="mt-1.5 text-xs text-ink-faint">
                {dict.dish.removeHint}
              </p>
              <div className="mt-3 space-y-2">
                {item.removable.map((ingredient) => {
                  const removed = selections.removed.includes(ingredient.en);
                  return (
                    <label
                      key={ingredient.en}
                      className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-colors duration-200 ${
                        removed
                          ? "border-danger/35 bg-danger/6"
                          : "border-paper-edge bg-white/55 hover:border-heritage/35"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={!removed}
                        onChange={() => toggleRemoved(ingredient.en)}
                        className="size-4 accent-[var(--color-heritage)]"
                      />
                      <span
                        className={`text-[0.95rem] ${removed ? "text-ink-faint line-through" : "text-ink"}`}
                      >
                        {ingredient[locale]}
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
          )}

          {/* Notes */}
          <div className="mt-7">
            <label
              htmlFor={`${titleId}-notes`}
              className="eyebrow text-heritage"
            >
              {dict.dish.specialInstructions}
            </label>
            <textarea
              id={`${titleId}-notes`}
              value={selections.notes}
              maxLength={MAX_NOTE_LENGTH}
              rows={3}
              onChange={(event) =>
                setSelections((s) => ({ ...s, notes: event.target.value }))
              }
              placeholder={dict.dish.specialInstructionsPlaceholder}
              className="mt-3 w-full resize-y rounded-xl border border-paper-edge bg-white/70 px-4 py-3 text-[0.95rem] text-ink placeholder:text-ink-faint focus:border-heritage focus:outline-none"
            />
            <p className="mt-1.5 text-end text-xs text-ink-faint tabular">
              {selections.notes.length} / {MAX_NOTE_LENGTH}
            </p>
          </div>
        </div>

        {/* Footer --------------------------------------------------- */}
        <div className="shrink-0 border-t border-paper-edge bg-paper/95 px-5 py-4 backdrop-blur safe-b">
          {showErrors && missing.length > 0 && (
            <p role="alert" className="mb-3 text-sm font-medium text-danger">
              {dict.dish.selectRequired}
            </p>
          )}
          {/* On a narrow screen the stepper, the label and the price cannot
              share one row without the Arabic label truncating, so the total
              moves next to the stepper and the button takes the full width.
              From 640px up (where the drawer is a 30rem panel) they combine. */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
            <div className="flex items-center justify-between gap-3">
              <QuantityStepper
                value={quantity}
                onChange={setQuantity}
                dict={dict}
                label={item.name[locale]}
                className="shrink-0"
              />
              <span
                className="tabular text-lg font-bold text-heritage sm:hidden"
                aria-hidden
              >
                {formatMoney(total, locale)}
              </span>
            </div>

            <Button
              type="button"
              size="lg"
              onClick={handleSubmit}
              className="w-full sm:flex-1 sm:justify-between sm:gap-2"
            >
              <span>
                {isEditing ? dict.dish.updateForTotal : dict.dish.addForTotal}
              </span>
              {/* Separator for screen readers only — the visual layouts use a
                  gap. Without it the accessible name runs the label and the
                  amount together ("Add to order8 AED"). */}
              <span className="sr-only">{" — "}</span>
              <span className="tabular hidden font-bold sm:inline">
                {formatMoney(total, locale)}
              </span>
              {/* Below 640px the total sits beside the stepper instead, so the
                  button still announces the amount. */}
              <span className="sr-only sm:hidden">
                {formatMoney(total, locale)}
              </span>
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function OptionGroupField({
  group,
  locale,
  dict,
  selections,
  invalid,
  onSingle,
  onMulti,
  onCounter,
}: {
  group: OptionGroup;
  locale: Locale;
  dict: Dictionary;
  selections: LineSelections;
  invalid: boolean;
  onSingle: (groupId: string, choiceId: string) => void;
  onMulti: (groupId: string, choiceId: string) => void;
  onCounter: (
    group: Extract<OptionGroup, { kind: "counter" }>,
    value: number,
  ) => void;
}) {
  const hint =
    group.kind === "single"
      ? group.required
        ? dict.common.required
        : dict.dish.chooseOne
      : dict.common.optional;

  return (
    <fieldset className="mt-7" data-group={group.id}>
      <div className="flex items-baseline justify-between gap-3">
        <legend className="eyebrow text-heritage">{group.label[locale]}</legend>
        <span
          className={`text-xs font-medium ${
            invalid
              ? "text-danger"
              : group.kind === "single" && group.required
                ? "text-toast-600"
                : "text-ink-faint"
          }`}
        >
          {hint}
        </span>
      </div>

      {group.note && (
        <p className="mt-1.5 text-xs leading-relaxed text-ink-faint">
          {group.note[locale]}
        </p>
      )}

      {group.kind === "counter" ? (
        <div
          className={`mt-3 flex items-center justify-between rounded-xl border bg-white/55 px-4 py-3 ${
            invalid ? "border-danger" : "border-paper-edge"
          }`}
        >
          <span className="text-[0.95rem] text-ink">
            {formatMoney(group.unitPrice, locale)} {dict.common.each}
          </span>
          <QuantityStepper
            value={selections.counters[group.id] ?? 0}
            min={0}
            max={group.max}
            dict={dict}
            label={group.label[locale]}
            onChange={(value) => onCounter(group, value)}
            compact
          />
        </div>
      ) : (
        <div
          className={`mt-3 space-y-2 ${invalid ? "rounded-xl ring-2 ring-danger/40 ring-offset-4 ring-offset-paper" : ""}`}
        >
          {group.choices.map((choice) => {
            const checked =
              group.kind === "single"
                ? selections.single[group.id] === choice.id
                : (selections.multi[group.id] ?? []).includes(choice.id);

            return (
              <label
                key={choice.id}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-all duration-200 ${
                  checked
                    ? "border-heritage bg-heritage/8"
                    : "border-paper-edge bg-white/55 hover:border-heritage/35"
                }`}
              >
                <input
                  type={group.kind === "single" ? "radio" : "checkbox"}
                  name={group.id}
                  value={choice.id}
                  checked={checked}
                  required={group.kind === "single" && group.required}
                  onChange={() =>
                    group.kind === "single"
                      ? onSingle(group.id, choice.id)
                      : onMulti(group.id, choice.id)
                  }
                  className="sr-only"
                />
                <span
                  aria-hidden
                  className={`grid size-5 shrink-0 place-content-center border-2 transition-colors duration-200 ${
                    group.kind === "single" ? "rounded-full" : "rounded-md"
                  } ${checked ? "border-heritage bg-heritage text-paper" : "border-ink-faint/50"}`}
                >
                  {checked &&
                    (group.kind === "single" ? (
                      <span className="size-2 rounded-full bg-paper" />
                    ) : (
                      <IconCheck className="size-3.5" strokeWidth={2.6} />
                    ))}
                </span>
                <span className="flex-1 text-[0.95rem] text-ink">
                  {choice.label[locale]}
                </span>
                {choice.priceDelta > 0 && (
                  <span className="tabular text-sm font-semibold text-heritage">
                    +{formatMoney(choice.priceDelta, locale)}
                  </span>
                )}
              </label>
            );
          })}
        </div>
      )}
    </fieldset>
  );
}

/* ------------------------------------------------------------------ */

export function QuantityStepper({
  value,
  onChange,
  dict,
  label,
  min = 1,
  max = MAX_QUANTITY,
  compact = false,
  className = "",
}: {
  value: number;
  onChange: (value: number) => void;
  dict: Dictionary;
  label: string;
  min?: number;
  max?: number;
  compact?: boolean;
  className?: string;
}) {
  const size = compact ? "size-8" : "size-10";
  return (
    <div
      className={`flex items-center gap-0.5 rounded-full ${compact ? "" : "border border-paper-edge bg-white/70 p-1"} ${className}`}
    >
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label={`${dict.common.decrease} — ${label}`}
        className={`${size} inline-flex items-center justify-center rounded-full text-ink transition-colors duration-200 hover:bg-heritage/10 disabled:opacity-35 disabled:hover:bg-transparent`}
      >
        <IconMinus className={compact ? "size-4" : "size-5"} />
      </button>
      <span
        className="tabular min-w-[2ch] text-center text-[0.95rem] font-bold text-ink"
        aria-live="polite"
        aria-atomic="true"
      >
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label={`${dict.common.increase} — ${label}`}
        className={`${size} inline-flex items-center justify-center rounded-full text-ink transition-colors duration-200 hover:bg-heritage/10 disabled:opacity-35 disabled:hover:bg-transparent`}
      >
        <IconPlus className={compact ? "size-4" : "size-5"} />
      </button>
    </div>
  );
}
