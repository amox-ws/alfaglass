import type { CSSProperties } from "react";
import { JOB_SIGN, jobContext } from "@/components/kit/MachineBlueprint";
import { PlayOnView } from "@/components/kit/PlayOnView";
import { Units } from "@/components/kit/Units";
import { formatNumber } from "@/lib/machine";
import { t, type Lang } from "@/lib/i18n";

/*
 * The home page's close-up of the CNC work (the service page tells the whole machine's story; this is its trailer): the round sign of the
 * demo job, seen close on the acrylic sheet, its neighbours in the nesting fading out at the edges. When half of it is on screen the
 * spindle, a point of light, engraves the rosette petal by petal, pockets the centre, cuts the disc out, and the disc rises out of the
 * sheet (home.css, "the close-up"). Once, about four seconds, on its own clock; the finished state is the base rule.
 *
 * Coordinates are the machine's (mm, landscape). The view is 3.500 × 2.200 mm centred on the sign and cropped by the box (`slice`):
 * 16:9 from md, square on a phone, where it shows the sign alone. The spindle and the words are placed from the centre in `--mm`
 * (the px of one mm at the current crop), so they stay on the drawing in both crops; a word hangs inwards from its side of the disc.
 */

const S = JOB_SIGN;
const VIEW = { w: 3500, h: 2200 };
const VB = `${S.u - VIEW.w / 2} ${S.v - VIEW.h / 2} ${VIEW.w} ${VIEW.h}`;
const K = 0.5523;

const p = (u: number, v: number) => `${Math.round(u)} ${Math.round(v)}`;
const pol = (r: number, deg: number): [number, number] => [S.u + r * Math.cos((deg * Math.PI) / 180), S.v + r * Math.sin((deg * Math.PI) / 180)];
/** A circle as one path that starts at the top and runs clockwise, so its stroke is drawn the way the spindle travels. */
const ring = (cu: number, cv: number, r: number) =>
  `M${p(cu, cv - r)}C${p(cu + K * r, cv - r)} ${p(cu + r, cv - K * r)} ${p(cu + r, cv)}C${p(cu + r, cv + K * r)} ${p(cu + K * r, cv + r)} ${p(cu, cv + r)}` +
  `C${p(cu - K * r, cv + r)} ${p(cu - r, cv + K * r)} ${p(cu - r, cv)}C${p(cu - r, cv - K * r)} ${p(cu - K * r, cv - r)} ${p(cu, cv - r)}`;
const petal = (deg: number, r0: number, r1: number, spread: number) => {
  const at = (r: number, d: number) => p(...pol(r, d));
  return (
    `M${at(r0, deg)}C${at(r0 + (r1 - r0) * 0.35, deg - spread)} ${at(r0 + (r1 - r0) * 0.85, deg - spread * 0.7)} ${at(r1, deg)}` +
    `C${at(r0 + (r1 - r0) * 0.85, deg + spread * 0.7)} ${at(r0 + (r1 - r0) * 0.35, deg + spread)} ${at(r0, deg)}`
  );
};

/** The sequence, in seconds after it starts: each stroke draws over `t` from `d`. The spindle's path in home.css follows the same clock. */
const STROKES: { d: string; at: number; t: number; cut?: boolean }[] = [
  { d: ring(S.u, S.v, 880), at: 0, t: 0.6 },
  // the twelve large petals clockwise from the top, the small ones between them a beat behind
  ...Array.from({ length: 12 }, (_, i) => ({ d: petal(i * 30 - 90, 240, 820, 13), at: 0.6 + i * 0.13, t: 0.32 })),
  ...Array.from({ length: 12 }, (_, i) => ({ d: petal(i * 30 - 75, 240, 540, 9), at: 0.75 + i * 0.13, t: 0.28 })),
  { d: ring(S.u, S.v, 230), at: 2.4, t: 0.25 },
  { d: ring(S.u, S.v, S.r), at: 2.8, t: 0.8, cut: true },
  ...[45, 135, 225, 315].map((deg, i) => ({ d: ring(...pol(915, deg), 14), at: 2.9 + i * 0.2, t: 0.1, cut: true })),
];

export function CutDetail({ lang }: { lang: Lang }) {
  const h = t(lang).home;
  const ctx = jobContext();
  const sheet = ctx.sheet;
  const disc = ring(S.u, S.v, S.r) + [45, 135, 225, 315].map((deg) => ring(...pol(915, deg), 14)).join("");

  return (
    <PlayOnView className="cd" duration={4700} replay={h.cutAgain}>
      {/* The sheet and the other parts of the nesting, fading out towards the edges like the edge of a lens */}
      <svg className="cd-layer cd-context" role="img" aria-label={h.cutLabel} viewBox={VB} preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="cd-sheen" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="white" stopOpacity="0.12" />
            <stop offset="0.5" stopColor="white" stopOpacity="0.02" />
            <stop offset="0.7" stopColor="white" stopOpacity="0.08" />
            <stop offset="1" stopColor="white" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <rect className="cd-sheet" x={sheet.u} y={sheet.v} width={sheet.w} height={sheet.h} />
        <rect fill="url(#cd-sheen)" x={sheet.u} y={sheet.v} width={sheet.w} height={sheet.h} />
        <path className="cd-ctx-pocket" d={ctx.pocket} />
        <path className="cd-ctx" d={ctx.engrave} />
        <path className="cd-ctx" d={ctx.parts} />
      </svg>

      {/* Where the disc was: its shadow on the table once it has risen */}
      <svg className="cd-layer cd-shadow" aria-hidden viewBox={VB} preserveAspectRatio="xMidYMid slice">
        <path fillRule="evenodd" d={disc} />
      </svg>

      {/* The disc: engraved, pocketed and cut out stroke by stroke, then risen out of the sheet */}
      <svg className="cd-layer cd-disc" aria-hidden viewBox={VB} preserveAspectRatio="xMidYMid slice">
        <path className="cd-face" fillRule="evenodd" d={disc} />
        <circle className="cd-pocket" cx={S.u} cy={S.v} r={170} />
        {STROKES.map((s, i) => (
          <path key={i} className={`cd-draw ${s.cut ? "cd-cut" : "cd-engrave"}`} d={s.d} pathLength={1} style={{ "--at": `${s.at}s`, "--t": `${s.t}s` } as CSSProperties} />
        ))}
      </svg>

      {/* The spindle: a point of light that turns about the sign's centre at the radius it is working on */}
      <div aria-hidden className="cd-spin">
        <span className="cd-tool" />
      </div>

      <span aria-hidden className="cd-label t-label" data-side="r" style={{ "--x": 960, "--y": -900 } as CSSProperties}>
        Ø&nbsp;{formatNumber(S.r * 2)}&nbsp;<span className="unit">mm</span>
      </span>
      <span aria-hidden className="cd-label t-label" data-side="l" style={{ "--x": -960, "--y": 900 } as CSSProperties}>
        <Units>{h.cutEngrave}</Units>
      </span>
    </PlayOnView>
  );
}
