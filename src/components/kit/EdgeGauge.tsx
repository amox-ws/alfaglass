import { Reveal } from "@/components/reveal";
import { t, type Lang } from "@/lib/i18n";

const fmt = (n: number) => String(n).replace(".", ",");

/**
 * The thicknesses a sheet is sold in, drawn as the edges of the sheets: one bar per thickness, as wide as it is thick, in the
 * brand's glass-edge gradient. Seen together the gauges of nine families read as a rack seen from its end.
 *
 * - `sm` (0.9 px per mm, 20px tall) and `md` (1.6 px, 40px) show one caption after the bars ("2–19 mm"): thin bars sit closer than
 *   two digits are wide, so a label per bar would overlap its neighbours.
 * - `lg` (3 px per mm, 2 below md; 120px tall, 96 below md) puts each value under its bar, each bar centred in a slot of at least
 *   2.6ch so neighbouring labels never touch.
 * `role="img"` carries the words ("Πάχη: 2, 3, 4… mm"); bars and captions are decorative. Without values it renders nothing.
 * The bars grow from the base, 30ms apart, as the gauge scrolls into view (`edge-in`: a 600ms expo-out transition armed by the same observer
 * as `Reveal`, so a gauge on screen at load never waits, and a full-page screenshot, a printout and reduced motion show the finished gauge).
 */
export function EdgeGauge({
  values,
  size = "md",
  label,
  lang = "el",
  className = "",
}: {
  values: number[];
  size?: "sm" | "md" | "lg";
  /** A mono label above the bars, e.g. "Διαθέσιμα πάχη". */
  label?: string;
  lang?: Lang;
  className?: string;
}) {
  if (values.length === 0) return null;
  const words = t(lang).a11y.thicknesses(values.map(fmt).join(", "));
  const range = values.length === 1 ? fmt(values[0]) : `${fmt(values[0])}–${fmt(values[values.length - 1])}`;
  return (
    <Reveal className={`edge-gauge ${className}`} attrs={{ "data-size": size }}>
      {label && <p className="t-label mb-3 text-fg-muted">{label}</p>}
      <div role="img" aria-label={words} className="edge-gauge-in">
        <span aria-hidden className="edge-bars">
          {values.map((mm, i) => (
            <span key={mm} className="edge-slot">
              <span className="edge-bar" style={{ "--mm": mm, "--i": i } as React.CSSProperties} />
              {size === "lg" && <span className="edge-val t-data">{fmt(mm)}</span>}
            </span>
          ))}
        </span>
        {size !== "lg" && (
          <span aria-hidden className="edge-cap t-data">
            {range} mm
          </span>
        )}
      </div>
    </Reveal>
  );
}
