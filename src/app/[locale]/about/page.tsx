import type { Metadata } from "next";
import { Img } from "@/components/ui/Img";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n";
import { localePath, ROUTES } from "@/i18n/routing";
import { PageHeader } from "@/components/layout/PageHeader";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/Motion";
import { ButtonLink } from "@/components/ui/Button";
import { IconArrow, IconCheck } from "@/components/ui/Icons";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { RESTAURANT } from "@/data/restaurant";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const dict = getDictionary(raw);
  return {
    title: dict.meta.about.title,
    description: dict.meta.about.description,
    alternates: {
      canonical: localePath(raw, ROUTES.about),
      languages: {
        en: localePath("en", ROUTES.about),
        ar: localePath("ar", ROUTES.about),
        "x-default": localePath("en", ROUTES.about),
      },
    },
  };
}

export default async function AboutPage({
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
      <BreadcrumbJsonLd
        locale={locale}
        trail={[
          { name: dict.nav.home, path: ROUTES.home },
          { name: dict.nav.about, path: ROUTES.about },
        ]}
      />

      <PageHeader eyebrow={dict.about.eyebrow} title={dict.about.title} lead={dict.about.lead} />

      {/* Promise ------------------------------------------------------- */}
      <section className="section-y relative overflow-hidden bg-paper">
        <div className="pattern-arch absolute inset-0" aria-hidden />
        <div className="shell relative grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <Reveal>
            <h2 className="eyebrow text-toast-600">{dict.about.promiseTitle}</h2>
            <p className="mt-4 text-2xl leading-snug font-bold text-heritage lg:text-3xl">
              {RESTAURANT.promise[locale]}
            </p>
            <p className="mt-6 text-lg font-medium text-ink-muted">
              {RESTAURANT.brandIdea[locale]}
            </p>

            <h3 className="eyebrow mt-12 text-toast-600">{dict.about.proofTitle}</h3>
            <Stagger as="ul" className="mt-5 space-y-3.5">
              {dict.about.proof.map((point) => (
                <StaggerItem as="li" key={point} className="flex items-start gap-3">
                  <span
                    className="mt-0.5 grid size-6 shrink-0 place-content-center rounded-full bg-heritage/12 text-heritage"
                    aria-hidden
                  >
                    <IconCheck className="size-3.5" strokeWidth={2.4} />
                  </span>
                  <span className="text-[0.98rem] leading-relaxed text-ink">{point}</span>
                </StaggerItem>
              ))}
            </Stagger>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="relative aspect-[4/5] overflow-hidden rounded-card shadow-warm-lg">
              <Img
                src="/food/gallery-pizza.jpg"
                alt=""
                fill
                sizes="(min-width: 1024px) 34rem, 100vw"
                className="object-cover"
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* Positioning --------------------------------------------------- */}
      <section className="bg-heritage py-16 text-paper lg:py-20">
        <Reveal className="shell text-center">
          <h2 className="eyebrow text-toast">{dict.about.positioningTitle}</h2>
          <p className="mx-auto mt-5 max-w-2xl text-xl leading-snug font-bold text-paper lg:text-2xl">
            {dict.about.positioning}
          </p>
        </Reveal>
      </section>

      {/* Audience ------------------------------------------------------ */}
      <section className="section-y bg-paper-dim">
        <div className="shell">
          <Reveal>
            <h2 className="h-section text-heritage">{dict.about.audienceTitle}</h2>
          </Reveal>
          <Stagger as="ul" className="mt-10 grid gap-4 md:grid-cols-3 lg:gap-5">
            {dict.about.audience.map((entry, index) => (
              <StaggerItem
                as="li"
                key={entry.title}
                className="rounded-card border border-paper-edge bg-white/70 p-6 shadow-warm-sm"
              >
                <span className="tabular text-sm font-bold text-toast">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 text-lg font-bold text-heritage">{entry.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">{entry.body}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Values -------------------------------------------------------- */}
      <section className="section-y bg-paper">
        <div className="shell">
          <Reveal>
            <h2 className="h-section text-heritage">{dict.about.valuesTitle}</h2>
          </Reveal>
          <Stagger as="ul" className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
            {dict.home.values.map((value) => (
              <StaggerItem
                as="li"
                key={value.title}
                className="rounded-card border border-paper-edge bg-white/70 p-6 shadow-warm-sm"
              >
                <h3 className="text-lg font-bold text-heritage">{value.title}</h3>
                {locale === "en" && (
                  <p lang="ar" dir="rtl" className="font-arabic mt-1 text-base text-ink-faint">
                    {value.arabic}
                  </p>
                )}
                <p className="mt-3 text-sm leading-relaxed text-ink-muted">{value.body}</p>
              </StaggerItem>
            ))}
          </Stagger>

          <Reveal delay={0.1} className="mt-12 flex flex-wrap gap-3">
            <ButtonLink href={localePath(locale, ROUTES.menu)} size="lg">
              {dict.common.viewFullMenu}
              <IconArrow className="flip-rtl size-[18px]" />
            </ButtonLink>
            <ButtonLink href={localePath(locale, ROUTES.location)} variant="secondary" size="lg">
              {dict.about.visitCta}
            </ButtonLink>
          </Reveal>
        </div>
      </section>
    </>
  );
}
