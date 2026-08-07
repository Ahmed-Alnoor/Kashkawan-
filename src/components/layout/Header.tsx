"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Logo } from "@/components/brand/Logo";
import { IconBag, IconClose, IconGlobe, IconMenu } from "@/components/ui/Icons";
import { useCart } from "@/lib/cart-context";
import { localePath, ROUTES, switchLocalePath } from "@/i18n/routing";
import { OTHER_LOCALE, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n";
import { RESTAURANT } from "@/data/restaurant";

type NavItem = { href: string; label: string };

export function Header({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const pathname = usePathname();
  const { count, hydrated, addPulse } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const reduced = useReducedMotion();
  const firstMobileLink = useRef<HTMLAnchorElement>(null);

  const items: NavItem[] = [
    { href: localePath(locale, ROUTES.menu), label: dict.nav.menu },
    { href: localePath(locale, ROUTES.about), label: dict.nav.about },
    { href: localePath(locale, ROUTES.location), label: dict.nav.location },
  ];

  /** The homepage hero is dark, so the header starts transparent there. */
  const overHero = pathname === localePath(locale, ROUTES.home);
  const solid = scrolled || !overHero || mobileOpen;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock the page behind the open drawer.
  useEffect(() => {
    if (!mobileOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    firstMobileLink.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [mobileOpen]);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-100 focus:rounded-full focus:bg-heritage focus:px-5 focus:py-3 focus:text-sm focus:font-semibold focus:text-paper"
      >
        {dict.nav.skipToContent}
      </a>

      <header
        className={[
          "fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,backdrop-filter] duration-300",
          solid
            ? "bg-paper/92 shadow-warm-sm backdrop-blur-md"
            : "bg-transparent",
        ].join(" ")}
        style={{ height: "var(--header-h)" }}
      >
        <div className="shell flex h-full items-center justify-between gap-3">
          <Link
            href={localePath(locale, ROUTES.home)}
            className="flex shrink-0 items-center rounded-lg py-1"
            aria-label={`${RESTAURANT.name[locale]} — ${dict.nav.home}`}
          >
            <Logo
              variant={solid ? "full" : "reversed"}
              width={150}
              priority
              className="h-9 w-auto lg:h-11"
            />
          </Link>

          <nav
            aria-label={dict.nav.primary}
            className="hidden items-center gap-1 lg:flex"
          >
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={[
                  "relative rounded-full px-4 py-2 text-[0.95rem] font-medium transition-colors duration-200",
                  solid
                    ? "text-ink hover:text-heritage"
                    : "text-paper/90 hover:text-paper",
                ].join(" ")}
              >
                {item.label}
                {isActive(item.href) && (
                  <motion.span
                    layoutId="nav-active"
                    className={`absolute inset-x-4 -bottom-0.5 h-0.5 rounded-full ${
                      solid ? "bg-heritage" : "bg-toast"
                    }`}
                    transition={
                      reduced ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 36 }
                    }
                  />
                )}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1.5">
            <Link
              href={switchLocalePath(pathname, OTHER_LOCALE[locale])}
              hrefLang={OTHER_LOCALE[locale]}
              aria-label={dict.nav.switchLanguageAria}
              className={[
                "inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-sm font-semibold transition-colors duration-200",
                solid
                  ? "text-heritage hover:bg-heritage/8"
                  : "text-paper/90 hover:bg-white/12 hover:text-paper",
              ].join(" ")}
            >
              <IconGlobe className="size-[18px]" />
              <span>{dict.nav.switchLanguage}</span>
            </Link>

            {/* The `key` is the add counter, so every add remounts this node
                and replays the keyframes. No state, no timers. */}
            <motion.div
              key={reduced ? "cart" : `cart-${addPulse}`}
              animate={reduced ? undefined : { scale: [1, 1.1, 1] }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="inline-flex"
            >
              <Link
                href={localePath(locale, ROUTES.cart)}
                aria-label={dict.cart.openCart}
                className={[
                  "relative inline-flex h-10 items-center gap-2 rounded-full ps-3 pe-3.5 text-sm font-semibold transition-colors duration-200",
                  solid
                    ? "bg-heritage text-paper hover:bg-heritage-700"
                    : "bg-paper/95 text-heritage-900 hover:bg-paper",
                ].join(" ")}
              >
                <IconBag className="size-[18px]" />
                <span className="tabular min-w-[1ch]" aria-hidden>
                  {hydrated ? count : 0}
                </span>
                <span className="sr-only">
                  {hydrated
                    ? (count === 1
                        ? dict.cart.itemCount
                        : dict.cart.itemCountPlural
                      ).replace("{count}", String(count))
                    : ""}
                </span>
              </Link>
            </motion.div>

            <button
              type="button"
              onClick={() => setMobileOpen((open) => !open)}
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav"
              aria-label={mobileOpen ? dict.nav.closeMenu : dict.nav.openMenu}
              className={[
                "inline-flex size-10 items-center justify-center rounded-full transition-colors duration-200 lg:hidden",
                solid ? "text-ink hover:bg-heritage/8" : "text-paper hover:bg-white/12",
              ].join(" ")}
            >
              {mobileOpen ? <IconClose className="size-6" /> : <IconMenu className="size-6" />}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-nav"
            id="mobile-nav"
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: -12 }}
            transition={{ duration: reduced ? 0.15 : 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-x-0 z-40 border-b border-paper-edge bg-paper shadow-warm-lg lg:hidden"
            style={{ top: "var(--header-h)" }}
          >
            <nav aria-label={dict.nav.primary} className="shell flex flex-col py-3">
              {[{ href: localePath(locale, ROUTES.home), label: dict.nav.home }, ...items].map(
                (item, index) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    ref={index === 0 ? firstMobileLink : undefined}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-between border-b border-paper-edge/70 py-4 text-lg font-medium text-ink last:border-0"
                  >
                    {item.label}
                    {isActive(item.href) && (
                      <span className="size-1.5 rounded-full bg-heritage" aria-hidden />
                    )}
                  </Link>
                ),
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
