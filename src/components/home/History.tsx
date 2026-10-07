import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { MachineBlueprint } from "@/components/kit/MachineBlueprint";
import { Eyebrow } from "@/components/ui";
import { t, type Lang } from "@/lib/i18n";

type Item = { year: string; text: string };

/**
 * Pinned timeline (night): vertical scrolling moves the years sideways. The travel distance is computed in CSS from the card widths
 * and the number of years, and a CSS scroll timeline drives it (home.css, "history"), so nothing runs on the main thread. Without
 * scroll timelines, or with reduced motion, the row becomes a swipeable strip with a hint.
 *
 * The years come from `historyTimeline`: the content's five and a sixth, 2025, the machine. That card carries the machine drawn in
 * edge lines and a link to the service page: the company's story ends at the machine.
 */
export function History({ lang, items, engraving, serviceHref }: { lang: Lang; items: Item[]; engraving: string; serviceHref: string }) {
  const d = t(lang);
  const h = d.home;
  const last = items.length - 1;

  return (
    <section data-theme="night" aria-labelledby="history-title" className="hist relative bg-surface" style={{ "--hist-n": items.length } as CSSProperties}>
      <div className="hist-track">
        <div className="hist-stage">
          <div className="shell hist-head">
            <div>
              <Eyebrow index="06">{h.historyEyebrow}</Eyebrow>
              <h2 id="history-title" className="t-h1 mt-5">
                {h.historyTitle}
              </h2>
            </div>
            <div aria-hidden className="hist-progress w-48">
              <div className="h-0.5 w-full bg-line">
                <div className="hist-bar" />
              </div>
              <p className="t-label mt-3 flex justify-between text-fg-dim tabular">
                <span>{items[0]?.year}</span>
                <span>{items[last]?.year}</span>
              </p>
            </div>
            {/* Where the years are a strip to swipe (no scroll timelines, or reduced motion) the strip says so */}
            <p aria-hidden className="hist-hint t-label shrink-0 items-center gap-3 text-fg-muted">
              {h.swipe}
              <svg width="28" height="10" viewBox="0 0 28 10" className="hist-hint-arrow">
                <path d="M0 5h26M22 1l4 4-4 4" stroke="currentColor" strokeWidth="1.5" fill="none" />
              </svg>
            </p>
          </div>

          <div className="hist-row">
            <figure className="hist-figure">
              <Image src={engraving} alt={h.engravingAlt} fill sizes="30rem" className="object-cover" />
              <figcaption className="glass glass-dark t-label absolute bottom-3 left-3 right-3 rounded-[0.7rem] px-3.5 py-3 text-fg">{h.engravingCaption}</figcaption>
            </figure>
            {items.map((it, i) => (
              <article key={it.year} className="hist-card">
                <div>
                  <p className="t-label mb-5 tabular text-accent">
                    {String(i + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
                  </p>
                  <p className="hist-year">{it.year}</p>
                </div>
                <div>
                  <p className="t-body max-w-[26rem] text-fg-muted">{it.text}</p>
                  {i === last && (
                    <>
                      <MachineBlueprint lang={lang} variant="mini" className="mt-6 max-w-[26rem]" />
                      <Link href={serviceHref} className="text-link t-label mt-2 gap-2 text-fg">
                        {d.nav.serviceLong} <span aria-hidden>→</span>
                      </Link>
                    </>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
