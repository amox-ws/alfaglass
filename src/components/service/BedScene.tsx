import type { CSSProperties } from "react";
import { BLUEPRINT_BOX, MachineBlueprint } from "@/components/kit/MachineBlueprint";
import { MediaSlot } from "@/components/kit/MediaSlot";
import { Units } from "@/components/kit/Units";
import { t, type Lang } from "@/lib/i18n";
import { slots } from "@/lib/media-slots";

/**
 * The machine's scale, told by scroll (DIRECTION §4.13.2). One pinned stage of 100svh in a taller track, one view timeline
 * (`--bed`, in service.css), transform and opacity only:
 *   0–20 %   you stand next to the person at human size and the drawing pulls back until the whole bed fits (`zoom-out`)
 *   20–45 %  the 8 vacuum zones light up one by one, the two dimension lines are drawn (`zones`, `wipe`)
 *   45–80 %  the gantry crosses the bed and the demo job appears behind the spindle (`sweep`, `wipe`)
 *   80–100 % five numbered pins appear on the drawing and the legend names them (from md; on a phone the same facts are in the
 *            machine's data sheet further down)
 * The base rule is the final frame: browsers without scroll timelines and visitors who prefer reduced motion see the finished drawing
 * and no empty scroll. Below md the bed stands upright (the gantry sweeps downwards).
 *
 * The film slot: when `slots.machineFilm` gets a loop, from lg the bed's rectangle cross-fades into it at the end of the scene (the
 * pins and dimensions stay on top); below lg it follows the scene as a band with its poster and play button (MediaLoop's rules).
 */

/** The drawing's viewBox in mm: the pins are placed in the same coordinates as the drawing. */
const BOX = BLUEPRINT_BOX;
const pct = (value: number, from: number, size: number) => `${(((value - from) / size) * 100).toFixed(3)}%`;

/** Where each pin hangs (mm, along and across the bed) and what it points at: callouts in the dictionary come in this order. */
const PINS: { at: { u: number; v: number }; to?: { u: number; v: number } }[] = [
  { at: { u: -330, v: 1050 }, to: { u: 0, v: 1050 } }, // the vacuum table: beside the start of the bed, at its edge
  { at: { u: 5050, v: -240 }, to: { u: 5510, v: -240 } }, // the gantry: on the rail, beside the leg
  { at: { u: 5050, v: 850 }, to: { u: 5950, v: 850 } }, // the spindle: across the beam to the carriage
  { at: { u: 2580, v: 1050 } }, // the accuracy: on the engraved rosette of the round sign
  { at: { u: 6479, v: 2780 }, to: { u: 6279, v: 2502.5 } }, // the machine: at the corner of the frame
];

export function BedScene({ lang }: { lang: Lang }) {
  const d = t(lang);
  const s = d.service;
  const film = slots.machineFilm.loop;

  return (
    <>
      <section data-theme="deep" aria-labelledby="bed-title" className="bed">
        <div className="bed-stage">
          <div className="shell bed-head">
            <h2 id="bed-title" className="bed-title t-label">
              <Units>{s.bedTitle}</Units>
            </h2>
            {/* On a phone the upright drawing has no room beside the bed for the scale figure's words, so they stand here */}
            <p className="bed-scale t-label">{d.machine.scale}</p>
          </div>

          <div className="shell bed-draw">
            <div className="bed-land">
              <MachineBlueprint lang={lang} variant="full" id="bp-land" className="bp-zoomable" />
              {film && (
                <div className="bed-film">
                  <MediaSlot slot={slots.machineFilm} ratio="2.88 / 1" fill lang={lang} alt={s.filmLabel} />
                </div>
              )}
              <div aria-hidden className="bed-pins">
                <svg className="bed-leaders" viewBox={`${BOX.u} ${BOX.v} ${BOX.w} ${BOX.h}`}>
                  {PINS.map(
                    (p, i) => p.to && <line key={i} x1={p.at.u} y1={p.at.v} x2={p.to.u} y2={p.to.v} style={{ "--i": i } as CSSProperties} className="bed-leader" />,
                  )}
                </svg>
                {PINS.map((p, i) => (
                  <span key={i} className="bed-pin t-label" style={{ left: pct(p.at.u, BOX.u, BOX.w), top: pct(p.at.v, BOX.v, BOX.h), "--i": i } as CSSProperties}>
                    {i + 1}
                  </span>
                ))}
              </div>
            </div>
            <div className="bed-port">
              <MachineBlueprint lang={lang} variant="full" orientation="portrait" id="bp-port" className="bp-zoomable" />
            </div>
          </div>

          <ol className="shell bed-legend">
            {s.callouts.map((c, i) => (
              <li key={c.label} style={{ "--i": i } as CSSProperties}>
                <span aria-hidden className="bed-no t-label">
                  {i + 1}
                </span>
                <p className="t-label text-fg-muted">{c.label}</p>
                <p className="t-small">{c.value}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {film && (
        <div data-theme="deep" className="bed-after bg-surface pb-section">
          <div className="shell">
            <MediaSlot slot={slots.machineFilm} ratio="16 / 9" ratioMd="21 / 9" sizes="100vw" lang={lang} alt={s.filmLabel} />
          </div>
        </div>
      )}
    </>
  );
}
