import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import { mediaSize } from "@/lib/media";
import type { Slot } from "@/lib/media-slots";
import type { Lang } from "@/lib/i18n";
import { MediaLoop } from "./MediaLoop";

/**
 * A place for a photograph or a film (the registry is src/lib/media-slots.ts). It reserves its space with an aspect ratio, so nothing
 * shifts; paints the still (or the loop's poster) with `next/image`; and, only when the slot has a loop, hands over to the small client
 * island `MediaLoop`, so a page without loops ships no media JavaScript.
 *
 * The poster is what the browser paints first and what LCP measures: a video is never the LCP element. An empty slot renders its designed
 * `fallback` (the machine drawing), never an empty box and never a "coming soon" label; without a fallback it renders nothing.
 * Never larger than its source: the box is capped at the photo's width and centred (`cap`).
 */
export function MediaSlot({
  slot,
  ratio,
  ratioMd,
  sizes = "100vw",
  preload = false,
  fit = "cover",
  fallback,
  caption,
  alt,
  cap = true,
  fill = false,
  drift = false,
  lang = "el",
  className = "",
}: {
  slot: Slot;
  /** CSS aspect-ratio, e.g. "16 / 9". */
  ratio: string;
  /** The ratio from md, when it differs ("21 / 9" on desktop, "4 / 5" on a phone). */
  ratioMd?: string;
  sizes?: string;
  /** Only for a first-screen hero: Next 16's `preload` (it replaces `priority`). */
  preload?: boolean;
  fit?: "cover" | "contain";
  fallback?: ReactNode;
  caption?: string;
  /** The alt text of the picture, when the page is not Greek (the registry's is Greek). */
  alt?: string;
  cap?: boolean;
  /** Fill the parent (positioned) instead of reserving a ratio of its own. */
  fill?: boolean;
  /** The picture (and the film over it) settles into the frame as it scrolls into view (`drift`); the controls stay where they are. */
  drift?: boolean;
  lang?: Lang;
  className?: string;
}) {
  const still = slot.still ?? slot.loop?.poster;
  if (!still && !fallback) return null;
  const size = still ? mediaSize(still.src) : null;
  const style = {
    "--r": ratio,
    "--r-md": ratioMd ?? ratio,
    ...(cap && size && !fill ? { maxWidth: size.w } : {}),
  } as CSSProperties;
  return (
    <figure className={`media-slot ${fill ? "media-slot-fill" : ""} ${className}`} style={style} data-fit={fit} data-empty={still ? undefined : ""}>
      {still ? (
        <Image
          src={still.src}
          alt={alt ?? still.alt}
          fill
          sizes={sizes}
          preload={preload}
          className={`${fit === "contain" ? "object-contain" : "object-cover"} ${drift ? "drift" : ""}`}
          style={still.focal ? { objectPosition: still.focal } : undefined}
        />
      ) : (
        fallback
      )}
      {slot.loop && <MediaLoop loop={slot.loop} lang={lang} drift={drift} />}
      {caption && <figcaption className="media-cap t-label">{caption}</figcaption>}
    </figure>
  );
}
