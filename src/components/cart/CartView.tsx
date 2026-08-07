"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { getItem } from "@/data/menu";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n";
import { fill } from "@/i18n";
import { localePath, ROUTES } from "@/i18n/routing";
import { useCart } from "@/lib/cart-context";
import { formatMoney } from "@/lib/format";
import type { LineSelections } from "@/lib/pricing";
import { CartLineRow } from "./CartLineRow";
import { DishDrawer, type DrawerTarget } from "@/components/menu/DishDrawer";
import { Button, ButtonLink } from "@/components/ui/Button";
import { IconArrow, IconBag, IconInfo } from "@/components/ui/Icons";
import { MINIMUM_ORDER_AED } from "@/data/delivery";

export function CartView({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const cart = useCart();
  const reduced = useReducedMotion();
  const [target, setTarget] = useState<DrawerTarget | null>(null);

  const belowMinimum =
    MINIMUM_ORDER_AED !== null && cart.subtotal > 0 && cart.subtotal < MINIMUM_ORDER_AED;

  if (!cart.hydrated) {
    return (
      <div className="shell py-24">
        <div className="mx-auto max-w-md space-y-4" aria-busy="true" aria-live="polite">
          <div className="h-6 w-40 animate-pulse rounded-full bg-paper-dim" />
          <div className="h-24 animate-pulse rounded-card bg-paper-dim" />
          <div className="h-24 animate-pulse rounded-card bg-paper-dim" />
          <span className="sr-only">{dict.common.loading}</span>
        </div>
      </div>
    );
  }

  if (cart.lines.length === 0) {
    return (
      <div className="shell py-20 lg:py-28">
        <div className="mx-auto max-w-md text-center">
          <span className="mx-auto grid size-16 place-content-center rounded-full bg-heritage/10 text-heritage">
            <IconBag className="size-7" />
          </span>
          <h2 className="h-card mt-6 font-bold text-ink">{dict.cart.empty}</h2>
          <p className="mt-2 text-ink-muted">{dict.cart.emptyBody}</p>
          <ButtonLink href={localePath(locale, ROUTES.menu)} size="lg" className="mt-7">
            {dict.cart.browseMenu}
            <IconArrow className="flip-rtl size-[18px]" />
          </ButtonLink>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="shell py-10 lg:py-14">
        <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr] lg:gap-14">
          {/* Lines -------------------------------------------------- */}
          <section aria-label={dict.a11y.cartRegion}>
            <div className="flex items-center justify-between gap-4">
              <p className="tabular text-sm text-ink-faint">
                {fill(cart.count === 1 ? dict.cart.itemCount : dict.cart.itemCountPlural, {
                  count: cart.count,
                })}
              </p>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(dict.cart.clearConfirm)) cart.clear();
                }}
                className="text-sm font-semibold text-ink-faint underline underline-offset-4 transition-colors hover:text-danger"
              >
                {dict.cart.clear}
              </button>
            </div>

            <ul className="mt-2 divide-y divide-paper-edge border-y border-paper-edge">
              <AnimatePresence initial={false}>
                {cart.lines.map((line) => {
                  const item = getItem(line.itemId);
                  if (!item) return null;
                  return (
                    <motion.div
                      key={line.lineId}
                      layout={!reduced}
                      initial={reduced ? false : { opacity: 0, height: 0 }}
                      animate={reduced ? {} : { opacity: 1, height: "auto" }}
                      exit={reduced ? { opacity: 0 } : { opacity: 0, height: 0 }}
                      transition={{ duration: reduced ? 0.15 : 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <CartLineRow
                        item={item}
                        line={line}
                        locale={locale}
                        dict={dict}
                        onQuantity={(quantity) => cart.setQuantity(line.lineId, quantity)}
                        onRemove={() => cart.removeLine(line.lineId, item.name[locale])}
                        onEdit={() =>
                          setTarget({
                            item,
                            lineId: line.lineId,
                            selections: line.selections,
                            quantity: line.quantity,
                          })
                        }
                      />
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </ul>

            <ButtonLink
              href={localePath(locale, ROUTES.menu)}
              variant="ghost"
              className="mt-6 -ms-2"
            >
              <IconArrow className="flip-rtl size-[18px] rotate-180" />
              {dict.cart.continueShopping}
            </ButtonLink>
          </section>

          {/* Summary ------------------------------------------------ */}
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-card border border-paper-edge bg-white/75 p-6 shadow-warm-sm">
              <h2 className="h-card font-bold text-ink">{dict.cart.title}</h2>

              <dl className="mt-5 space-y-3 text-[0.95rem]">
                <div className="flex justify-between gap-4">
                  <dt className="text-ink-muted">{dict.common.subtotal}</dt>
                  <dd className="tabular font-semibold text-ink">
                    {formatMoney(cart.subtotal, locale)}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-ink-muted">{dict.cart.deliveryFee}</dt>
                  {/* Fees are area-dependent and confirmed on the call — see
                      src/data/delivery.ts. Nothing is guessed here. */}
                  <dd className="text-end text-sm text-ink-faint">
                    {dict.cart.deliveryFeeOnCall}
                  </dd>
                </div>
              </dl>

              <div className="mt-5 flex items-baseline justify-between gap-4 border-t border-paper-edge pt-5">
                <p className="font-bold text-ink">{dict.cart.orderTotal}</p>
                <p className="tabular text-xl font-bold text-heritage">
                  {formatMoney(cart.subtotal, locale)}
                </p>
              </div>

              {belowMinimum && (
                <p className="mt-4 rounded-xl bg-toast/12 px-4 py-3 text-sm text-wheat">
                  {fill(dict.cart.minimumOrder, { amount: MINIMUM_ORDER_AED ?? 0 })}
                </p>
              )}

              <ButtonLink
                href={localePath(locale, ROUTES.checkout)}
                size="lg"
                className="mt-6 w-full"
              >
                {dict.cart.checkout}
                <IconArrow className="flip-rtl size-[18px]" />
              </ButtonLink>

              <div className="mt-5 flex gap-2.5 rounded-xl bg-heritage/8 p-4">
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
            </div>
          </aside>
        </div>
      </div>

      {/* Undo toast */}
      <AnimatePresence>
        {cart.lastRemoved && (
          <motion.div
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: reduced ? 0.15 : 0.3, ease: [0.22, 1, 0.36, 1] }}
            role="status"
            className="fixed inset-x-4 bottom-5 z-50 mx-auto flex max-w-md items-center justify-between gap-4 rounded-full bg-heritage-900 px-5 py-3 text-paper shadow-warm-lg sm:inset-x-auto sm:start-1/2 sm:-translate-x-1/2"
          >
            <span className="truncate text-sm">
              {fill(dict.cart.itemRemoved, { name: cart.lastRemoved.name })}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={cart.undoRemove}
              className="shrink-0 text-toast hover:bg-white/10 hover:text-toast"
            >
              {dict.cart.undo}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <DishDrawer
        target={target}
        locale={locale}
        dict={dict}
        onClose={() => setTarget(null)}
        onSubmit={(selections: LineSelections, quantity: number) => {
          if (target?.lineId) cart.updateLine(target.lineId, selections, quantity);
          setTarget(null);
        }}
      />

      <p className="sr-only">
        <Link href={localePath(locale, ROUTES.delivery)}>{dict.footer.delivery}</Link>
      </p>
    </>
  );
}
