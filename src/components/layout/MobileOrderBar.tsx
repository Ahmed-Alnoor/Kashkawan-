"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCart } from "@/lib/cart-context";
import { localePath, ROUTES } from "@/i18n/routing";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n";
import { formatMoney } from "@/lib/format";
import { IconArrow, IconBag } from "@/components/ui/Icons";

/**
 * Sticky order bar for small screens. It only appears once there is something
 * to order, and hides itself on the pages that already show the basket so it
 * never covers the real total or the submit button.
 */
export function MobileOrderBar({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const { count, subtotal, hydrated } = useCart();
  const pathname = usePathname();
  const reduced = useReducedMotion();

  const hiddenOn = [
    localePath(locale, ROUTES.cart),
    localePath(locale, ROUTES.checkout),
    localePath(locale, ROUTES.confirmation),
  ];
  const suppressed = hiddenOn.some((path) => pathname.startsWith(path));
  const visible = hydrated && count > 0 && !suppressed;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="order-bar"
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: 70 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, y: 70 }}
          transition={{ duration: reduced ? 0.15 : 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="no-print safe-b fixed inset-x-0 bottom-0 z-40 px-4 pb-3 lg:hidden"
        >
          <Link
            href={localePath(locale, ROUTES.cart)}
            className="flex h-14 items-center justify-between gap-3 rounded-full bg-heritage px-5 text-paper shadow-warm-lg transition-colors duration-200 active:bg-heritage-700"
          >
            <span className="flex items-center gap-2.5">
              <span className="relative inline-flex">
                <IconBag className="size-5" />
                <span className="tabular absolute -end-2 -top-2 grid size-[18px] place-content-center rounded-full bg-toast text-[11px] font-bold text-heritage-900">
                  {count}
                </span>
              </span>
              <span className="font-semibold">{dict.cart.stickyView}</span>
            </span>
            <span className="flex items-center gap-2">
              <span className="tabular font-bold">{formatMoney(subtotal, locale)}</span>
              <IconArrow className="flip-rtl size-[18px]" />
            </span>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
