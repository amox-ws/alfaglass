/**
 * The CNC router, in numbers: language-free data. Greek words live in `d.machine` (src/lib/i18n.ts).
 * Glass is not a machine material and never appears here: nothing on the site may suggest that the router cuts glass.
 */

/** The working area in mm. X runs across the bed (2.100), Y along it (6.050); the drawing's horizontal axis is Y. */
export const BED = { x: 2100, y: 6050, z: 300 } as const;

/** Does a piece of w × h mm fit the working area, as it is ("fits"), only turned by 90° ("rotated"), or not at all ("out")? */
export const fitsBed = (w: number, h: number): "fits" | "rotated" | "out" =>
  w <= BED.x && h <= BED.y ? "fits" : h <= BED.x && w <= BED.y ? "rotated" : "out";

export const MATERIALS = [
  "acrylic",
  "polycarbonate",
  "industrial",
  "pvcFoam",
  "pet",
  "foamBoard",
  "acm",
  "carbon",
  "aluminium",
  "bronze",
  "copper",
  "wood",
  "other",
] as const;
export type MaterialKey = (typeof MATERIALS)[number];

/** Product slugs that ALFA GLASS stocks, per machine material. "Πολυστερίνες", "Πάνελ πολυουρεθάνης" and "Αξεσουάρ πλαστικών" are not mapped (they are not in the machine's list). */
export const STOCKED: Partial<Record<MaterialKey, string[]>> = {
  acrylic: ["akrylika-fylla-xt-extruded", "akrylika-fylla-chyta-cast"],
  polycarbonate: ["polykarvonika-masif-fylla", "polykarvonika-kypselota-fylla"],
  pvcFoam: ["pvc-afrodes-foam"],
  pet: ["pet-g"],
  acm: ["bond-panel-alouminiou-epigrafopoiias", "bond-panel-alouminiou-ktirion"],
};

export const OPERATIONS = ["cut", "route", "engrave", "pocket", "drill", "vgroove", "letters"] as const;
export type OperationKey = (typeof OPERATIONS)[number];

/** "glazing" is for Έργα only. */
export const APPLICATIONS = ["signage", "displays", "shopfit", "facade", "interior", "glazing"] as const;
export type ApplicationKey = (typeof APPLICATIONS)[number];

/** The material key of a product slug, when the router cuts it (the CNC link on product pages). */
export function materialOfProduct(slug: string): MaterialKey | null {
  for (const key of MATERIALS) if (STOCKED[key]?.includes(slug)) return key;
  return null;
}

const NBSP = "\u00a0";

const formatters = new Map<string, Intl.NumberFormat>();

/** A number the Greek way (decimal comma, thousands dot, also for four digits: "6.050"). */
export function formatNumber(n: number, locale = "el-GR", digits?: number) {
  const key = `${locale}|${digits ?? "-"}`;
  let f = formatters.get(key);
  if (!f) {
    // "always": some engines leave four-digit numbers ungrouped in Greek, and "2100" must never replace "2.100"
    f = new Intl.NumberFormat(locale, {
      useGrouping: "always",
      ...(digits !== undefined && { minimumFractionDigits: digits, maximumFractionDigits: digits }),
    });
    formatters.set(key, f);
  }
  return f.format(n);
}

/**
 * Millimetres, written for the page: "2.100 mm" or "2.100 × 6.050 mm", with a no-break space before the unit and around
 * the "×". Inside an uppercase label wrap the unit in `<span class="unit">` (see `Units` in components/kit) so it keeps its SI case.
 */
export function formatMm(w: number, h?: number, locale = "el-GR") {
  return h === undefined ? `${formatNumber(w, locale)}${NBSP}mm` : `${formatNumber(w, locale)}${NBSP}×${NBSP}${formatNumber(h, locale)}${NBSP}mm`;
}

/** An area in m², two decimals ("22,20 m²"). */
export function formatArea(m2: number, locale = "el-GR") {
  return `${formatNumber(m2, locale, 2)}${NBSP}m²`;
}
