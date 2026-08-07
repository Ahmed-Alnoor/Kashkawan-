import NextImage, { type ImageProps } from "next/image";
import { asset } from "@/lib/deployment";

/**
 * `next/image` with the deployment's basePath applied.
 *
 * When the site is exported statically and served from a subfolder (a GitHub
 * project site lives at /<repo>), `next/image` does **not** prefix a plain
 * string `src` — so every photograph 404s. This wrapper applies the prefix in
 * one place.
 *
 * Use this instead of importing `next/image` directly anywhere the `src` is a
 * literal path into /public. Imported image objects and remote URLs are passed
 * through untouched.
 */
export function Img({ src, ...rest }: ImageProps) {
  return <NextImage src={typeof src === "string" ? asset(src) : src} {...rest} />;
}
