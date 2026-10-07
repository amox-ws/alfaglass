/**
 * An etched nameplate on mist: a hairline frame, four corner rivets, cells (or rows) separated by hairlines, a mono label above a
 * display value. It evolves the foundation's `Stamp` and is used for the company facts, the facilities numbers, the machine's
 * data sheet and the case-study facts.
 *
 * - `layout="cells"` (default): a value under a label, 2 × 2 at 390 and `columns` across from md (four from lg). Values are display numerals:
 *   `t-h2` up to xl and `t-h1` from there, the size at which "13.000 τ.μ." still fits a cell of four.
 * - `layout="list"`: a two-column definition list (label on the left, `t-data` value on the right), one column at 390.
 */
/** `unit` follows a numeral in small mono type ("13.000" + "τ.μ."), so a value never wraps into two lines of display type. */
export type SpecItem = { label: string; value: React.ReactNode; unit?: string };

export function SpecPlate({
  items,
  layout = "cells",
  columns = 4,
  className = "",
  label,
}: {
  items: SpecItem[];
  layout?: "cells" | "list";
  columns?: 2 | 3 | 4;
  className?: string;
  /** An accessible name for the plate. */
  label?: string;
}) {
  // two columns on a phone and a tablet; three from md; four only from lg, where a cell is wide enough for "13.000 τ.μ."
  const grid = { 2: "", 3: "md:grid-cols-3", 4: "lg:grid-cols-4" }[columns];
  return (
    <div className={`spec-plate ${className}`} role={label ? "group" : undefined} aria-label={label}>
      <span aria-hidden className="rivet" data-at="tl" />
      <span aria-hidden className="rivet" data-at="tr" />
      <span aria-hidden className="rivet" data-at="bl" />
      <span aria-hidden className="rivet" data-at="br" />
      {layout === "cells" ? (
        <dl className={`spec-cells grid grid-cols-2 ${grid}`}>
          {items.map((it) => (
            <div key={it.label} className="spec-cell">
              <dt className="t-label text-fg-muted">{it.label}</dt>
              <dd className="t-h2 t-xl-h1 tabular mt-3">
                {it.value}
                {it.unit && <span className="t-label ml-2 align-baseline text-fg-muted">{it.unit}</span>}
              </dd>
            </div>
          ))}
        </dl>
      ) : (
        <dl className="spec-rows">
          {items.map((it) => (
            <div key={it.label} className="spec-row">
              <dt className="t-label text-fg-muted">{it.label}</dt>
              <dd className="t-data text-fg">
                {it.value}
                {it.unit && ` ${it.unit}`}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
