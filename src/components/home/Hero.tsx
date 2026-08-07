"use client";

import { Img } from "@/components/ui/Img";
import { motion, useReducedMotion } from "motion/react";
import { ButtonLink } from "@/components/ui/Button";
import { Logo } from "@/components/brand/Logo";
import { IconArrow, IconPin } from "@/components/ui/Icons";
import { localePath, ROUTES } from "@/i18n/routing";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n";
import { fill } from "@/i18n";
import { categoryPriceFloor } from "@/data/menu";
import { RESTAURANT } from "@/data/restaurant";

/**
 * Split hero, food-first.
 *
 * The brand's own menu system reserves 42–50% of a spread for one appetising
 * category image (guidelines p.17) — the same split is used here. It also
 * means the photograph is shown at its native size on a tall panel instead of
 * being stretched across a full-bleed background, so nothing is upscaled and
 * the type never sits on top of a busy plate.
 */
export function Hero({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const reduced = useReducedMotion();
  const manakishFloor = categoryPriceFloor("manakish");

  const rise = (delay: number) => ({
    "data-reveal": "",
    initial: reduced ? { opacity: 0 } : { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: reduced ? 0.25 : 0.75,
      delay: reduced ? 0 : delay,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  });

  return (
    <section className="relative isolate grid overflow-hidden bg-heritage-900 lg:min-h-[100svh] lg:grid-cols-[1.05fr_0.95fr]">
      {/* Editorial column ------------------------------------------- */}
      <div className="relative order-2 flex items-center lg:order-1">
        <div className="pattern-arch-dark absolute inset-0" aria-hidden />

        <div className="shell relative w-full py-14 lg:max-w-none lg:px-16 lg:py-24 xl:px-20">
          <motion.p {...rise(0.05)} className="eyebrow inline-flex items-center gap-2 text-toast">
            <IconPin className="size-4" />
            {dict.home.heroEyebrow}
          </motion.p>

          <motion.div {...rise(0.12)} className="mt-6 mb-7">
            <Logo
              variant="signature"
              width={280}
              priority
              className="h-auto w-[170px] sm:w-[205px]"
            />
          </motion.div>

          <motion.h1 {...rise(0.2)} className="h-display max-w-[13ch] text-paper">
            {dict.home.heroTitle}
          </motion.h1>

          <motion.p
            {...rise(0.3)}
            className="mt-5 max-w-md text-base leading-relaxed text-paper/78 sm:text-lg"
          >
            {dict.home.heroBody}
          </motion.p>

          <motion.div {...rise(0.4)} className="mt-9 flex flex-wrap items-center gap-3">
            <ButtonLink
              href={localePath(locale, ROUTES.menu)}
              variant="onDark"
              size="lg"
              className="min-w-[9.5rem]"
            >
              {dict.common.orderNow}
              <IconArrow className="flip-rtl size-[18px]" />
            </ButtonLink>
            <ButtonLink
              href={localePath(locale, ROUTES.menu)}
              size="lg"
              className="min-w-[9.5rem] border border-paper/30 bg-transparent text-paper shadow-none hover:border-paper/70 hover:bg-white/10"
            >
              {dict.common.viewMenu}
            </ButtonLink>
          </motion.div>

          <motion.p {...rise(0.5)} className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-paper/60">
            <span className="tabular">
              {fill(dict.home.heroPriceNote, { price: manakishFloor })}
            </span>
            <span className="text-toast/55" aria-hidden>
              |
            </span>
            <a
              href={`tel:${RESTAURANT.phone.e164}`}
              dir="ltr"
              className="tabular transition-colors hover:text-paper"
            >
              {RESTAURANT.phone.display}
            </a>
          </motion.p>

          {/* Canonical service line — guidelines p.17 */}
          <motion.ul
            {...rise(0.6)}
            className="mt-10 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-paper/12 pt-6 text-sm text-paper/55 lg:mt-14"
          >
            {RESTAURANT.serviceLine[locale].map((entry, index) => (
              <li key={entry} className="flex items-center gap-3">
                {index > 0 && (
                  <span className="text-toast/50" aria-hidden>
                    |
                  </span>
                )}
                <span>{entry}</span>
              </li>
            ))}
          </motion.ul>
        </div>
      </div>

      {/* Food column ------------------------------------------------- */}
      <div className="relative order-1 h-[52svh] min-h-[19rem] lg:order-2 lg:h-auto lg:min-h-[100svh]">
        <Img
          src="/food/gallery-manakish.jpg"
          alt=""
          fill
          priority
          sizes="(min-width: 1024px) 48vw, 100vw"
          className="object-cover object-center"
        />
        {/* Mobile: the photo dissolves into the green block beneath it.
            Desktop: only a light vignette, so the food stays appetising. */}
        <div
          className="absolute inset-0 bg-gradient-to-b from-heritage-900/45 via-transparent to-heritage-900 lg:from-heritage-900/25 lg:via-heritage-900/5 lg:to-heritage-900/35"
          aria-hidden
        />
        <div
          className="absolute inset-y-0 start-0 w-24 bg-gradient-to-r from-heritage-900/70 to-transparent max-lg:hidden rtl:bg-gradient-to-l"
          aria-hidden
        />
      </div>
    </section>
  );
}
