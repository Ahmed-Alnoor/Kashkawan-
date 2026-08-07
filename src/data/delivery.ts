/**
 * DELIVERY CONFIGURATION
 *
 * ⚠️  THIS FILE NEEDS THE OWNER'S SIGN-OFF BEFORE LAUNCH.
 *
 * Neither the menu nor the brand guidelines states which areas Kashkawan
 * delivers to, or what it charges. Rather than invent a delivery map, the
 * checkout works off the explicit allowlist below and refuses any address
 * outside it. Two things are deliberately left for the restaurant to set:
 *
 *   1. `AREAS`   — the districts you actually deliver to. Delete any you do
 *                  not serve, add any that are missing.
 *   2. `fee`     — AED delivery charge per area. `null` means "not published
 *                  yet"; the UI then tells the customer the fee is confirmed
 *                  when the branch calls, and leaves it out of the total.
 *   3. `MINIMUM_ORDER_AED` — `null` means no published minimum.
 *
 * The districts listed are the municipal areas of Ajman, the emirate the
 * branch is in (Al Rashidiya 2, Al Burkan Street). They are a starting point
 * for the owner to confirm, NOT a claim that delivery reaches all of them.
 *
 * See SETUP.md.
 */

import type { BilingualText } from "./restaurant";

export type DeliveryArea = {
  id: string;
  name: BilingualText;
  /** AED. `null` = not published yet; confirmed by phone. */
  fee: number | null;
};

/** Flip to `true` once the list and the fees below have been confirmed. */
export const DELIVERY_CONFIRMED = false;

export const AREAS: DeliveryArea[] = [
  { id: "al-rashidiya", name: { en: "Al Rashidiya", ar: "الراشدية" }, fee: null },
  { id: "al-nuaimiya", name: { en: "Al Nuaimiya", ar: "النعيمية" }, fee: null },
  { id: "al-jurf", name: { en: "Al Jurf", ar: "الجرف" }, fee: null },
  { id: "al-rumailah", name: { en: "Al Rumailah", ar: "الرميلة" }, fee: null },
  { id: "al-mowaihat", name: { en: "Al Mowaihat", ar: "المويهات" }, fee: null },
  { id: "al-hamidiya", name: { en: "Al Hamidiya", ar: "الحميدية" }, fee: null },
  { id: "al-rawda", name: { en: "Al Rawda", ar: "الروضة" }, fee: null },
  { id: "al-bustan", name: { en: "Al Bustan", ar: "البستان" }, fee: null },
  { id: "al-zahra", name: { en: "Al Zahra", ar: "الزهراء" }, fee: null },
  { id: "mushairef", name: { en: "Mushairef", ar: "مشيرف" }, fee: null },
  { id: "ajman-corniche", name: { en: "Ajman Corniche", ar: "كورنيش عجمان" }, fee: null },
  { id: "al-jerf-industrial", name: { en: "Al Jurf Industrial", ar: "الجرف الصناعية" }, fee: null },
];

/** AED. `null` = no published minimum order. */
export const MINIMUM_ORDER_AED: number | null = null;

/**
 * Offline payment methods offered on delivery. The menu cover shows Visa,
 * Mastercard, Apple Pay and Google Pay marks, which the branch accepts in
 * person / on the doorstep. There is no online payment on this website.
 */
export const PAYMENT_METHODS = [
  { id: "cash", label: { en: "Cash on delivery", ar: "الدفع نقداً عند الاستلام" } },
  { id: "card", label: { en: "Card on delivery", ar: "الدفع بالبطاقة عند الاستلام" } },
] as const;

export type PaymentMethodId = (typeof PAYMENT_METHODS)[number]["id"];

export const AREA_INDEX = new Map(AREAS.map((a) => [a.id, a]));

export const isServiceableArea = (id: string): boolean => AREA_INDEX.has(id);

/** Delivery fee for an area, or `null` when it has not been published. */
export const feeForArea = (id: string): number | null => AREA_INDEX.get(id)?.fee ?? null;

/** Fulfilment options. Pickup needs no address and never carries a fee. */
export const FULFILMENT = [
  { id: "delivery", label: { en: "Delivery", ar: "توصيل" } },
  { id: "pickup", label: { en: "Pickup from the branch", ar: "الاستلام من الفرع" } },
] as const;

export type FulfilmentId = (typeof FULFILMENT)[number]["id"];
