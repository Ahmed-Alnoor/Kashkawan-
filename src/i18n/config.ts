export const LOCALES = ["en", "ar"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

export const isLocale = (value: string): value is Locale =>
  (LOCALES as readonly string[]).includes(value);

export const dirFor = (locale: Locale): "ltr" | "rtl" => (locale === "ar" ? "rtl" : "ltr");

export const OTHER_LOCALE: Record<Locale, Locale> = { en: "ar", ar: "en" };

export const LOCALE_LABEL: Record<Locale, string> = { en: "English", ar: "العربية" };

/** BCP-47 tags used for <html lang> and Intl formatting. */
export const HTML_LANG: Record<Locale, string> = { en: "en-AE", ar: "ar-AE" };
