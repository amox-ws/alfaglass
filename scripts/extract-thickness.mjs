// Writes src/content/thickness.json: { "<product slug>": [2, 3, 4] }, the thicknesses (mm) each Greek product is sold in.
// Run after build-content.py has changed the content:  node scripts/extract-thickness.mjs
//
// The rule is strict on purpose (a wrong thickness on a catalogue is worse than none):
//  - only groups `yalopinakes` and `plastika-fylla`; skip category `yalopinakes-asfaleias` (its numbers are compositions such as
//    0,38 mm interlayers or 45/51 mm bullet-proof builds) and product `axesouar-plastikon` (part sizes);
//  - a value comes only from (a) a table column whose header contains "Πάχ" and whose cell lines match ^0?\d{1,2}([.,]\d)?\s?mm$
//    (rowspan and colspan are expanded first, so the column is the right one in every row), or (b) the <li> items that match
//    the same pattern in the list right after a paragraph that contains "πάχ"; and (c) the matrix form "Πάχος (mm)", a header
//    cell that spans the thickness columns, read from the cells under it (plain numbers such as 03, 04, 05; the cast acrylic
//    table is written this way; dots in the cells below mean "available" and are never read);
//  - a column or a list is trusted only when every line in it matches (a cell such as "04mm, 06mm & 44.1" or "66.1 (12,4mm)" says
//    the sheet is sold in more than the matching lines show, so the whole column is dropped rather than half-read);
//  - deduplicated, sorted, 1 to 30 values.
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => JSON.parse(readFileSync(path.join(root, p), "utf8"));
const products = read("src/content/el/products.json");

const GROUPS = new Set(["yalopinakes", "plastika-fylla"]);
const SKIP_CATEGORIES = new Set(["yalopinakes-asfaleias"]);
const SKIP_PRODUCTS = new Set(["axesouar-plastikon", "aksesouar-plastikon"]);
const VALUE = /^0?\d{1,2}([.,]\d)?\s?mm$/i;

const ENTITIES = { "&amp;": "&", "&gt;": ">", "&lt;": "<", "&quot;": '"', "&#39;": "'", "&nbsp;": " " };
const decode = (s) => s.replace(/&(amp|gt|lt|quot|nbsp|#39);/g, (m) => ENTITIES[m] ?? m);

/** The text lines of a fragment: paragraphs, list items and <br> start a new line. */
function lines(html) {
  return decode(html.replace(/<\/(p|li|div)>|<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, " "))
    .split("\n")
    .map((l) => l.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

/** A table as a rectangular grid of cell texts, rowspan and colspan expanded; the header row is the first row. */
function parseTable(html) {
  const grid = [];
  const rowRe = /<tr\b[^>]*>([\s\S]*?)<\/tr>/gi;
  let r = 0;
  for (let m = rowRe.exec(html); m; m = rowRe.exec(html), r++) {
    grid[r] ??= [];
    let c = 0;
    const cellRe = /<t([hd])\b([^>]*)>([\s\S]*?)<\/t\1>/gi;
    for (let cm = cellRe.exec(m[1]); cm; cm = cellRe.exec(m[1])) {
      while (grid[r][c] !== undefined) c++;
      const rowspan = Number(/rowspan="?(\d+)/i.exec(cm[2])?.[1] ?? 1);
      const colspan = Number(/colspan="?(\d+)/i.exec(cm[2])?.[1] ?? 1);
      const cell = lines(cm[3]);
      for (let dr = 0; dr < rowspan; dr++) for (let dc = 0; dc < colspan; dc++) (grid[r + dr] ??= [])[c + dc] = cell;
      c += colspan;
    }
  }
  return grid;
}

const toMm = (line) => (VALUE.test(line) ? parseFloat(line.replace(/\s?mm$/i, "").replace(",", ".")) : null);
const PLAIN = /^0?\d{1,2}([.,]\d)?$/;
const EMPTY = /^[-–—]?$/;

function fromTables(html) {
  const out = [];
  for (const [, table] of html.matchAll(/<table\b[\s\S]*?<\/table>/gi).map((m) => [0, m[0]])) {
    const grid = parseTable(table);
    const head = grid[0] ?? [];
    head.forEach((h, col) => {
      const text = (h ?? []).join(" ");
      if (!/πάχ/i.test(text)) return;
      if (/πάχος\s*\(mm\)/i.test(text)) {
        // (c) the matrix form: the numbers sit in the row under the header, in the columns it spans
        const cells = (grid[1] ?? []).flatMap((cell, c2) => (c2 >= col && head[c2] === h ? (cell ?? []).filter((l) => !EMPTY.test(l)) : []));
        if (cells.length && cells.every((l) => PLAIN.test(l))) out.push(...cells.map((l) => parseFloat(l.replace(",", "."))));
        return;
      }
      const column = grid.slice(1).flatMap((row) => (row[col] ?? []).filter((l) => !EMPTY.test(l)));
      if (column.length && column.every((l) => toMm(l) !== null)) out.push(...column.map(toMm));
    });
  }
  return out;
}

function fromLists(html) {
  const out = [];
  for (const m of html.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>\s*<(ul|ol)\b[^>]*>([\s\S]*?)<\/\2>/gi)) {
    if (!/πάχ/i.test(lines(m[1]).join(" "))) continue;
    const items = [...m[3].matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)].flatMap((li) => lines(li[1]));
    if (items.length && items.every((l) => toMm(l) !== null)) out.push(...items.map(toMm));
  }
  return out;
}

const result = {};
for (const slug of Object.keys(products).sort()) {
  const p = products[slug];
  if (!GROUPS.has(p.group) || SKIP_CATEGORIES.has(p.category) || SKIP_PRODUCTS.has(slug)) continue;
  const values = new Set();
  for (const html of [p.body, ...p.tabs.map((t) => t.html)]) for (const v of [...fromTables(html), ...fromLists(html)]) values.add(v);
  const sorted = [...values].sort((a, b) => a - b);
  if (sorted.length >= 1 && sorted.length <= 30) result[slug] = sorted;
}

const body = Object.entries(result)
  .map(([slug, v]) => `  ${JSON.stringify(slug)}: ${JSON.stringify(v)}`)
  .join(",\n");
writeFileSync(path.join(root, "src", "content", "thickness.json"), `{\n${body}\n}\n`);
const total = Object.keys(products).filter((s) => GROUPS.has(products[s].group)).length;
console.log(`${Object.keys(result).length} of ${total} glass and plastic products have thicknesses`);
