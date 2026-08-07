import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n";
import { localePath, ROUTES } from "@/i18n/routing";
import { PageHeader } from "@/components/layout/PageHeader";
import { VisitUs } from "@/components/home/VisitUs";
import { Reveal } from "@/components/ui/Motion";
import { ButtonLink, ExternalButtonLink } from "@/components/ui/Button";
import { IconArrow, IconPhone, IconPin, IconWhatsApp } from "@/components/ui/Icons";
import { BreadcrumbJsonLd, RestaurantJsonLd } from "@/components/seo/JsonLd";
import { RESTAURANT, mapsSearchUrl, whatsappUrl } from "@/data/restaurant";
import { telHref } from "@/lib/format";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const dict = getDictionary(raw);
  return {
    title: dict.meta.location.title,
    description: dict.meta.location.description,
    alternates: {
      canonical: localePath(raw, ROUTES.location),
      languages: {
        en: localePath("en", ROUTES.location),
        ar: localePath("ar", ROUTES.location),
        "x-default": localePath("en", ROUTES.location),
      },
    },
  };
}

export default async function LocationPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale: Locale = raw;
  const dict = getDictionary(locale);

  return (
    <>
      <RestaurantJsonLd locale={locale} />
      <BreadcrumbJsonLd
        locale={locale}
        trail={[
          { name: dict.nav.home, path: ROUTES.home },
          { name: dict.nav.location, path: ROUTES.location },
        ]}
      />

      <PageHeader
        eyebrow={dict.location.eyebrow}
        title={dict.location.title}
        lead={dict.location.lead}
      >
        <div className="mt-7 flex flex-wrap gap-3">
          <ExternalButtonLink
            href={mapsSearchUrl(locale)}
            target="_blank"
            variant="onDark"
            size="lg"
          >
            <IconPin className="size-[18px]" />
            {dict.common.directions}
          </ExternalButtonLink>
          <ExternalButtonLink
            href={telHref(RESTAURANT.phone.e164)}
            size="lg"
            className="border border-paper/30 bg-transparent text-paper shadow-none hover:border-paper/70 hover:bg-white/10"
          >
            <IconPhone className="size-[18px]" />
            <span dir="ltr" className="tabular">
              {RESTAURANT.phone.display}
            </span>
          </ExternalButtonLink>
        </div>
      </PageHeader>

      <VisitUs locale={locale} dict={dict} />

      <section className="section-y bg-paper">
        <div className="shell grid gap-6 md:grid-cols-2 lg:gap-8">
          <Reveal className="rounded-card border border-paper-edge bg-white/70 p-7 shadow-warm-sm">
            <h2 className="h-card font-bold text-heritage">{dict.location.howToFind}</h2>
            <p className="mt-3 text-[0.98rem] leading-relaxed text-ink-muted">
              {dict.location.directionsBody}
            </p>
            <p className="mt-3 text-[0.98rem] leading-relaxed text-ink-muted">
              {dict.location.parkingNote}
            </p>
            <ExternalButtonLink
              href={mapsSearchUrl(locale)}
              target="_blank"
              variant="secondary"
              className="mt-5"
            >
              <IconPin className="size-4" />
              {dict.home.openInMaps}
            </ExternalButtonLink>
          </Reveal>

          <Reveal delay={0.08} className="grid gap-6">
            <div className="rounded-card border border-paper-edge bg-white/70 p-7 shadow-warm-sm">
              <h2 className="h-card font-bold text-heritage">{dict.location.orderByPhone}</h2>
              <p className="mt-3 text-[0.98rem] leading-relaxed text-ink-muted">
                {dict.location.orderByPhoneBody}
              </p>
              <div className="mt-5 flex flex-wrap gap-2.5">
                <ExternalButtonLink href={telHref(RESTAURANT.phone.e164)} variant="secondary">
                  <IconPhone className="size-4" />
                  {dict.common.call}
                </ExternalButtonLink>
                <ExternalButtonLink href={whatsappUrl()} target="_blank" variant="secondary">
                  <IconWhatsApp className="size-4" />
                  {dict.common.whatsapp}
                </ExternalButtonLink>
              </div>
            </div>

            <div className="rounded-card border border-paper-edge bg-white/70 p-7 shadow-warm-sm">
              <h2 className="h-card font-bold text-heritage">{dict.location.orderOnline}</h2>
              <p className="mt-3 text-[0.98rem] leading-relaxed text-ink-muted">
                {dict.location.orderOnlineBody}
              </p>
              <ButtonLink href={localePath(locale, ROUTES.menu)} className="mt-5">
                {dict.common.orderNow}
                <IconArrow className="flip-rtl size-[18px]" />
              </ButtonLink>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
