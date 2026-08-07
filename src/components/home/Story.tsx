import { Img } from "@/components/ui/Img";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/Motion";
import { ButtonLink } from "@/components/ui/Button";
import { IconArrow } from "@/components/ui/Icons";
import { localePath, ROUTES } from "@/i18n/routing";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n";

export function Story({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  return (
    <section className="section-y relative overflow-hidden bg-paper">
      <div className="pattern-arch absolute inset-0" aria-hidden />

      <div className="shell relative grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
        <Reveal>
          <p className="eyebrow text-toast-600">{dict.home.storyEyebrow}</p>
          <h2 className="h-section mt-3 text-heritage">{dict.home.storyTitle}</h2>
          <p className="mt-5 text-base leading-relaxed text-ink-muted lg:text-lg">
            {dict.home.storyBody}
          </p>

          <blockquote className="mt-8 border-s-2 border-toast ps-5">
            <p className="text-lg leading-relaxed font-medium text-heritage lg:text-xl">
              {dict.home.storyQuote}
            </p>
          </blockquote>

          <ButtonLink
            href={localePath(locale, ROUTES.about)}
            variant="secondary"
            size="md"
            className="mt-8"
          >
            {dict.home.readStory}
            <IconArrow className="flip-rtl size-[18px]" />
          </ButtonLink>
        </Reveal>

        <Reveal delay={0.1} className="relative">
          {/* Approved engraved illustration — guidelines p.14 */}
          <div className="relative overflow-hidden rounded-card border border-paper-edge bg-white/70 shadow-warm">
            <Img
              src="/brand/engraved-spread.jpg"
              alt=""
              width={836}
              height={680}
              sizes="(min-width: 1024px) 40rem, 100vw"
              className="h-auto w-full mix-blend-multiply"
            />
          </div>
          <div
            className="absolute -inset-3 -z-10 rounded-[2rem] bg-heritage/5"
            aria-hidden
          />
        </Reveal>
      </div>

      {/* Four pillars — guidelines p.06 */}
      <div className="shell relative mt-20 lg:mt-28">
        <Reveal>
          <h3 className="h-section text-center text-heritage">{dict.home.valuesTitle}</h3>
        </Reveal>

        <Stagger as="ul" className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {dict.home.values.map((value, index) => (
            <StaggerItem
              as="li"
              key={value.title}
              className="group relative overflow-hidden rounded-card border border-paper-edge bg-white/70 p-6 shadow-warm-sm transition-[box-shadow,border-color,transform] duration-300 hover:-translate-y-1 hover:border-heritage/25 hover:shadow-warm"
            >
              <span className="tabular text-sm font-bold text-toast">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h4 className="mt-3 text-lg font-bold text-heritage">{value.title}</h4>
              {locale === "en" && (
                <p lang="ar" dir="rtl" className="font-arabic mt-1 text-base text-ink-faint">
                  {value.arabic}
                </p>
              )}
              <p className="mt-3 text-sm leading-relaxed text-ink-muted">{value.body}</p>
              <div
                className="absolute inset-x-0 bottom-0 h-0.5 origin-center scale-x-0 bg-toast transition-transform duration-400 ease-out group-hover:scale-x-100"
                aria-hidden
              />
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
