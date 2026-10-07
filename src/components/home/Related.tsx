import Image from "next/image";
import Link from "next/link";
import { ArrowLink, Reveal, SectionHeader } from "@/components/ui";
import { t, type Lang } from "@/lib/i18n";

type Item = { href: string; title: string; image: string | null; count: number };

const arrow =
  "flex size-11 shrink-0 items-center justify-center rounded-full border border-line-strong bg-surface transition-colors duration-300 group-hover:border-accent group-hover:bg-accent group-hover:text-accent-fg";
const settle = { transitionTimingFunction: "var(--ease-out)" };

/**
 * Related products as a bento (P4): the first family is the large card on the left, the others are horizontal cards in
 * one column beside it (from lg; below lg the cards stack). Every picture sits in a slot that fits its own proportion:
 * the first is a photograph that fills a frame as tall as the column, the others are product shots on a square slot,
 * never stretched (the sources are 600 to 1100px wide, the slots at most 650px).
 */
export function Related({ lang, items, allHref }: { lang: Lang; items: Item[]; allHref: string }) {
  const d = t(lang);
  const h = d.home;
  const [lead, ...rest] = items;
  return (
    <section data-theme="frost" aria-labelledby="related-title" className="bg-surface section-y">
      <div className="shell">
        <SectionHeader
          index="06"
          eyebrow={h.relatedEyebrow}
          id="related-title"
          title={h.relatedTitle.join(" ")}
          intro={h.relatedText}
          action={<ArrowLink href={allHref}>{h.allRelated}</ArrowLink>}
        />

        <div className="mt-16 grid gap-8 md:mt-24 lg:grid-cols-12">
          {lead && (
            <Reveal className="lg:col-span-6">
              <Link
                href={lead.href}
                className="group flex h-full flex-col overflow-hidden rounded-sm border border-line bg-surface-2"
              >
                <div className="relative aspect-[4/3] md:aspect-[2/1] lg:aspect-auto lg:min-h-96 lg:flex-1">
                  {lead.image && (
                    <Image
                      src={lead.image}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 45vw, 100vw"
                      className="object-cover transition-transform duration-[1200ms] group-hover:scale-[1.03]"
                      style={settle}
                    />
                  )}
                </div>
                <div className="flex items-end justify-between gap-6 border-t border-line p-5 md:p-8">
                  <div>
                    <p className="t-label tabular text-fg-muted">{d.count(lead.count)}</p>
                    <h3 className="t-h2 mt-2">{lead.title}</h3>
                  </div>
                  <span aria-hidden className={arrow}>
                    →
                  </span>
                </div>
              </Link>
            </Reveal>
          )}

          <ul className="grid gap-6 lg:col-span-6 lg:gap-8">
            {rest.map((it, i) => (
              <Reveal as="li" key={it.href} delay={i * 0.06} className="flex">
                <Link
                  href={it.href}
                  className="group grid w-full grid-cols-[6.5rem_minmax(0,1fr)] overflow-hidden rounded-sm border border-line bg-surface-2 sm:grid-cols-[7rem_minmax(0,1fr)] lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]"
                >
                  <div className="relative min-h-26 self-stretch sm:aspect-square">
                    {it.image && (
                      <Image
                        src={it.image}
                        alt=""
                        fill
                        sizes="(min-width: 1024px) 18vw, (min-width: 640px) 112px, 104px"
                        className="object-cover transition-transform duration-[1200ms] group-hover:scale-[1.05]"
                        style={settle}
                      />
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-4 border-l border-line p-4 lg:p-8">
                    <div className="min-w-0">
                      <p className="t-label tabular text-fg-muted">{d.count(it.count)}</p>
                      <h3 className="t-h3 mt-2">{it.title}</h3>
                    </div>
                    <span aria-hidden className={`${arrow} hidden sm:flex`}>
                      →
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
