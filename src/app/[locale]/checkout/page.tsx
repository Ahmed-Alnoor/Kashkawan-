import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n";
import { localePath, ROUTES } from "@/i18n/routing";
import { PageHeader } from "@/components/layout/PageHeader";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const dict = getDictionary(raw);
  return {
    title: dict.meta.checkout.title,
    description: dict.meta.checkout.description,
    robots: { index: false, follow: false },
    alternates: { canonical: localePath(raw, ROUTES.checkout) },
  };
}

export default async function CheckoutPage({
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
      <PageHeader
        eyebrow={dict.nav.cart}
        title={dict.checkout.title}
        lead={dict.checkout.subtitle}
      />
      <CheckoutForm locale={locale} dict={dict} />
    </>
  );
}
