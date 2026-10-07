import Image from "next/image";
import Link from "next/link";
import { ArrowLink, Reveal, SectionHeader } from "@/components/ui";
import { t, type Lang } from "@/lib/i18n";

export type RelatedItem = { href: string; title: string; summary: string; image: string | null; count: number };

/**
 * Related products as a tool wall: four families, each a specimen on its plate (the photo `object-contain` on snow, never cropped and
 * never larger than its file), a mono count, the name, two lines of text and an arrow. Four columns from lg, two from md; on a phone the
 * same cards are rows with a thumbnail (the layout is CSS: `.wall` in home.css). The text is the first thing to go if the page grows.
 */
export function Related({ lang, items, allHref }: { lang: Lang; items: RelatedItem[]; allHref: string }) {
  const d = t(lang);
  const h = d.home;
  return (
    <section data-theme="frost" aria-labelledby="related-title" className="bg-surface section-y">
      <div className="shell">
        <SectionHeader
          index="05"
          eyebrow={h.relatedEyebrow}
          id="related-title"
          title={h.relatedTitle.join(" ")}
          intro={h.relatedText}
          action={<ArrowLink href={allHref}>{h.allRelated}</ArrowLink>}
        />

        <ul className="wall mt-16 md:mt-24">
          {items.map((it, i) => (
            <Reveal as="li" key={it.href} delay={Math.min(i, 8) * 0.06} y={12}>
              <Link href={it.href} className="wall-card group lift">
                <span aria-hidden className="wall-plate specimen-plate glint-edge">
                  {it.image && <Image src={it.image} alt="" fill sizes="(min-width: 1024px) 24vw, (min-width: 768px) 44vw, 72px" className="object-contain" />}
                </span>
                <span className="wall-text">
                  <span className="t-label tabular block text-fg-muted">
                    {String(i + 1).padStart(2, "0")} · {d.count(it.count)}
                  </span>
                  <h3 className="t-h3 mt-2 transition-colors group-hover:text-accent">{it.title}</h3>
                  <span className="wall-summary t-small mt-3 text-fg-muted">{it.summary}</span>
                </span>
                <span aria-hidden className="specimen-arrow">
                  →
                </span>
              </Link>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
