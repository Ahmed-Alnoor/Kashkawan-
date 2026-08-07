"use client";

import { useState } from "react";
import { FEATURED_ITEMS } from "@/data/menu";
import type { MenuItem } from "@/data/menu-types";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n";
import { fill } from "@/i18n";
import { useCart } from "@/lib/cart-context";
import { defaultSelections, isValidLine, type LineSelections } from "@/lib/pricing";
import { DishCard } from "@/components/menu/DishCard";
import { DishDrawer, type DrawerTarget } from "@/components/menu/DishDrawer";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/Motion";
import { ButtonLink } from "@/components/ui/Button";
import { IconArrow } from "@/components/ui/Icons";
import { localePath, ROUTES } from "@/i18n/routing";

export function FeaturedDishes({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const { addLine } = useCart();
  const [target, setTarget] = useState<DrawerTarget | null>(null);
  const [announcement, setAnnouncement] = useState("");

  const announce = (item: MenuItem) =>
    setAnnouncement(fill(dict.a11y.addedToCart, { name: item.name[locale] }));

  const quickAdd = (item: MenuItem) => {
    const selections = defaultSelections(item);
    if (!isValidLine(item, selections)) {
      setTarget({ item });
      return;
    }
    addLine(item.id, selections, 1);
    announce(item);
  };

  const submitDrawer = (selections: LineSelections, quantity: number) => {
    if (!target) return;
    addLine(target.item.id, selections, quantity);
    announce(target.item);
    setTarget(null);
  };

  return (
    <section className="section-y bg-paper-dim">
      <div className="shell">
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-xl">
            <p className="eyebrow text-toast-600">{dict.home.signatureEyebrow}</p>
            <h2 className="h-section mt-3 text-heritage">{dict.home.signatureTitle}</h2>
            <p className="mt-4 text-base leading-relaxed text-ink-muted">
              {dict.home.signatureBody}
            </p>
          </div>

          <ButtonLink href={localePath(locale, ROUTES.menu)} variant="secondary">
            {dict.common.viewFullMenu}
            <IconArrow className="flip-rtl size-[18px]" />
          </ButtonLink>
        </Reveal>

        <Stagger className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-5">
          {FEATURED_ITEMS.map((item, index) => (
            <StaggerItem key={item.id}>
              <DishCard
                item={item}
                locale={locale}
                dict={dict}
                index={index}
                onOpen={() => setTarget({ item })}
                onQuickAdd={() => quickAdd(item)}
              />
            </StaggerItem>
          ))}
        </Stagger>
      </div>

      <DishDrawer
        target={target}
        locale={locale}
        dict={dict}
        onClose={() => setTarget(null)}
        onSubmit={submitDrawer}
      />

      <p className="sr-only" role="status" aria-live="polite">
        {announcement}
      </p>
    </section>
  );
}
