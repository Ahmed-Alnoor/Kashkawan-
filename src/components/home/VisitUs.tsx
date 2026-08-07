import { Reveal } from "@/components/ui/Motion";
import { ExternalButtonLink } from "@/components/ui/Button";
import { IconClock, IconPhone, IconPin, IconWhatsApp } from "@/components/ui/Icons";
import { RESTAURANT, mapsEmbedUrl, mapsSearchUrl, whatsappUrl } from "@/data/restaurant";
import { telHref } from "@/lib/format";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n";

export function VisitUs({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  return (
    <section className="section-y bg-paper-dim">
      <div className="shell">
        <Reveal className="max-w-2xl">
          <p className="eyebrow text-toast-600">{dict.home.visitEyebrow}</p>
          <h2 className="h-section mt-3 text-heritage">{dict.home.visitTitle}</h2>
        </Reveal>

        <div className="mt-10 grid gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:gap-8">
          <Reveal className="flex flex-col gap-4">
            <InfoCard
              icon={<IconPin className="size-5" />}
              label={dict.home.addressLabel}
            >
              <p className="text-[0.98rem] leading-relaxed text-ink">
                {RESTAURANT.address.line[locale]}
              </p>
              <a
                href={mapsSearchUrl(locale)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-sm font-semibold text-heritage underline underline-offset-4 hover:text-heritage-700"
              >
                {dict.home.openInMaps}
              </a>
            </InfoCard>

            <InfoCard
              icon={<IconPhone className="size-5" />}
              label={dict.home.phoneLabel}
            >
              <a
                href={telHref(RESTAURANT.phone.e164)}
                dir="ltr"
                className="tabular text-lg font-bold text-heritage hover:text-heritage-700"
              >
                {RESTAURANT.phone.display}
              </a>
              <div className="mt-3 flex flex-wrap gap-2">
                <ExternalButtonLink
                  href={telHref(RESTAURANT.phone.e164)}
                  variant="secondary"
                  size="sm"
                >
                  <IconPhone className="size-4" />
                  {dict.common.call}
                </ExternalButtonLink>
                <ExternalButtonLink
                  href={whatsappUrl()}
                  target="_blank"
                  variant="secondary"
                  size="sm"
                >
                  <IconWhatsApp className="size-4" />
                  {dict.common.whatsapp}
                </ExternalButtonLink>
              </div>
            </InfoCard>

            <InfoCard icon={<IconClock className="size-5" />} label={dict.home.hoursLabel}>
              {RESTAURANT.openingHours ? (
                <ul className="space-y-1.5 text-[0.98rem] text-ink">
                  {RESTAURANT.openingHours.map((entry) => (
                    <li key={entry.days.en} className="flex justify-between gap-4">
                      <span>{entry.days[locale]}</span>
                      <span dir="ltr" className="tabular text-ink-muted">
                        {entry.opens} – {entry.closes}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                /* Hours are not printed on the menu or brand pack — we ask the
                   customer to check rather than publish a guess. */
                <p className="text-[0.98rem] leading-relaxed text-ink-muted">
                  {dict.home.hoursUnconfirmed}
                </p>
              )}
            </InfoCard>
          </Reveal>

          <Reveal delay={0.08} className="flex flex-col">
            <div className="min-h-[22rem] flex-1 overflow-hidden rounded-card border border-paper-edge bg-paper-dim shadow-warm">
              <iframe
                src={mapsEmbedUrl(locale)}
                title={dict.home.mapTitle}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="size-full min-h-[22rem] border-0"
                allowFullScreen
              />
            </div>
            {/* The embed can be blocked by privacy extensions or a corporate
                network, so the address never dead-ends on a grey frame. */}
            <a
              href={mapsSearchUrl(locale)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 self-start text-sm font-semibold text-heritage underline underline-offset-4 hover:text-heritage-700"
            >
              <IconPin className="size-4" />
              {dict.common.directions}
            </a>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function InfoCard({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-card border border-paper-edge bg-white/75 p-5 shadow-warm-sm">
      <div className="flex items-center gap-2.5 text-heritage">
        <span aria-hidden>{icon}</span>
        <h3 className="eyebrow">{label}</h3>
      </div>
      <div className="mt-3">{children}</div>
    </div>
  );
}
