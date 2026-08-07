import { Img } from "@/components/ui/Img";
import { RESTAURANT } from "@/data/restaurant";

/**
 * Approved logo lockups (guidelines p.09).
 *
 * `full`     — full colour, for warm paper / white grounds
 * `reversed` — for solid Heritage Green
 * `green`    — one-colour, economical use
 * `signature`— reversed lockup including the Arabic tagline
 *
 * The mark is never rebuilt from type and never recoloured here; each variant
 * points at the exact master asset extracted from the brand pack.
 */

const SOURCES = {
  full: { src: "/brand/logo-full-colour.webp", w: 900, h: 369 },
  reversed: { src: "/brand/logo-mark-reversed.webp", w: 900, h: 369 },
  green: { src: "/brand/logo-mark-green.webp", w: 900, h: 369 },
  brown: { src: "/brand/logo-mark-brown.webp", w: 900, h: 369 },
  signature: { src: "/brand/logo-signature-reversed.webp", w: 900, h: 512 },
} as const;

export type LogoVariant = keyof typeof SOURCES;

export function Logo({
  variant = "full",
  className = "",
  width,
  priority = false,
  alt,
}: {
  variant?: LogoVariant;
  className?: string;
  /** Rendered width in px; height follows the master artwork's ratio. */
  width: number;
  priority?: boolean;
  alt?: string;
}) {
  const source = SOURCES[variant];
  return (
    <Img
      src={source.src}
      alt={alt ?? `${RESTAURANT.name.en} — ${RESTAURANT.name.ar}`}
      width={width}
      height={Math.round((width * source.h) / source.w)}
      className={className}
      priority={priority}
      sizes={`${width}px`}
    />
  );
}
