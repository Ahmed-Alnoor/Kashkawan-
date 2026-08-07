"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Reveal } from "@/components/ui/Motion";
import { IconArrow, IconClose } from "@/components/ui/Icons";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n";

/**
 * Gallery built entirely from the restaurant's own menu photography. Alt text
 * describes what is actually in each frame — nothing is captioned as a dish we
 * cannot identify.
 */
const SHOTS = [
  {
    src: "/food/gallery-pizza.jpg",
    alt: { en: "Pepperoni, vegetable and cheese pizzas with a board of pastries", ar: "بيتزا بيبروني وخضار وجبنة مع صحن فطائر" },
    span: "sm:col-span-2 sm:row-span-2",
  },
  {
    src: "/food/category-manakish.jpg",
    alt: { en: "Cheese manakish fresh from the oven", ar: "منقوشة جبنة طازجة من الفرن" },
    span: "",
  },
  {
    src: "/food/manakish-gazawi.jpg",
    alt: { en: "Gazawi dukkah manakish", ar: "منقوشة دقة غزاوية" },
    span: "",
  },
  {
    src: "/food/gallery-bread.jpg",
    alt: { en: "Stacks of fresh white and brown Arabic bread with laben ayran", ar: "أرغفة خبز عربي أبيض وأسمر طازجة مع لبن عيران" },
    span: "sm:col-span-2",
  },
  {
    src: "/food/manakish-labneh-veg.jpg",
    alt: { en: "Labneh manakish topped with vegetables", ar: "منقوشة لبنة مع الخضار" },
    span: "",
  },
  {
    src: "/food/category-pastries.jpg",
    alt: { en: "A board of spinach, zaatar, meat and cheese pastries", ar: "صحن فطائر سبانخ وزعتر ولحمة وجبنة" },
    span: "",
  },
] as const;

export function Gallery({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const [index, setIndex] = useState<number | null>(null);
  const reduced = useReducedMotion();

  const close = useCallback(() => setIndex(null), []);
  const step = useCallback(
    (delta: number) => setIndex((i) => (i === null ? null : (i + delta + SHOTS.length) % SHOTS.length)),
    [],
  );

  useEffect(() => {
    if (index === null) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "ArrowRight") step(1);
      if (event.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [index, close, step]);

  const current = index === null ? null : SHOTS[index];

  return (
    <section className="section-y bg-paper">
      <div className="shell">
        <Reveal className="max-w-2xl">
          <p className="eyebrow text-toast-600">{dict.home.galleryEyebrow}</p>
          <h2 className="h-section mt-3 text-heritage">{dict.home.galleryTitle}</h2>
          <p className="mt-4 text-base leading-relaxed text-ink-muted">
            {dict.home.galleryBody}
          </p>
        </Reveal>

        <Reveal delay={0.08}>
          <ul className="mt-10 grid auto-rows-[11rem] grid-cols-2 gap-3 sm:auto-rows-[13rem] sm:grid-cols-4 lg:auto-rows-[15rem] lg:gap-4">
            {SHOTS.map((shot, i) => (
              <li key={shot.src} className={shot.span}>
                <button
                  type="button"
                  onClick={() => setIndex(i)}
                  className="group relative size-full overflow-hidden rounded-2xl bg-paper-dim shadow-warm-sm transition-shadow duration-300 hover:shadow-warm"
                >
                  <Image
                    src={shot.src}
                    alt={shot.alt[locale]}
                    fill
                    sizes="(min-width: 640px) 25vw, 50vw"
                    className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                  />
                  <span
                    className="absolute inset-0 bg-heritage-900/0 transition-colors duration-300 group-hover:bg-heritage-900/20"
                    aria-hidden
                  />
                </button>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>

      <AnimatePresence>
        {current && (
          <motion.div
            className="fixed inset-0 z-80 flex items-center justify-center bg-heritage-900/92 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0.15 : 0.25 }}
            role="dialog"
            aria-modal="true"
            aria-label={current.alt[locale]}
            onClick={close}
          >
            <button
              type="button"
              onClick={close}
              aria-label={dict.common.close}
              className="absolute end-4 top-4 inline-flex size-11 items-center justify-center rounded-full bg-paper/12 text-paper transition-colors hover:bg-paper/22"
            >
              <IconClose className="size-6" />
            </button>

            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                step(-1);
              }}
              aria-label={dict.common.back}
              className="absolute start-3 inline-flex size-11 items-center justify-center rounded-full bg-paper/12 text-paper transition-colors hover:bg-paper/22"
            >
              <IconArrow className="size-5 rotate-180" />
            </button>

            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                step(1);
              }}
              aria-label={dict.common.continue}
              className="absolute end-3 top-1/2 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-paper/12 text-paper transition-colors hover:bg-paper/22"
            >
              <IconArrow className="size-5" />
            </button>

            <motion.figure
              key={current.src}
              initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: reduced ? 0.15 : 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="relative max-h-[82dvh] w-full max-w-4xl"
              onClick={(event) => event.stopPropagation()}
            >
              <Image
                src={current.src}
                alt={current.alt[locale]}
                width={1200}
                height={900}
                sizes="(min-width: 1024px) 56rem, 100vw"
                className="mx-auto h-auto max-h-[74dvh] w-auto rounded-2xl object-contain"
              />
              <figcaption className="mt-4 text-center text-sm text-paper/70">
                {current.alt[locale]}
              </figcaption>
            </motion.figure>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
