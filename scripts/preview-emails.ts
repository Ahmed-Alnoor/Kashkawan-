/**
 * Renders both order emails, in both languages, to `.email-preview/` so you
 * can open them in a browser without sending anything.
 *
 *   npx tsx --tsconfig tsconfig.json scripts/preview-emails.ts
 */
import fs from "node:fs";
import path from "node:path";
import { customerEmail, restaurantEmail } from "../src/lib/email/templates";
import { priceOrder } from "../src/lib/order-summary";
import type { OrderInput } from "../src/lib/order-schema";

const OUT = path.join(process.cwd(), ".email-preview");
fs.mkdirSync(OUT, { recursive: true });

const sample = (locale: "en" | "ar"): OrderInput => ({
  idempotencyKey: "preview",
  locale,
  fulfilment: "delivery",
  customer: {
    fullName: locale === "ar" ? "أحمد النور" : "Ahmed Alnoor",
    phone: "0501234567",
    email: "customer@example.com",
  },
  paymentMethod: "cash",
  website: "",
  lines: [
    {
      itemId: "pizza-margherita",
      quantity: 2,
      selections: {
        single: { size: "large" },
        multi: { "pizza-edges": ["cheese-edges"] },
        counters: { "pizza-toppings": 2 },
        removed: ["Tomato sauce"],
        notes: "Well done please",
      },
    },
    {
      itemId: "manakish-zaatar",
      quantity: 3,
      selections: {
        single: { dough: "wholegrain" },
        multi: {},
        counters: {},
        removed: [],
        notes: "",
      },
    },
    {
      itemId: "pastry-sfiha-half-kilo",
      quantity: 1,
      selections: { single: {}, multi: {}, counters: {}, removed: [], notes: "" },
    },
  ],
  address: {
    areaId: "al-rashidiya",
    neighbourhood: locale === "ar" ? "شارع البركان" : "Al Burkan Street",
    building: locale === "ar" ? "مبنى ١٢" : "Building 12",
    floor: "3",
    apartment: "305",
    landmark: locale === "ar" ? "بجانب المسجد" : "Next to the mosque",
    mapPin: "https://maps.app.goo.gl/example",
    instructions: locale === "ar" ? "اتصل عند الوصول" : "Call when you arrive",
  },
});

for (const locale of ["en", "ar"] as const) {
  const order = sample(locale);
  const priced = priceOrder(order);
  const ctx = { reference: "KSH-260807-AB7K", order, priced, locale };

  for (const [name, message] of [
    ["customer", customerEmail(ctx)],
    ["restaurant", restaurantEmail(ctx)],
  ] as const) {
    fs.writeFileSync(path.join(OUT, `${name}-${locale}.html`), message.html);
    fs.writeFileSync(
      path.join(OUT, `${name}-${locale}.txt`),
      `SUBJECT: ${message.subject}\n\n${message.text}`,
    );
  }

  console.log(
    `${locale}: subtotal ${priced.subtotal} AED, total ${priced.total} AED` +
      (priced.feeIsPending ? " (delivery fee pending)" : ""),
  );
}

console.log(`\nWritten to ${OUT}`);
