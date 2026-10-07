import Image from "next/image";
import Link from "next/link";
import { EdgeGauge } from "@/components/kit/EdgeGauge";
import { Marquee } from "@/components/kit/Marquee";
import { ArrowLink, Eyebrow, MaskedLines, Reveal } from "@/components/ui";
import { t, type Lang } from "@/lib/i18n";

export type Material = { title: string; href: string; image: string | null; values: number[] };

/**
 * Plastic sheets (P5, sticky split): a loop of materials across the top, then the title, text and photograph on the left (they stay
 * in view from lg while you read the list) and the eleven materials as rows on the right, each with its specimen thumbnail and the
 * gauge of the thicknesses it is sold in.
 */
export function Plastics({ lang, image, items, allHref }: { lang: Lang; image: string; items: Material[]; allHref: string }) {
  const d = t(lang);
  const h = d.home;
  return (
    <section data-theme="mist" aria-labelledby="plastics-title" className="relative bg-surface">
      <Marquee items={h.plasticsMarquee} />

      <div className="shell mt-16 pb-section md:mt-24">
        <div className="grid gap-x-8 gap-y-16 lg:grid-cols-12">
          <div className="plastics-sticky lg:col-span-5">
            <Eyebrow index="03">{h.plasticsEyebrow}</Eyebrow>
            <MaskedLines as="h2" id="plastics-title" lines={[h.plasticsTitle.join(" ")]} className="t-h1 mt-5" />
            <Reveal>
              <p className="t-body mt-6 max-w-[44ch] text-fg-muted">{h.plasticsText}</p>
              <ArrowLink href={allHref} className="mt-10">
                {h.allPlastics}
              </ArrowLink>
            </Reveal>
            <Reveal className="plastics-photo mt-10">
              <Image src={image} alt={h.plasticsAlt} fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
            </Reveal>
          </div>

          <div className="lg:col-span-6 lg:col-start-7">
            <p className="t-label flex justify-between pb-4 text-fg-muted">
              <span>{d.common.materials}</span>
              <span className="tabular">{items.length}</span>
            </p>
            <ul className="border-t border-line">
              {items.map((it, i) => (
                <Reveal as="li" key={it.href} delay={Math.min(i, 8) * 0.03} y={12} className="border-b border-line">
                  <Link href={it.href} className="mat-row group lift glint">
                    <span aria-hidden className="mat-index t-label tabular text-fg-muted">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span aria-hidden className="mat-thumb specimen-plate">
                      {it.image && <Image src={it.image} alt="" fill sizes="88px" className="object-contain" />}
                    </span>
                    <span className="min-w-0">
                      <h3 className="t-h3 transition-colors group-hover:text-accent">{it.title}</h3>
                      <EdgeGauge values={it.values} size="sm" lang={lang} className="mt-2" />
                    </span>
                    <span aria-hidden className="edge-row-arrow">
                      →
                    </span>
                  </Link>
                </Reveal>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
