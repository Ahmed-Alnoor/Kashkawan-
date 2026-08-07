import { LOCALES, type Locale } from "./config";

/** Builds a locale-prefixed path: localePath("ar", "/menu") -> "/ar/menu". */
export const localePath = (locale: Locale, path = "/"): string => {
  const clean = path === "/" ? "" : path.startsWith("/") ? path : `/${path}`;
  return `/${locale}${clean}`;
};

/**
 * Swaps the locale segment of the current pathname, keeping the rest intact
 * so the language switcher never bounces the visitor back to the homepage.
 */
export const switchLocalePath = (pathname: string, next: Locale): string => {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length > 0 && (LOCALES as readonly string[]).includes(segments[0])) {
    segments[0] = next;
  } else {
    segments.unshift(next);
  }
  return `/${segments.join("/")}`;
};

export const ROUTES = {
  home: "/",
  menu: "/menu",
  about: "/about",
  location: "/location",
  cart: "/cart",
  checkout: "/checkout",
  confirmation: "/order-received",
  privacy: "/privacy",
  terms: "/terms",
  delivery: "/delivery",
} as const;
