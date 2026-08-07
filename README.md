# Kashkawan Cafeteria — website

Bilingual (Arabic / English) ordering site for Kashkawan Cafeteria,
Al Rashidiya 2, Ajman.

Menu, prices, imagery and voice are transcribed from the two source documents
in this repository: `Kashkawan Menu _ July 24_compressed.pdf` and
`Kashkawan Full Brand Guidelines 2026.pdf`. Nothing on the site is invented —
see [`docs/CONFIGURE.md`](docs/CONFIGURE.md) for the handful of details the
restaurant still needs to confirm and exactly where to put them.

---

## Quick start

```bash
npm install
cp .env.example .env.local     # optional — the site runs without it
npm run dev                    # http://localhost:3000
```

| Command | |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npx tsx --tsconfig tsconfig.json scripts/preview-emails.ts` | Render both order emails to `.email-preview/` |

---

## Stack

- **Next.js 16** (App Router, Turbopack) + **React 19** + **TypeScript** (strict)
- **Tailwind CSS v4** — brand tokens defined in `@theme` in `src/app/globals.css`
- **Motion** (Framer Motion) — every animation respects `prefers-reduced-motion`
- **Zod** — one schema shared by the checkout form and the API route
- **Resend** — transactional email, optional (see below)

No database and no online payment. Orders are emailed to the branch and to the
customer; the basket lives in the customer's own browser.

---

## Layout

```
src/
  app/
    [locale]/            every page, under /en or /ar
      page.tsx           homepage
      menu/              full menu with search, filters and dish drawer
      cart/  checkout/  order-received/
      about/  location/
      privacy/  terms/  delivery/
    api/orders/          order intake, validation and email dispatch
    globals.css          brand tokens, base type, patterns, utilities
    fonts.ts             Latin + Arabic font loading
  components/
    brand/               approved logo lockups
    home/                homepage sections
    menu/                dish card, dish drawer, menu browser
    cart/  checkout/     basket, checkout form, confirmation
    layout/  ui/  seo/
  data/
    menu.ts              ← the menu. Single source of truth.
    restaurant.ts        address, phone, promise, service line
    delivery.ts          ← delivery areas and fees. Needs owner sign-off.
  i18n/                  locale config, routing, EN + AR dictionaries
  lib/
    pricing.ts           option pricing and cart maths
    cart-context.tsx     basket state, persisted to localStorage
    order-schema.ts      zod contract, shared client + server
    order-summary.ts     server-side re-pricing of a submitted order
    email/               templates and Resend dispatch
  proxy.ts               locale detection and redirect
```

---

## Editing content

**The menu.** `src/data/menu.ts`. Every price, portion and footnote is
transcribed from the printed menu; option `priceDelta` values are chosen so
computed totals match the printed numbers exactly. The rules for keeping it
trustworthy are in [`docs/CONFIGURE.md`](docs/CONFIGURE.md#changing-the-menu).

**Copy.** `src/i18n/dictionaries/en.ts` and `ar.ts`. The Arabic file is typed
against the English one, so adding a key without translating it fails the
build.

**Restaurant details.** `src/data/restaurant.ts`.

**Delivery areas and fees.** `src/data/delivery.ts` — **needs confirming before
launch**, see [`docs/CONFIGURE.md`](docs/CONFIGURE.md#1-delivery-areas--required-before-launch).

---

## Arabic and RTL

- Both languages are first-class. `/ar` sets `dir="rtl"` on `<html>`; every
  layout uses logical properties (`ms-`, `pe-`, `start-`, `end-`), so nothing
  needs a mirrored stylesheet.
- Icons that encode direction carry `.flip-rtl`.
- Prices use Western Arabic digits in both languages (guidelines p.13) and
  tabular figures so they align down a column.
- Phone numbers are wrapped in a bidi isolate so their digit groups are not
  reordered inside Arabic sentences.
- Every dish shows its name in both scripts, as on the printed menu.

## Accessibility

- Skip link, landmarks, and a visible focus ring on every control.
- The dish drawer is a real modal: focus is moved in, trapped, and restored;
  Escape closes it; the page behind it is locked.
- Quick-add and "open details" are two separate, separately-labelled controls
  rather than one ambiguous target.
- Cart changes are announced through a polite live region.
- Every animation collapses to a static state under `prefers-reduced-motion` —
  both the Motion components and the CSS transitions.
- Body text uses the palette's approved contrast pairs; Toast is used as an
  accent only, never for body copy (guidelines p.11).

## Order integrity

- Prices are **always** recomputed server-side from `src/data/menu.ts`. Nothing
  in the request body can change what an order costs.
- Delivery is restricted to the allowlist in `src/data/delivery.ts`, enforced
  in both the schema and the route.
- One idempotency key per checkout attempt: double-clicks, refreshes and retries
  return the original order reference instead of creating a second order.
- Per-IP rate limiting and a honeypot field.
- No card details are collected anywhere, by design.

---

## Deploying

Any Node host works; Vercel needs no configuration.

1. Push the repository and import it.
2. Set the environment variables from `.env.example`.
3. Deploy.

Then work through [`docs/CONFIGURE.md`](docs/CONFIGURE.md) — the delivery
areas in particular.

## Further reading

- [`docs/CONFIGURE.md`](docs/CONFIGURE.md) — what still needs the owner's sign-off
- [`docs/EMAIL.md`](docs/EMAIL.md) — switching on order emails
- [`docs/FONTS.md`](docs/FONTS.md) — dropping in the licensed brand fonts
