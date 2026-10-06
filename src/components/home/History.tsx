import Image from "next/image";
import { Eyebrow, Reveal } from "@/components/ui";
import { t, type Lang } from "@/lib/i18n";

type Item = { year: string; text: string };

export function History({ lang, items, engraving }: { lang: Lang; items: Item[]; engraving: string }) {
  const h = t(lang).home;

  return (
    <section data-theme="deep" aria-labelledby="history-title" className="relative bg-surface section-y">
      <div className="shell grid gap-12 md:grid-cols-12">
        <div className="md:col-span-4">
          <Eyebrow index="05">{h.historyEyebrow}</Eyebrow>
          <h2 id="history-title" className="t-h1 mt-5">
            {h.historyTitle}
          </h2>
          <figure className="mt-10">
            <div className="relative aspect-[3/2] overflow-hidden rounded-sm">
              <Image src={engraving} alt={h.engravingAlt} fill sizes="(min-width: 768px) 30vw, 100vw" className="object-cover grayscale" />
              <div className="absolute inset-0 bg-deep/40 mix-blend-multiply" />
            </div>
            <figcaption className="t-label mt-3 text-fg-muted">{h.engravingCaption}</figcaption>
          </figure>
        </div>

        <ol className="md:col-span-7 md:col-start-6">
          {items.map((it, i) => (
            <Reveal
              as="li"
              key={it.year}
              delay={i * 0.04}
              y={14}
              className="grid gap-x-[clamp(1.5rem,4vw,4rem)] gap-y-3 border-t border-line py-7 last:border-b sm:grid-cols-[auto_minmax(0,1fr)] sm:items-baseline"
            >
              <p className="font-display text-[clamp(3.25rem,6vw,6rem)] font-[200] leading-[0.85] text-fg tabular">{it.year}</p>
              <p className="text-fg-muted">{it.text}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
