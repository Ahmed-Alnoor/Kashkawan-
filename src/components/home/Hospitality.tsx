import Image from "next/image";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/Motion";
import { IconCheck } from "@/components/ui/Icons";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n";

export function Hospitality({ dict }: { locale: Locale; dict: Dictionary }) {
  return (
    <section className="section-y bg-paper">
      <div className="shell grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <Reveal className="order-2 lg:order-1">
          <p className="eyebrow text-toast-600">{dict.home.familyEyebrow}</p>
          <h2 className="h-section mt-3 text-heritage">{dict.home.familyTitle}</h2>
          <p className="mt-5 text-base leading-relaxed text-ink-muted lg:text-lg">
            {dict.home.familyBody}
          </p>

          <Stagger as="ul" className="mt-8 space-y-3.5" step={0.08}>
            {dict.home.familyPoints.map((point) => (
              <StaggerItem as="li" key={point} className="flex items-start gap-3">
                <span
                  className="mt-0.5 grid size-6 shrink-0 place-content-center rounded-full bg-heritage/12 text-heritage"
                  aria-hidden
                >
                  <IconCheck className="size-3.5" strokeWidth={2.4} />
                </span>
                <span className="text-[0.98rem] leading-relaxed text-ink">{point}</span>
              </StaggerItem>
            ))}
          </Stagger>
        </Reveal>

        <Reveal delay={0.08} className="order-1 lg:order-2">
          <div className="relative">
            <div className="relative aspect-[4/5] overflow-hidden rounded-card shadow-warm-lg sm:aspect-[4/3] lg:aspect-[5/6]">
              <Image
                src="/food/gallery-manakish.jpg"
                alt=""
                fill
                sizes="(min-width: 1024px) 34rem, 100vw"
                className="object-cover"
              />
            </div>
            {/* Toast hairline frame — accent only, per the palette rules. */}
            <div
              className="pointer-events-none absolute -inset-2.5 -z-10 rounded-[1.75rem] border border-toast/35"
              aria-hidden
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
