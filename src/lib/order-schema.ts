import { z } from "zod";
import { AREAS, PAYMENT_METHODS } from "@/data/delivery";
import { getItem } from "@/data/menu";
import { MAX_NOTE_LENGTH, MAX_QUANTITY } from "./pricing";

/**
 * The order contract. This module is imported by BOTH the checkout form and
 * the API route, so the browser and the server enforce exactly the same rules
 * — the server never trusts what the client sent.
 */

const areaIds = AREAS.map((a) => a.id) as [string, ...string[]];
const paymentIds = PAYMENT_METHODS.map((p) => p.id) as [string, ...string[]];

/**
 * UAE numbers: 05X XXXXXXX locally, or +9715X XXXXXXX. Spaces, dashes and
 * brackets are tolerated because people paste numbers from their contacts.
 */
export const UAE_PHONE = /^(?:\+?971|0)?5\d{8}$/;

const normalisePhone = (value: string) => value.replace(/[\s()\-.]/g, "");

const phoneSchema = z
  .string()
  .trim()
  .min(1)
  .transform(normalisePhone)
  .refine((value) => UAE_PHONE.test(value), { message: "invalidPhone" });

/** Rejects anything that is not an http(s) URL — no javascript: or data:. */
const mapPinSchema = z
  .string()
  .trim()
  .max(500)
  .refine(
    (value) => {
      if (value === "") return true;
      try {
        const url = new URL(value);
        return url.protocol === "https:" || url.protocol === "http:";
      } catch {
        return false;
      }
    },
    { message: "invalidUrl" },
  )
  .optional()
  .default("");

export const orderLineSchema = z.object({
  itemId: z.string().min(1),
  quantity: z.number().int().min(1).max(MAX_QUANTITY),
  selections: z.object({
    single: z.record(z.string(), z.string()).default({}),
    multi: z.record(z.string(), z.array(z.string())).default({}),
    counters: z.record(z.string(), z.number().int().min(0).max(20)).default({}),
    removed: z.array(z.string()).max(20).default([]),
    notes: z.string().max(MAX_NOTE_LENGTH).default(""),
  }),
});

const baseOrder = z.object({
  /** Client-generated, stable across retries — the server de-duplicates on it. */
  idempotencyKey: z.string().min(8).max(120),
  locale: z.enum(["en", "ar"]),
  fulfilment: z.enum(["delivery", "pickup"]),
  customer: z.object({
    fullName: z.string().trim().min(2, "required").max(120),
    phone: phoneSchema,
    email: z.string().trim().toLowerCase().email("invalidEmail").max(180),
  }),
  paymentMethod: z.enum(paymentIds),
  lines: z.array(orderLineSchema).min(1).max(80),
  /**
   * Honeypot — real people never fill this in. Deliberately NOT constrained to
   * an empty string: letting it through validation means the route can answer
   * a benign 200 without creating an order, rather than handing a bot a
   * validation error that tells it which field gave the game away.
   */
  website: z.string().max(200).optional().default(""),
});

const deliveryAddress = z.object({
  areaId: z.enum(areaIds),
  neighbourhood: z.string().trim().min(2, "required").max(160),
  building: z.string().trim().min(1, "required").max(120),
  floor: z.string().trim().max(40).optional().default(""),
  apartment: z.string().trim().max(60).optional().default(""),
  landmark: z.string().trim().max(160).optional().default(""),
  mapPin: mapPinSchema,
  instructions: z.string().trim().max(400).optional().default(""),
});

export const orderSchema = z.discriminatedUnion("fulfilment", [
  baseOrder.extend({
    fulfilment: z.literal("delivery"),
    address: deliveryAddress,
  }),
  baseOrder.extend({
    fulfilment: z.literal("pickup"),
    address: z.null().optional(),
  }),
]);

export type OrderInput = z.infer<typeof orderSchema>;
export type OrderLineInput = z.infer<typeof orderLineSchema>;

/**
 * Second gate: every line must reference a dish that still exists and every
 * required option must be answered. A tampered payload cannot smuggle in a
 * dish id or a price the menu does not have — prices are always recomputed
 * server-side from src/data/menu.ts and never read from the request.
 */
export const validateLinesAgainstMenu = (lines: OrderLineInput[]): string[] => {
  const problems: string[] = [];
  for (const line of lines) {
    const item = getItem(line.itemId);
    if (!item) {
      problems.push(`Unknown item: ${line.itemId}`);
      continue;
    }
    for (const group of item.optionGroups) {
      if (group.kind !== "single" || !group.required) continue;
      const chosen = line.selections.single[group.id];
      if (!chosen || !group.choices.some((c) => c.id === chosen)) {
        problems.push(`${item.name.en}: missing required choice "${group.label.en}"`);
      }
    }
  }
  return problems;
};
