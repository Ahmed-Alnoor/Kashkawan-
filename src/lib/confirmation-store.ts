import type { Locale } from "@/i18n/config";
import type { OrderLineInput } from "./order-schema";

/**
 * The confirmation page needs to show the order after the basket has been
 * cleared. There is no customer account and no database, so the placed order
 * is kept in sessionStorage on the customer's own device: it survives a
 * refresh of the confirmation page, and disappears when the tab closes.
 *
 * The authoritative copy of every order is the email sent to the branch — this
 * is only a receipt on screen. The page says so when the record is missing.
 */

const KEY = "kashkawan.confirmation.v1";

export type StoredConfirmation = {
  reference: string;
  emailed: boolean;
  emailConfigured: boolean;
  locale: Locale;
  fulfilment: "delivery" | "pickup";
  customer: { fullName: string; phone: string; email: string };
  address: {
    areaId: string;
    neighbourhood: string;
    building: string;
    floor: string;
    apartment: string;
    landmark: string;
    mapPin: string;
    instructions: string;
  } | null;
  paymentMethod: string;
  lines: OrderLineInput[];
  placedAt: string;
};

export const storeConfirmation = (confirmation: StoredConfirmation): void => {
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(confirmation));
  } catch {
    /* Private mode or full storage — the confirmation page falls back to the
       "we could not find that order" message, which is accurate. */
  }
};

export const readConfirmation = (reference: string): StoredConfirmation | null => {
  try {
    const raw = window.sessionStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredConfirmation;
    return parsed.reference === reference ? parsed : null;
  } catch {
    return null;
  }
};
