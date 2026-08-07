import type { MetadataRoute } from "next";

import { LOCALES } from "@/i18n/config";
import { localePath, ROUTES } from "@/i18n/routing";
import { absoluteUrl } from "@/lib/site";

/**
 * Emitted as a plain file at build time. Required for the static export, and
 * correct for the server build too — neither of these ever changes per
 * request.
 */
export const dynamic = "force-static";

/** Public pages only — the cart, checkout and confirmation are noindex. */
const PUBLIC_ROUTES = [
  { path: ROUTES.home, priority: 1, changeFrequency: "weekly" as const },
  { path: ROUTES.menu, priority: 0.9, changeFrequency: "weekly" as const },
  { path: ROUTES.about, priority: 0.6, changeFrequency: "yearly" as const },
  { path: ROUTES.location, priority: 0.7, changeFrequency: "monthly" as const },
  { path: ROUTES.delivery, priority: 0.5, changeFrequency: "yearly" as const },
  { path: ROUTES.privacy, priority: 0.3, changeFrequency: "yearly" as const },
  { path: ROUTES.terms, priority: 0.3, changeFrequency: "yearly" as const },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return LOCALES.flatMap((locale) =>
    PUBLIC_ROUTES.map((route) => ({
      url: absoluteUrl(localePath(locale, route.path)),
      lastModified,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
      alternates: {
        languages: Object.fromEntries(
          LOCALES.map((other) => [other, absoluteUrl(localePath(other, route.path))]),
        ),
      },
    })),
  );
}
