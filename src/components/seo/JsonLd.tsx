import { MENU } from "@/data/menu";
import { RESTAURANT, mapsSearchUrl } from "@/data/restaurant";
import type { Locale } from "@/i18n/config";
import { localePath, ROUTES } from "@/i18n/routing";
import { absoluteUrl } from "@/lib/site";

/**
 * Structured data. Everything here is drawn from the printed material — no
 * invented ratings, hours or price ranges. Fields we cannot substantiate
 * (aggregateRating, openingHours, geo) are simply omitted.
 */

function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // Serialised server-side from static data; `<` is escaped so the payload
      // can never terminate the script element early.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}

export function RestaurantJsonLd({ locale }: { locale: Locale }) {
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "@id": absoluteUrl(localePath(locale, ROUTES.home)),
    name: RESTAURANT.name[locale],
    alternateName: RESTAURANT.name[locale === "en" ? "ar" : "en"],
    description: RESTAURANT.promise[locale],
    servesCuisine: locale === "ar" ? ["شامية", "مخبوزات"] : ["Levantine", "Bakery"],
    url: absoluteUrl(localePath(locale, ROUTES.home)),
    telephone: RESTAURANT.phone.e164,
    image: [absoluteUrl("/food/spread-hero.jpg")],
    logo: absoluteUrl("/brand/logo-full-colour.png"),
    hasMap: mapsSearchUrl(locale),
    address: {
      "@type": "PostalAddress",
      streetAddress:
        locale === "ar" ? "شارع البركان، الراشدية ٢" : "Al Burkan Street, Al Rashidiya 2",
      addressLocality: RESTAURANT.address.city[locale],
      addressCountry: "AE",
    },
    hasMenu: {
      "@type": "Menu",
      url: absoluteUrl(localePath(locale, ROUTES.menu)),
      hasMenuSection: MENU.map((category) => ({
        "@type": "MenuSection",
        name: category.name[locale],
        hasMenuItem: category.items.map((item) => ({
          "@type": "MenuItem",
          name: item.name[locale],
          description: item.description[locale],
          offers: {
            "@type": "Offer",
            price: item.basePrice,
            priceCurrency: "AED",
          },
        })),
      })),
    },
    paymentAccepted:
      locale === "ar" ? "نقداً، بطاقة عند الاستلام" : "Cash, card on delivery",
    // Delivery is offered but the serviceable areas are owner-confirmed —
    // see src/data/delivery.ts. No areaServed is claimed until then.
    acceptsReservations: "False",
  };

  if (RESTAURANT.openingHours) {
    data.openingHoursSpecification = RESTAURANT.openingHours.map((entry) => ({
      "@type": "OpeningHoursSpecification",
      description: entry.days.en,
      opens: entry.opens,
      closes: entry.closes,
    }));
  }

  if (RESTAURANT.coordinates) {
    data.geo = {
      "@type": "GeoCoordinates",
      latitude: RESTAURANT.coordinates.lat,
      longitude: RESTAURANT.coordinates.lng,
    };
  }

  return <JsonLd data={data} />;
}

export function BreadcrumbJsonLd({
  locale,
  trail,
}: {
  locale: Locale;
  trail: Array<{ name: string; path: string }>;
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: trail.map((entry, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: entry.name,
          item: absoluteUrl(localePath(locale, entry.path)),
        })),
      }}
    />
  );
}
