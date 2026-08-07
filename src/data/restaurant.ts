/**
 * Restaurant facts.
 *
 * SOURCE OF TRUTH: "Kashkawan Menu | July 24" (cover page) and
 * "Kashkawan Full Brand Guidelines 2026".
 *
 * Every value below is taken verbatim from those documents. Do not add
 * opening hours, extra branches, emails or claims that are not printed on
 * the source material — see docs/CONFIGURE.md for the fields the owner
 * still needs to confirm before launch.
 */

export type BilingualText = { en: string; ar: string };

export const RESTAURANT = {
  /** Latin transliteration is fixed by the brand guidelines — never vary it. */
  name: { en: "Kashkawan Cafeteria", ar: "كافتيريا قشقوان" } as BilingualText,
  shortName: { en: "Kashkawan", ar: "قشقوان" } as BilingualText,
  /** Printed on the logo signature. */
  tagline: {
    en: "Authentic taste — the secret of distinction",
    ar: "الطعم الأصيل ... سر التميز",
  } as BilingualText,
  /** Brand guidelines, p.04 — brand promise. */
  promise: {
    en: "Freshly baked Levantine comfort, served generously and simply.",
    ar: "مخبوزات شامية طازجة، تُقدَّم بسخاء وبساطة.",
  } as BilingualText,
  /** Brand guidelines, p.03 — brand idea. */
  brandIdea: {
    en: "The warmth of the neighborhood oven",
    ar: "دفء فرن الحي",
  } as BilingualText,
  /** Brand guidelines, p.18 — legal descriptor, kept out of the logo. */
  legalName: "S.P.S. - L.L.C.",

  address: {
    line: {
      en: "Ajman — Al Rashidiya 2 — Al Burkan Street",
      ar: "عجمان - الراشدية ٢ - شارع البركان",
    } as BilingualText,
    city: { en: "Ajman", ar: "عجمان" } as BilingualText,
    country: { en: "United Arab Emirates", ar: "الإمارات العربية المتحدة" } as BilingualText,
  },

  /** Printed on the menu cover as the Home Delivery / WhatsApp number. */
  phone: {
    display: "058 60 60 158",
    /** E.164 for tel: and wa.me links. */
    e164: "+971586060158",
    whatsapp: "971586060158",
  },

  website: "kashkawan.ae",

  /**
   * The menu cover shows TikTok, Instagram, Facebook and Snapchat icons next
   * to "Kashkawan.ae" but prints no per-platform handles. Until the owner
   * confirms each URL these stay null and the footer simply omits them —
   * see docs/CONFIGURE.md.
   */
  social: {
    instagram: null as string | null,
    facebook: null as string | null,
    tiktok: null as string | null,
    snapchat: null as string | null,
  },

  /** Card logos printed on the menu cover (in-store / on delivery only). */
  acceptedPaymentMarks: ["Visa", "Mastercard", "Apple Pay", "Google Pay"],

  /**
   * Opening hours are NOT printed on the menu or in the brand guidelines.
   * Leave `null` until confirmed — the UI shows a "call to confirm" line
   * instead of inventing times. Shape when filled in:
   *   openingHours: [{ days: { en: "Saturday – Thursday", ar: "السبت - الخميس" },
   *                    opens: "07:00", closes: "23:00" }]
   */
  openingHours: null as null | Array<{
    days: BilingualText;
    opens: string;
    closes: string;
  }>,

  /**
   * Precise coordinates were not supplied with the brand pack. The location
   * page links to a Google Maps search for the printed address, which always
   * resolves, rather than dropping a pin at a guessed lat/lng.
   */
  coordinates: null as null | { lat: number; lng: number },

  /** Brand guidelines p.17 — canonical service line. */
  serviceLine: {
    en: ["Pizza", "Pastries", "Manakish", "Fresh Arabic Bread", "Fresh Juices"],
    ar: ["بيتزا", "فطائر", "مناقيش", "خبز عربي طازج", "عصائر طازجة"],
  },
} as const;

/** Google Maps search URL built from the printed address — no invented pin. */
export const mapsSearchUrl = (locale: "en" | "ar") =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${RESTAURANT.name.en}, ${RESTAURANT.address.line.en}`,
  )}&hl=${locale}`;

export const mapsEmbedUrl = (locale: "en" | "ar") =>
  `https://www.google.com/maps?q=${encodeURIComponent(
    `${RESTAURANT.name.en}, ${RESTAURANT.address.line.en}`,
  )}&hl=${locale}&z=15&output=embed`;

export const whatsappUrl = (text?: string) =>
  `https://wa.me/${RESTAURANT.phone.whatsapp}${
    text ? `?text=${encodeURIComponent(text)}` : ""
  }`;
