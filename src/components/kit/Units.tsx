import { Fragment } from "react";

/** A unit that follows a number: mm, kW, rpm, m/min, m² and m ("6,05 m"). */
const UNIT = /(?<=\d[\s ]?)(mm|kW|rpm|m\/min|m²|m)(?![\p{L}\p{N}])/gu;

/**
 * Text for an uppercase label with its units kept in SI case ("2–19 mm", "22,20 m²", "9 kW", never "MM" or "M²": M is mega).
 * Labels are set in capitals by CSS (`t-label`); a `.unit` span opts the unit out of the transform.
 */
export function Units({ children }: { children: string }) {
  const parts: React.ReactNode[] = [];
  let last = 0;
  for (const m of children.matchAll(UNIT)) {
    if (m.index > last) parts.push(children.slice(last, m.index));
    parts.push(
      <span key={m.index} className="unit">
        {m[0]}
      </span>,
    );
    last = m.index + m[0].length;
  }
  if (last < children.length) parts.push(children.slice(last));
  return (
    <>
      {parts.map((p, i) => (
        <Fragment key={i}>{p}</Fragment>
      ))}
    </>
  );
}
