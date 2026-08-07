import { PageHeader } from "./PageHeader";
import { Reveal } from "@/components/ui/Motion";
import { ButtonLink, ExternalButtonLink } from "@/components/ui/Button";
import { IconPhone } from "@/components/ui/Icons";
import { localePath, ROUTES } from "@/i18n/routing";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n";
import { RESTAURANT } from "@/data/restaurant";
import { telHref } from "@/lib/format";

/** Date the policy copy in the dictionaries last changed. */
export const POLICY_UPDATED = "2026-08-07";

export function PolicyPage({
  locale,
  dict,
  policy,
}: {
  locale: Locale;
  dict: Dictionary;
  policy: { title: string; intro: string; sections: ReadonlyArray<{ heading: string; body: string }> };
}) {
  const updated = new Intl.DateTimeFormat(locale === "ar" ? "ar-AE" : "en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
    numberingSystem: "latn",
  }).format(new Date(POLICY_UPDATED));

  return (
    <>
      <PageHeader eyebrow={dict.footer.legal} title={policy.title} lead={policy.intro} />

      <div className="shell py-12 lg:py-16">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm text-ink-faint">
            {dict.policies.lastUpdatedLabel}: {updated}
          </p>

          <div className="mt-10 space-y-10">
            {policy.sections.map((section) => (
              <Reveal as="section" key={section.heading}>
                <h2 className="h-card font-bold text-heritage">{section.heading}</h2>
                <p className="mt-3 text-[0.98rem] leading-relaxed text-ink-muted">
                  {section.body}
                </p>
              </Reveal>
            ))}
          </div>

          <div className="mt-14 rounded-card border border-paper-edge bg-white/70 p-6">
            <p className="text-[0.95rem] text-ink">{dict.confirmation.contactUs}</p>
            <div className="mt-4 flex flex-wrap gap-2.5">
              <ExternalButtonLink href={telHref(RESTAURANT.phone.e164)} variant="secondary">
                <IconPhone className="size-4" />
                <span dir="ltr" className="tabular">
                  {RESTAURANT.phone.display}
                </span>
              </ExternalButtonLink>
              <ButtonLink href={localePath(locale, ROUTES.location)} variant="ghost">
                {dict.nav.location}
              </ButtonLink>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
