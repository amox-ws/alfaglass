import Link from "next/link";
import type { Lang } from "@/lib/i18n";
import { EdgeGauge } from "./EdgeGauge";
import { SpecimenPlate } from "./SpecimenPlate";

/**
 * A product or a category as a card: its specimen plate, a mono index, the title and a small gauge. The plate carries the
 * view-transition name `spec-<slug>`, so the photo morphs into the product page's gallery. The whole card is one link.
 */
export function SpecimenCard({
  lang,
  href,
  title,
  image,
  alt = "",
  slug,
  index,
  values = [],
  headingLevel = 3,
  sizes = "(min-width: 1024px) 28vw, (min-width: 768px) 44vw, 100vw",
}: {
  lang: Lang;
  href: string;
  title: string;
  image: string | null;
  alt?: string;
  /** The product slug: names the shared element. */
  slug?: string;
  index?: number;
  values?: number[];
  headingLevel?: 2 | 3 | 4;
  sizes?: string;
}) {
  const Heading = `h${headingLevel}` as "h2" | "h3" | "h4";
  return (
    <Link href={href} className="specimen-card group lift block">
      {image ? (
        <SpecimenPlate src={image} alt={alt} sizes={sizes} captionRow={false} name={slug ? `spec-${slug}` : undefined} lang={lang} />
      ) : (
        <div className="specimen-plate" style={{ aspectRatio: "4 / 3" }} />
      )}
      <div className="mt-5 flex items-start gap-4">
        {index !== undefined && <span className="t-label tabular pt-2 text-fg-muted">{String(index).padStart(2, "0")}</span>}
        <div className="min-w-0 flex-1">
          <Heading className="t-h3 transition-colors group-hover:text-accent">{title}</Heading>
          {values.length > 0 && <EdgeGauge values={values} size="sm" lang={lang} className="mt-3" />}
        </div>
        <span aria-hidden className="specimen-arrow">
          →
        </span>
      </div>
    </Link>
  );
}
