import Link from "next/link";
import { MachineBlueprint } from "@/components/kit/MachineBlueprint";
import { PillArrow } from "@/components/kit/PillArrow";
import { Units } from "@/components/kit/Units";
import { Eyebrow, MaskedLines, Reveal } from "@/components/ui";
import { t, type Lang } from "@/lib/i18n";

/** A number never parts from its unit, nor the "×" from its numbers: "2,1 × 6,05 m" is one word to the line breaker. */
const tie = (text: string) =>
  text.replace(/(\d) (mm|m|kW|rpm)(?![\p{L}\p{N}])/gu, "$1\u00a0$2").replace(/ × /g, "\u00a0×\u00a0");

/**
 * The second pillar on the home page, in one screen: ALFA GLASS now cuts, how big, and where to ask. A blueprint chapter (`deep`: white
 * and edge-cyan lines on the wordmark's indigo, not a night chapter): the working table of the CNC router drawn to scale across the
 * whole shell, with the person at the bed and both dimensions. As the drawing scrolls into view the gantry crosses the bed once and the
 * cut path appears behind it (home.css, "the machine": a scroll timeline over transform only); the drawing itself is the finished state.
 *
 * Inline SVG, no image request and no client JavaScript. The drawing is the visual for good (no render, no supplier picture, no stock
 * photo); once the machine's film exists (`slots.machineFilm.loop`), a link to the service page's scene appears after the actions, and
 * the home page never plays the film itself.
 */
export function Machine({ lang, serviceHref, estimatorHref, film }: { lang: Lang; serviceHref: string; estimatorHref: string; film: boolean }) {
  const d = t(lang);
  const m = d.machine;
  return (
    <section data-theme="deep" aria-labelledby="machine-title" className="relative bg-surface section-y">
      <div className="shell">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-8">
          <div className="lg:col-span-7">
            <Eyebrow index="04">{m.eyebrow}</Eyebrow>
            {/* A no-break space ties the "&" to the word before it, so the title wraps after it ("CNC ΚΟΠΗ &" / "ΚΑΤΕΡΓΑΣΙΑ"), never before it */}
            <MaskedLines as="h2" id="machine-title" lines={[m.title.replace(" & ", "\u00a0& ")]} className="t-display mt-5" />
          </div>
          <Reveal className="lg:col-span-4 lg:col-start-9">
            <p className="t-lead text-balance">{tie(`${m.promise} ${m.accuracy}`)}</p>
          </Reveal>
        </div>

        <div className="mach-drawing mt-10 md:mt-12">
          <MachineBlueprint lang={lang} variant="band" />
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:gap-8">
          <Reveal className="lg:col-span-5">
            <p className="t-body max-w-[48ch] text-fg-muted">{m.lead}</p>
          </Reveal>
          <ul className="mach-facts t-label lg:col-span-3 lg:col-start-6">
            {m.facts.map((fact) => (
              <li key={fact} className="tabular">
                <Units>{fact}</Units>
              </li>
            ))}
          </ul>
          <div className="flex flex-col items-start gap-2 lg:col-span-4 lg:col-start-9">
            <Link href={serviceHref} className="btn-pill btn-pill-dark w-full sm:w-auto">
              {m.serviceLink}
              <PillArrow />
            </Link>
            <Link href={estimatorHref} className="text-link gap-2 font-semibold">
              {d.nav.estimator} <span aria-hidden>→</span>
            </Link>
            {film && (
              <Link href={serviceHref} className="text-link t-label gap-2">
                {d.home.watchCut} <span aria-hidden>→</span>
              </Link>
            )}
          </div>
        </div>

        <p className="t-label mt-10 border-t border-line pt-6 text-fg-muted">
          <Units>{m.materialsLine}</Units>
        </p>
      </div>
    </section>
  );
}
