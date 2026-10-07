import { thicknessOf, type SpecTableData } from "@/lib/spec-table";

/**
 * The product table, rebuilt as a data sheet: numbers in mono and tabular, hairlines only, a header row on mist in mono labels,
 * thicknesses as small chips, a row tint on hover. It scrolls inside its own container below lg (never the page) with the first
 * column sticky and a fade on the edge that still has more to show. Rowspan and colspan of the source are kept.
 */
export function SpecTable({ table, label, className = "" }: { table: SpecTableData; label: string; className?: string }) {
  const head = table.rows.slice(0, table.headRows);
  const body = table.rows.slice(table.headRows);
  const thicknessCols = new Set(table.headers.flatMap((h, col) => (/πάχ|thick/i.test(h ?? "") ? [col] : [])));
  return (
    <div className={`spec-table ${className}`}>
      <div className="spec-scroll" role="region" aria-label={label} tabIndex={0}>
        <table className="spec-grid">
          {head.length > 0 && (
            <thead>
              {head.map((row, r) => (
                <tr key={r}>
                  {row.map((cell, c) => (
                    <th
                      key={c}
                      scope={cell.colSpan > 1 ? "colgroup" : "col"}
                      colSpan={cell.colSpan > 1 ? cell.colSpan : undefined}
                      rowSpan={cell.rowSpan > 1 ? cell.rowSpan : undefined}
                      className={`t-label ${cell.col === 0 ? "spec-sticky" : ""}`}
                    >
                      {cell.lines.join(" ")}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
          )}
          <tbody>
            {body.map((row, r) => (
              <tr key={r}>
                {row.map((cell, c) => {
                  const Cell = cell.header ? "th" : "td";
                  return (
                    <Cell
                      key={c}
                      scope={cell.header ? "row" : undefined}
                      colSpan={cell.colSpan > 1 ? cell.colSpan : undefined}
                      rowSpan={cell.rowSpan > 1 ? cell.rowSpan : undefined}
                      className={`t-data ${cell.col === 0 ? "spec-sticky" : ""}`}
                    >
                      {cell.lines.map((line, k) => {
                        const mm = thicknessCols.has(cell.col) ? thicknessOf(line) : null;
                        return mm !== null ? (
                          <span key={k} className="spec-chip">
                            {String(mm).replace(".", ",")} mm
                          </span>
                        ) : (
                          <span key={k} className="spec-line">
                            {line}
                          </span>
                        );
                      })}
                    </Cell>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <span aria-hidden className="spec-fade" />
    </div>
  );
}
