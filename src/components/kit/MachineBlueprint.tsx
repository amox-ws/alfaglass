import type { CSSProperties } from "react";
import { BED, fitsBed, formatNumber } from "@/lib/machine";
import { t, type Lang } from "@/lib/i18n";

/*
 * The machine drawn as a blueprint: a plan view (κάτοψη) of the 6.050 × 2.100 mm working table, in millimetres, white and edge-cyan
 * lines on the brand indigo. It is the visual language of the cutting service and, until ALFA GLASS's own machine is photographed,
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
const MARGIN = 400;
const ZONES = 8;
const ZONE = LEN / ZONES; // 756.25
const BEAM = 260;
const BEAM_OVER = 120; // the gantry reaches 120 mm past the bed on both sides
const TOOLS = 8;
/**
 * The viewBox: "-400 -400 6850 3300", the working area with 400 mm round it, and 800 mm below it (the person at the near edge, her label).
 * It grows only when a piece sticks out of the field.
 */
const BOX = { u: -MARGIN, v: -MARGIN, w: LEN + 2 * MARGIN, h: MARGIN + WID + 2 * MARGIN };
/** The mini drawing has no dimensions and no person, so it is framed closer: a 200 mm margin round the bed and the gantry. */
const MINI = 200;
const MINI_BOX = { u: -MINI, v: -MINI, w: LEN + 2 * MINI, h: WID + 2 * MINI };

/** The person standing at the bed, to scale: shoulders 520 × 260, head Ø 200, at the near long edge. */
const PERSON = { u: 1000, v: 2450, rx: 260, ry: 130, head: 100 };

/** Where the callouts of the service scene hang their leaders (final frame: the gantry has crossed the whole bed). */
export const BLUEPRINT_ANCHORS = {
  zones: { u: ZONE * 3.5, v: WID / 2 },
  gantry: { u: LEN - BEAM / 2, v: -BEAM_OVER },
  carriage: { u: LEN - BEAM / 2, v: 850 },
  path: { u: 1750, v: 700 },
  bed: { u: LEN, v: 1700 },
} as const;
export type BlueprintAnchor = keyof typeof BLUEPRINT_ANCHORS;

/** A demo job: no letters, no logos. A façade cassette, a sign panel and a row of six discs. */
const CASSETTE = { u: 250, v: 250, w: 1500, h: 900, notch: 100, groove: 50 };
const SIGN = { u: 2250, v: 250, w: 1800, h: 700, r: 60 };
const DISCS = { u: 800, v: 1650, r: 150, pitch: 560, n: 6 };

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

/** The cut path of the demo job, as SVG elements in the drawing's coordinates. */
function cutPath(o: Orientation) {
  const g = geometry(o);
  const c = CASSETTE;
  const n = c.notch;
  // a cassette blank: 1500 × 900 with 100 mm notches cut out of its four corners
  const cassette =
    `M${g.pt(c.u + n, c.v)}L${g.pt(c.u + c.w - n, c.v)}L${g.pt(c.u + c.w - n, c.v + n)}L${g.pt(c.u + c.w, c.v + n)}` +
    `L${g.pt(c.u + c.w, c.v + c.h - n)}L${g.pt(c.u + c.w - n, c.v + c.h - n)}L${g.pt(c.u + c.w - n, c.v + c.h)}` +
    `L${g.pt(c.u + n, c.v + c.h)}L${g.pt(c.u + n, c.v + c.h - n)}L${g.pt(c.u, c.v + c.h - n)}L${g.pt(c.u, c.v + n)}L${g.pt(c.u + n, c.v + n)}Z`;
  // two V-grooves, 50 mm inside the long edges, where the flanges are folded
  const grooves = [c.v + c.groove, c.v + c.h - c.groove].map((v) => `M${g.pt(c.u + n, v)}L${g.pt(c.u + c.w - n, v)}`).join("");
  const sign = g.rect(SIGN.u, SIGN.v, SIGN.w, SIGN.h);
  const discs = Array.from({ length: DISCS.n }, (_, i) => ({ cx: g.x(DISCS.u + i * DISCS.pitch, DISCS.v), cy: g.y(DISCS.u + i * DISCS.pitch, DISCS.v) }));
  return (
    <>
      <path className="bp-cut" d={cassette} />
      <path className="bp-cut bp-groove" d={grooves} />
      <rect className="bp-cut" {...sign} rx={SIGN.r} />
      {discs.map((d, i) => (
        <circle key={i} className="bp-cut" cx={d.cx} cy={d.cy} r={DISCS.r} />
      ))}
    </>
  );
}

/** The gantry in its own track: a 260 mm beam across the whole width, the spindle carriage and the 8 tool positions. */
function gantry(o: Orientation) {
  const g = geometry(o);
  const beam = g.rect(0, -BEAM_OVER, BEAM, WID + 2 * BEAM_OVER);
  const carriage = g.rect(BEAM / 2 - 200, 650, 400, 400);
  return (
    <>
      <rect className="bp-beam" {...beam} />
      <rect className="bp-carriage" {...carriage} />
      <circle className="bp-spindle" cx={g.x(BEAM / 2, 850)} cy={g.y(BEAM / 2, 850)} r={55} />
      {Array.from({ length: TOOLS }, (_, i) => (
        <circle key={i} className="bp-tool" cx={g.x(BEAM / 2, 1250 + i * 110)} cy={g.y(BEAM / 2, 1250 + i * 110)} r={45} />
      ))}
    </>
  );
}

/** The person in plan: shoulders an ellipse, the head a circle. */
function person(o: Orientation) {
  const g = geometry(o);
  return (
    <>
      <ellipse className="bp-person" cx={g.x(PERSON.u, PERSON.v)} cy={g.y(PERSON.u, PERSON.v)} rx={g.land ? PERSON.rx : PERSON.ry} ry={g.land ? PERSON.ry : PERSON.rx} />
      <circle className="bp-person" cx={g.x(PERSON.u, PERSON.v)} cy={g.y(PERSON.u, PERSON.v)} r={PERSON.head} />
    </>
  );
}

/** A dimension line with arrowheads and two extension lines, outside the bed. */
function dimension(o: Orientation, along: "length" | "width") {
  const g = geometry(o);
  const A = 120; // arrowhead length
  const B = 45; // half width
  const arrow = (u: number, v: number, du: number, dv: number) =>
    `M${g.pt(u, v)}L${g.pt(u - du * A + dv * B, v - dv * A + du * B)}L${g.pt(u - du * A - dv * B, v - dv * A - du * B)}Z`;
  if (along === "length") {
    const v = -250;
    return (
      <>
        <path className="bp-dim" d={`M${g.pt(0, v)}L${g.pt(LEN, v)}M${g.pt(0, -40)}L${g.pt(0, v - 40)}M${g.pt(LEN, -40)}L${g.pt(LEN, v - 40)}`} />
        <path className="bp-arrow" d={`${arrow(0, v, -1, 0)}${arrow(LEN, v, 1, 0)}`} />
      </>
    );
  }
  const u = LEN + 250;
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
  const big = { u: -MARGIN * 4, v: -MARGIN * 4, w: Math.max(du, LEN) + MARGIN * 8, h: Math.max(dv, WID) + MARGIN * 8 };
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
  /** `full`: every layer and the callout anchors (the service scene); `band`: bed, zones, gantry, path, dimensions and person (home, plastics); `mini`: bed and gantry only, in about 2 KB (the menu card, the timeline tile, the estimator). */
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

  // the box: the working area with its margin, grown to hold a piece that sticks out of the field
  const p = piece ? pieceOf(o, piece, id) : null;
  let box = { ...(mini ? MINI_BOX : BOX) };
  if (p?.out) {
    const u1 = Math.max(box.u + box.w, p.box.w + MINI);
    const v1 = Math.max(box.v + box.h, p.box.h + MINI);
    box = { u: box.u, v: box.v, w: u1 - box.u, h: v1 - box.v };
  }
  const viewBox = g.vb(box);
  const ratio = land ? box.w / box.h : box.h / box.w;
  const style = {
    aspectRatio: `${num(ratio)}`,
    "--bp-rest": gantryAt,
    "--bp-fx": ((land ? PERSON.u : PERSON.v) - (land ? box.u : box.v)) / (land ? box.w : box.h),
    "--bp-fy": ((land ? PERSON.v : PERSON.u) - (land ? box.v : box.u)) / (land ? box.h : box.w),
  } as CSSProperties;
  const common = { role: "img" as const, "aria-label": d.drawingLabel };

  const bedRect = <rect className="bp-bed" {...g.rect(0, 0, LEN, WID)} />;

  if (mini) {
    // bed and gantry only; the gantry at rest `gantryAt` along the bed
    const shift = (LEN - BEAM) * gantryAt;
    return (
      <div className={`bp ${className}`} data-variant="mini" data-o={o} data-tone={tone} style={style} {...common}>
        <svg className="bp-layer bp-base" viewBox={viewBox} aria-hidden>
          {bedRect}
          <g transform={`translate(${land ? shift : 0} ${land ? 0 : shift})`}>{gantry(o)}</g>
          {p?.el}
        </svg>
      </div>
    );
  }

  const trackBox = land ? `0 ${BOX.v} ${LEN} ${BOX.h}` : `${BOX.v} 0 ${BOX.h} ${LEN}`;
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
          {Array.from({ length: ZONES }, (_, i) => (
            <rect key={i} className="bp-zone" style={{ "--i": i } as CSSProperties} {...g.rect(i * ZONE, 0, ZONE, WID)} />
          ))}
          <path
            className="bp-seam"
            d={Array.from({ length: ZONES - 1 }, (_, i) => `M${g.pt((i + 1) * ZONE, 0)}L${g.pt((i + 1) * ZONE, WID)}`).join("")}
          />
          <path
            className="bp-slot"
            d={Array.from({ length: 6 }, (_, i) => `M${g.pt(0, (i + 1) * 300)}L${g.pt(LEN, (i + 1) * 300)}`).join("")}
          />
          {bedRect}
          {person(o)}
          {p?.el}
        </svg>

        <div className="bp-layer bp-wipe bp-dims" aria-hidden>
          <div className="bp-wipe-in">
            <svg className="bp-layer" viewBox={viewBox}>
              {dimension(o, "length")}
              {dimension(o, "width")}
            </svg>
          </div>
        </div>

        <div className="bp-track bp-wipe bp-path" aria-hidden>
          <div className="bp-wipe-in">
            <svg className="bp-layer" viewBox={trackBox}>
              {cutPath(o)}
            </svg>
          </div>
        </div>

        {/* The track clips the gantry layer: a layer as long as the bed that travels by (100% - the beam) must not widen the page */}
        <div className="bp-track bp-gantry-box" aria-hidden>
          <div className="bp-gantry">
            <svg className="bp-layer" viewBox={trackBox}>
              {gantry(o)}
            </svg>
          </div>
        </div>
      </div>

      <div className="bp-labels">
        {/* 6.050 on the line along the bed, 2.100 on the line across it: on top and to the right in landscape, to the left and below in portrait */}
        <span className="bp-label bp-label-len t-label" style={land ? { ...place(LEN / 2, -250), top: place(0, -250).top } : { top: "50%" }}>
          {formatNumber(LEN)}
          <br className="bp-br" /> <span className="unit">mm</span>
        </span>
        <span className="bp-label bp-label-wid t-label" style={land ? { top: place(0, 1560).top } : { left: "50%", top: place(LEN + 250, 0).top }}>
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
