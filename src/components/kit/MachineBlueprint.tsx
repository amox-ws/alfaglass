import type { CSSProperties } from "react";
import { BED, fitsBed, formatNumber } from "@/lib/machine";
import { t, type Lang } from "@/lib/i18n";

/*
 * The machine drawn as a blueprint: a plan view (κάτοψη) of the CNC router as it is built (the frame, the rails, the gantry, the vacuum
 * table of 6.050 × 2.100 mm and the control cabinet beside it), in millimetres, white and edge-cyan lines on the brand indigo. It is the visual language of the cutting service and, until ALFA GLASS's own machine is photographed,
 * its only picture (no renders, no supplier pictures, no stock photos). A static, server-rendered component: the System builds the
 * geometry and the layer hooks, the lanes choreograph it (the keyframes `sweep`, `wipe-clip`, `wipe-content`, `zones`, `zoom-out`
 * are in motion.css; their base rule here is the finished drawing).
 *
 * Machine coordinates: u runs along the bed (the machine's Y axis, 6.050 mm), v across it (X, 2.100 mm). The landscape drawing draws
 * u horizontally; the portrait drawing swaps the axes (the gantry then sweeps downwards).
 */

type Orientation = "landscape" | "portrait";
type Variant = "full" | "band" | "mini";

const LEN = BED.y; // 6050
const WID = BED.x; // 2100

/*
 * The real machine (the maker's offer, CNC Router XY2160 Vacuum ATC PC), in plan, in mm:
 *   the frame is about 2.905 × 6.879 mm; the working area sits in it with 400 mm either side and the gantry's parking room at the start
 *   the gantry rides two 25 mm linear rails with a rack (X, Y), one servo on each leg; the spindle carriage hangs on the front of the beam
 *   the vacuum table is acetal in 8 zones (2 across × 4 along) with T-slots between them and a valve for each zone on the frame
 *   the 8-place tool changer travels with the gantry (ISO30, "on the bridge"); the tool length sensor stands at the start of the table
 *   the control cabinet (industrial PC, beacon) is a separate station beside the machine
 */
const FRAME = { u: -600, v: WID / 2 - 1452.5, w: 6879, h: 2905 };
/** The two rails, centred on the gantry legs, along the whole frame. */
const RAILS = [-240, WID + 240];
const ZONES = 8;
const ZONE_U = LEN / 4; // 1512.5
const ZONE_V = WID / 2; // 1050
/** A T-slot between two zones, 20 mm wide. */
const SLOT = 20;
/** The vacuum grid of the acetal plate. */
const GRID = 50;

/**
 * The gantry in its own coordinates, u measured from the spindle axis (which reaches the whole bed, 0 to 6.050). The beam stands behind
 * the carriage, the legs stand on the rails; `back` and `front` are how far the gantry reaches behind and in front of the spindle.
 */
const G = {
  back: -540,
  front: 150,
  beam: { u: -380, w: 280, v: -330, h: WID + 660 },
  legs: [
    { v: -330, h: 180 },
    { v: WID + 150, h: 180 },
  ],
  leg: { u: -540, w: 600 },
  motors: [
    { v: -440, h: 110 },
    { v: WID + 330, h: 110 },
  ],
  motor: { u: -480, w: 140 },
  carriage: { u: -100, w: 210, v: 620, h: 460 },
  spindle: { v: 850, r: 62, hood: 150 },
  chain: { u: -320, w: 160, v0: -290 },
  rack: { u: -95, w: 110, v: 1220, h: 920 },
  tools: 8,
  tool: { u: -40, v: 1270, pitch: 120, r: 40 },
} as const;
const GANTRY_LEN = G.front - G.back; // 690
/** The track the gantry layer travels in: from where its back stands at the start to where its front stands at the end. */
const TRACK = { u: G.back, w: LEN + GANTRY_LEN };

/** The control cabinet beside the start of the machine, its keyboard shelf towards the operator, the beacon on its roof. */
const CABINET = { u: -1380, v: 1500, w: 600, h: 600, shelf: 220, beacon: 50 };
/** The zone valves, one for each zone, on a manifold along the near side of the frame. */
const VALVES = { u: 2300, v: FRAME.v + FRAME.h, pitch: 200, r: 38 };
/** The tool length sensor at the start of the table, inside the spindle's reach across. */
const SENSOR = { u: -150, v: 1900, r: 55 };

/** The dimension lines: along the bed above the frame, across it to the right of the frame. */
const DIM_V = FRAME.v - 200;
const DIM_U = FRAME.u + FRAME.w + 200;

/**
 * The viewBox: the cabinet and the frame, the dimension lines and the person at the near side, with a margin. It grows only when a
 * piece sticks out of the field.
 */
export const BLUEPRINT_BOX = { u: -1600, v: DIM_V - 150, w: DIM_U + 150 + 1600, h: 3100 - (DIM_V - 150) };
const BOX = BLUEPRINT_BOX;
/** The mini drawing has no dimensions, no cabinet and no person, so it is framed closer: a 200 mm margin round the frame. */
const MINI = 200;
const MINI_BOX = { u: FRAME.u - MINI, v: FRAME.v - 40 - MINI, w: FRAME.w + 2 * MINI, h: FRAME.h + 80 + 2 * MINI };

/** The person standing at the near side of the machine, to scale: shoulders 510 × 230, head Ø 200, the hands on the frame. */
const PERSON = { u: 1000, v: 2800, rx: 255, ry: 115, head: 100, hands: FRAME.v + FRAME.h + 45 };

/** Where the callouts of the service scene hang their leaders (final frame: the gantry has crossed the whole bed). */
export const BLUEPRINT_ANCHORS = {
  zones: { u: ZONE_U * 1.5, v: ZONE_V * 1.25 },
  gantry: { u: LEN + G.leg.u, v: G.legs[0].v + G.legs[0].h / 2 },
  carriage: { u: LEN, v: G.spindle.v },
  path: { u: 1750, v: 700 },
  bed: { u: FRAME.u + FRAME.w, v: FRAME.v + FRAME.h },
} as const;
export type BlueprintAnchor = keyof typeof BLUEPRINT_ANCHORS;

/**
 * The demo job, no letters and no logos: one whole acrylic sheet on the vacuum table and a nesting of real shop work cut out of it,
 * packed with a 25 mm web between the parts. From the start of the bed: a display stand (two curved sides with slots, three shelves,
 * a base strip with a pocket for an edge-lit panel, six drilled stand-off discs), a round sign Ø 1.900 with an engraved rosette, a
 * screen panel perforated with hexagons that shrink along the bed, and two arched panels with an engraved inner frame. The last
 * 380 mm of the sheet are left as an offcut: the gantry parks over them at the end of the job.
 */
const SHEET = { u: 25, v: 35, w: 6000, h: 2030 };
/** How far a cut part rises out of the sheet at the end of the scene, in plan: up and to the left, its shadow stays below. */
const LIFT = 30;

const num = (n: number) => String(Math.round(n * 100) / 100);

function geometry(o: Orientation) {
  const land = o === "landscape";
  /** machine coordinates (u, v) → the drawing's (x, y) */
  const x = (u: number, v: number) => (land ? u : v);
  const y = (u: number, v: number) => (land ? v : u);
  const pt = (u: number, v: number) => `${num(x(u, v))} ${num(y(u, v))}`;
  const rect = (u: number, v: number, du: number, dv: number) => ({
    x: land ? u : v,
    y: land ? v : u,
    width: land ? du : dv,
    height: land ? dv : du,
  });
  const vb = (b: { u: number; v: number; w: number; h: number }) => (land ? `${b.u} ${b.v} ${b.w} ${b.h}` : `${b.v} ${b.u} ${b.h} ${b.w}`);
  return { land, x, y, pt, rect, vb };
}

type Job = { parts: string; engrave: string; pocket: string };

/** The demo job as three paths in the drawing's coordinates: the parts with their holes (even-odd), the engraving, the pockets. */
function job(o: Orientation): Job {
  const g = geometry(o);
  const P = (u: number, v: number) => `${Math.round(g.x(u, v))} ${Math.round(g.y(u, v))}`;
  const poly = (pts: [number, number][]) => `M${pts.map(([u, v]) => P(u, v)).join("L")}Z`;
  const K = 0.5523; // a quarter circle as one cubic
  const circle = (cu: number, cv: number, r: number) =>
    `M${P(cu + r, cv)}C${P(cu + r, cv + K * r)} ${P(cu + K * r, cv + r)} ${P(cu, cv + r)}` +
    `C${P(cu - K * r, cv + r)} ${P(cu - r, cv + K * r)} ${P(cu - r, cv)}` +
    `C${P(cu - r, cv - K * r)} ${P(cu - K * r, cv - r)} ${P(cu, cv - r)}` +
    `C${P(cu + K * r, cv - r)} ${P(cu + r, cv - K * r)} ${P(cu + r, cv)}Z`;
  const rounded = (u: number, v: number, w: number, h: number, r: number) =>
    `M${P(u + r, v)}L${P(u + w - r, v)}C${P(u + w - r + K * r, v)} ${P(u + w, v + r - K * r)} ${P(u + w, v + r)}` +
    `L${P(u + w, v + h - r)}C${P(u + w, v + h - r + K * r)} ${P(u + w - r + K * r, v + h)} ${P(u + w - r, v + h)}` +
    `L${P(u + r, v + h)}C${P(u + r - K * r, v + h)} ${P(u, v + h - r + K * r)} ${P(u, v + h - r)}` +
    `L${P(u, v + r)}C${P(u, v + r - K * r)} ${P(u + r - K * r, v)} ${P(u + r, v)}Z`;
  const parts: string[] = [];
  const engrave: string[] = [];
  const pocket: string[] = [];

  // the display stand: two curved sides (1.450 long, 420 tall at the back, 170 at the front), each with three shelf slots 20 × 80
  const side = (u0: number, base: number, dir: 1 | -1) => {
    const at = (a: number, b: number): [number, number] => [u0 + a, base - dir * b];
    const slots = [300, 725, 1150].flatMap((sl) => [at(sl - 10, 0), at(sl - 10, 80), at(sl + 10, 80), at(sl + 10, 0)]);
    const [a0, a1] = [at(0, 0), at(1450, 0)];
    const [c0, c1, c2, c3] = [at(1450, 170), at(1000, 170), at(480, 420), at(0, 420)];
    return `M${P(...a0)}L${slots.map((q) => P(...q)).join("L")}L${P(...a1)}L${P(...c0)}C${P(...c1)} ${P(...c2)} ${P(...c3)}Z`;
  };
  parts.push(side(70, 500, 1), side(70, 530, -1));
  // three shelves 1.000 × 240 with rounded front corners
  for (const v of [980, 1250, 1520]) parts.push(rounded(70, v, 1000, 240, 40));
  // six stand-off discs Ø 180 with a Ø 24 hole
  for (const cu of [1200, 1405]) for (const cv of [1085, 1330, 1575]) parts.push(circle(cu, cv, 90) + circle(cu, cv, 12));
  // the base strip with the pocket that holds an edge-lit panel
  parts.push(rounded(70, 1800, 1450, 200, 30));
  pocket.push(rounded(130, 1885, 1330, 30, 6));

  // the round sign: Ø 1.900, four Ø 28 fixing holes, an engraved ring and rosette, a pocketed centre
  const S = { u: 2580, v: 1050, r: 950 };
  const pol = (r: number, deg: number): [number, number] => [S.u + r * Math.cos((deg * Math.PI) / 180), S.v + r * Math.sin((deg * Math.PI) / 180)];
  parts.push(circle(S.u, S.v, S.r) + [45, 135, 225, 315].map((d) => circle(...pol(915, d), 14)).join(""));
  engrave.push(circle(S.u, S.v, 880), circle(S.u, S.v, 230));
  const petal = (deg: number, r0: number, r1: number, spread: number) =>
    `M${P(...pol(r0, deg))}C${P(...pol(r0 + (r1 - r0) * 0.35, deg - spread))} ${P(...pol(r0 + (r1 - r0) * 0.85, deg - spread * 0.7))} ${P(...pol(r1, deg))}` +
    `C${P(...pol(r0 + (r1 - r0) * 0.85, deg + spread * 0.7))} ${P(...pol(r0 + (r1 - r0) * 0.35, deg + spread))} ${P(...pol(r0, deg))}Z`;
  for (let i = 0; i < 12; i++) engrave.push(petal(i * 30, 240, 820, 13), petal(i * 30 + 15, 240, 540, 9));
  pocket.push(circle(S.u, S.v, 170));

  // the screen panel 1.400 × 1.940, perforated with hexagons that shrink along the bed (Ø 200 to Ø 70)
  const H = { u: 3580, v: 80, w: 1400, h: 1940 };
  let screen = rounded(H.u, H.v, H.w, H.h, 80);
  const pitch = 235;
  const row = (pitch * Math.sqrt(3)) / 2;
  for (let j = 0; H.v + 150 + j * row <= H.v + H.h - 150; j++) {
    const cv = H.v + 150 + j * row;
    for (let cu = H.u + 150 + (j % 2) * (pitch / 2); cu <= H.u + H.w - 150; cu += pitch) {
      const t = (cu - H.u - 150) / (H.w - 300);
      const r = (100 - 65 * t) * (0.88 + 0.12 * Math.cos(((cv - 1050) / 970) * Math.PI));
      screen += poly(Array.from({ length: 6 }, (_, k) => [cu + r * Math.cos((k * Math.PI) / 3), cv + r * Math.sin((k * Math.PI) / 3)] as [number, number]));
    }
  }
  parts.push(screen);

  // two arched panels 610 × 940, their tips towards the end of the bed, an engraved frame 70 mm inside
  const arch = (ub: number, ut: number, va: number, vb: number) => {
    const vc = (va + vb) / 2;
    const r = (vb - va) / 2;
    const us = ut - r;
    return (
      `M${P(ub, va)}L${P(us, va)}C${P(us + K * r, va)} ${P(ut, vc - K * r)} ${P(ut, vc)}` +
      `C${P(ut, vc + K * r)} ${P(us + K * r, vb)} ${P(us, vb)}L${P(ub, vb)}Z`
    );
  };
  for (const [va, vb] of [[80, 1020], [1080, 2020]]) {
    parts.push(arch(5030, 5640, va, vb));
    engrave.push(arch(5100, 5570, va + 70, vb - 70));
  }

  return { parts: parts.join(""), engrave: engrave.join(""), pocket: pocket.join("") };
}

/** The cut path: what the spindle leaves in the sheet. */
function cutPath(j: Job) {
  return (
    <g className="bp-cuts">
      <path className="bp-pocket" d={j.pocket} />
      <path className="bp-engrave" d={j.engrave} />
      <path className="bp-cut" d={j.parts} />
    </g>
  );
}

/** The cut parts risen out of the sheet: their shadow where they were, the parts themselves moved up and to the left. */
function lifted(j: Job, layer: "shadow" | "part") {
  if (layer === "shadow") return <path className="bp-shadow" fillRule="evenodd" d={j.parts} />;
  return (
    <g transform={`translate(${-LIFT} ${-LIFT})`}>
      <path className="bp-part" fillRule="evenodd" d={j.parts} />
      <path className="bp-pocket" d={j.pocket} />
      <path className="bp-engrave" d={j.engrave} />
    </g>
  );
}

/** The acrylic sheet on the table: a tint, a sheen across it and a bright edge. */
function sheet(o: Orientation, id: string) {
  const g = geometry(o);
  const r = g.rect(SHEET.u, SHEET.v, SHEET.w, SHEET.h);
  return (
    <>
      <defs>
        <linearGradient id={`${id}-sheen`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--bp-sheen)" stopOpacity="0.16" />
          <stop offset="0.45" stopColor="var(--bp-sheen)" stopOpacity="0.03" />
          <stop offset="0.62" stopColor="var(--bp-sheen)" stopOpacity="0.1" />
          <stop offset="1" stopColor="var(--bp-sheen)" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <rect className="bp-sheet" {...r} />
      <rect fill={`url(#${id}-sheen)`} className="bp-sheen" {...r} />
    </>
  );
}

/**
 * The gantry, in the coordinates of its track (u from the track's start, so the layer can travel by translate alone): the beam across
 * the whole frame, a leg with its servo on each rail, the drag chain on the beam, the spindle carriage with the dust hood, and the
 * tool rack beside it. Its parts are filled with the page's surface, so it reads as a solid thing over the table. `simple` (the mini
 * drawing) keeps only the beam, the legs, the carriage, the spindle and the tools.
 */
function gantry(o: Orientation, at: number, simple = false) {
  const g = geometry(o);
  const r = (u: number, v: number, du: number, dv: number) => g.rect(at + u, v, du, dv);
  const c = (u: number, v: number) => ({ cx: g.x(at + u, v), cy: g.y(at + u, v) });
  const ch = G.chain;
  // the drag chain: two side bands and a link every 70 mm, from the beam's end to the carriage
  const links = Math.floor((G.spindle.v - ch.v0) / 70);
  const chain =
    `M${g.pt(at + ch.u, ch.v0)}L${g.pt(at + ch.u, G.spindle.v)}M${g.pt(at + ch.u + ch.w, ch.v0)}L${g.pt(at + ch.u + ch.w, G.spindle.v)}` +
    Array.from({ length: links + 1 }, (_, i) => `M${g.pt(at + ch.u, ch.v0 + i * 70)}L${g.pt(at + ch.u + ch.w, ch.v0 + i * 70)}`).join("");
  return (
    <>
      {G.legs.map((l, i) => (
        <rect key={`l${i}`} className="bp-leg" {...r(G.leg.u, l.v, G.leg.w, l.h)} />
      ))}
      {!simple &&
        G.motors.map((m, i) => <rect key={`m${i}`} className="bp-motor" {...r(G.motor.u, m.v, G.motor.w, m.h)} />)}
      <rect className="bp-beam" {...r(G.beam.u, G.beam.v, G.beam.w, G.beam.h)} />
      {!simple && <path className="bp-chain" d={chain} />}
      <rect className="bp-rack" {...r(G.rack.u, G.rack.v, G.rack.w, G.rack.h)} />
      {Array.from({ length: G.tools }, (_, i) => (
        <circle key={`t${i}`} className="bp-tool" {...c(G.tool.u, G.tool.v + i * G.tool.pitch)} r={G.tool.r} />
      ))}
      <rect className="bp-carriage" {...r(G.carriage.u, G.carriage.v, G.carriage.w, G.carriage.h)} />
      {!simple && <circle className="bp-hood" {...c(0, G.spindle.v)} r={G.spindle.hood} />}
      <circle className="bp-spindle" {...c(0, G.spindle.v)} r={G.spindle.r} />
    </>
  );
}

/** The frame and the two rails with their racks, under everything else. */
function frame(o: Orientation, simple = false) {
  const g = geometry(o);
  const f = FRAME;
  const rails = RAILS.map((v) => `M${g.pt(f.u, v - 12.5)}L${g.pt(f.u + f.w, v - 12.5)}M${g.pt(f.u, v + 12.5)}L${g.pt(f.u + f.w, v + 12.5)}`).join("");
  // the rack: on the outer side of each rail, its teeth a fine dash
  const racks = RAILS.map((v, i) => {
    const rv = v + (i === 0 ? -45 : 45);
    return `M${g.pt(f.u, rv)}L${g.pt(f.u + f.w, rv)}`;
  }).join("");
  return (
    <>
      <rect className="bp-frame" {...g.rect(f.u, f.v, f.w, f.h)} />
      <path className="bp-rail" d={rails} />
      {!simple && <path className="bp-rack-teeth" d={racks} />}
    </>
  );
}

/** The vacuum table: the acetal grid, the 8 zones (2 × 4) and the T-slots between them. */
function table(o: Orientation, id: string) {
  const g = geometry(o);
  const seams = [
    ...[1, 2, 3].flatMap((i) => [i * ZONE_U - SLOT / 2, i * ZONE_U + SLOT / 2].map((u) => `M${g.pt(u, 0)}L${g.pt(u, WID)}`)),
    ...[ZONE_V - SLOT / 2, ZONE_V + SLOT / 2].map((v) => `M${g.pt(0, v)}L${g.pt(LEN, v)}`),
  ].join("");
  return (
    <>
      <defs>
        <pattern id={`${id}-grid`} width={GRID} height={GRID} patternUnits="userSpaceOnUse">
          <path className="bp-grid-line" d={`M${GRID} 0H0V${GRID}`} />
        </pattern>
      </defs>
      <rect className="bp-table" {...g.rect(0, 0, LEN, WID)} />
      <rect fill={`url(#${id}-grid)`} className="bp-grid" {...g.rect(0, 0, LEN, WID)} />
      {Array.from({ length: ZONES }, (_, i) => (
        <rect
          key={i}
          className="bp-zone"
          style={{ "--i": i } as CSSProperties}
          {...g.rect(Math.floor(i / 2) * ZONE_U, (i % 2) * ZONE_V, ZONE_U, ZONE_V)}
        />
      ))}
      <path className="bp-seam" d={seams} />
    </>
  );
}

/** What stands round the machine: the zone valves on the frame, the tool length sensor and the control cabinet. */
function fittings(o: Orientation) {
  const g = geometry(o);
  const c = (u: number, v: number) => ({ cx: g.x(u, v), cy: g.y(u, v) });
  const k = CABINET;
  const vl = VALVES;
  return (
    <>
      <rect className="bp-fit" {...g.rect(vl.u - 120, vl.v, ZONES * vl.pitch + 40, 60)} />
      {Array.from({ length: ZONES }, (_, i) => (
        <circle key={i} className="bp-valve" {...c(vl.u + i * vl.pitch, vl.v + 30)} r={vl.r} />
      ))}
      <circle className="bp-fit" {...c(SENSOR.u, SENSOR.v)} r={SENSOR.r} />
      <circle className="bp-fit" {...c(SENSOR.u, SENSOR.v)} r={SENSOR.r * 0.45} />
      <rect className="bp-fit" {...g.rect(k.u, k.v, k.w, k.h)} />
      <rect className="bp-fit" {...g.rect(k.u + 60, k.v + k.h - 40, k.w - 120, 40)} />
      <rect className="bp-fit" {...g.rect(k.u + 50, k.v + k.h, k.w - 100, k.shelf)} />
      <circle className="bp-beacon" {...c(k.u + k.w - 90, k.v + 90)} r={k.beacon} />
    </>
  );
}

/**
 * The person in plan, as architects draw an operator at a bench: the shoulders a rounded band, the arms reaching forward to the edge
 * of the machine with the hands on it, the head on top of the shoulders. The shapes are filled with the page's surface, so the head
 * covers the shoulders and the shoulders cover the arms: it reads as a body seen from above, not as an eye.
 */
function person(o: Orientation) {
  const g = geometry(o);
  const P = (u: number, v: number) => g.pt(u, v);
  const { u, v } = PERSON;
  // a band with round ends round the segment (u0, v0)–(u1, v1), r wide on each side: the shoulders and the arms (each end a half circle of 8 steps)
  const capsule = (u0: number, v0: number, u1: number, v1: number, r: number) => {
    const t = Math.atan2(v1 - v0, u1 - u0);
    const half = (cu: number, cv: number, from: number) =>
      Array.from({ length: 9 }, (_, i) => P(cu + r * Math.cos(from + (i * Math.PI) / 8), cv + r * Math.sin(from + (i * Math.PI) / 8)));
    return `M${[...half(u1, v1, t - Math.PI / 2), ...half(u0, v0, t + Math.PI / 2)].join("L")}Z`;
  };
  // the machine is towards smaller v: the arms reach it, the hands rest on the frame's near edge
  const arms = [-1, 1].map((s) => capsule(u + s * 215, v - 20, u + s * 178, PERSON.hands + 30, 40)).join("");
  return (
    <>
      <path className="bp-person" d={arms} />
      {[-1, 1].map((s) => (
        <circle key={s} className="bp-person" cx={g.x(u + s * 178, PERSON.hands)} cy={g.y(u + s * 178, PERSON.hands)} r={46} />
      ))}
      <path className="bp-person" d={capsule(u - PERSON.rx + PERSON.ry, v, u + PERSON.rx - PERSON.ry, v, PERSON.ry)} />
      <circle className="bp-person" cx={g.x(u, v - 10)} cy={g.y(u, v - 10)} r={PERSON.head} />
    </>
  );
}

/** A dimension line of the working area with arrowheads, outside the frame, and two extension lines from the bed's corners. */
function dimension(o: Orientation, along: "length" | "width") {
  const g = geometry(o);
  const A = 120; // arrowhead length
  const B = 45; // half width
  const arrow = (u: number, v: number, du: number, dv: number) =>
    `M${g.pt(u, v)}L${g.pt(u - du * A + dv * B, v - dv * A + du * B)}L${g.pt(u - du * A - dv * B, v - dv * A - du * B)}Z`;
  if (along === "length") {
    const v = DIM_V;
    return (
      <>
        <path className="bp-dim" d={`M${g.pt(0, v)}L${g.pt(LEN, v)}M${g.pt(0, -40)}L${g.pt(0, v - 40)}M${g.pt(LEN, -40)}L${g.pt(LEN, v - 40)}`} />
        <path className="bp-arrow" d={`${arrow(0, v, -1, 0)}${arrow(LEN, v, 1, 0)}`} />
      </>
    );
  }
  const u = DIM_U;
  return (
    <>
      <path className="bp-dim" d={`M${g.pt(u, 0)}L${g.pt(u, WID)}M${g.pt(LEN + 40, 0)}L${g.pt(u + 40, 0)}M${g.pt(LEN + 40, WID)}L${g.pt(u + 40, WID)}`} />
      <path className="bp-arrow" d={`${arrow(u, 0, 0, -1)}${arrow(u, WID, 0, 1)}`} />
    </>
  );
}

/** The piece of the estimator, drawn to scale from the origin corner; what sticks out of the field is hatched. */
function pieceOf(o: Orientation, piece: { w: number; h: number }, id: string) {
  const g = geometry(o);
  const fit = fitsBed(piece.w, piece.h);
  // `w` lies across the bed (machine X), `h` along it (Y); a piece that only fits turned by 90° is drawn turned
  const du = fit === "rotated" ? piece.w : piece.h;
  const dv = fit === "rotated" ? piece.h : piece.w;
  const r = g.rect(0, 0, du, dv);
  const out = du > LEN || dv > WID;
  const big = { u: -1600, v: -1600, w: Math.max(du, LEN) + 3200, h: Math.max(dv, WID) + 3200 };
  const bigR = g.rect(big.u, big.v, big.w, big.h);
  const bedR = g.rect(0, 0, LEN, WID);
  const hole = (b: typeof bigR) => `M${b.x} ${b.y}h${b.width}v${b.height}h${-b.width}Z`;
  return {
    box: { u: 0, v: 0, w: du, h: dv },
    out,
    el: (
      <>
        <rect className="bp-piece" {...r} />
        {out && (
          <>
            <defs>
              <pattern id={`${id}-hatch`} width="90" height="90" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <path d="M0 0V90" stroke="var(--signal)" strokeWidth="14" />
              </pattern>
              <clipPath id={`${id}-clip`}>
                <path clipRule="evenodd" d={`${hole(bigR)}${hole(bedR)}`} />
              </clipPath>
            </defs>
            <rect {...r} fill={`url(#${id}-hatch)`} clipPath={`url(#${id}-clip)`} className="bp-over" />
          </>
        )}
      </>
    ),
  };
}

export type BlueprintProps = {
  lang?: Lang;
  /** `full`: every layer and the callout anchors (the service scene); `band`: bed, zones, gantry, path, dimensions and person (home, plastics); `mini`: frame, bed with its zones and gantry only (the menu card, the timeline tile, the estimator). */
  variant?: Variant;
  /** Portrait swaps the axes: the bed stands upright and the gantry sweeps downwards (the service scene below md). */
  orientation?: Orientation;
  /** `dark` (white and cyan lines, for deep and night) or `light` (the foreground colour, for the estimator on frost or mist). */
  tone?: "dark" | "light";
  /** A piece in mm (`w` across the bed, `h` along it), drawn to scale. */
  piece?: { w: number; h: number };
  /** Where the gantry rests, 0 (start) to 1 (end of the bed). The finished drawing has it at the end. */
  gantryAt?: number;
  /** An id for the hatch of an out-of-field piece, unique on the page. */
  id?: string;
  className?: string;
};

export function MachineBlueprint({
  lang = "el",
  variant = "band",
  orientation = "landscape",
  tone = "dark",
  piece,
  gantryAt = 1,
  id = "bp",
  className = "",
}: BlueprintProps) {
  const d = t(lang).machine;
  const o = orientation;
  const g = geometry(o);
  const land = g.land;
  const mini = variant === "mini";

  // the box: the machine with its margin, grown to hold a piece that sticks out of the field
  const p = piece ? pieceOf(o, piece, id) : null;
  let box = { ...(mini ? MINI_BOX : BOX) };
  if (p?.out) {
    const u1 = Math.max(box.u + box.w, p.box.w + MINI);
    const v1 = Math.max(box.v + box.h, p.box.h + MINI);
    box = { u: box.u, v: box.v, w: u1 - box.u, h: v1 - box.v };
  }
  const viewBox = g.vb(box);
  const ratio = land ? box.w / box.h : box.h / box.w;
  /** A run along the bed (from u, du long) as the share of the drawing's length: where the tracks stand. */
  const along = (u: number, du: number) => ({ at: `${num(((u - box.u) / box.w) * 100)}%`, len: `${num((du / box.w) * 100)}%` });
  const gt = along(TRACK.u, TRACK.w);
  const pt = along(0, LEN);
  const style = {
    aspectRatio: `${num(ratio)}`,
    "--bp-rest": gantryAt,
    "--bp-gw": `${num((GANTRY_LEN / TRACK.w) * 100)}%`,
    // the lift, as a share of the cut path's track (the bed's length by the drawing's height)
    "--bp-lift": land ? `${num((LIFT / LEN) * 100)}% ${num((LIFT / box.h) * 100)}%` : `${num((LIFT / box.h) * 100)}% ${num((LIFT / LEN) * 100)}%`,
    "--bp-fx": ((land ? PERSON.u : PERSON.v) - (land ? box.u : box.v)) / (land ? box.w : box.h),
    "--bp-fy": ((land ? PERSON.v : PERSON.u) - (land ? box.v : box.u)) / (land ? box.h : box.w),
  } as CSSProperties;
  const common = { role: "img" as const, "aria-label": d.drawingLabel };

  const bedRect = <rect className="bp-bed" {...g.rect(0, 0, LEN, WID)} />;

  if (mini) {
    // the frame, the bed with its zones and the gantry, at rest `gantryAt` along the bed
    const seams = [
      ...[1, 2, 3].map((i) => `M${g.pt(i * ZONE_U, 0)}L${g.pt(i * ZONE_U, WID)}`),
      `M${g.pt(0, ZONE_V)}L${g.pt(LEN, ZONE_V)}`,
    ].join("");
    return (
      <div className={`bp ${className}`} data-variant="mini" data-o={o} data-tone={tone} style={style} {...common}>
        <svg className="bp-layer bp-base" viewBox={viewBox} aria-hidden>
          {frame(o, true)}
          <rect className="bp-table" {...g.rect(0, 0, LEN, WID)} />
          <path className="bp-seam" d={seams} />
          {bedRect}
          {gantry(o, LEN * gantryAt, true)}
          {p?.el}
        </svg>
      </div>
    );
  }

  // the tracks' own boxes: the gantry's from where its back stands at the start, the cut path's exactly the bed
  const trackBox = (u: number, w: number) => (land ? `${u} ${box.v} ${w} ${box.h}` : `${box.v} ${u} ${box.h} ${w}`);
  const j = job(o);
  const trackStyle = (a: { at: string; len: string }) => ({ "--trk-at": a.at, "--trk-len": a.len }) as CSSProperties;
  const A = BLUEPRINT_ANCHORS;
  const place = (u: number, v: number) => {
    const w = land ? box.w : box.h;
    const h = land ? box.h : box.w;
    return { left: `${(((land ? u : v) - (land ? box.u : box.v)) / w) * 100}%`, top: `${(((land ? v : u) - (land ? box.v : box.u)) / h) * 100}%` };
  };

  return (
    <div className={`bp ${className}`} data-variant={variant} data-o={o} data-tone={tone} style={style} {...common}>
      <div className="bp-zoom">
        <svg className="bp-layer bp-base" viewBox={viewBox} aria-hidden>
          {frame(o)}
          {fittings(o)}
          {table(o, id)}
          {bedRect}
          {person(o)}
          {p?.el}
        </svg>

        {/* The sheet is laid on the table once the zones are lit: its own layer, so only its opacity moves */}
        <svg className="bp-layer bp-sheet-layer" viewBox={viewBox} aria-hidden>
          {sheet(o, id)}
        </svg>

        <div className="bp-layer bp-wipe bp-dims" aria-hidden>
          <div className="bp-wipe-in">
            <svg className="bp-layer" viewBox={viewBox}>
              {dimension(o, "length")}
              {dimension(o, "width")}
            </svg>
          </div>
        </div>

        <div className="bp-track bp-wipe bp-path" style={trackStyle(pt)} aria-hidden>
          <div className="bp-wipe-in">
            <svg className="bp-layer" viewBox={trackBox(0, LEN)}>
              {cutPath(j)}
            </svg>
          </div>
        </div>

        {/* When the gantry has passed, the parts rise out of the sheet: two layers, opacity and translate only */}
        <div className="bp-track bp-lift-shadow" style={trackStyle(pt)} aria-hidden>
          <svg className="bp-layer" viewBox={trackBox(0, LEN)}>
            {lifted(j, "shadow")}
          </svg>
        </div>
        <div className="bp-track bp-lift" style={trackStyle(pt)} aria-hidden>
          <svg className="bp-layer" viewBox={trackBox(0, LEN)}>
            {lifted(j, "part")}
          </svg>
        </div>

        {/* The track clips the gantry layer: a layer as long as the track that travels by (100% - the gantry) must not widen the page */}
        <div className="bp-track bp-gantry-box" style={trackStyle(gt)} aria-hidden>
          <div className="bp-gantry">
            <svg className="bp-layer" viewBox={trackBox(TRACK.u, TRACK.w)}>
              {gantry(o, 0)}
            </svg>
          </div>
        </div>
      </div>

      <div className="bp-labels">
        {/* 6.050 on the line along the bed, 2.100 on the line across it: on top and to the right in landscape, to the left and below in portrait */}
        <span className="bp-label bp-label-len t-label" style={land ? { ...place(LEN / 2, DIM_V), top: place(0, DIM_V).top } : { top: "50%" }}>
          {formatNumber(LEN)}
          <br className="bp-br" /> <span className="unit">mm</span>
        </span>
        <span className="bp-label bp-label-wid t-label" style={land ? { top: place(0, 1560).top } : { left: "50%", top: place(DIM_U, 0).top }}>
          {formatNumber(WID)}
          <br className="bp-br" /> <span className="unit">mm</span>
        </span>
        <span
          className="bp-label bp-label-person t-label"
          style={land ? place(PERSON.u + PERSON.rx + 120, PERSON.v) : { left: place(PERSON.u, PERSON.v + PERSON.ry + 120).left, top: place(PERSON.u, PERSON.v).top }}
        >
          {d.scale}
        </span>
        <span className="bp-label bp-label-schematic t-label">{d.schematic}</span>
      </div>

      {variant === "full" && (
        <div className="bp-anchors" aria-hidden>
          {(Object.keys(A) as BlueprintAnchor[]).map((name) => (
            <span key={name} className="bp-anchor" data-anchor={name} style={place(A[name].u, A[name].v)} />
          ))}
        </div>
      )}
    </div>
  );
}
