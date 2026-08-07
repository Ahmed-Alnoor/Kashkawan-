import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import "../globals.css";
import { latin, arabicFallback } from "../fonts";
import { LOCALES, dirFor, HTML_LANG, isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n";
import { localePath, ROUTES } from "@/i18n/routing";
import { CartProvider } from "@/lib/cart-context";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileOrderBar } from "@/components/layout/MobileOrderBar";
import { RESTAURANT } from "@/data/restaurant";
import { siteUrl } from "@/lib/site";
import { arabicFontFaceCss } from "@/lib/arabic-font";

export const dynamicParams = false;

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  themeColor: "#2a5d47",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const locale: Locale = raw;
  const dict = getDictionary(locale);

  return {
    metadataBase: new URL(siteUrl()),
    title: {
      default: dict.meta.home.title,
      template: `%s · ${RESTAURANT.name[locale]}`,
    },
    description: dict.meta.home.description,
    applicationName: RESTAURANT.name.en,
    alternates: {
      canonical: localePath(locale, ROUTES.home),
      languages: {
        en: localePath("en", ROUTES.home),
        ar: localePath("ar", ROUTES.home),
        "x-default": localePath("en", ROUTES.home),
      },
    },
    openGraph: {
      type: "website",
      siteName: RESTAURANT.name[locale],
      locale: HTML_LANG[locale],
      alternateLocale: HTML_LANG[locale === "en" ? "ar" : "en"],
      title: dict.meta.home.title,
      description: dict.meta.home.description,
      url: localePath(locale, ROUTES.home),
    },
    twitter: {
      card: "summary_large_image",
      title: dict.meta.home.title,
      description: dict.meta.home.description,
    },
    robots: { index: true, follow: true },
    formatDetection: { telephone: true, address: false, email: false },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale: Locale = raw;
  const dict = getDictionary(locale);
  const dir = dirFor(locale);
  const arabicFontFace = arabicFontFaceCss();

  return (
    <html lang={HTML_LANG[locale]} dir={dir} className={`${latin.variable} ${arabicFallback.variable}`}>
      <head>
        {/* Emitted only when the licensed Madani Arabic files are present.
            The ternary matters: a bare `&&` would put an empty text node in
            <head>, which React reports as a hydration mismatch. */}
        {arabicFontFace ? <style>{arabicFontFace}</style> : null}

        {/* Scroll-reveal sections are server-rendered at opacity 0 and are
            revealed by an IntersectionObserver. Without JavaScript that never
            fires, so the content — which is all present in the HTML — would
            simply never appear. This makes it visible instead. */}
        <noscript>
          <style>{`[data-reveal]{opacity:1!important;transform:none!important}`}</style>
        </noscript>
      </head>
      <body className="flex min-h-dvh flex-col bg-paper antialiased">
        <CartProvider>
          <Header locale={locale} dict={dict} />
          <main id="main" className="flex-1">
            {children}
          </main>
          <Footer locale={locale} dict={dict} />
          <MobileOrderBar locale={locale} dict={dict} />
        </CartProvider>
      </body>
    </html>
  );
}
