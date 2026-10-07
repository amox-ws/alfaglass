import type { OperationKey } from "@/lib/machine";

/**
 * The seven operations as 64 × 40 pictograms, drawn like the machine: 1px lines (the material in the text colour, the tool's work in
 * the accent). Sections show the thickness of the sheet, plans show its face. Decorative (`aria-hidden`): the name and the sentence
 * beside each one say it in words.
 */
const DRAWINGS: Record<OperationKey, React.ReactNode> = {
  // an outline being cut: the part of the path the tool has done is solid, the rest dashed, the tool sits at its head
  cut: (
    <>
      <rect x="3.5" y="4.5" width="57" height="31" />
      <path className="pict-tool" d="M16 28V15l9-6h13" />
      <path className="pict-tool pict-dash" d="M38 9l10 8v11l-8 5H24l-8-5" />
      <circle className="pict-tool" cx="38" cy="9" r="3" />
    </>
  ),
  // a notch milled out of the edge of a sheet, with the cutter above it
  route: (
    <>
      <path d="M4 18h17v9h22v-9h17v16H4z" />
      <path className="pict-tool" d="M27 4v14M37 4v14M27 18h10" />
    </>
  ),
  // the face of a sheet with an area engraved: a hatch
  engrave: (
    <>
      <rect x="3.5" y="4.5" width="57" height="31" />
      <path className="pict-tool" d="M14 14h36v14H14zM20 28l8-14M27 28l8-14M34 28l8-14M41 28l8-14M14 24l6-10M14 28l10-14" />
    </>
  ),
  // a stepped pocket: wide and shallow, then narrow and deep
  pocket: (
    <>
      <path d="M4 12h14M46 12h14v22H4V12" />
      <path className="pict-tool" d="M18 12v6h8v6h12v-6h8v-6" />
    </>
  ),
  // holes in exact positions, one with a drill above it
  drill: (
    <>
      <rect x="3.5" y="14.5" width="57" height="19" />
      <path className="pict-tool pict-dash" d="M14 14v20M18 14v20M44 14v20M50 14v20" />
      <path className="pict-tool" d="M28 3v11M36 3v11M28 14l4 7 4-7" />
    </>
  ),
  // a V cut in the panel so that it folds at 90°: the closed faces of the V are the line across the corner
  vgroove: (
    <>
      <path d="M8 31h34V6h5v30H8z" />
      <path className="pict-tool" d="M42 31l5 5" />
      <path className="pict-tool pict-dash" d="M8 31H3M8 36H3" />
    </>
  ),
  // a letter's outline cut out of a sheet
  letters: (
    <>
      <rect x="3.5" y="4.5" width="57" height="31" />
      <path className="pict-tool" d="M19 32 29.5 8h5L45 32h-5l-2.2-5.5H26.2L24 32zM27.8 22.5h8.4L32 12.5z" />
    </>
  ),
};

export function Pictogram({ kind }: { kind: OperationKey }) {
  return (
    <svg className="pict" width="64" height="40" viewBox="0 0 64 40" fill="none" aria-hidden>
      {DRAWINGS[kind]}
    </svg>
  );
}
