import { getItem } from "@/data/menu";
import { RESTAURANT, whatsappUrl } from "@/data/restaurant";
import { AREA_INDEX, PAYMENT_METHODS } from "@/data/delivery";
import type { Locale } from "@/i18n/config";
import { formatPrice, generateOrderReference, listJoin } from "./format";
import { unitPrice, type LineSelections } from "./pricing";
import { ORDER_CHANNEL } from "./deployment";

/**
 * Sending an order.
 *
 * Two channels, chosen at build time (see src/lib/deployment.ts):
 *
 *   api      — POST to /api/orders. The server re-prices the basket from the
 *              menu data, refuses anything that does not match, and emails
 *              the branch and the customer.
 *   whatsapp — no server available. The complete order is written into a
 *              WhatsApp message to the branch's published delivery number.
 *              The reference is generated in the browser and printed in the
 *              message, so the customer and the branch quote the same number.
 *
 * Both return the same shape, so the checkout does not branch.
 */

export type OrderPayload = {
  idempotencyKey: string;
  locale: Locale;
  fulfilment: "delivery" | "pickup";
  customer: { fullName: string; phone: string; email: string };
  paymentMethod: string;
  website: string;
  lines: Array<{ itemId: string; quantity: number; selections: LineSelections }>;
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
};

export type SubmitResult =
  | { ok: true; reference: string; emailed: boolean; emailConfigured: boolean }
  | { ok: false; areaRejected: boolean };

/* ------------------------------------------------------------------ */
/* WhatsApp message                                                    */
/* ------------------------------------------------------------------ */

const L = {
  en: {
    title: "New order",
    ref: "Reference",
    items: "Order",
    without: "Without",
    notes: "Notes",
    subtotal: "Subtotal",
    feeNote: "Delivery fee to be confirmed",
    name: "Name",
    phone: "Phone",
    email: "Email",
    delivery: "Delivery",
    pickup: "Pickup from the branch",
    area: "Area",
    address: "Address",
    landmark: "Landmark",
    mapPin: "Map",
    instructions: "Instructions",
    payment: "Payment",
    each: "each",
  },
  ar: {
    title: "طلب جديد",
    ref: "رقم الطلب",
    items: "الطلب",
    without: "بدون",
    notes: "ملاحظات",
    subtotal: "المجموع",
    feeNote: "رسوم التوصيل تُؤكَّد لاحقاً",
    name: "الاسم",
    phone: "الهاتف",
    email: "البريد",
    delivery: "توصيل",
    pickup: "استلام من الفرع",
    area: "المنطقة",
    address: "العنوان",
    landmark: "أقرب معلم",
    mapPin: "الخريطة",
    instructions: "تعليمات",
    payment: "الدفع",
    each: "للحبة",
  },
} as const;

/** Builds the plain-text order the branch receives on WhatsApp. */
export function buildWhatsAppMessage(
  order: OrderPayload,
  reference: string,
): { text: string; subtotal: number } {
  const locale = order.locale;
  const t = L[locale];
  const money = (n: number) =>
    locale === "ar" ? `${formatPrice(n)} درهم` : `${formatPrice(n)} AED`;

  const lines: string[] = [];
  let subtotal = 0;

  lines.push(`*${t.title} — ${RESTAURANT.name[locale]}*`);
  lines.push(`${t.ref}: ${reference}`);
  lines.push("");
  lines.push(`*${t.items}*`);

  for (const line of order.lines) {
    const item = getItem(line.itemId);
    if (!item) continue;

    const each = unitPrice(item, line.selections);
    const lineTotal = each * line.quantity;
    subtotal += lineTotal;

    lines.push(
      `${line.quantity}× ${item.name[locale]} — ${money(lineTotal)}` +
        (line.quantity > 1 ? ` (${money(each)} ${t.each})` : ""),
    );

    const options: string[] = [];
    for (const group of item.optionGroups) {
      if (group.kind === "single") {
        const choice = group.choices.find((c) => c.id === line.selections.single[group.id]);
        if (choice) options.push(`${group.label[locale]}: ${choice.label[locale]}`);
      } else if (group.kind === "multi") {
        for (const id of line.selections.multi[group.id] ?? []) {
          const choice = group.choices.find((c) => c.id === id);
          if (choice) options.push(choice.label[locale]);
        }
      } else {
        const count = line.selections.counters[group.id] ?? 0;
        if (count > 0) options.push(`${group.label[locale]} × ${count}`);
      }
    }
    if (options.length) lines.push(`   ${options.join(" · ")}`);

    const removed = line.selections.removed
      .map((key) => item.removable.find((r) => r.en === key)?.[locale])
      .filter((v): v is string => Boolean(v));
    if (removed.length) lines.push(`   ${t.without}: ${listJoin(removed, locale)}`);

    if (line.selections.notes.trim()) {
      lines.push(`   ${t.notes}: ${line.selections.notes.trim()}`);
    }
  }

  lines.push("");
  lines.push(`*${t.subtotal}: ${money(subtotal)}*`);
  if (order.fulfilment === "delivery") lines.push(t.feeNote);

  lines.push("");
  lines.push(`*${order.fulfilment === "delivery" ? t.delivery : t.pickup}*`);
  lines.push(`${t.name}: ${order.customer.fullName}`);
  lines.push(`${t.phone}: ${order.customer.phone}`);
  lines.push(`${t.email}: ${order.customer.email}`);

  if (order.fulfilment === "delivery" && order.address) {
    const a = order.address;
    const area = AREA_INDEX.get(a.areaId)?.name[locale] ?? a.areaId;
    lines.push(`${t.area}: ${area}`);
    lines.push(
      `${t.address}: ${listJoin(
        [a.neighbourhood, a.building, a.floor, a.apartment].filter(Boolean),
        locale,
      )}`,
    );
    if (a.landmark) lines.push(`${t.landmark}: ${a.landmark}`);
    if (a.mapPin) lines.push(`${t.mapPin}: ${a.mapPin}`);
    if (a.instructions) lines.push(`${t.instructions}: ${a.instructions}`);
  }

  const payment = PAYMENT_METHODS.find((p) => p.id === order.paymentMethod);
  if (payment) lines.push(`${t.payment}: ${payment.label[locale]}`);

  return { text: lines.join("\n"), subtotal };
}

/* ------------------------------------------------------------------ */

export async function submitOrder(order: OrderPayload): Promise<SubmitResult> {
  if (ORDER_CHANNEL === "whatsapp") {
    const reference = generateOrderReference();
    const { text } = buildWhatsAppMessage(order, reference);

    // Opened in a new tab so the customer keeps the confirmation page. If the
    // browser blocks it, the confirmation page repeats the WhatsApp link.
    window.open(whatsappUrl(text), "_blank", "noopener,noreferrer");

    return { ok: true, reference, emailed: false, emailConfigured: false };
  }

  const response = await fetch("/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(order),
  });

  const result = (await response.json()) as {
    reference?: string;
    emailed?: boolean;
    emailConfigured?: boolean;
    issues?: Array<{ path: string; message: string }>;
  };

  if (!response.ok || !result.reference) {
    return {
      ok: false,
      areaRejected: Boolean(result.issues?.some((i) => i.path === "address.areaId")),
    };
  }

  return {
    ok: true,
    reference: result.reference,
    emailed: Boolean(result.emailed),
    emailConfigured: result.emailConfigured !== false,
  };
}
