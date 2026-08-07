# Fonts

The site uses two families — the maximum the brand guidelines allow in one
customer-facing piece (p.12). Both of the brand's specified faces are
commercially licensed and are **not** bundled in this repository, so each has a
documented drop-in slot and a working fallback.

| Role | Specified | Shipping today | Where |
| --- | --- | --- | --- |
| Arabic | **Madani Arabic** (your request) | Noto Sans Arabic | `src/app/fonts.ts`, `src/lib/arabic-font.ts` |
| Latin | **Co Headline** (guidelines p.12) | Outfit | `src/app/fonts.ts` |

The brand guidelines name `Noto Sans Arabic + Noto Sans` as the approved
fallback pair, so nothing here is off-brand while the licences are pending —
securing the Co Headline licence is itself an open action in the guidelines
(p.22).

---

## Adding Madani Arabic

Madani Arabic is the primary Arabic face. It is already first in the font
stack; it simply has no files behind it yet.

1. Obtain the licence and the **woff2** files.
2. Drop them into `public/fonts/` with exactly these names:

   ```
   public/fonts/madani-arabic-regular.woff2   (400)
   public/fonts/madani-arabic-medium.woff2    (500)
   public/fonts/madani-arabic-bold.woff2      (700)
   ```

3. Rebuild (`npm run build`).

That is the whole change. `src/lib/arabic-font.ts` checks the directory at
build time and emits `@font-face` rules **only for the weights it finds** — so
a partial set works, and an empty directory produces no failed requests. Every
Arabic surface picks it up through the `--font-arabic` token in
`src/app/globals.css`.

Only have `.ttf` or `.otf`? Convert first — woff2 is roughly a third of the
size and is supported by every browser this site targets:

```bash
npx ttf2woff2 < MadaniArabic-Regular.ttf > public/fonts/madani-arabic-regular.woff2
```

---

## Swapping Outfit for Co Headline

Outfit is a freely-licensed geometric sans chosen because it is the closest
match to Co Headline's rounded geometric character — much closer than Noto Sans
would be. To switch to the real thing:

1. Put the woff2 files in `public/fonts/` (e.g. `co-headline-regular.woff2`,
   `-medium`, `-bold`).
2. In `src/app/fonts.ts`, replace the `Outfit` import with a `localFont`
   declaration:

   ```ts
   import localFont from "next/font/local";

   export const latin = localFont({
     src: [
       { path: "../../public/fonts/co-headline-regular.woff2", weight: "400", style: "normal" },
       { path: "../../public/fonts/co-headline-medium.woff2",  weight: "500", style: "normal" },
       { path: "../../public/fonts/co-headline-bold.woff2",    weight: "700", style: "normal" },
     ],
     display: "swap",
     variable: "--font-latin",
   });
   ```

Nothing else changes — every heading, price and control reads the family
through `--font-sans` / `--font-display`.

---

## Numerals

Western Arabic digits (0–9) are used in both languages, as recommended in the
guidelines (p.13) for quick bilingual price scanning. The `.tabular` utility in
`globals.css` turns on tabular figures so prices align down a column, and in
RTL it keeps numerals in the Latin face so a price never picks up the wrong
digit shapes mid-column.
