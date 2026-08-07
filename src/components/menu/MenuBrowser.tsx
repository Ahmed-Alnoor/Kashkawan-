"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { MENU, getItem } from "@/data/menu";
import type { CategoryId, MenuItem } from "@/data/menu-types";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n";
import { fill } from "@/i18n";
import { useCart } from "@/lib/cart-context";
import { defaultSelections, isValidLine, type LineSelections } from "@/lib/pricing";
import { DishCard } from "./DishCard";
import { DishDrawer, type DrawerTarget } from "./DishDrawer";
import { IconClose, IconFilter, IconInfo, IconSearch } from "@/components/ui/Icons";

type FilterKey = "vegetarian" | "noNuts" | "noGluten" | "noMilk" | "spicy" | "signature";

const FILTERS: Array<{ key: FilterKey; labelKey: keyof Dictionary["menu"] }> = [
  { key: "vegetarian", labelKey: "filterVegetarian" },
  { key: "signature", labelKey: "filterSignature" },
  { key: "spicy", labelKey: "filterSpicy" },
  { key: "noNuts", labelKey: "filterNoNuts" },
  { key: "noMilk", labelKey: "filterNoMilk" },
  { key: "noGluten", labelKey: "filterNoGluten" },
];

const matchesFilters = (item: MenuItem, active: Set<FilterKey>): boolean => {
  if (active.has("vegetarian") && !item.dietary.includes("vegetarian")) return false;
  if (active.has("signature") && !item.signature) return false;
  if (active.has("spicy") && !item.dietary.includes("spicy")) return false;
  if (active.has("noNuts") && item.allergens.includes("nuts")) return false;
  if (active.has("noMilk") && item.allergens.includes("milk")) return false;
  if (active.has("noGluten") && item.allergens.includes("gluten")) return false;
  return true;
};

/** Matches across both languages so an Arabic search works on the English page. */
const matchesQuery = (item: MenuItem, query: string): boolean => {
  if (!query) return true;
  const haystack = [
    item.name.en,
    item.name.ar,
    item.description.en,
    item.description.ar,
    ...item.ingredients.flatMap((i) => [i.en, i.ar]),
  ]
    .join(" ")
    .toLowerCase();
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((term) => haystack.includes(term));
};

export function MenuBrowser({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const { addLine } = useCart();
  const reduced = useReducedMotion();
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<Set<FilterKey>>(new Set());
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<CategoryId>(MENU[0].id);
  const [target, setTarget] = useState<DrawerTarget | null>(null);
  const [announcement, setAnnouncement] = useState("");

  const railRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef(new Map<CategoryId, HTMLElement>());

  const filtered = useMemo(
    () =>
      MENU.map((category) => ({
        ...category,
        items: category.items.filter(
          (item) => matchesQuery(item, query) && matchesFilters(item, filters),
        ),
      })).filter((category) => category.items.length > 0),
    [query, filters],
  );

  const resultCount = filtered.reduce((n, c) => n + c.items.length, 0);
  const isSearching = query.trim().length > 0 || filters.size > 0;

  /* Sticky rail: highlight whichever category is currently under the header. */
  useEffect(() => {
    if (isSearching) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActiveCategory(visible.target.id.replace("category-", "") as CategoryId);
      },
      {
        // Band just under the sticky header + rail.
        rootMargin: "-30% 0px -60% 0px",
        threshold: 0,
      },
    );
    for (const section of sectionRefs.current.values()) observer.observe(section);
    return () => observer.disconnect();
  }, [isSearching, filtered.length]);

  /* Keep the active chip in view inside the horizontal rail. */
  useEffect(() => {
    const rail = railRef.current;
    const chip = rail?.querySelector<HTMLElement>(`[data-chip="${activeCategory}"]`);
    if (!rail || !chip) return;
    const chipStart = chip.offsetLeft;
    const chipEnd = chipStart + chip.offsetWidth;
    const viewStart = rail.scrollLeft;
    const viewEnd = viewStart + rail.clientWidth;
    if (chipStart < viewStart + 24 || chipEnd > viewEnd - 24) {
      rail.scrollTo({
        left: chipStart - rail.clientWidth / 2 + chip.offsetWidth / 2,
        behavior: reduced ? "auto" : "smooth",
      });
    }
  }, [activeCategory, reduced]);

  const registerSection = useCallback(
    (id: CategoryId) => (node: HTMLElement | null) => {
      if (node) sectionRefs.current.set(id, node);
      else sectionRefs.current.delete(id);
    },
    [],
  );

  const toggleFilter = (key: FilterKey) =>
    setFilters((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const announce = (item: MenuItem) =>
    setAnnouncement(fill(dict.a11y.addedToCart, { name: item.name[locale] }));

  /** Quick-add only works when nothing is required; otherwise open the drawer. */
  const quickAdd = (item: MenuItem) => {
    const selections = defaultSelections(item);
    if (!isValidLine(item, selections)) {
      setTarget({ item });
      return;
    }
    addLine(item.id, selections, 1);
    announce(item);
  };

  const submitDrawer = (selections: LineSelections, quantity: number) => {
    if (!target) return;
    addLine(target.item.id, selections, quantity);
    announce(target.item);
    setTarget(null);
  };

  return (
    <>
      {/* Sticky controls ------------------------------------------------ */}
      <div
        className="sticky z-30 border-b border-paper-edge/80 bg-paper/94 backdrop-blur-md"
        style={{ top: "var(--header-h)" }}
      >
        <div className="shell py-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <IconSearch className="pointer-events-none absolute start-3.5 top-1/2 size-[18px] -translate-y-1/2 text-ink-faint" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={dict.menu.searchPlaceholder}
                aria-label={dict.menu.search}
                className="h-11 w-full rounded-full border border-paper-edge bg-white/80 ps-11 pe-10 text-[0.95rem] text-ink placeholder:text-ink-faint focus:border-heritage focus:outline-none"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label={dict.menu.clearSearch}
                  className="absolute end-2 top-1/2 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-ink-faint transition-colors duration-200 hover:bg-heritage/8 hover:text-ink"
                >
                  <IconClose className="size-4" />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => setFiltersOpen((open) => !open)}
              aria-expanded={filtersOpen}
              aria-controls="menu-filters"
              className={`inline-flex h-11 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors duration-200 ${
                filters.size > 0
                  ? "border-heritage bg-heritage text-paper"
                  : "border-paper-edge bg-white/80 text-ink hover:border-heritage/40"
              }`}
            >
              <IconFilter className="size-[18px]" />
              <span className="hidden sm:inline">{dict.menu.filters}</span>
              {filters.size > 0 && <span className="tabular">{filters.size}</span>}
            </button>
          </div>

          <AnimatePresence initial={false}>
            {filtersOpen && (
              <motion.div
                id="menu-filters"
                initial={reduced ? { opacity: 0 } : { opacity: 0, height: 0 }}
                animate={reduced ? { opacity: 1 } : { opacity: 1, height: "auto" }}
                exit={reduced ? { opacity: 0 } : { opacity: 0, height: 0 }}
                transition={{ duration: reduced ? 0.15 : 0.28, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap items-center gap-2 pt-3">
                  {FILTERS.map(({ key, labelKey }) => {
                    const on = filters.has(key);
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => toggleFilter(key)}
                        aria-pressed={on}
                        className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors duration-200 ${
                          on
                            ? "border-heritage bg-heritage/12 text-heritage"
                            : "border-paper-edge bg-white/70 text-ink-muted hover:border-heritage/40 hover:text-ink"
                        }`}
                      >
                        {dict.menu[labelKey] as string}
                      </button>
                    );
                  })}
                  {filters.size > 0 && (
                    <button
                      type="button"
                      onClick={() => setFilters(new Set())}
                      className="rounded-full px-3 py-1.5 text-sm font-semibold text-heritage underline underline-offset-4 hover:text-heritage-700"
                    >
                      {dict.menu.clearFilters}
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Category rail */}
          <nav aria-label={dict.menu.categoryNav} className="mt-3">
            <div
              ref={railRef}
              className="no-scrollbar fade-inline -mx-1 flex gap-2 overflow-x-auto px-1 pb-1"
            >
              {MENU.map((category) => {
                const available = filtered.some((c) => c.id === category.id);
                const on = !isSearching && activeCategory === category.id;
                return (
                  <a
                    key={category.id}
                    href={`#category-${category.id}`}
                    data-chip={category.id}
                    aria-current={on ? "true" : undefined}
                    aria-disabled={!available}
                    onClick={(event) => {
                      if (!available) event.preventDefault();
                      else setActiveCategory(category.id);
                    }}
                    className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold whitespace-nowrap transition-colors duration-200 ${
                      on
                        ? "bg-heritage text-paper"
                        : available
                          ? "bg-white/75 text-ink-muted hover:bg-heritage/10 hover:text-heritage"
                          : "cursor-not-allowed bg-white/40 text-ink-faint/50"
                    }`}
                  >
                    {category.name[locale]}
                  </a>
                );
              })}
            </div>
          </nav>
        </div>
      </div>

      {/* Results -------------------------------------------------------- */}
      <div className="shell pt-8 pb-20 lg:pb-28">
        <p className="tabular text-sm text-ink-faint" aria-live="polite">
          {fill(dict.menu.resultsCount, { count: resultCount })}
        </p>

        {filtered.length === 0 ? (
          <div className="mx-auto max-w-md py-20 text-center">
            <p className="h-card font-semibold text-ink">{dict.menu.noResults}</p>
            <p className="mt-2 text-ink-muted">{dict.menu.noResultsBody}</p>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setFilters(new Set());
              }}
              className="mt-6 rounded-full bg-heritage px-5 py-2.5 text-sm font-semibold text-paper transition-colors hover:bg-heritage-700"
            >
              {dict.menu.clearFilters}
            </button>
          </div>
        ) : (
          filtered.map((category) => (
            <section
              key={category.id}
              id={`category-${category.id}`}
              ref={registerSection(category.id)}
              aria-labelledby={`heading-${category.id}`}
              className="scroll-mt-44 pt-12 first:pt-8"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
                <h2 id={`heading-${category.id}`} className="h-section text-heritage">
                  {category.name[locale]}
                </h2>
                <p
                  lang={locale === "en" ? "ar" : "en"}
                  dir={locale === "en" ? "rtl" : "ltr"}
                  className={`text-lg text-ink-faint ${locale === "en" ? "font-arabic" : "font-sans"}`}
                >
                  {locale === "en" ? category.name.ar : category.name.en}
                </p>
              </div>

              <p className="mt-2 max-w-2xl text-[0.95rem] text-ink-muted">
                {category.blurb[locale]}
              </p>

              {category.notes.length > 0 && (
                <ul className="mt-4 flex flex-wrap gap-2">
                  {category.notes.map((note) => (
                    <li
                      key={note.en}
                      className="inline-flex items-center gap-1.5 rounded-full bg-heritage/8 px-3 py-1.5 text-xs font-medium text-heritage"
                    >
                      <IconInfo className="size-3.5" />
                      {note[locale]}
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:gap-5 xl:grid-cols-4">
                {category.items.map((item, index) => (
                  <DishCard
                    key={item.id}
                    item={item}
                    locale={locale}
                    dict={dict}
                    index={index}
                    onOpen={() => setTarget({ item })}
                    onQuickAdd={() => quickAdd(item)}
                  />
                ))}
              </div>
            </section>
          ))
        )}

        <p className="mt-16 flex max-w-2xl gap-2 text-sm leading-relaxed text-ink-faint">
          <IconInfo className="mt-0.5 size-4 shrink-0" />
          <span>{dict.menu.allergenNote}</span>
        </p>
      </div>

      <DishDrawer
        target={target}
        locale={locale}
        dict={dict}
        onClose={() => setTarget(null)}
        onSubmit={submitDrawer}
      />

      <p className="sr-only" role="status" aria-live="polite">
        {announcement}
      </p>
    </>
  );
}

/** Re-exported so the cart can reopen the drawer for editing. */
export { getItem };
