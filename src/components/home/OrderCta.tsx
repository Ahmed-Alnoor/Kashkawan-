import { Reveal } from "@/components/ui/Motion";
import { ButtonLink, ExternalButtonLink } from "@/components/ui/Button";
import { IconArrow, IconPhone } from "@/components/ui/Icons";
import { localePath, ROUTES } from "@/i18n/routing";
import { RESTAURANT } from "@/data/restaurant";
import { telHref } from "@/lib/format";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n";

export function OrderCta({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  return (
    <section className="relative overflow-hidden bg-heritage py-16 text-paper lg:py-24">
      <div className="pattern-arch-dark absolute inset-0" aria-hidden />

      <Reveal className="shell relative flex flex-col items-center gap-7 text-center">
        <h2 className="h-section max-w-2xl text-paper">{dict.home.ctaTitle}</h2>
        <p className="max-w-xl text-base leading-relaxed text-paper/75">{dict.home.ctaBody}</p>

        <div className="flex flex-wrap justify-center gap-3">
          <ButtonLink href={localePath(locale, ROUTES.menu)} variant="onDark" size="lg">
            {dict.common.orderNow}
            <IconArrow className="flip-rtl size-[18px]" />
          </ButtonLink>
          <ExternalButtonLink
            href={telHref(RESTAURANT.phone.e164)}
            size="lg"
            className="border border-paper/30 bg-transparent text-paper shadow-none hover:border-paper/70 hover:bg-white/10"
          >
            <IconPhone className="size-[18px]" />
            <span dir="ltr" className="tabular">
              {RESTAURANT.phone.display}
            </span>
          </ExternalButtonLink>
        </div>
      </Reveal>
    </section>
  );
}
