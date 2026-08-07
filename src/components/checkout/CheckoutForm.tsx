"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { getItem } from "@/data/menu";
import { AREAS, FULFILMENT, PAYMENT_METHODS, type FulfilmentId } from "@/data/delivery";
import { RESTAURANT, mapsSearchUrl } from "@/data/restaurant";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n";
import { fill } from "@/i18n";
import { localePath, ROUTES } from "@/i18n/routing";
import { useCart } from "@/lib/cart-context";
import { bidiIsolate, formatMoney, listJoin, telHref } from "@/lib/format";
import { UAE_PHONE } from "@/lib/order-schema";
import { describeSelections } from "@/components/cart/CartLineRow";
import { Field, RadioCards, SelectField, TextareaField } from "./Field";
import { Button, ButtonLink } from "@/components/ui/Button";
import { IconArrow, IconBag, IconInfo, IconPhone, IconPin } from "@/components/ui/Icons";
import { storeConfirmation } from "@/lib/confirmation-store";
import { submitOrder } from "@/lib/submit-order";

type FormState = {
  fullName: string;
  phone: string;
  email: string;
  areaId: string;
  neighbourhood: string;
  building: string;
  floor: string;
  apartment: string;
  landmark: string;
  mapPin: string;
  instructions: string;
  paymentMethod: string;
  website: string; // honeypot
};

const EMPTY: FormState = {
  fullName: "",
  phone: "",
  email: "",
  areaId: "",
  neighbourhood: "",
  building: "",
  floor: "",
  apartment: "",
  landmark: "",
  mapPin: "",
  instructions: "",
  paymentMethod: PAYMENT_METHODS[0].id,
  website: "",
};

type Errors = Partial<Record<keyof FormState, string>>;

const CONTACT_KEY = "kashkawan.contact.v1";

export function CheckoutForm({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const cart = useCart();
  const router = useRouter();
  const reduced = useReducedMotion();

  const [fulfilment, setFulfilment] = useState<FulfilmentId>("delivery");
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const errorSummary = useRef<HTMLDivElement>(null);

  /**
   * One idempotency key per checkout attempt. It is minted on the first submit
   * (an event handler, so nothing impure happens during render) and reused for
   * every retry of that attempt, so a double-click or a retry after a dropped
   * connection can never create two orders — the server answers with the first
   * reference instead.
   */
  const idempotencyKey = useRef<string | null>(null);
  const takeIdempotencyKey = () => {
    idempotencyKey.current ??=
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `order-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    return idempotencyKey.current;
  };

  // Prefill from the last order placed on this device. This has to happen
  // after mount: reading storage during render would make the server and
  // client markup disagree.
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(CONTACT_KEY);
      if (!stored) return;
      const parsed = JSON.parse(stored) as Partial<FormState>;
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time sync from an external store (localStorage) after mount
      setForm((current) => ({ ...current, ...parsed }));
    } catch {
      /* ignore unreadable storage */
    }
  }, []);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => (current[key] ? { ...current, [key]: undefined } : current));
  };

  const validate = (): Errors => {
    const next: Errors = {};
    const required = dict.checkout.required;

    if (form.fullName.trim().length < 2) next.fullName = required;

    const phone = form.phone.replace(/[\s()\-.]/g, "");
    if (!phone) next.phone = required;
    else if (!UAE_PHONE.test(phone)) next.phone = dict.checkout.invalidPhone;

    const email = form.email.trim();
    if (!email) next.email = required;
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) next.email = dict.checkout.invalidEmail;

    if (fulfilment === "delivery") {
      if (!form.areaId) next.areaId = required;
      if (form.neighbourhood.trim().length < 2) next.neighbourhood = required;
      if (form.building.trim().length < 1) next.building = required;
      if (form.mapPin.trim()) {
        try {
          const url = new URL(form.mapPin.trim());
          if (url.protocol !== "https:" && url.protocol !== "http:") {
            next.mapPin = dict.checkout.invalidUrl;
          }
        } catch {
          next.mapPin = dict.checkout.invalidUrl;
        }
      }
    }

    return next;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submitting) return;

    if (cart.lines.length === 0) {
      setSubmitError(dict.checkout.emptyCart);
      return;
    }

    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) {
      setSubmitError(dict.checkout.validationError);
      errorSummary.current?.scrollIntoView({
        behavior: reduced ? "auto" : "smooth",
        block: "center",
      });
      return;
    }

    setSubmitError(null);
    setSubmitting(true);

    const payload = {
      idempotencyKey: takeIdempotencyKey(),
      locale,
      fulfilment,
      customer: {
        fullName: form.fullName.trim(),
        phone: form.phone.replace(/[\s()\-.]/g, ""),
        email: form.email.trim().toLowerCase(),
      },
      paymentMethod: form.paymentMethod,
      website: form.website,
      lines: cart.lines.map((line) => ({
        itemId: line.itemId,
        quantity: line.quantity,
        selections: line.selections,
      })),
      ...(fulfilment === "delivery"
        ? {
            address: {
              areaId: form.areaId,
              neighbourhood: form.neighbourhood.trim(),
              building: form.building.trim(),
              floor: form.floor.trim(),
              apartment: form.apartment.trim(),
              landmark: form.landmark.trim(),
              mapPin: form.mapPin.trim(),
              instructions: form.instructions.trim(),
            },
          }
        : { address: null }),
    };

    try {
      // Routed to the order API or to WhatsApp depending on how this build was
      // deployed — see src/lib/submit-order.ts.
      const result = await submitOrder(payload);

      if (!result.ok) {
        if (result.areaRejected) {
          setErrors((current) => ({ ...current, areaId: dict.checkout.areaUnserved }));
        }
        setSubmitError(
          fill(dict.checkout.submitError, { phone: bidiIsolate(RESTAURANT.phone.display) }),
        );
        setSubmitting(false);
        return;
      }

      try {
        window.localStorage.setItem(
          CONTACT_KEY,
          JSON.stringify({
            fullName: form.fullName,
            phone: form.phone,
            email: form.email,
            areaId: form.areaId,
            neighbourhood: form.neighbourhood,
            building: form.building,
            floor: form.floor,
            apartment: form.apartment,
            landmark: form.landmark,
          }),
        );
      } catch {
        /* storage is optional */
      }

      // Hand the confirmation page everything it needs before clearing the
      // basket, so a refresh on that page still shows the order.
      storeConfirmation({
        reference: result.reference,
        emailed: result.emailed,
        emailConfigured: result.emailConfigured,
        locale,
        fulfilment,
        customer: payload.customer,
        address: fulfilment === "delivery" ? payload.address ?? null : null,
        paymentMethod: form.paymentMethod,
        lines: payload.lines,
        placedAt: new Date().toISOString(),
      });

      cart.clear();
      router.push(
        `${localePath(locale, ROUTES.confirmation)}?ref=${encodeURIComponent(result.reference)}`,
      );
    } catch {
      setSubmitError(fill(dict.checkout.submitError, { phone: bidiIsolate(RESTAURANT.phone.display) }));
      setSubmitting(false);
    }
  };

  const summaryLines = useMemo(
    () =>
      cart.lines.flatMap((line) => {
        const item = getItem(line.itemId);
        if (!item) return [];
        const { options, removed, notes } = describeSelections(item, line, locale);
        return [{ line, item, options, removed, notes }];
      }),
    [cart.lines, locale],
  );

  if (cart.hydrated && cart.lines.length === 0) {
    return (
      <div className="shell py-20 lg:py-28">
        <div className="mx-auto max-w-md text-center">
          <span className="mx-auto grid size-16 place-content-center rounded-full bg-heritage/10 text-heritage">
            <IconBag className="size-7" />
          </span>
          <h2 className="h-card mt-6 font-bold text-ink">{dict.cart.empty}</h2>
          <p className="mt-2 text-ink-muted">{dict.checkout.emptyCart}</p>
          <ButtonLink href={localePath(locale, ROUTES.menu)} size="lg" className="mt-7">
            {dict.cart.browseMenu}
            <IconArrow className="flip-rtl size-[18px]" />
          </ButtonLink>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="shell py-10 lg:py-14">
      <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-14">
        {/* ---------------------------------------------------------- */}
        <div className="space-y-10">
          <div ref={errorSummary}>
            <AnimatePresence>
              {submitError && (
                <motion.div
                  initial={reduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  role="alert"
                  className="mb-8 flex gap-3 rounded-xl border border-danger/30 bg-danger/6 px-4 py-3.5"
                >
                  <IconInfo className="mt-0.5 size-5 shrink-0 text-danger" />
                  <p className="text-sm leading-relaxed font-medium text-danger">{submitError}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <Section title={dict.checkout.fulfilmentLegend}>
              <RadioCards
                legend={dict.checkout.fulfilmentLegend}
                name="fulfilment"
                value={fulfilment}
                onChange={(value) => setFulfilment(value as FulfilmentId)}
                options={FULFILMENT.map((option) => ({
                  value: option.id,
                  label: option.label[locale],
                  description:
                    option.id === "pickup" ? RESTAURANT.address.line[locale] : undefined,
                }))}
              />
            </Section>
          </div>

          <Section title={dict.checkout.contactLegend}>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Field
                  label={dict.checkout.fullName}
                  name="fullName"
                  value={form.fullName}
                  onChange={(value) => set("fullName", value)}
                  error={errors.fullName}
                  required
                  autoComplete="name"
                  maxLength={120}
                />
              </div>
              <Field
                label={dict.checkout.phone}
                hint={dict.checkout.phoneHint}
                name="phone"
                type="tel"
                inputMode="tel"
                dir="ltr"
                value={form.phone}
                onChange={(value) => set("phone", value)}
                error={errors.phone}
                required
                autoComplete="tel"
                maxLength={20}
              />
              <Field
                label={dict.checkout.email}
                hint={dict.checkout.emailHint}
                name="email"
                type="email"
                inputMode="email"
                dir="ltr"
                value={form.email}
                onChange={(value) => set("email", value)}
                error={errors.email}
                required
                autoComplete="email"
                maxLength={180}
              />
            </div>
          </Section>

          <AnimatePresence mode="wait" initial={false}>
            {fulfilment === "delivery" ? (
              <motion.div
                key="delivery"
                initial={reduced ? { opacity: 0 } : { opacity: 0, height: 0 }}
                animate={reduced ? { opacity: 1 } : { opacity: 1, height: "auto" }}
                exit={reduced ? { opacity: 0 } : { opacity: 0, height: 0 }}
                transition={{ duration: reduced ? 0.15 : 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <Section title={dict.checkout.addressLegend}>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <SelectField
                        label={dict.checkout.area}
                        hint={dict.checkout.areaHelp}
                        placeholder={dict.checkout.areaPlaceholder}
                        name="areaId"
                        value={form.areaId}
                        onChange={(value) => set("areaId", value)}
                        error={errors.areaId}
                        required
                        options={AREAS.map((area) => ({
                          value: area.id,
                          label: area.name[locale],
                        }))}
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <Field
                        label={dict.checkout.neighbourhood}
                        name="neighbourhood"
                        value={form.neighbourhood}
                        onChange={(value) => set("neighbourhood", value)}
                        error={errors.neighbourhood}
                        required
                        autoComplete="address-line1"
                        maxLength={160}
                      />
                    </div>

                    <Field
                      label={dict.checkout.building}
                      name="building"
                      value={form.building}
                      onChange={(value) => set("building", value)}
                      error={errors.building}
                      required
                      autoComplete="address-line2"
                      maxLength={120}
                    />
                    <Field
                      label={dict.checkout.floor}
                      name="floor"
                      value={form.floor}
                      onChange={(value) => set("floor", value)}
                      optionalLabel={dict.common.optional}
                      maxLength={40}
                    />
                    <Field
                      label={dict.checkout.apartment}
                      name="apartment"
                      value={form.apartment}
                      onChange={(value) => set("apartment", value)}
                      optionalLabel={dict.common.optional}
                      maxLength={60}
                    />
                    <Field
                      label={dict.checkout.landmark}
                      hint={dict.checkout.landmarkHint}
                      name="landmark"
                      value={form.landmark}
                      onChange={(value) => set("landmark", value)}
                      optionalLabel={dict.common.optional}
                      maxLength={160}
                    />

                    <div className="sm:col-span-2">
                      <Field
                        label={dict.checkout.mapPin}
                        hint={dict.checkout.mapPinHint}
                        placeholder={dict.checkout.mapPinPlaceholder}
                        name="mapPin"
                        type="url"
                        inputMode="url"
                        dir="ltr"
                        value={form.mapPin}
                        onChange={(value) => set("mapPin", value)}
                        error={errors.mapPin}
                        optionalLabel={dict.common.optional}
                        maxLength={500}
                      />
                      <a
                        href={mapsSearchUrl(locale)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-heritage underline underline-offset-4 hover:text-heritage-700"
                      >
                        <IconPin className="size-3.5" />
                        {dict.checkout.mapPinShare}
                      </a>
                    </div>

                    <div className="sm:col-span-2">
                      <TextareaField
                        label={dict.checkout.deliveryInstructions}
                        placeholder={dict.checkout.deliveryInstructionsPlaceholder}
                        name="instructions"
                        value={form.instructions}
                        onChange={(value) => set("instructions", value)}
                        optionalLabel={dict.common.optional}
                        maxLength={400}
                      />
                    </div>
                  </div>
                </Section>
              </motion.div>
            ) : (
              <motion.div
                key="pickup"
                initial={reduced ? { opacity: 0 } : { opacity: 0, height: 0 }}
                animate={reduced ? { opacity: 1 } : { opacity: 1, height: "auto" }}
                exit={reduced ? { opacity: 0 } : { opacity: 0, height: 0 }}
                transition={{ duration: reduced ? 0.15 : 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <Section title={dict.checkout.pickupNotice}>
                  <div className="rounded-xl border border-paper-edge bg-white/70 p-5">
                    <p className="text-[0.95rem] leading-relaxed text-ink">
                      {fill(dict.checkout.pickupBody, {
                        address: RESTAURANT.address.line[locale],
                      })}
                    </p>
                    <a
                      href={mapsSearchUrl(locale)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-heritage underline underline-offset-4"
                    >
                      <IconPin className="size-4" />
                      {dict.common.directions}
                    </a>
                  </div>
                </Section>
              </motion.div>
            )}
          </AnimatePresence>

          <Section title={dict.checkout.paymentLegend}>
            <RadioCards
              legend={dict.checkout.paymentMethod}
              name="paymentMethod"
              value={form.paymentMethod}
              onChange={(value) => set("paymentMethod", value)}
              options={PAYMENT_METHODS.map((method) => ({
                value: method.id,
                label: method.label[locale],
              }))}
            />
            <div className="mt-4 flex gap-2.5 rounded-xl bg-heritage/8 p-4">
              <IconInfo className="mt-0.5 size-4 shrink-0 text-heritage" />
              <div>
                <p className="text-sm font-semibold text-heritage">
                  {dict.cart.noOnlinePayment}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-ink-muted">
                  {dict.cart.noOnlinePaymentBody}
                </p>
              </div>
            </div>
          </Section>

          {/* Honeypot — visually and programmatically hidden from people. */}
          <div aria-hidden className="absolute h-px w-px overflow-hidden opacity-0">
            <label htmlFor="website-field">Website</label>
            <input
              id="website-field"
              name="website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={form.website}
              onChange={(event) => set("website", event.target.value)}
            />
          </div>
        </div>

        {/* Summary --------------------------------------------------- */}
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-card border border-paper-edge bg-white/75 p-6 shadow-warm-sm">
            <div className="flex items-center justify-between gap-3">
              <h2 className="h-card font-bold text-ink">{dict.checkout.reviewLegend}</h2>
              <Link
                href={localePath(locale, ROUTES.cart)}
                className="text-sm font-semibold text-heritage underline underline-offset-4 hover:text-heritage-700"
              >
                {dict.common.edit}
              </Link>
            </div>

            <ul className="mt-5 max-h-72 space-y-4 overflow-y-auto pe-1">
              {summaryLines.map(({ line, item, options, removed, notes }) => (
                <li key={line.lineId} className="flex justify-between gap-3 text-sm">
                  <div className="min-w-0">
                    <p className="font-medium text-ink">
                      <span className="tabular text-heritage">{line.quantity}×</span>{" "}
                      {item.name[locale]}
                    </p>
                    {options.length > 0 && (
                      <p className="mt-0.5 text-xs text-ink-faint">{options.join(" · ")}</p>
                    )}
                    {removed.length > 0 && (
                      <p className="mt-0.5 text-xs text-danger">
                        {dict.cart.without}: {listJoin(removed, locale)}
                      </p>
                    )}
                    {notes && (
                      <p className="mt-0.5 text-xs text-ink-faint italic">{notes}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            <dl className="mt-5 space-y-3 border-t border-paper-edge pt-5 text-[0.95rem]">
              <div className="flex justify-between gap-4">
                <dt className="text-ink-muted">{dict.common.subtotal}</dt>
                <dd className="tabular font-semibold text-ink">
                  {formatMoney(cart.subtotal, locale)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink-muted">{dict.cart.deliveryFee}</dt>
                <dd className="text-end text-sm text-ink-faint">
                  {fulfilment === "pickup"
                    ? dict.cart.deliveryFeePickup
                    : dict.cart.deliveryFeeOnCall}
                </dd>
              </div>
            </dl>

            <div className="mt-5 flex items-baseline justify-between gap-4 border-t border-paper-edge pt-5">
              <p className="font-bold text-ink">{dict.cart.orderTotal}</p>
              <p className="tabular text-xl font-bold text-heritage">
                {formatMoney(cart.subtotal, locale)}
              </p>
            </div>

            <Button type="submit" size="lg" className="mt-6 w-full" disabled={submitting}>
              {submitting ? dict.checkout.placingOrder : dict.checkout.placeOrder}
              {!submitting && <IconArrow className="flip-rtl size-[18px]" />}
            </Button>

            <p className="mt-4 text-xs leading-relaxed text-ink-faint">
              {(() => {
                const parts = dict.checkout.consent.split(/(\{terms\}|\{privacy\})/);
                return parts.map((part, index) => {
                  if (part === "{terms}") {
                    return (
                      <Link
                        key={index}
                        href={localePath(locale, ROUTES.terms)}
                        className="font-semibold text-heritage underline underline-offset-2"
                      >
                        {dict.checkout.termsLink}
                      </Link>
                    );
                  }
                  if (part === "{privacy}") {
                    return (
                      <Link
                        key={index}
                        href={localePath(locale, ROUTES.privacy)}
                        className="font-semibold text-heritage underline underline-offset-2"
                      >
                        {dict.checkout.privacyLink}
                      </Link>
                    );
                  }
                  return <span key={index}>{part}</span>;
                });
              })()}
            </p>

            <a
              href={telHref(RESTAURANT.phone.e164)}
              className="mt-5 flex items-center justify-center gap-2 rounded-xl border border-paper-edge py-3 text-sm font-semibold text-heritage transition-colors hover:bg-paper-dim"
            >
              <IconPhone className="size-4" />
              <span dir="ltr" className="tabular">
                {RESTAURANT.phone.display}
              </span>
            </a>
          </div>
        </aside>
      </div>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="h-card font-bold text-heritage">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}
