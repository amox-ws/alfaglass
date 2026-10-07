import { BED, fitsBed, formatArea, formatMm, formatNumber } from "@/lib/machine";
import type { Dict } from "@/lib/i18n";

/**
 * The estimator's rules, apart from its markup: what a typed size means, whether a piece fits the machine's working area, the totals
 * and the text of the email. Pure functions: no prices, no storage, no network.
 */

export const MAX_ROWS = 20;
export const MAX_NOTE = 500;
/** An encoded `mailto:` longer than this may be cut by a mail program (Outlook is the strictest): the email button becomes a copy button. */
export const MAX_MAILTO = 1800;

export type Row = { id: number; w: string; h: string; q: string; touched: boolean };
export type Fit = "fits" | "rotated" | "out";

export type PieceState =
  | { kind: "blank" }
  | { kind: "need-size" }
  | { kind: "need-qty" }
  | { kind: "ok"; w: number; h: number; q: number; fit: Fit };

export const newRow = (id: number): Row => ({ id, w: "", h: "", q: "1", touched: false });

/** A whole number of millimetres or pieces: digits, with the Greek thousands dot ("1.200") accepted. */
export function parseWhole(raw: string): number | null {
  const s = raw.trim().replace(/\s/g, "");
  if (/^\d{1,3}(\.\d{3})+$/.test(s)) return Number(s.replace(/\./g, ""));
  return /^\d+$/.test(s) ? Number(s) : null;
}

/** A thickness in mm, decimal comma or point, greater than 0. */
export function parseThickness(raw: string): number | null {
  const s = raw.trim().replace(/\s/g, "");
  if (!/^\d+([.,]\d+)?$/.test(s)) return null;
  const n = Number(s.replace(",", "."));
  return n > 0 ? n : null;
}

export function pieceState(row: Row): PieceState {
  if (!row.w.trim() && !row.h.trim()) return { kind: "blank" };
  const w = parseWhole(row.w);
  const h = parseWhole(row.h);
  if (!w || !h) return { kind: "need-size" };
  const q = parseWhole(row.q);
  if (!q || q < 1) return { kind: "need-qty" };
  return { kind: "ok", w, h, q, fit: fitsBed(w, h) };
}

export type Valid = Extract<PieceState, { kind: "ok" }> & { n: number; id: number };

/** The pieces that can be listed, with the number of the row they were written in. */
export function validPieces(rows: Row[]): Valid[] {
  return rows.flatMap((row, i) => {
    const s = pieceState(row);
    return s.kind === "ok" ? [{ ...s, n: i + 1, id: row.id }] : [];
  });
}

export function totals(pieces: Valid[]) {
  const count = pieces.reduce((n, p) => n + p.q, 0);
  const area = pieces.reduce((m2, p) => m2 + (p.w * p.h * p.q) / 1e6, 0);
  return { count, area, out: pieces.filter((p) => p.fit === "out").map((p) => p.n) };
}

const plain = (s: string) => s.replace(/ /g, " ");

/** The subject, the body and the numbers of the email. Rows out of the field are counted and listed, never dropped. */
export function buildList({
  d,
  locale,
  material,
  thickness,
  pieces,
  note,
}: {
  d: Dict["estimator"];
  locale: string;
  material: string;
  thickness: string;
  pieces: Valid[];
  note: string;
}) {
  const sum = totals(pieces);
  const bed = plain(formatMm(BED.x, BED.y, locale));
  const lines = pieces.map((p, i) => {
    const verdict = p.fit === "fits" ? d.body.fits : p.fit === "rotated" ? d.body.rotated : d.body.out(bed);
    return `${i + 1}. ${plain(formatMm(p.w, p.h, locale))} × ${formatNumber(p.q, locale)} ${d.body.unit} (${verdict})`;
  });
  const body = [
    d.body.title,
    `${d.body.material}: ${material}${thickness ? `, ${thickness} mm` : ""}`,
    `${d.body.pieces}:`,
    ...lines,
    `${d.body.total}: ${d.pieces(sum.count)}, ${plain(formatArea(sum.area, locale))}`,
    ...(note.trim() ? [`${d.body.note}: ${note.trim()}`] : []),
    d.body.attach,
  ].join("\n");
  return { subject: d.mailSubject(material, thickness, sum.count), body, ...sum };
}
