import type { NextConfig } from "next";

/**
 * The site builds in two shapes from one codebase:
 *
 *   1. SERVER (default) — `npm run build`. Full Next.js app on a Node host
 *      (Vercel, Render, a VPS). The /api/orders route runs, so orders are
 *      re-priced server-side and emailed to the branch and the customer.
 *
 *   2. STATIC (`npm run build:static`) — a folder of plain HTML/CSS/JS in
 *      `out/`, which is what GitHub Pages can serve. There is no server, so
 *      orders are handed to WhatsApp instead of the API. See SETUP.md.
 *
 * Everything else — pages, menu, cart, both languages — is identical.
 */
const isStatic = process.env.STATIC_EXPORT === "1";

/** Project sites live at /<repo>, so assets need that prefix. */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  ...(isStatic
    ? {
        output: "export" as const,
        // GitHub Pages has no image optimiser, so images are served as-is.
        images: { unoptimized: true },
        // Pages serves /menu/ from /menu/index.html.
        trailingSlash: true,
      }
    : {
        images: { formats: ["image/avif", "image/webp"] as const },
      }),

  basePath: basePath || undefined,
  assetPrefix: basePath || undefined,

  /**
   * Resend lazily imports @react-email/render for React-component emails. We
   * send pre-rendered HTML strings instead, so that dependency is never used —
   * keeping the package external stops the bundler from trying to resolve it.
   */
  serverExternalPackages: ["resend"],

  // Static hosts set their own headers; these only apply to the Node build.
  ...(isStatic
    ? {}
    : {
        async headers() {
          return [
            {
              source: "/:path*",
              headers: [
                { key: "X-Content-Type-Options", value: "nosniff" },
                { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
                { key: "X-Frame-Options", value: "SAMEORIGIN" },
                {
                  key: "Permissions-Policy",
                  value: "camera=(), microphone=(), interest-cohort=()",
                },
              ],
            },
            {
              source: "/fonts/:path*",
              headers: [
                { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
              ],
            },
          ];
        },
      }),
};

export default nextConfig;
