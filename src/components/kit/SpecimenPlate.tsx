import Image from "next/image";
import { mediaSize } from "@/lib/media";
import { t, type Lang } from "@/lib/i18n";
import { Morph } from "./Morph";

/**
 * How every product and category photo is shown: a specimen on a plate. A `bg-snow` plate with a 1px hairline, the photo
 * `object-contain` (its colour is information, so it is never graded or cropped), never larger than its source, 4:3 by default
 * and 5:4 for a portrait source, and a mono caption row under it ("ΕΙΚ. 01/05" and the caption, if any). Corners 2px: a cut sheet,
 * not a rounded card. No shadow; on hover (pointer devices) the top edge of the plate catches the light.
 */
export function SpecimenPlate({
  src,
  alt,
  sizes = "(min-width: 1024px) 40vw, 100vw",
  ratio,
  index,
  total,
  caption,
  captionRow = true,
  preload = false,
  name,
  lang = "el",
  className = "",
}: {
  src: string;
  alt: string;
  sizes?: string;
  /** CSS aspect-ratio of the plate; by default 4 / 3, and 5 / 4 for a portrait source. */
  ratio?: string;
  /** 1-based position and count, for the "ΕΙΚ. 01/05" caption. */
  index?: number;
  total?: number;
  caption?: string | null;
  /** False in cards, where the text under the plate is the card's own. */
  captionRow?: boolean;
  /** The first photo of a page (its LCP). */
  preload?: boolean;
  /** A view-transition name (`spec-<slug>`): this plate morphs between a card and the product page. */
  name?: string;
  lang?: Lang;
  className?: string;
}) {
  const size = mediaSize(src);
  const portrait = size !== null && size.h > size.w * 1.05;
  const pad = (n: number) => String(n).padStart(2, "0");
  const figure = index !== undefined ? `${t(lang).media.figure} ${pad(index)}${total ? `/${pad(total)}` : ""}` : null;
  const plate = (
    <div className="specimen-plate glint-edge" style={{ aspectRatio: ratio ?? (portrait ? "5 / 4" : "4 / 3") }}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        preload={preload}
        className="object-contain"
      />
    </div>
  );
  return (
    <figure className={`specimen ${className}`} style={size ? { maxWidth: size.w } : undefined}>
      {name ? <Morph name={name}>{plate}</Morph> : plate}
      {captionRow && (figure || caption) && (
        <figcaption className="specimen-cap t-label">
          {figure && <span className="text-fg-muted">{figure}</span>}
          {caption && <span className="text-fg-dim">{caption}</span>}
        </figcaption>
      )}
    </figure>
  );
}
