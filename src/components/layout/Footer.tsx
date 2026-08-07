import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import {
  IconFacebook,
  IconInstagram,
  IconPhone,
  IconPin,
  IconSnapchat,
  IconTikTok,
  IconWhatsApp,
} from "@/components/ui/Icons";
import { localePath, ROUTES } from "@/i18n/routing";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n";
import { MENU } from "@/data/menu";
import { RESTAURANT, mapsSearchUrl, whatsappUrl } from "@/data/restaurant";
import { telHref } from "@/lib/format";

const SOCIAL_ICONS = {
  instagram: IconInstagram,
  facebook: IconFacebook,
  tiktok: IconTikTok,
  snapchat: IconSnapchat,
} as const;

export function Footer({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const year = new Date().getFullYear();

  const socials = (Object.keys(SOCIAL_ICONS) as Array<keyof typeof SOCIAL_ICONS>)
    .map((key) => ({ key, url: RESTAURANT.social[key], Icon: SOCIAL_ICONS[key] }))
    .filter((entry): entry is { key: keyof typeof SOCIAL_ICONS; url: string; Icon: typeof IconInstagram } =>
      Boolean(entry.url),
    );

  return (
    <footer className="relative overflow-hidden bg-heritage-900 text-paper/80">
      <div className="pattern-arch-dark absolute inset-0" aria-hidden />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-toast/50 to-transparent"
        aria-hidden
      />

      <div className="shell relative py-14 lg:py-18">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1.1fr]">
          <div className="max-w-sm">
            <Logo variant="signature" width={220} className="h-auto w-[190px]" />
            <p className="mt-6 text-[0.95rem] leading-relaxed text-paper/70">
              {dict.footer.tagline}
            </p>

            {socials.length > 0 ? (
              <div className="mt-6">
                <h2 className="eyebrow text-toast">{dict.footer.followUs}</h2>
                <ul className="mt-3 flex gap-2">
                  {socials.map(({ key, url, Icon }) => (
                    <li key={key}>
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={key}
                        className="inline-flex size-10 items-center justify-center rounded-full border border-paper/18 text-paper/80 transition-colors duration-200 hover:border-toast hover:text-toast"
                      >
                        <Icon className="size-5" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="mt-6 text-sm leading-relaxed text-paper/50">
                {dict.footer.socialPending}
              </p>
            )}
          </div>

          <nav aria-labelledby="footer-explore">
            <h2 id="footer-explore" className="eyebrow text-toast">
              {dict.footer.explore}
            </h2>
            <ul className="mt-4 space-y-3 text-[0.95rem]">
              {[
                { href: localePath(locale, ROUTES.home), label: dict.nav.home },
                { href: localePath(locale, ROUTES.menu), label: dict.nav.menu },
                { href: localePath(locale, ROUTES.about), label: dict.nav.about },
                { href: localePath(locale, ROUTES.location), label: dict.nav.location },
                { href: localePath(locale, ROUTES.cart), label: dict.cart.title },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-paper/70 transition-colors duration-200 hover:text-paper"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-labelledby="footer-menu">
            <h2 id="footer-menu" className="eyebrow text-toast">
              {dict.nav.menu}
            </h2>
            <ul className="mt-4 space-y-3 text-[0.95rem]">
              {MENU.map((category) => (
                <li key={category.id}>
                  <Link
                    href={`${localePath(locale, ROUTES.menu)}#category-${category.id}`}
                    className="text-paper/70 transition-colors duration-200 hover:text-paper"
                  >
                    {category.name[locale]}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="eyebrow text-toast">{dict.footer.visit}</h2>
            <address className="mt-4 space-y-4 text-[0.95rem] not-italic">
              <a
                href={mapsSearchUrl(locale)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-2.5 text-paper/70 transition-colors duration-200 hover:text-paper"
              >
                <IconPin className="mt-0.5 size-[18px] shrink-0 text-toast" />
                <span>{RESTAURANT.address.line[locale]}</span>
              </a>
              <a
                href={telHref(RESTAURANT.phone.e164)}
                className="flex items-center gap-2.5 text-paper/70 transition-colors duration-200 hover:text-paper"
              >
                <IconPhone className="size-[18px] shrink-0 text-toast" />
                <span dir="ltr" className="tabular">
                  {RESTAURANT.phone.display}
                </span>
              </a>
              <a
                href={whatsappUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-paper/70 transition-colors duration-200 hover:text-paper"
              >
                <IconWhatsApp className="size-[18px] shrink-0 text-toast" />
                <span>{dict.common.whatsapp}</span>
              </a>
            </address>

            <h2 className="eyebrow mt-8 text-toast">{dict.footer.legal}</h2>
            <ul className="mt-4 space-y-3 text-[0.95rem]">
              {[
                { href: localePath(locale, ROUTES.delivery), label: dict.footer.delivery },
                { href: localePath(locale, ROUTES.privacy), label: dict.footer.privacy },
                { href: localePath(locale, ROUTES.terms), label: dict.footer.terms },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-paper/70 transition-colors duration-200 hover:text-paper"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-14 border-t border-paper/12 pt-8">
          <div className="flex flex-col gap-4 text-sm text-paper/55 md:flex-row md:items-center md:justify-between">
            <p>
              © {year} {RESTAURANT.name[locale]} {RESTAURANT.legalName}. {dict.footer.rights}
            </p>
            <p className="md:text-end">{dict.footer.noOnlinePayment}</p>
          </div>
          <p className="mt-3 text-xs text-paper/40">{dict.footer.payments}</p>
        </div>
      </div>
    </footer>
  );
}
