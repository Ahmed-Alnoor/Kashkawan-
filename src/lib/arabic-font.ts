import { existsSync } from "node:fs";
import path from "node:path";

/**
 * Conditional @font-face for the licensed Arabic display face.
 *
 * "Madani Arabic" is the brand's requested primary Arabic font. It is
 * commercially licensed, so the files are not committed here. This module
 * checks /public/fonts at build time and emits the @font-face rules only for
 * the weights that are actually present — so an unconfigured deployment makes
 * zero failed font requests, and dropping the licensed files in switches the
 * site over on the next build with no code change.
 *
 * See SETUP.md for the exact filenames.
 */

const WEIGHTS = [
  { weight: 400, file: "madani-arabic-regular.woff2" },
  { weight: 500, file: "madani-arabic-medium.woff2" },
  { weight: 700, file: "madani-arabic-bold.woff2" },
] as const;

export function arabicFontFaceCss(): string {
  const publicFonts = path.join(process.cwd(), "public", "fonts");

  const rules = WEIGHTS.filter(({ file }) => existsSync(path.join(publicFonts, file))).map(
    ({ weight, file }) =>
      `@font-face{font-family:"Madani Arabic";src:url("/fonts/${file}") format("woff2");font-weight:${weight};font-style:normal;font-display:swap;}`,
  );

  return rules.join("");
}
