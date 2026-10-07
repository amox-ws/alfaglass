import Image from "next/image";
import Link from "next/link";
import type { Work } from "@/content/works";
import type { Lang } from "@/lib/i18n";
import { mediaSize } from "@/lib/media";
import { hrefFor } from "@/lib/routes";
import { MetaLine } from "./MetaLine";

/** Width of each slot at 1440px (CSS px): a cover narrower than its slot is never stretched to fill it. */
const SLOT_WIDTH = { lg: 780, md: 540, sm: 420 } as const;
const SIZES = {
  lg: "(min-width: 1024px) 58vw, 100vw",
  md: "(min-width: 1024px) 40vw, (min-width: 768px) 50vw, 100vw",
  sm: "(min-width: 1024px) 30vw, (min-width: 768px) 50vw, 100vw",
} as const;

/**
 * A finished job as a card: the cover in a frame of its own ratio (3:2; 4:5 for a portrait cover in `sm`), the title, a mono line (material and
 * thickness, application, year) and the place when there is one. The cover fills the frame (`object-cover`) only when its file is at least as
 * wide as the slot; a smaller or a portrait one sits whole on snow, like a specimen. The whole card is one link; the card lifts and a glint
 * crosses the frame on hover (pointer devices). Stills only: a card never plays a film.
 */
export type WorkCardProps = { lang: Lang; work: Work; size: "lg" | "md" | "sm"; headingLevel?: 2 | 3 | 4; /** A card in the first screen: its cover loads at once (it is a candidate for the largest paint). */ eager?: boolean };

export function WorkCard({ lang, work, size, headingLevel = 3, eager = false }: WorkCardProps) {
  const source = mediaSize(work.cover.src);
  const portrait = source !== null && source.h > source.w * 1.05;
  const fills = source !== null && source.w >= SLOT_WIDTH[size] && !portrait;
  const ratio = size === "sm" && portrait ? "4 / 5" : "3 / 2";
  const Heading = `h${headingLevel}` as "h2" | "h3" | "h4";
  return (
    <Link href={hrefFor(lang, { kind: "work", slug: work.slug })} className="work-card group lift block">
      <span className="work-frame glint" data-fit={fills ? "cover" : "contain"} style={{ aspectRatio: ratio }}>
        <Image
          src={work.cover.src}
          alt={work.cover.alt}
          fill
          sizes={SIZES[size]}
          loading={eager ? "eager" : undefined}
          className={fills ? "object-cover" : "object-contain"}
          style={work.cover.focal ? { objectPosition: work.cover.focal } : undefined}
        />
      </span>
      <span className="mt-5 block">
        <Heading className={`${size === "lg" ? "t-h2" : "t-h3"} transition-colors group-hover:text-accent`}>{work.title}</Heading>
        <span className="t-label mt-3 block text-fg-muted">
          <MetaLine lang={lang} work={work} />
        </span>
        {work.place && <span className="t-small mt-1 block text-fg-muted">{work.place}</span>}
      </span>
    </Link>
  );
}
