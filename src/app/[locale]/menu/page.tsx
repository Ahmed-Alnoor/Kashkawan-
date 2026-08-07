import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n";
import { localePath, ROUTES } from "@/i18n/routing";
import { MenuBrowser } from "@/components/menu/MenuBrowser";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { PageHeader } from "@/components/layout/PageHeader";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const dict = getDictionary(raw);
  return {
    title: dict.meta.menu.title,
    description: dict.meta.menu.description,
    alternates: {
      canonical: localePath(raw, ROUTES.menu),
      languages: {
        en: localePath("en", ROUTES.menu),
        ar: localePath("ar", ROUTES.menu),
        "x-default": localePath("en", ROUTES.menu),
      },
    },
  };
}

export default async function MenuPage({
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
          { name: dict.nav.menu, path: ROUTES.menu },
        ]}
      />
      <PageHeader
        eyebrow={dict.menu.eyebrow}
        title={dict.menu.title}
        lead={dict.menu.subtitle}
      />
      <MenuBrowser locale={locale} dict={dict} />
    </>
  );
}
