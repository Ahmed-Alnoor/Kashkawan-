import type { Locale } from "@/i18n/config";
import type { BilingualText } from "@/data/restaurant";

/**
 * Prices use Western Arabic digits in both languages — the brand guidelines
 * recommend one numeral style per piece, and Western digits for quick
 * bilingual price scanning (p.13). Half dirhams (the 1.50 pastries) keep
 * their decimals; whole dirhams do not gain any.
 */
export const formatPrice = (amount: number): string =>
  Number.isInteger(amount) ? String(amount) : amount.toFixed(2);

/** "15 AED" / "15 درهم" — the currency word sits after the number in both. */
export const formatMoney = (amount: number, locale: Locale): string =>
  locale === "ar" ? `${formatPrice(amount)} درهم` : `${formatPrice(amount)} AED`;

export const pick = (text: BilingualText, locale: Locale): string => text[locale];

/** Latin-only slug, used for anchors and ids. */
export const slugify = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

/**
 * Order reference: KSH-YYMMDD-XXXX. Readable over the phone, sortable by day,
 * and random enough that two orders in the same minute cannot collide.
 */
export const generateOrderReference = (now = new Date()): string => {
  const yy = String(now.getUTCFullYear()).slice(-2);
  const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(now.getUTCDate()).padStart(2, "0");
  const alphabet = "ACDEFGHJKLMNPQRTUVWXY3456789"; // no look-alike characters
  let suffix = "";
  const bytes = new Uint8Array(4);
  crypto.getRandomValues(bytes);
  for (const byte of bytes) suffix += alphabet[byte % alphabet.length];
  return `KSH-${yy}${mm}${dd}-${suffix}`;
};

/** Formats a phone number for display without changing what the user typed. */
export const telHref = (e164: string): string => `tel:${e164}`;

/**
 * Joins a list with the separator that language actually uses. The Arabic
 * comma (U+060C) in an English sentence looks like a typo; a Latin comma in
 * Arabic breaks the line rhythm.
 */
export const listJoin = (items: string[], locale: Locale): string =>
  items.join(locale === "ar" ? "، " : ", ");

/**
 * Wraps a value in a bidi isolate so it keeps its own direction inside a
 * sentence of the opposite direction. Without this, "058 60 60 158" inside
 * Arabic copy is reordered by the bidi algorithm into "158 60 60 058".
 * U+2068 FSI … U+2069 PDI is the plain-text equivalent of dir="auto".
 */
export const bidiIsolate = (value: string): string => `⁨${value}⁩`;
