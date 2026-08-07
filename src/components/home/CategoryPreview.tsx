"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { MENU } from "@/data/menu";
import type { CategoryId } from "@/data/menu-types";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n";
import { fill } from "@/i18n";
import { localePath, ROUTES } from "@/i18n/routing";
import { formatMoney } from "@/lib/format";
import { Reveal } from "@/components/ui/Motion";
import { IconArrow, IconWheat } from "@/components/ui/Icons";

/**
 * Interactive category preview: hovering or focusing a category swaps the
 * large panel. On touch the panel simply follows the selected category, so
 * the section works without hover.
 */
export function CategoryPreview({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const [active, setActive] = useState<CategoryId>(MENU[0].id);
  const reduced = useReducedMotion();
  const category = MENU.find((c) => c.id === active) ?? MENU[0];
  const floor = Math.min(...category.items.map((i) => i.basePrice));

  return (
    <section className="section-y relative overflow-hidden bg-heritage-900 text-paper">
      <div className="pattern-arch-dark absolute inset-0" aria-hidden />

      <div className="shell relative">
        <Reveal className="max-w-2xl">
          <p className="eyebrow text-toast">{dict.home.categoriesEyebrow}</p>
          <h2 className="h-section mt-3 text-paper">{dict.home.categoriesTitle}</h2>
          <p className="mt-4 text-base leading-relaxed text-paper/70">
            {dict.home.categoriesBody}
          </p>
        </Reveal>

        <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_1.15fr] lg:items-center lg:gap-14">
          {/* List */}
          <ul className="divide-y divide-paper/12 border-y border-paper/12">
            {MENU.map((entry) => {
              const on = entry.id === active;
              return (
                <li key={entry.id}>
                  <Link
                    href={`${localePath(locale, ROUTES.menu)}#category-${entry.id}`}
                    onMouseEnter={() => setActive(entry.id)}
                    onFocus={() => setActive(entry.id)}
                    onTouchStart={() => setActive(entry.id)}
                    className="group flex items-center gap-4 py-5 transition-colors duration-300"
                  >
                    <span
                      className={`h-px flex-none transition-all duration-400 ease-out ${
                        on ? "w-10 bg-toast" : "w-4 bg-paper/25"
                      }`}
                      aria-hidden
                    />
                    <span className="flex-1">
                      <span
                        className={`block text-xl font-bold transition-colors duration-300 lg:text-2xl ${
                          on ? "text-toast" : "text-paper/80 group-hover:text-paper"
                        }`}
                      >
                        {entry.name[locale]}
                      </span>
                      <span
                        lang={locale === "en" ? "ar" : "en"}
                        dir={locale === "en" ? "rtl" : "ltr"}
                        className={`mt-0.5 block text-sm text-paper/45 ${
                          locale === "en" ? "font-arabic" : "font-sans"
                        }`}
                      >
                        {locale === "en" ? entry.name.ar : entry.name.en}
                      </span>
                    </span>
                    <span className="tabular text-sm text-paper/45">
                      {fill(dict.home.itemCount, { count: entry.items.length })}
                    </span>
                    <IconArrow
                      className={`flip-rtl size-5 transition-all duration-300 ${
                        on ? "translate-x-0 text-toast opacity-100" : "-translate-x-1 opacity-0"
                      }`}
                    />
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Panel */}
          <div className="relative aspect-[4/3] overflow-hidden rounded-card border border-paper/12 bg-heritage-800 shadow-warm-lg sm:aspect-[16/11]">
            <AnimatePresence mode="wait">
              <motion.div
                key={category.id}
                data-reveal=""
                initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduced ? 0.2 : 0.55, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0"
              >
                {category.image ? (
                  <Image
                    src={category.image}
                    alt={`${category.name.en} — ${category.name.ar}`}
                    fill
                    sizes="(min-width: 1024px) 40rem, 100vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 grid place-content-center bg-heritage-800">
                    <IconWheat className="size-12 text-toast/40" />
                  </div>
                )}
                <div
                  className="absolute inset-0 bg-gradient-to-t from-heritage-900/85 via-heritage-900/20 to-transparent"
                  aria-hidden
                />
              </motion.div>
            </AnimatePresence>

            <div className="absolute inset-x-0 bottom-0 p-6 lg:p-8">
              <h3 className="text-2xl font-bold text-paper lg:text-3xl">
                {category.name[locale]}
              </h3>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-paper/75">
                {category.blurb[locale]}
              </p>
              <p className="tabular mt-4 text-sm font-semibold text-toast">
                {dict.common.from} {formatMoney(floor, locale)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
