import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n";
import { Confirmation } from "@/components/checkout/Confirmation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const dict = getDictionary(raw);
  return {
    title: dict.meta.confirmation.title,
    description: dict.meta.confirmation.description,
    robots: { index: false, follow: false },
  };
}

export default async function ConfirmationPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale: Locale = raw;
  const dict = getDictionary(locale);

  return (
    <div style={{ paddingTop: "var(--header-h)" }}>
      <Suspense
        fallback={
          <div className="shell py-24" aria-busy="true">
            <div className="mx-auto h-40 max-w-lg animate-pulse rounded-card bg-paper-dim" />
          </div>
        }
      >
        <Confirmation locale={locale} dict={dict} />
      </Suspense>
    </div>
  );
}
