"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { getItem } from "@/data/menu";
import { RESTAURANT, mapsSearchUrl, whatsappUrl } from "@/data/restaurant";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n";
import { fill } from "@/i18n";
import { localePath, ROUTES } from "@/i18n/routing";
import { formatMoney, listJoin, telHref } from "@/lib/format";
import { unitPrice } from "@/lib/pricing";
import { areaName, paymentLabel } from "@/lib/order-summary";
import { readConfirmation, type StoredConfirmation } from "@/lib/confirmation-store";
import { buildWhatsAppMessage } from "@/lib/submit-order";
import { ORDER_CHANNEL } from "@/lib/deployment";
import { ButtonLink, ExternalButtonLink } from "@/components/ui/Button";
import { IconCheck, IconInfo, IconPhone, IconPin, IconWhatsApp } from "@/components/ui/Icons";

export function Confirmation({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const params = useSearchParams();
  const reference = params.get("ref") ?? "";
  const reduced = useReducedMotion();
  const [order, setOrder] = useState<StoredConfirmation | null>(null);
  const [loaded, setLoaded] = useState(false);

  // The placed order lives in sessionStorage on this device. Reading it during
  // render would make the server and client markup disagree, so it happens
  // after mount and the page shows a skeleton until then.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time sync from an external store (sessionStorage) after mount
    setOrder(reference ? readConfirmation(reference) : null);
    setLoaded(true);
  }, [reference]);

  if (!loaded) {
    return (
      <div className="shell py-24" aria-busy="true">
        <div className="mx-auto h-40 max-w-lg animate-pulse rounded-card bg-paper-dim" />
        <span className="sr-only">{dict.common.loading}</span>
      </div>
    );
  }

  const steps =
    order?.fulfilment === "pickup" ? dict.confirmation.stepsPickup : dict.confirmation.steps;

  const lines =
    order?.lines.flatMap((line) => {
      const item = getItem(line.itemId);
      if (!item) return [];
      return [
        {
          key: `${line.itemId}-${JSON.stringify(line.selections)}`,
          item,
          quantity: line.quantity,
          total: unitPrice(item, line.selections) * line.quantity,
        },
      ];
    }) ?? [];

  const subtotal = lines.reduce((sum, line) => sum + line.total, 0);

  return (
    <div className="shell py-12 lg:py-16">
      <div className="mx-auto max-w-3xl">
        <motion.div
          data-reveal=""
          initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: reduced ? 0.2 : 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto grid size-16 place-content-center rounded-full bg-heritage text-paper"
        >
          <IconCheck className="size-8" strokeWidth={2.2} />
        </motion.div>

        <div className="mt-6 text-center">
          <p className="eyebrow text-toast-600">{dict.confirmation.eyebrow}</p>
          <h1 className="h-section mt-3 text-heritage">{dict.confirmation.title}</h1>
        </div>

        {reference && (
          <div className="mt-8 rounded-card border border-paper-edge bg-white/75 p-6 text-center shadow-warm-sm">
            <p className="eyebrow text-ink-faint">{dict.confirmation.reference}</p>
            <p
              dir="ltr"
              className="tabular mt-2 text-2xl font-bold tracking-wider text-heritage sm:text-3xl"
            >
              {reference}
            </p>
            <p className="mt-2 text-sm text-ink-muted">{dict.confirmation.referenceHint}</p>
          </div>
        )}

        {order ? (
          <>
            {/* Only claim we emailed the customer when we actually did. */}
            <p className="mt-7 text-center text-base leading-relaxed text-ink-muted">
              {fill(
                order.emailed
                  ? order.fulfilment === "pickup"
                    ? dict.confirmation.bodyPickup
                    : dict.confirmation.body
                  : order.fulfilment === "pickup"
                    ? dict.confirmation.bodyPickupNoEmail
                    : dict.confirmation.bodyNoEmail,
                { email: order.customer.email, phone: order.customer.phone },
              )}
            </p>

            {/* WhatsApp builds: the message was opened in a new tab, which a
                browser may have blocked. Repeat it here so the order can
                always be sent — it is not with us until that message goes. */}
            {ORDER_CHANNEL === "whatsapp" ? (
              <div className="mt-6 rounded-card border border-heritage/25 bg-heritage/8 p-6">
                <h2 className="h-card font-bold text-heritage">
                  {dict.confirmation.whatsappTitle}
                </h2>
                <p className="mt-2 text-[0.95rem] leading-relaxed text-ink-muted">
                  {dict.confirmation.whatsappBody}
                </p>
                <ExternalButtonLink
                  href={whatsappUrl(
                    buildWhatsAppMessage(
                      {
                        idempotencyKey: reference,
                        locale,
                        fulfilment: order.fulfilment,
                        customer: order.customer,
                        paymentMethod: order.paymentMethod,
                        website: "",
                        lines: order.lines,
                        address: order.address,
                      },
                      reference,
                    ).text,
                  )}
                  target="_blank"
                  size="lg"
                  className="mt-5 w-full sm:w-auto"
                >
                  <IconWhatsApp className="size-5" />
                  {dict.confirmation.whatsappCta}
                </ExternalButtonLink>
                <p className="mt-3 text-xs leading-relaxed text-ink-faint">
                  {dict.confirmation.whatsappSent}
                </p>
              </div>
            ) : (
              !order.emailed && (
                <p className="mt-4 flex gap-2.5 rounded-xl bg-toast/12 px-4 py-3.5 text-sm leading-relaxed text-wheat">
                  <IconInfo className="mt-0.5 size-4 shrink-0" />
                  <span>{dict.confirmation.emailPending}</span>
                </p>
              )
            )}

            <div className="mt-4 flex gap-2.5 rounded-xl bg-heritage/8 px-4 py-3.5">
              <IconInfo className="mt-0.5 size-4 shrink-0 text-heritage" />
              <p className="text-sm leading-relaxed font-medium text-heritage">
                {dict.confirmation.noPayment}
              </p>
            </div>

            {/* What happens next */}
            <section className="mt-10">
              <h2 className="h-card font-bold text-heritage">{dict.confirmation.whatNext}</h2>
              <ol className="mt-4 space-y-4">
                {steps.map((step, index) => (
                  <li key={step} className="flex gap-4">
                    <span className="tabular grid size-8 shrink-0 place-content-center rounded-full bg-heritage/12 text-sm font-bold text-heritage">
                      {index + 1}
                    </span>
                    <p className="pt-1 text-[0.98rem] leading-relaxed text-ink-muted">{step}</p>
                  </li>
                ))}
              </ol>
            </section>

            {/* Address */}
            <section className="mt-10 rounded-card border border-paper-edge bg-white/75 p-6">
              <h2 className="eyebrow text-heritage">
                {order.fulfilment === "pickup"
                  ? dict.confirmation.collectFrom
                  : dict.confirmation.deliverTo}
              </h2>
              {order.fulfilment === "pickup" || !order.address ? (
                <p className="mt-3 text-[0.98rem] leading-relaxed text-ink">
                  {RESTAURANT.address.line[locale]}
                </p>
              ) : (
                <address className="mt-3 space-y-1 text-[0.98rem] leading-relaxed text-ink not-italic">
                  <p>{order.customer.fullName}</p>
                  <p>
                    {listJoin(
                      [
                        areaName(order.address.areaId, locale),
                        order.address.neighbourhood,
                        order.address.building,
                        order.address.floor,
                        order.address.apartment,
                      ].filter((part): part is string => Boolean(part)),
                      locale,
                    )}
                  </p>
                  {order.address.landmark && (
                    <p className="text-ink-muted">{order.address.landmark}</p>
                  )}
                  <p dir="ltr" className="tabular text-ink-muted">
                    {order.customer.phone}
                  </p>
                </address>
              )}
              <p className="mt-4 border-t border-paper-edge pt-4 text-sm text-ink-muted">
                {paymentLabel(order.paymentMethod, locale)}
              </p>
            </section>

            {/* Summary */}
            <section className="mt-6 rounded-card border border-paper-edge bg-white/75 p-6">
              <h2 className="eyebrow text-heritage">{dict.confirmation.summary}</h2>
              <ul className="mt-4 divide-y divide-paper-edge">
                {lines.map((line) => (
                  <li key={line.key} className="flex justify-between gap-4 py-3 text-[0.95rem]">
                    <span className="text-ink">
                      <span className="tabular font-semibold text-heritage">
                        {line.quantity}×
                      </span>{" "}
                      {line.item.name[locale]}
                    </span>
                    <span className="tabular shrink-0 font-semibold text-ink">
                      {formatMoney(line.total, locale)}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 space-y-2.5 border-t border-paper-edge pt-4 text-[0.95rem]">
                <div className="flex justify-between gap-4">
                  <span className="text-ink-muted">{dict.common.subtotal}</span>
                  <span className="tabular font-semibold text-ink">
                    {formatMoney(subtotal, locale)}
                  </span>
                </div>
                {order.fulfilment === "delivery" && (
                  <div className="flex justify-between gap-4">
                    <span className="text-ink-muted">{dict.cart.deliveryFee}</span>
                    <span className="text-sm text-ink-faint">{dict.cart.deliveryFeeOnCall}</span>
                  </div>
                )}
                <div className="flex items-baseline justify-between gap-4 border-t border-paper-edge pt-3">
                  <span className="font-bold text-ink">{dict.cart.orderTotal}</span>
                  <span className="tabular text-lg font-bold text-heritage">
                    {formatMoney(subtotal, locale)}
                  </span>
                </div>
              </div>
            </section>
          </>
        ) : (
          <div className="mt-8 rounded-card border border-paper-edge bg-white/75 p-6 text-center">
            <p className="font-semibold text-ink">{dict.confirmation.notFound}</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              {dict.confirmation.notFoundBody}
            </p>
          </div>
        )}

        {/* Contact */}
        <section className="mt-10 text-center">
          <h2 className="font-semibold text-ink">{dict.confirmation.contactUs}</h2>
          <div className="mt-4 flex flex-wrap justify-center gap-2.5">
            <ExternalButtonLink href={telHref(RESTAURANT.phone.e164)} variant="secondary">
              <IconPhone className="size-4" />
              <span dir="ltr" className="tabular">
                {RESTAURANT.phone.display}
              </span>
            </ExternalButtonLink>
            <ExternalButtonLink
              href={whatsappUrl(
                reference
                  ? locale === "ar"
                    ? `مرحباً، بخصوص الطلب ${reference}`
                    : `Hello, about order ${reference}`
                  : undefined,
              )}
              target="_blank"
              variant="secondary"
            >
              <IconWhatsApp className="size-4" />
              {dict.common.whatsapp}
            </ExternalButtonLink>
            <ExternalButtonLink href={mapsSearchUrl(locale)} target="_blank" variant="secondary">
              <IconPin className="size-4" />
              {dict.common.directions}
            </ExternalButtonLink>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-2.5">
            <ButtonLink href={localePath(locale, ROUTES.menu)}>
              {dict.confirmation.orderAgain}
            </ButtonLink>
            <ButtonLink href={localePath(locale, ROUTES.home)} variant="ghost">
              {dict.confirmation.backHome}
            </ButtonLink>
          </div>
        </section>
      </div>
    </div>
  );
}
