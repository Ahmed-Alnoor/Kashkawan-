import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

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
