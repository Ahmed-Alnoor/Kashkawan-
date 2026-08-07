import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n";
import { localePath, ROUTES } from "@/i18n/routing";
import { PolicyPage } from "@/components/layout/PolicyPage";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const dict = getDictionary(raw);
  return {
    title: dict.meta.delivery.title,
    description: dict.meta.delivery.description,
    alternates: {
      canonical: localePath(raw, ROUTES.delivery),
      languages: {
        en: localePath("en", ROUTES.delivery),
        ar: localePath("ar", ROUTES.delivery),
        "x-default": localePath("en", ROUTES.delivery),
      },
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale: Locale = raw;
  const dict = getDictionary(locale);

  return <PolicyPage locale={locale} dict={dict} policy={dict.policies.delivery} />;
}
