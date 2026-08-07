/**
 * Canonical origin for metadata, sitemaps and email links.
 *
 * Set NEXT_PUBLIC_SITE_URL in the environment (see .env.example). It falls
 * back to the Vercel-provided URL, then to the domain printed on the menu.
 */
export const siteUrl = (): string => {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
  if (vercel) return `https://${vercel.replace(/\/$/, "")}`;

  return "https://kashkawan.ae";
};

export const absoluteUrl = (path: string): string =>
  `${siteUrl()}${path.startsWith("/") ? path : `/${path}`}`;
