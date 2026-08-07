/**
 * How this build is deployed.
 *
 * The same code runs two ways (see next.config.ts):
 *
 *   SERVER  — a Node host. Orders POST to /api/orders, which re-prices them
 *             from the menu data and emails the branch and the customer.
 *   STATIC  — a folder of files on GitHub Pages. There is no server, so
 *             orders are handed to WhatsApp with the full basket in the
 *             message. The branch already publishes that number for delivery.
 *
 * Both are first-class; neither is a stub. SETUP.md explains how to switch.
 */

/** Path prefix when the site is served from a subfolder (GitHub project sites). */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export type OrderChannel = "api" | "whatsapp";

export const ORDER_CHANNEL: OrderChannel =
  process.env.NEXT_PUBLIC_ORDER_CHANNEL === "whatsapp" ? "whatsapp" : "api";

/**
 * Prefixes a path in `/public` with the basePath.
 *
 * `next/image` and `next/link` do this themselves; anything that builds a URL
 * by hand — CSS custom properties, the manifest — needs this helper.
 */
export const asset = (path: string): string =>
  `${BASE_PATH}${path.startsWith("/") ? path : `/${path}`}`;
