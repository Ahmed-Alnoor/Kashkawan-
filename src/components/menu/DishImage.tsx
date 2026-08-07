import { Img } from "@/components/ui/Img";
import type { MenuItem } from "@/data/menu-types";
import type { Locale } from "@/i18n/config";
import { IconWheat } from "@/components/ui/Icons";

/**
 * A dish either has a genuine photograph from the brand pack, or it gets a
 * branded pattern tile. We never borrow another dish's photo — the arch
 * pattern is a deliberate, on-brand stand-in rather than a stock one.
 *
 * The component always fills its parent, which must be positioned and must
 * set the aspect ratio. It owns `position` itself: passing a competing
 * position utility through `className` would fight the `fill` image inside
 * and collapse it to zero height.
 */
export function DishImage({
  item,
  locale,
  sizes,
  priority = false,
  className = "",
  rounded = "rounded-2xl",
}: {
  item: MenuItem;
  locale: Locale;
  sizes: string;
  priority?: boolean;
  /** Extra classes. Do not pass position or inset utilities. */
  className?: string;
  rounded?: string;
}) {
  const frame = `absolute inset-0 overflow-hidden ${rounded} ${className}`;

  if (item.image) {
    return (
      <div className={`${frame} bg-paper-dim`}>
        <Img
          src={item.image}
          alt={`${item.name.en} — ${item.name.ar}`}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
        />
      </div>
    );
  }

  return (
    <div className={`${frame} bg-heritage-100`} role="img" aria-label={item.name[locale]}>
      <div className="pattern-arch absolute inset-0" aria-hidden />
      <div
        className="absolute inset-0 bg-gradient-to-br from-paper/55 via-transparent to-heritage/12"
        aria-hidden
      />
      <div className="absolute inset-0 grid place-content-center gap-2 p-4 text-center">
        <IconWheat className="mx-auto size-7 text-heritage/45" />
        <span
          lang="ar"
          dir="rtl"
          className="font-arabic text-[0.95rem] leading-relaxed font-medium text-heritage/70"
        >
          {item.name.ar}
        </span>
      </div>
    </div>
  );
}
