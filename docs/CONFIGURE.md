# What the restaurant still needs to confirm

Everything on this site is transcribed from two documents in this repository:

- `Kashkawan Menu _ July 24_compressed.pdf`
- `Kashkawan Full Brand Guidelines 2026.pdf`

Nothing has been invented. Where those documents are silent, the site says so
rather than guessing. This page lists every one of those gaps, what the site
currently does, and the single file to edit.

---

## 1. Delivery areas — **required before launch**

**File:** `src/data/delivery.ts`

Neither document states where Kashkawan delivers or what it charges. Checkout
therefore works off an explicit allowlist and refuses any address outside it.
The list currently holds the municipal districts of Ajman — the emirate the
branch is in — as a starting point, **not** as a claim that you deliver to all
of them.

```ts
export const AREAS: DeliveryArea[] = [
  { id: "al-rashidiya", name: { en: "Al Rashidiya", ar: "الراشدية" }, fee: null },
  …
];
```

Do this:

1. **Delete every area you do not serve.** An area left in the list is an area
   a customer can order to.
2. **Add any missing ones**, following the same shape. `id` must be a unique
   lowercase slug.
3. **Set `fee`** to the delivery charge in AED for each area.
4. Set `DELIVERY_CONFIRMED = true` once you have done all three.

While a `fee` is `null`, the cart, checkout, confirmation page and both emails
all show *"Delivery fee — confirmed when we call"* and leave it out of the
total. As soon as you set a number, it appears in the totals everywhere. No
other file needs touching.

Also in this file:

- `MINIMUM_ORDER_AED` — `null` means no published minimum.
- `PAYMENT_METHODS` — currently cash or card on delivery. There is no online
  payment anywhere on this site.

---

## 2. Opening hours

**File:** `src/data/restaurant.ts` → `openingHours`

Not printed on the menu or in the brand guidelines, so it is `null`. The
homepage and location page currently say *"Call or message us and we will
confirm today's hours."*

Fill it in and the hours table appears automatically, and
`openingHoursSpecification` is added to the Restaurant structured data for
Google:

```ts
openingHours: [
  { days: { en: "Saturday – Thursday", ar: "السبت - الخميس" }, opens: "07:00", closes: "23:00" },
  { days: { en: "Friday", ar: "الجمعة" }, opens: "13:00", closes: "23:00" },
],
```

Use 24-hour `HH:MM`.

---

## 3. Social media links

**File:** `src/data/restaurant.ts` → `social`

The menu cover shows TikTok, Instagram, Facebook and Snapchat icons next to
`Kashkawan.ae`, but prints no handles. All four are `null`, so the footer
shows a short line inviting people to call instead of linking to a guess.

Fill in the full URLs you want to publish; the icon row appears automatically
and any left as `null` is simply skipped:

```ts
social: {
  instagram: "https://instagram.com/kashkawan",
  facebook: null,
  tiktok: null,
  snapchat: null,
},
```

---

## 4. Map pin

**File:** `src/data/restaurant.ts` → `coordinates`

No latitude/longitude was supplied. Every map link and the embedded map use a
Google Maps **search** for the printed address, which always resolves. Adding
coordinates adds a `geo` block to the structured data:

```ts
coordinates: { lat: 25.4052, lng: 55.5136 },
```

Take the numbers from the Google Maps URL of your own listing — do not
estimate them.

---

## 5. Site URL

**File:** environment (`NEXT_PUBLIC_SITE_URL`), see `.env.example`

Used for canonical tags, the sitemap, Open Graph tags and links inside emails.

---

## 6. Order emails

See [`docs/EMAIL.md`](./EMAIL.md). The site runs without them; orders get a
reference number and the confirmation page tells the customer to phone it
through.

---

## 7. Fonts

See [`docs/FONTS.md`](./FONTS.md). Two licensed families (Madani Arabic and
Co Headline) have documented drop-in slots.

---

## Changing the menu

`src/data/menu.ts` is the single source of truth — the menu page, homepage,
category previews, cart, emails, structured data and every price on the site
read from it.

Rules that keep the site honest:

1. Never add a dish, price or portion that is not on the printed menu.
2. A `description` may only restate what the dish name already says.
3. `allergens` are **derived** from the named ingredients, and the UI labels
   them as guidance. Over-declare rather than under-declare.
4. Only set `image` when a real photograph of that exact dish exists in
   `public/food/`. Dishes without one get a branded arch tile — never another
   dish's photo.

Prices are in AED. Option `priceDelta` values are differences from
`basePrice`, chosen so the computed totals equal the printed numbers exactly
(e.g. Margherita `basePrice: 15` with a Large delta of `+7` gives the printed
22).
