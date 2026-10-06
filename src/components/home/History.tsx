import Image from "next/image";
import type { CSSProperties } from "react";
import { Eyebrow } from "@/components/ui";
import { t, type Lang } from "@/lib/i18n";

type Item = { year: string; text: string };

/**
 * Pinned timeline: vertical scrolling moves the years sideways. The travel distance is computed in CSS
 * from the card widths and the number of years, and a CSS scroll timeline drives it (globals.css,
 * "history scene"), so nothing runs on the main thread. Without scroll timelines, or with reduced
 * motion, the row becomes a swipeable strip.
 */
export function History({ lang, items, engraving }: { lang: Lang; items: Item[]; engraving: string }) {
  const h = t(lang).home;

  return (
    <section
      data-theme="deep"
      aria-labelledby="history-title"
      className="hist relative bg-surface"
      style={{ "--hist-n": items.length } as CSSProperties}
    >
      <div className="hist-track">
        <div className="hist-stage">
          <div className="shell mb-10 flex items-end justify-between gap-6 md:mb-14">
            <div>
              <Eyebrow index="05">{h.historyEyebrow}</Eyebrow>
              <h2 id="history-title" className="t-h1 mt-5">
                {h.historyTitle}
              </h2>
            </div>
            <div className="hist-progress w-48">
              <div className="h-px w-full bg-line">
                <div className="hist-bar h-px bg-accent" />
              </div>
              <p className="t-label mt-3 flex justify-between text-fg-dim tabular">
                <span>{items[0]?.year}</span>
                <span>{items[items.length - 1]?.year}</span>
              </p>
            </div>
          </div>

          <div className="hist-row">
            <figure className="hist-figure relative shrink-0 overflow-hidden rounded-sm">
              <Image src={engraving} alt={h.engravingAlt} fill sizes="30rem" className="object-cover grayscale" />
              <div className="absolute inset-0 bg-deep/40 mix-blend-multiply" />
              <figcaption className="glass glass-dark t-label absolute bottom-3 left-3 right-3 rounded-[0.7rem] px-3.5 py-3 text-fg">{h.engravingCaption}</figcaption>
            </figure>
            {items.map((it, i) => (
              <article
                key={it.year}
                className="hist-card flex shrink-0 flex-col justify-between border-l border-line pl-[clamp(1.25rem,2.5vw,2.5rem)]"
              >
                <p className="font-display text-[clamp(6rem,15vw,15rem)] font-[200] leading-[0.8] text-fg tabular">{it.year}</p>
                <div>
                  <p className="t-label mb-4 text-accent">{String(i + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}</p>
                  <p className="t-lead max-w-[26rem] text-fg-muted">{it.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
