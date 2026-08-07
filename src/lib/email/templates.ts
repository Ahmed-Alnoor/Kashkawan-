import { RESTAURANT, mapsSearchUrl } from "@/data/restaurant";
import type { Locale } from "@/i18n/config";
import type { OrderInput } from "@/lib/order-schema";
import { areaName, money, paymentLabel, type PricedOrder } from "@/lib/order-summary";
import { bidiIsolate, listJoin } from "@/lib/format";

/**
 * Transactional email bodies.
 *
 * Written as inline-styled tables so they survive Gmail, Outlook and the iOS
 * mail client. Colours come from the brand palette. Every message also carries
 * a plain-text alternative, which is what most kitchen printers use.
 */

const C = {
  heritage: "#2A5D47",
  heritageDeep: "#132B21",
  wheat: "#523B16",
  paper: "#F5F2EA",
  paperDim: "#ECE7DB",
  edge: "#DED7C6",
  toast: "#C69C62",
  ink: "#252A27",
  muted: "#5C635E",
};

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

type Ctx = {
  reference: string;
  order: OrderInput;
  priced: PricedOrder;
  locale: Locale;
};

const COPY = {
  en: {
    dir: "ltr" as const,
    greeting: (name: string) => `Thank you, ${name}`,
    received: "We have your order",
    referenceLabel: "Order reference",
    nextTitle: "What happens next",
    nextDelivery: [
      "Our team reviews your order and calls you to confirm it.",
      "We bake it fresh — nothing is prepared before that call.",
      "Your driver collects it and heads to your address.",
    ],
    nextPickup: [
      "Our team reviews your order and calls you to confirm it.",
      "We bake it fresh — nothing is prepared before that call.",
      "We call you again as soon as it is ready to collect.",
    ],
    summary: "Order summary",
    subtotal: "Subtotal",
    deliveryFee: "Delivery fee",
    feePending: "Confirmed on the call",
    total: "Order total",
    noPayment:
      "No online payment was taken. You pay on delivery, or at the counter on pickup.",
    deliverTo: "Delivering to",
    collectFrom: "Collect from",
    contact: "Contact",
    payment: "Payment",
    instructions: "Delivery instructions",
    landmark: "Landmark",
    mapPin: "Map pin",
    notes: "Notes",
    without: "Without",
    questions: "Questions about this order? Call or message us on",
    footerAddress: "Kashkawan Cafeteria, Al Burkan Street, Al Rashidiya 2, Ajman",
    each: "each",
    qty: "Qty",
    newOrder: "New order",
    channel: "Placed on the website",
  },
  ar: {
    dir: "rtl" as const,
    greeting: (name: string) => `شكراً لك، ${name}`,
    received: "وصلنا طلبك",
    referenceLabel: "رقم الطلب",
    nextTitle: "ماذا بعد",
    nextDelivery: [
      "يراجع فريقنا طلبك ويتصل بك لتأكيده.",
      "نخبزه طازجاً — لا نبدأ التحضير قبل هذه المكالمة.",
      "يستلمه السائق ويتوجّه إلى عنوانك.",
    ],
    nextPickup: [
      "يراجع فريقنا طلبك ويتصل بك لتأكيده.",
      "نخبزه طازجاً — لا نبدأ التحضير قبل هذه المكالمة.",
      "نتصل بك مرة أخرى فور جهوزيته للاستلام.",
    ],
    summary: "ملخص الطلب",
    subtotal: "المجموع",
    deliveryFee: "رسوم التوصيل",
    feePending: "تُؤكَّد في المكالمة",
    total: "إجمالي الطلب",
    noPayment: "لم يُخصم أي مبلغ إلكترونياً. تدفع عند الاستلام أو عند الكاشير.",
    deliverTo: "التوصيل إلى",
    collectFrom: "الاستلام من",
    contact: "بيانات التواصل",
    payment: "الدفع",
    instructions: "تعليمات التوصيل",
    landmark: "أقرب معلم",
    mapPin: "موقع على الخريطة",
    notes: "ملاحظات",
    without: "بدون",
    questions: "لديك سؤال عن هذا الطلب؟ اتصل بنا أو راسلنا على",
    footerAddress: "كافتيريا قشقوان، شارع البركان، الراشدية ٢، عجمان",
    each: "للحبة",
    qty: "الكمية",
    newOrder: "طلب جديد",
    channel: "وارد من الموقع الإلكتروني",
  },
};

/* ------------------------------------------------------------------ */
/* Shared building blocks                                              */
/* ------------------------------------------------------------------ */

const shell = (locale: Locale, title: string, body: string): string => {
  const t = COPY[locale];
  return `<!doctype html>
<html lang="${locale}" dir="${t.dir}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light">
<title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background:${C.paperDim};font-family:'Segoe UI',Tahoma,Arial,sans-serif;color:${C.ink};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(title)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.paperDim};padding:24px 12px;">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:${C.paper};border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(82,59,22,0.10);">
${body}
</table>
<p style="max-width:600px;margin:20px auto 0;font-size:12px;line-height:1.7;color:${C.muted};text-align:center;">
${escapeHtml(t.footerAddress)}<br>
<a href="tel:${RESTAURANT.phone.e164}" dir="ltr" style="color:${C.heritage};text-decoration:none;unicode-bidi:isolate;">${RESTAURANT.phone.display}</a>
</p>
</td></tr>
</table>
</body>
</html>`;
};

const header = (locale: Locale, eyebrow: string, heading: string): string => `
<tr><td style="background:${C.heritageDeep};padding:28px 28px 24px;">
  <p style="margin:0;font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:${C.toast};">${escapeHtml(eyebrow)}</p>
  <h1 style="margin:8px 0 0;font-size:24px;line-height:1.3;color:${C.paper};font-weight:700;">${escapeHtml(heading)}</h1>
  <p style="margin:14px 0 0;font-size:13px;color:rgba(245,242,234,.6);">${escapeHtml(RESTAURANT.name[locale])} · ${escapeHtml(RESTAURANT.tagline.ar)}</p>
</td></tr>`;

const referenceBlock = (locale: Locale, reference: string): string => {
  const t = COPY[locale];
  return `
<tr><td style="padding:24px 28px 0;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.paperDim};border-radius:12px;">
    <tr><td style="padding:16px 20px;">
      <p style="margin:0;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:${C.muted};">${escapeHtml(t.referenceLabel)}</p>
      <p style="margin:6px 0 0;font-size:22px;font-weight:700;letter-spacing:.04em;color:${C.heritage};font-family:'Courier New',monospace;" dir="ltr">${escapeHtml(reference)}</p>
    </td></tr>
  </table>
</td></tr>`;
};

const lineRows = ({ priced, locale }: Ctx): string => {
  const t = COPY[locale];
  return priced.lines
    .map((line) => {
      const details: string[] = [];
      if (line.options[locale].length > 0) {
        details.push(
          `<div style="margin-top:4px;font-size:13px;color:${C.muted};">${line.options[locale].map(escapeHtml).join(" · ")}</div>`,
        );
      }
      if (line.removed[locale].length > 0) {
        details.push(
          `<div style="margin-top:3px;font-size:13px;color:#A3341F;">${escapeHtml(t.without)}: ${listJoin(line.removed[locale].map(escapeHtml), locale)}</div>`,
        );
      }
      if (line.notes) {
        details.push(
          `<div style="margin-top:3px;font-size:13px;font-style:italic;color:${C.muted};">${escapeHtml(t.notes)}: ${escapeHtml(line.notes)}</div>`,
        );
      }
      return `
<tr>
  <td style="padding:14px 0;border-bottom:1px solid ${C.edge};vertical-align:top;">
    <div style="font-size:15px;font-weight:600;color:${C.ink};">
      <span style="display:inline-block;min-width:26px;color:${C.heritage};font-weight:700;">${line.quantity}×</span>
      ${escapeHtml(line.name[locale])}
    </div>
    <div style="margin-top:2px;font-size:12px;color:#8A908B;" dir="${locale === "ar" ? "ltr" : "rtl"}">${escapeHtml(line.name[locale === "ar" ? "en" : "ar"])}</div>
    ${details.join("")}
  </td>
  <td style="padding:14px 0;border-bottom:1px solid ${C.edge};text-align:${t.dir === "rtl" ? "left" : "right"};vertical-align:top;white-space:nowrap;">
    <div style="font-size:15px;font-weight:700;color:${C.heritage};">${escapeHtml(money(line.total, locale))}</div>
    ${line.quantity > 1 ? `<div style="margin-top:2px;font-size:12px;color:#8A908B;">${escapeHtml(money(line.unit, locale))} ${escapeHtml(t.each)}</div>` : ""}
  </td>
</tr>`;
    })
    .join("");
};

const totalsBlock = (ctx: Ctx): string => {
  const { priced, locale } = ctx;
  const t = COPY[locale];
  const align = t.dir === "rtl" ? "left" : "right";

  const feeCell = priced.feeIsPending
    ? `<span style="font-size:13px;color:${C.muted};">${escapeHtml(t.feePending)}</span>`
    : `<span style="font-weight:600;">${escapeHtml(money(priced.deliveryFee ?? 0, locale))}</span>`;

  return `
<tr><td style="padding-top:6px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td style="padding:10px 0 4px;font-size:14px;color:${C.muted};">${escapeHtml(t.subtotal)}</td>
      <td style="padding:10px 0 4px;text-align:${align};font-size:14px;color:${C.ink};font-weight:600;">${escapeHtml(money(priced.subtotal, locale))}</td>
    </tr>
    ${
      ctx.order.fulfilment === "delivery"
        ? `<tr>
      <td style="padding:4px 0 12px;font-size:14px;color:${C.muted};">${escapeHtml(t.deliveryFee)}</td>
      <td style="padding:4px 0 12px;text-align:${align};font-size:14px;color:${C.ink};">${feeCell}</td>
    </tr>`
        : ""
    }
    <tr>
      <td style="padding:14px 0 0;border-top:2px solid ${C.heritage};font-size:16px;font-weight:700;color:${C.ink};">${escapeHtml(t.total)}</td>
      <td style="padding:14px 0 0;border-top:2px solid ${C.heritage};text-align:${align};font-size:20px;font-weight:700;color:${C.heritage};">${escapeHtml(money(priced.total, locale))}</td>
    </tr>
  </table>
</td></tr>`;
};

const addressBlock = (ctx: Ctx): string => {
  const { order, locale } = ctx;
  const t = COPY[locale];

  const rows: Array<[string, string]> = [];

  if (order.fulfilment === "delivery" && order.address) {
    const a = order.address;
    rows.push([
      t.deliverTo,
      listJoin(
        [
          areaName(a.areaId, locale),
          a.neighbourhood,
          a.building,
          a.floor ? `${locale === "ar" ? "الطابق" : "Floor"} ${a.floor}` : "",
          a.apartment,
        ].filter((part): part is string => Boolean(part)),
        locale,
      ),
    ]);
    if (a.landmark) rows.push([t.landmark, a.landmark]);
    if (a.instructions) rows.push([t.instructions, a.instructions]);
  } else {
    rows.push([t.collectFrom, RESTAURANT.address.line[locale]]);
  }

  rows.push([t.contact, `${order.customer.fullName} · ${order.customer.phone}`]);
  rows.push([t.payment, paymentLabel(order.paymentMethod, locale)]);

  const mapPin =
    order.fulfilment === "delivery" && order.address?.mapPin ? order.address.mapPin : "";

  return `
<tr><td style="padding:22px 28px 0;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.paperDim};border-radius:12px;">
    <tr><td style="padding:18px 20px;">
      ${rows
        .map(
          ([label, value]) => `
      <div style="margin-bottom:12px;">
        <div style="font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:${C.muted};">${escapeHtml(label)}</div>
        <div style="margin-top:3px;font-size:14px;line-height:1.6;color:${C.ink};">${escapeHtml(value)}</div>
      </div>`,
        )
        .join("")}
      ${
        mapPin
          ? `<div><div style="font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:${C.muted};">${escapeHtml(t.mapPin)}</div>
      <a href="${escapeHtml(mapPin)}" style="font-size:14px;color:${C.heritage};word-break:break-all;">${escapeHtml(mapPin)}</a></div>`
          : ""
      }
    </td></tr>
  </table>
</td></tr>`;
};

/* ------------------------------------------------------------------ */
/* Customer confirmation                                               */
/* ------------------------------------------------------------------ */

export function customerEmail(ctx: Ctx): { subject: string; html: string; text: string } {
  const { locale, reference, order, priced } = ctx;
  const t = COPY[locale];
  const steps = order.fulfilment === "delivery" ? t.nextDelivery : t.nextPickup;

  const html = shell(
    locale,
    `${t.received} — ${reference}`,
    `
${header(locale, t.received, t.greeting(order.customer.fullName))}
${referenceBlock(locale, reference)}
<tr><td style="padding:22px 28px 0;">
  <h2 style="margin:0 0 10px;font-size:13px;letter-spacing:.12em;text-transform:uppercase;color:${C.heritage};">${escapeHtml(t.nextTitle)}</h2>
  <ol style="margin:0;padding-${t.dir === "rtl" ? "right" : "left"}:20px;font-size:14px;line-height:1.85;color:${C.muted};">
    ${steps.map((step) => `<li>${escapeHtml(step)}</li>`).join("")}
  </ol>
</td></tr>
${addressBlock(ctx)}
<tr><td style="padding:26px 28px 0;">
  <h2 style="margin:0 0 4px;font-size:13px;letter-spacing:.12em;text-transform:uppercase;color:${C.heritage};">${escapeHtml(t.summary)}</h2>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    ${lineRows(ctx)}
    ${totalsBlock(ctx)}
  </table>
</td></tr>
<tr><td style="padding:22px 28px 28px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:rgba(42,93,71,.08);border-radius:12px;">
    <tr><td style="padding:16px 20px;font-size:14px;line-height:1.7;color:${C.heritage};font-weight:600;">
      ${escapeHtml(t.noPayment)}
    </td></tr>
  </table>
  <p style="margin:20px 0 0;font-size:13px;line-height:1.7;color:${C.muted};">
    ${escapeHtml(t.questions)}
    <a href="tel:${RESTAURANT.phone.e164}" style="color:${C.heritage};font-weight:600;text-decoration:none;unicode-bidi:isolate;" dir="ltr">${RESTAURANT.phone.display}</a>
  </p>
</td></tr>`,
  );

  const text = [
    `${t.received} — ${reference}`,
    "",
    `${t.referenceLabel}: ${reference}`,
    "",
    t.summary,
    ...priced.lines.map((line) => {
      const bits = [`${line.quantity}x ${line.name[locale]} — ${money(line.total, locale)}`];
      if (line.options[locale].length) bits.push(`   ${line.options[locale].join(" · ")}`);
      if (line.removed[locale].length)
        bits.push(`   ${t.without}: ${listJoin(line.removed[locale], locale)}`);
      if (line.notes) bits.push(`   ${t.notes}: ${line.notes}`);
      return bits.join("\n");
    }),
    "",
    `${t.subtotal}: ${money(priced.subtotal, locale)}`,
    order.fulfilment === "delivery"
      ? `${t.deliveryFee}: ${priced.feeIsPending ? t.feePending : money(priced.deliveryFee ?? 0, locale)}`
      : "",
    `${t.total}: ${money(priced.total, locale)}`,
    "",
    t.noPayment,
    "",
    `${t.questions} ${bidiIsolate(RESTAURANT.phone.display)}`,
    t.footerAddress,
  ]
    .filter(Boolean)
    .join("\n");

  return {
    subject:
      locale === "ar"
        ? `تأكيد طلبك ${reference} — كافتيريا قشقوان`
        : `Your order ${reference} — Kashkawan Cafeteria`,
    html,
    text,
  };
}

/* ------------------------------------------------------------------ */
/* Restaurant notification — always English + Arabic, kitchen-first     */
/* ------------------------------------------------------------------ */

export function restaurantEmail(ctx: Ctx): { subject: string; html: string; text: string } {
  const { reference, order, priced } = ctx;
  // The branch copy is always shown in the customer's language first, so the
  // team reads the order exactly as the customer wrote it.
  const locale = ctx.locale;
  const t = COPY[locale];

  const contactRows: Array<[string, string]> = [
    [locale === "ar" ? "الاسم" : "Name", order.customer.fullName],
    [locale === "ar" ? "الهاتف" : "Phone", order.customer.phone],
    [locale === "ar" ? "البريد" : "Email", order.customer.email],
    [
      locale === "ar" ? "الطريقة" : "Fulfilment",
      order.fulfilment === "delivery"
        ? locale === "ar"
          ? "توصيل"
          : "Delivery"
        : locale === "ar"
          ? "استلام من الفرع"
          : "Pickup",
    ],
    [t.payment, paymentLabel(order.paymentMethod, locale)],
  ];

  if (order.fulfilment === "delivery" && order.address) {
    const a = order.address;
    contactRows.push([locale === "ar" ? "المنطقة" : "Area", areaName(a.areaId, locale)]);
    contactRows.push([locale === "ar" ? "الحي والشارع" : "Neighbourhood & street", a.neighbourhood]);
    contactRows.push([locale === "ar" ? "المبنى" : "Building", a.building]);
    if (a.floor) contactRows.push([locale === "ar" ? "الطابق" : "Floor", a.floor]);
    if (a.apartment)
      contactRows.push([locale === "ar" ? "الشقة / الفيلا" : "Apartment / villa", a.apartment]);
    if (a.landmark) contactRows.push([t.landmark, a.landmark]);
    if (a.instructions) contactRows.push([t.instructions, a.instructions]);
  }

  const mapPin =
    order.fulfilment === "delivery" && order.address?.mapPin ? order.address.mapPin : "";

  const html = shell(
    locale,
    `${t.newOrder} ${reference}`,
    `
${header(locale, t.channel, `${t.newOrder} — ${reference}`)}
<tr><td style="padding:24px 28px 0;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.paperDim};border-radius:12px;">
    <tr><td style="padding:18px 20px;">
      ${contactRows
        .map(
          ([label, value]) => `
      <div style="margin-bottom:10px;">
        <span style="display:inline-block;min-width:150px;font-size:12px;text-transform:uppercase;letter-spacing:.1em;color:${C.muted};">${escapeHtml(label)}</span>
        <span style="font-size:14px;color:${C.ink};font-weight:600;">${escapeHtml(value)}</span>
      </div>`,
        )
        .join("")}
      ${
        mapPin
          ? `<div style="margin-top:6px;"><a href="${escapeHtml(mapPin)}" style="font-size:14px;font-weight:600;color:${C.heritage};">${escapeHtml(t.mapPin)}</a></div>`
          : ""
      }
      <div style="margin-top:6px;">
        <a href="tel:${RESTAURANT.phone.e164}" style="display:none;">.</a>
        <a href="${escapeHtml(mapsSearchUrl(locale))}" style="font-size:13px;color:${C.muted};">${escapeHtml(RESTAURANT.address.line[locale])}</a>
      </div>
    </td></tr>
  </table>
</td></tr>
<tr><td style="padding:24px 28px 28px;">
  <h2 style="margin:0 0 4px;font-size:13px;letter-spacing:.12em;text-transform:uppercase;color:${C.heritage};">${escapeHtml(t.summary)}</h2>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    ${lineRows(ctx)}
    ${totalsBlock(ctx)}
  </table>
</td></tr>`,
  );

  const text = [
    `${t.newOrder}: ${reference}`,
    "",
    ...contactRows.map(([label, value]) => `${label}: ${value}`),
    mapPin ? `${t.mapPin}: ${mapPin}` : "",
    "",
    t.summary,
    ...priced.lines.map((line) => {
      const bits = [`${line.quantity}x ${line.name.en} / ${line.name.ar} — ${money(line.total, locale)}`];
      if (line.options.en.length) bits.push(`   ${line.options.en.join(" · ")}`);
      if (line.removed.en.length) bits.push(`   ${t.without}: ${listJoin(line.removed.en, "en")}`);
      if (line.notes) bits.push(`   ${t.notes}: ${line.notes}`);
      return bits.join("\n");
    }),
    "",
    `${t.subtotal}: ${money(priced.subtotal, locale)}`,
    order.fulfilment === "delivery"
      ? `${t.deliveryFee}: ${priced.feeIsPending ? t.feePending : money(priced.deliveryFee ?? 0, locale)}`
      : "",
    `${t.total}: ${money(priced.total, locale)}`,
  ]
    .filter(Boolean)
    .join("\n");

  return {
    subject: `${t.newOrder} ${reference} · ${order.customer.fullName} · ${money(priced.total, locale)}`,
    html,
    text,
  };
}
