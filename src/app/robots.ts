import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/site";

/**
 * Emitted as a plain file at build time. Required for the static export, and
 * correct for the server build too — neither of these ever changes per
 * request.
 */
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/en/cart", "/ar/cart", "/en/checkout", "/ar/checkout", "/en/order-received", "/ar/order-received"],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
