import { Outfit, Noto_Sans_Arabic } from "next/font/google";

/**
 * Latin type.
 *
 * The brand guidelines specify Co Headline (Bold for display, Regular for
 * body) — a licensed family the brand pack does not include, and whose licence
 * the guidelines themselves list as an open action (p.22). Outfit is the
 * closest freely-licensed geometric sans and is used for both display and
 * body, mirroring the guidelines' own single-Latin-family approach (p.12:
 * "Use no more than two font families in one customer-facing piece").
 *
 * To switch to the licensed face, see docs/FONTS.md.
 */
export const latin = Outfit({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-latin",
  weight: ["400", "500", "600", "700"],
});

/**
 * Arabic fallback.
 *
 * "Madani Arabic" is the requested primary Arabic face and is declared first
 * in the --font-arabic stack in globals.css. It is a licensed font and is not
 * bundled here; Noto Sans Arabic is the brand guidelines' own approved
 * fallback (p.12) and carries the site until the licensed files are dropped
 * into /public/fonts.
 */
export const arabicFallback = Noto_Sans_Arabic({
  subsets: ["arabic"],
  display: "swap",
  variable: "--font-arabic-fallback",
  weight: ["400", "500", "600", "700"],
});

/** Display face variable — same family as body, per the guidelines. */
export const displayVariable = "--font-display";

export const fontVariables = `${latin.variable} ${arabicFallback.variable}`;
