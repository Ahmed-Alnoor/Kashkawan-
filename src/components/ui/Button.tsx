import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "onDark" | "danger";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold " +
  "transition-[transform,background-color,color,box-shadow,border-color] duration-200 ease-out " +
  "active:scale-[0.97] disabled:pointer-events-none disabled:opacity-55 " +
  "focus-visible:outline-2 focus-visible:outline-offset-3 select-none";

const variants: Record<Variant, string> = {
  primary:
    "bg-heritage text-paper shadow-warm hover:bg-heritage-700 hover:shadow-warm-lg " +
    "focus-visible:outline-heritage-800",
  secondary:
    "bg-paper text-heritage border border-heritage/25 hover:border-heritage/60 " +
    "hover:bg-paper-dim focus-visible:outline-heritage",
  ghost:
    "text-heritage hover:bg-heritage/8 focus-visible:outline-heritage",
  onDark:
    "bg-paper text-heritage-900 hover:bg-white shadow-warm-lg focus-visible:outline-paper",
  danger:
    "text-danger hover:bg-danger/8 focus-visible:outline-danger",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-[0.95rem]",
  lg: "h-13 px-7 text-base",
};

type Common = { variant?: Variant; size?: Size; className?: string; children: ReactNode };

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...rest
}: Common & ComponentProps<"button">) {
  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...rest}>
      {children}
    </button>
  );
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...rest
}: Common & ComponentProps<typeof Link>) {
  return (
    <Link className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...rest}>
      {children}
    </Link>
  );
}

export function ExternalButtonLink({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...rest
}: Common & ComponentProps<"a">) {
  return (
    <a
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      rel="noopener noreferrer"
      {...rest}
    >
      {children}
    </a>
  );
}
