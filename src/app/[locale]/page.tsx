import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n";
import { Hero } from "@/components/home/Hero";
import { Story } from "@/components/home/Story";
import { FeaturedDishes } from "@/components/home/FeaturedDishes";
import { CategoryPreview } from "@/components/home/CategoryPreview";
import { Hospitality } from "@/components/home/Hospitality";
import { VisitUs } from "@/components/home/VisitUs";
import { Gallery } from "@/components/home/Gallery";
import { OrderCta } from "@/components/home/OrderCta";
import { RestaurantJsonLd } from "@/components/seo/JsonLd";
import { localePath, ROUTES } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const dict = getDictionary(raw);
  return {
    title: dict.meta.home.title,
    description: dict.meta.home.description,
    alternates: {
      canonical: localePath(raw, ROUTES.home),
      languages: {
        en: localePath("en", ROUTES.home),
        ar: localePath("ar", ROUTES.home),
        "x-default": localePath("en", ROUTES.home),
      },
    },
  };
}

export default async function HomePage({
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
      <Hero locale={locale} dict={dict} />
      <Story locale={locale} dict={dict} />
      <FeaturedDishes locale={locale} dict={dict} />
      <CategoryPreview locale={locale} dict={dict} />
      <Hospitality locale={locale} dict={dict} />
      <Gallery locale={locale} dict={dict} />
      <VisitUs locale={locale} dict={dict} />
      <OrderCta locale={locale} dict={dict} />
    </>
  );
}
