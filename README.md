# Kashkawan Cafeteria

Bilingual (Arabic / English) ordering website for Kashkawan Cafeteria,
Al Burkan Street, Al Rashidiya 2, Ajman.

**→ [SETUP.md](SETUP.md) — publishing the site, and the few details still to
confirm.**

The menu, prices, photography and voice are transcribed from the restaurant's
own menu and 2026 brand guidelines. Nothing on the site is invented; where
those documents are silent, the site says so rather than guessing.

---

## Publish it

**GitHub Pages** — Settings → Pages → Source: **GitHub Actions**. Done. Every
push republishes. Orders arrive on WhatsApp.

**A Node host** (Vercel, Render) — import the repository and deploy. Orders
arrive by email as well.

Both are covered in [SETUP.md](SETUP.md#1-publishing-the-site).

## Run it locally

```bash
npm install
npm run dev      # http://localhost:3000
```

| Command | |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build (server) |
| `npm run build:static` | Static build for GitHub Pages → `out/` |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |

---

## What's in the box

Homepage · full menu with search, filters and a sticky category rail · dish
drawer with sizes, required choices, add-ons, removable ingredients, notes and
a live total · persistent cart · checkout · order confirmation · about ·
location · privacy, terms and delivery pages. All of it in both languages,
with real right-to-left layout.

**Stack** — Next.js 16 (App Router) · React 19 · TypeScript (strict) ·
Tailwind CSS v4 · Motion · Zod · Resend.

## Layout

```
src/
  app/
    [locale]/        every page, under /en or /ar
    api/orders/      order intake, validation, email (server build only)
    globals.css      brand tokens, base type, patterns
  components/        brand · home · menu · cart · checkout · layout · ui · seo
  data/
    menu.ts          ← the menu. Single source of truth.
    restaurant.ts    address, phone, promise, service line
    delivery.ts      ← delivery areas and fees. Needs your sign-off.
  i18n/              locale routing + English and Arabic dictionaries
  lib/               pricing · cart · order schema · submission · email
  proxy.ts           locale detection (server build only)
public/              logos, food photography, arch pattern
```

## How it holds together

**Arabic is first-class.** `/ar` sets `dir="rtl"`; every layout uses logical
properties, so there is no mirrored stylesheet to maintain. Prices use Western
digits in both languages per the guidelines, phone numbers are bidi-isolated so
they don't reverse inside Arabic sentences, and every dish shows both scripts.

**Accessible.** Skip link, landmarks, visible focus. The dish drawer is a real
modal — focus moved in, trapped, restored, Escape closes. Cart changes announce
politely. Every animation collapses under `prefers-reduced-motion`, and a
`noscript` rule reveals scroll-animated sections when JavaScript doesn't run.

**Orders can't be tampered with.** On the server build, prices are always
recomputed from `src/data/menu.ts` — nothing in the request body can change
what an order costs. Delivery is restricted to the allowlist in
`src/data/delivery.ts`, enforced twice. One idempotency key per checkout
attempt means double-taps and retries return the original reference instead of
creating a second order. Plus per-IP rate limiting and a honeypot.

**No card details are collected anywhere**, by design. Payment happens at the
door or the counter.
