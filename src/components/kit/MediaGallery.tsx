import { mediaSize } from "@/lib/media";
import type { Loop } from "@/lib/media-slots";
import type { Lang } from "@/lib/i18n";
import { GalleryClient } from "./GalleryClient";

export type GalleryItem = { src: string; alt: string; caption?: string | null; loop?: Loop };
export type GalleryItemSized = GalleryItem & { w: number | null; h: number | null };

/**
 * Photographs on specimen plates, opening a lightbox.
 * - `strip`: the product gallery: snap-scrolling plates, arrows, a mono counter ("01 / 05") and thumbnails.
 * - `plates`: small plates in a row (a category's gallery, a news article's images).
 * - `editorial`: the rhythm of a case study: rows of 7 + 5, 5 + 7 and 4 + 4 + 4 columns at 1440, 6 + 6 at 768, one column at 390,
 *   each image in its own ratio inside its cell, never upscaled.
 * Every item opens the `Lightbox` (its code loads on the first tap, not with the page). `morph` names the first plate, the target of
 * the shared-element transition from a card; `preloadFirst` is for a gallery whose first photo is the page's LCP.
 * Server component: it looks the natural sizes up, so the client never ships the size table.
 */
export function MediaGallery({
  items,
  layout,
  startIndex = 0,
  lang = "el",
  morph,
  preloadFirst = false,
  label,
  className = "",
}: {
  items: GalleryItem[];
  layout: "strip" | "plates" | "editorial";
  startIndex?: number;
  lang?: Lang;
  morph?: string;
  preloadFirst?: boolean;
  /** The accessible name of the gallery. */
  label: string;
  className?: string;
}) {
  if (items.length === 0) return null;
  const sized: GalleryItemSized[] = items.map((it) => {
    const size = mediaSize(it.src) ?? (it.loop ? mediaSize(it.loop.poster.src) : null);
    return { ...it, w: size?.w ?? null, h: size?.h ?? null };
  });
  return <GalleryClient items={sized} layout={layout} startIndex={startIndex} lang={lang} morph={morph} preloadFirst={preloadFirst} label={label} className={className} />;
}
