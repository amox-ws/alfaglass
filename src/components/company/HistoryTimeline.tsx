import Link from "next/link";
import { MachineBlueprint } from "@/components/kit/MachineBlueprint";
import { SpecimenPlate } from "@/components/kit/SpecimenPlate";
import { Units } from "@/components/kit/Units";
import { Reveal } from "@/components/ui";
import { historyTimeline } from "@/lib/content";
import { t, type Lang } from "@/lib/i18n";
import { slots } from "@/lib/media-slots";
import { hrefFor } from "@/lib/routes";

/**
 * The company's years as a list read down a 1px edge line: the line fills as you scroll (`fill`, a CSS scroll timeline on the
 * list, transform only; the base rule is the finished line). Each year is a row: the year in the thin display weight, the text,
 * a tick on the line. The last row is the machine (2025): the drawing on a small `deep` tile (a photo of ALFA GLASS's own machine on a
 * specimen plate once `slots.machineStill` has one: one line of data), and the way to the cutting service, where the line ends: the
 * company's story now ends at the machine.
 */
export function HistoryTimeline({ lang }: { lang: Lang }) {
  const d = t(lang);
  const rows = historyTimeline(lang);
  const last = rows.length - 1;
  const photo = slots.machineStill.still;
  return (
    <div className="co-timeline">
      <span aria-hidden className="co-track" />
      <span aria-hidden className="co-fill" />
      <ol>
        {rows.map((row, i) => (
          <Reveal as="li" key={row.year} className="co-row" attrs={i === last ? { "data-end": "" } : {}}>
            <span className="co-year t-h1 tabular font-extralight">{row.year}</span>
            <div className="co-body">
              <p className="t-body max-w-[52ch] text-fg-muted">{row.text}</p>
              {i === last && (
                <>
                  {photo ? (
                    <SpecimenPlate src={photo.src} alt={photo.alt} lang={lang} sizes="(min-width: 1024px) 30vw, 100vw" className="max-w-md" />
                  ) : (
                    <div aria-hidden data-theme="deep" className="co-tile bg-surface">
                      <p className="t-label text-fg-muted">
                        <Units>{d.machine.cardLine}</Units>
                      </p>
                      <MachineBlueprint lang={lang} variant="mini" gantryAt={0.62} id="co-bp" />
                    </div>
                  )}
                  <Link href={hrefFor(lang, { kind: "service" })} className="text-link t-body font-semibold">
                    {d.nav.serviceLong} →
                  </Link>
                </>
              )}
            </div>
          </Reveal>
        ))}
      </ol>
    </div>
  );
}
