/**
 * The product tables of the legacy content, read into data. A tab's html holds tables (with rowspan and colspan, paragraphs in
 * cells, a "Πάχος" column) and plain html (lists of applications); `splitSpecHtml` separates them so a table can be rebuilt
 * as a `SpecTable` and everything else stays prose. Server-side only (regular expressions, no DOM).
 */

export type SpecCellData = {
  /** The lines of the cell (paragraphs, list items and <br> start a new line). */
  lines: string[];
  header: boolean;
  rowSpan: number;
  colSpan: number;
  /** The column the cell starts in (rowspans of the rows above are taken into account). */
  col: number;
};

export type SpecTableData = {
  rows: SpecCellData[][];
  /** The text of each column's header, by column index (empty when the table has no header row). */
  headers: string[];
  /** How many leading rows are the header (the rows of `<thead>`, else the first row when it is made of `<th>`). */
  headRows: number;
};

export type SpecBlock = { kind: "table"; table: SpecTableData } | { kind: "html"; html: string };

const ENTITIES: Record<string, string> = { "&amp;": "&", "&gt;": ">", "&lt;": "<", "&quot;": '"', "&#39;": "'", "&nbsp;": " " };
const decode = (s: string) => s.replace(/&(amp|gt|lt|quot|nbsp|#39);/g, (m) => ENTITIES[m] ?? m);

function lines(html: string): string[] {
  return decode(html.replace(/<\/(p|li|div)>|<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, " "))
    .split("\n")
    .map((l) => l.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

function parseTable(html: string): SpecTableData {
  const rows: SpecCellData[][] = [];
  const occupied: boolean[][] = [];
  const headEnd = /<\/thead>/i.exec(html);
  let headRows = 0;
  const rowRe = /<tr\b[^>]*>([\s\S]*?)<\/tr>/gi;
  let r = 0;
  for (let m = rowRe.exec(html); m; m = rowRe.exec(html), r++) {
    if (headEnd && m.index < headEnd.index) headRows = r + 1;
    const cells: SpecCellData[] = [];
    occupied[r] ??= [];
    let c = 0;
    const cellRe = /<t([hd])\b([^>]*)>([\s\S]*?)<\/t\1>/gi;
    for (let cm = cellRe.exec(m[1]); cm; cm = cellRe.exec(m[1])) {
      while (occupied[r][c]) c++;
      const rowSpan = Math.max(1, Number(/rowspan="?(\d+)/i.exec(cm[2])?.[1] ?? 1));
      const colSpan = Math.max(1, Number(/colspan="?(\d+)/i.exec(cm[2])?.[1] ?? 1));
      cells.push({ lines: lines(cm[3]), header: cm[1].toLowerCase() === "h", rowSpan, colSpan, col: c });
      for (let dr = 0; dr < rowSpan; dr++) for (let dc = 0; dc < colSpan; dc++) (occupied[r + dr] ??= [])[c + dc] = true;
      c += colSpan;
    }
    rows.push(cells);
  }
  // No <thead>: a first row made only of <th> is the header
  if (!headRows && rows[0]?.length && rows[0].every((cell) => cell.header)) headRows = 1;
  const headers: string[] = [];
  if (headRows) for (const cell of rows[0] ?? []) for (let k = 0; k < cell.colSpan; k++) headers[cell.col + k] = cell.lines.join(" ");
  return { rows, headers, headRows };
}

/** The tables and the html between them, in order. A table with no rows is left out. */
export function splitSpecHtml(html: string): SpecBlock[] {
  const blocks: SpecBlock[] = [];
  let last = 0;
  for (const m of html.matchAll(/<table\b[\s\S]*?<\/table>/gi)) {
    const before = html.slice(last, m.index);
    if (before.replace(/<[^>]+>/g, "").trim()) blocks.push({ kind: "html", html: before });
    const table = parseTable(m[0]);
    if (table.rows.length) blocks.push({ kind: "table", table });
    last = m.index + m[0].length;
  }
  const rest = html.slice(last);
  if (rest.replace(/<[^>]+>/g, "").trim()) blocks.push({ kind: "html", html: rest });
  return blocks;
}

/** A thickness written in the legacy tables ("04mm", "2,5 mm") as a number, else null. */
export function thicknessOf(line: string): number | null {
  const m = /^0?(\d{1,2}(?:[.,]\d)?)\s?mm$/i.exec(line.trim());
  return m ? parseFloat(m[1].replace(",", ".")) : null;
}
