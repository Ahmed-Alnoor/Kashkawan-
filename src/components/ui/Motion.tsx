"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import type { ReactNode } from "react";

/**
 * Motion primitives.
 *
 * Every animation here collapses to an instant, non-moving state when the
 * visitor prefers reduced motion — opacity is kept (it does not trigger
 * vestibular discomfort) but transforms are dropped entirely.
 *
 * Each root carries `data-reveal`. Scroll-reveal elements are server-rendered
 * at opacity 0 and only become visible once Motion's IntersectionObserver
 * fires, so a visitor with JavaScript blocked or broken would otherwise see
 * empty sections. The <noscript> rule in the layout keys off that attribute
 * and forces them visible.
 */

export const EASE_OVEN = [0.22, 1, 0.36, 1] as const;

/** Fades and lifts a block into view once, as it enters the viewport. */
export function Reveal({
  children,
  delay = 0,
  y = 24,
  className,
  as = "div",
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: "div" | "section" | "li" | "article" | "header";
}) {
  const reduced = useReducedMotion();
  const Component = motion[as];

  return (
    <Component
      data-reveal=""
      className={className}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y }}
      whileInView={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15, margin: "0px 0px -60px 0px" }}
      transition={{ duration: reduced ? 0.2 : 0.7, delay: reduced ? 0 : delay, ease: EASE_OVEN }}
    >
      {children}
    </Component>
  );
}

/** Staggers a list of children. Pair with <StaggerItem>. */
export function Stagger({
  children,
  className,
  step = 0.07,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  step?: number;
  as?: "div" | "ul" | "section";
}) {
  const reduced = useReducedMotion();
  const Component = motion[as];

  const variants: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: reduced ? 0 : step } },
  };

  return (
    <Component
      data-reveal=""
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.1, margin: "0px 0px -60px 0px" }}
    >
      {children}
    </Component>
  );
}

export function StaggerItem({
  children,
  className,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "li" | "article";
}) {
  const reduced = useReducedMotion();
  const Component = motion[as];

  const variants: Variants = {
    hidden: reduced ? { opacity: 0 } : { opacity: 0, y: 22 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: reduced ? 0.2 : 0.6, ease: EASE_OVEN },
    },
  };

  return (
    <Component data-reveal="" className={className} variants={variants}>
      {children}
    </Component>
  );
}

/** Page-level entrance. Subtle by design — this runs on every navigation. */
export function PageTransition({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      data-reveal=""
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduced ? 0.15 : 0.45, ease: EASE_OVEN }}
    >
      {children}
    </motion.div>
  );
}
