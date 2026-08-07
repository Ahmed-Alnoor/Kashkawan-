import en, { type Dictionary } from "./dictionaries/en";
import ar from "./dictionaries/ar";
import type { Locale } from "./config";

const DICTIONARIES: Record<Locale, Dictionary> = { en, ar };

export const getDictionary = (locale: Locale): Dictionary => DICTIONARIES[locale];

export type { Dictionary };

/**
 * Replaces {placeholders} in a string. Kept deliberately tiny — the site has
 * no plural or gender rules beyond the two cart-count strings, which pick
 * their own template.
 */
export const fill = (
  template: string,
  values: Record<string, string | number>,
): string =>
  template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
