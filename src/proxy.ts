import { NextResponse, type NextRequest } from "next/server";
import { DEFAULT_LOCALE, LOCALES } from "@/i18n/config";

/**
 * Locale routing.
 *
 * Every page lives under /en or /ar. A request without a locale prefix is
 * redirected to the visitor's preferred language when we can tell, otherwise
 * to English. The choice is remembered in a cookie so a returning Arabic
 * visitor landing on "/" does not get bounced to English.
 */

const COOKIE = "kashkawan.locale";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

const pickLocale = (request: NextRequest): string => {
  const stored = request.cookies.get(COOKIE)?.value;
  if (stored && (LOCALES as readonly string[]).includes(stored)) return stored;

  const header = request.headers.get("accept-language") ?? "";
  // Very small negotiator: we only have two languages to choose between.
  const preferred = header
    .split(",")
    .map((part) => {
      const [tag, q] = part.trim().split(";q=");
      return { tag: tag.toLowerCase(), q: q ? Number(q) : 1 };
    })
    .sort((a, b) => b.q - a.q);

  for (const { tag } of preferred) {
    if (tag.startsWith("ar")) return "ar";
    if (tag.startsWith("en")) return "en";
  }

  return DEFAULT_LOCALE;
};

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const hasLocale = LOCALES.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );

  if (hasLocale) {
    const current = pathname.split("/")[1];
    const response = NextResponse.next();
    // Keep the cookie in step with what the visitor is actually reading, so
    // the language switcher sticks on the next visit.
    if (request.cookies.get(COOKIE)?.value !== current) {
      response.cookies.set(COOKIE, current, {
        maxAge: COOKIE_MAX_AGE,
        sameSite: "lax",
        path: "/",
      });
    }
    return response;
  }

  const locale = pickLocale(request);
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;

  const response = NextResponse.redirect(url);
  response.cookies.set(COOKIE, locale, {
    maxAge: COOKIE_MAX_AGE,
    sameSite: "lax",
    path: "/",
  });
  return response;
}

export const config = {
  matcher: [
    /*
     * Everything except:
     *  - /api routes
     *  - Next internals (_next/static, _next/image)
     *  - metadata files served from the app root
     *  - anything with a file extension (images, fonts, favicon)
     */
    "/((?!api|_next/static|_next/image|sitemap.xml|robots.txt|.*\\..*).*)",
  ],
};
