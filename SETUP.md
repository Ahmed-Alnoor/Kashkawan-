# Setup

Everything that needs configuring, in one place.

1. [Publishing the site](#1-publishing-the-site)
2. [Delivery areas and fees](#2-delivery-areas-and-fees--required-before-launch)
3. [Opening hours, social links, map pin](#3-opening-hours-social-links-map-pin)
4. [Order emails](#4-order-emails-server-deployment-only)
5. [Brand fonts](#5-brand-fonts)
6. [Editing the menu](#6-editing-the-menu)

---

## 1. Publishing the site

The same code publishes two ways. Pick one.

### A. GitHub Pages — free, no account needed, already wired up

**Repository → Settings → Pages → Source: _GitHub Actions_.** That's the whole
setup. Every push then rebuilds and republishes automatically
(`.github/workflows/deploy-pages.yml`).

Your site appears at `https://<username>.github.io/<repo>/`.

GitHub Pages serves files but cannot run a server, so this build sends orders
**to WhatsApp** instead of by email. The customer fills in the checkout, and
the complete order — items, options, prices, address, reference number — is
written into a WhatsApp message addressed to the delivery number on your menu.
They tap send; you get it on the phone you already use for orders.

### B. A Node host (Vercel, Render, Railway) — adds order emails

1. **vercel.com** → *Continue with GitHub* → *Add New → Project* → import this
   repository.
2. Deploy. Nothing to configure — Next.js is detected automatically.
3. Optionally add the email variables from section 4.

This build runs the order API: prices are recomputed on the server, and each
order is emailed to the branch and to the customer.

> Both are complete, working sites. The difference is only how the order
> reaches you.

---

## 2. Delivery areas and fees — **required before launch**

**File: `src/data/delivery.ts`**

Your menu and brand guidelines do not say where you deliver or what you charge,
so nothing was assumed. Checkout works off an explicit list and refuses any
address outside it. The list currently holds the districts of Ajman as a
starting point — **not** a claim that you deliver to all of them.

```ts
export const AREAS: DeliveryArea[] = [
  { id: "al-rashidiya", name: { en: "Al Rashidiya", ar: "الراشدية" }, fee: null },
  …
];
```

1. **Delete every area you do not serve.** An area left in the list is an area
   a customer can order to.
2. **Add any that are missing**, in the same shape. `id` is a unique lowercase
   slug.
3. **Set `fee`** to the charge in AED for each area.
4. Set `DELIVERY_CONFIRMED = true` when all three are done.

While a `fee` is `null`, the cart, checkout, confirmation page and the order
message all say *"Delivery fee — confirmed when we call"* and leave it out of
the total. Put a number in and it appears everywhere. No other file changes.

Also here: `MINIMUM_ORDER_AED` (`null` = no minimum) and `PAYMENT_METHODS`
(cash or card on delivery — there is no online payment anywhere on this site).

---

## 3. Opening hours, social links, map pin

**File: `src/data/restaurant.ts`**

None of these are printed on your menu, so all three are empty and the site
says so honestly rather than guessing.

**Opening hours** — currently *"Call or message us and we will confirm today's
hours."* Fill in and the table appears, and Google gets your hours too:

```ts
openingHours: [
  { days: { en: "Saturday – Thursday", ar: "السبت - الخميس" }, opens: "07:00", closes: "23:00" },
  { days: { en: "Friday", ar: "الجمعة" }, opens: "13:00", closes: "23:00" },
],
```

**Social links** — your menu shows TikTok, Instagram, Facebook and Snapchat
icons but no handles, so the footer invites people to call instead. Add the
full URLs and the icon row appears; any left `null` is skipped:

```ts
social: { instagram: "https://instagram.com/…", facebook: null, tiktok: null, snapchat: null },
```

**Map pin** — every map link searches Google Maps for your printed address,
which always works. Adding coordinates from your own Google listing makes the
pin exact:

```ts
coordinates: { lat: 25.4052, lng: 55.5136 },
```

---

## 4. Order emails (server deployment only)

Skip this on GitHub Pages — orders arrive by WhatsApp there.

The site runs perfectly well without email: orders still get a reference
number, and the confirmation page **never claims an email was sent** when it
was not.

To switch it on:

1. Sign up at [resend.com](https://resend.com).
2. **Domains → Add Domain** → `kashkawan.ae`, then add the DNS records Resend
   gives you (SPF, DKIM). You cannot send from an unverified domain.
3. **API Keys → Create API Key** with sending access.
4. Set these on your host:

```bash
RESEND_API_KEY=re_xxxxxxxxxxxx
ORDER_EMAIL_FROM=Kashkawan Cafeteria <orders@kashkawan.ae>   # domain must be verified
ORDER_EMAIL_TO=branch@kashkawan.ae                            # comma-separate for several
ORDER_EMAIL_REPLY_TO=                                         # optional
```

Place a test order. You get the customer email; the branch inbox gets the
order.

**If a send fails** the order still succeeds. A failed branch notification is
logged as `[orders] KSH-… — restaurant notification failed` — worth watching in
your host's logs.

**Preview the emails** without sending anything:

```bash
npx tsx --tsconfig tsconfig.json scripts/preview-emails.ts
```

**Duplicate orders** are prevented by an idempotency key held in memory for 30
minutes, so a double-tap or a retry returns the original reference. That memory
is per server instance. If you ever run more than one, move the `seenOrders`
map in `src/app/api/orders/route.ts` to a shared store like Upstash Redis.

---

## 5. Brand fonts

Two families, the maximum your guidelines allow in one piece (p.12). Both of
the specified faces are commercially licensed and are not included here, so
each has a drop-in slot and a working fallback.

| Role | Specified | Shipping today |
| --- | --- | --- |
| Arabic | **Madani Arabic** | Noto Sans Arabic |
| Latin | **Co Headline** (guidelines p.12) | Outfit |

Noto Sans Arabic is the fallback your own guidelines name (p.12), so nothing is
off-brand meanwhile — and securing the Co Headline licence is an open action in
the guidelines themselves (p.22).

**To add Madani Arabic**, drop the licensed woff2 files into `public/fonts/`
with exactly these names and rebuild:

```
public/fonts/madani-arabic-regular.woff2   (400)
public/fonts/madani-arabic-medium.woff2    (500)
public/fonts/madani-arabic-bold.woff2      (700)
```

That is the whole change — `src/lib/arabic-font.ts` checks the folder at build
time and only declares the weights it finds, so a partial set works and an
empty folder produces no failed requests. Convert other formats first:

```bash
npx ttf2woff2 < MadaniArabic-Regular.ttf > public/fonts/madani-arabic-regular.woff2
```

**To swap Outfit for Co Headline**, put its woff2 files in `public/fonts/` and
replace the `Outfit` import in `src/app/fonts.ts` with `next/font/local`.

**Numerals** are Western digits (0–9) in both languages, matching your printed
menu and the guidelines' recommendation (p.13).

---

## 6. Editing the menu

**File: `src/data/menu.ts`** — the single source of truth. The menu page,
homepage, category previews, cart, order message, emails and structured data
all read from it.

Four rules keep the site trustworthy:

1. Never add a dish, price or portion that is not on the printed menu.
2. A `description` may only restate what the dish name already says.
3. `allergens` are **derived** from the named ingredients and shown as
   guidance. Over-declare rather than under-declare.
4. Only set `image` when a real photograph of that exact dish exists in
   `public/food/`. Dishes without one get a branded arch tile — never another
   dish's photo.

Prices are in AED. Option `priceDelta` values are differences from `basePrice`,
chosen so the totals come out at the printed numbers (Margherita `basePrice:
15` with a Large delta of `+7` gives the printed 22).

**Copy** lives in `src/i18n/dictionaries/en.ts` and `ar.ts`. The Arabic file is
typed against the English one, so adding a key without translating it fails the
build.
