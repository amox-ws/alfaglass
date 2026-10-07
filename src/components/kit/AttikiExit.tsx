import { t, type Lang } from "@/lib/i18n";

/**
 * Where to turn off: a schematic, not a map. The motorway is a thick line, exit 4 leaves it by a short slip road to a pin: ALFA GLASS
 * at the Kyrillos position. A static SVG (responsive through its viewBox) with the words as HTML mono labels over it, so they stay
 * crisp at every width and are checked like any other text. `role="img"` with a label; the labels repeat what it says.
 */
export function AttikiExit({ lang = "el", className = "" }: { lang?: Lang; className?: string }) {
  const d = t(lang).common;
  return (
    <div className={`attiki ${className}`} role="img" aria-label={d.exitSchematicLabel}>
      <svg viewBox="0 0 1000 620" aria-hidden className="attiki-svg">
        <defs>
          <pattern id="attiki-grid" width="80" height="80" patternUnits="userSpaceOnUse">
            <path d="M80 0H0V80" fill="none" stroke="var(--line-faint)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          </pattern>
        </defs>
        <rect width="1000" height="620" fill="url(#attiki-grid)" />
        {/* the motorway, its centre line, and the slip road of exit 4 */}
        <path d="M-20 215 C280 205 560 120 1020 128" fill="none" stroke="var(--fg)" strokeWidth="28" />
        <path d="M-20 215 C280 205 560 120 1020 128" fill="none" stroke="var(--surface)" strokeWidth="2" strokeDasharray="14 12" />
        <path d="M430 172 C470 250 600 330 640 470" fill="none" stroke="var(--fg)" strokeWidth="14" strokeLinecap="round" />
        <circle cx="640" cy="470" r="30" fill="none" stroke="var(--accent)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
        <circle cx="640" cy="470" r="13" fill="var(--accent)" />
      </svg>
      <span className="attiki-label t-label" style={{ left: "4%", top: "14%" }}>
        {d.attikiRoad}
      </span>
      <span className="attiki-sign" style={{ left: "31%", top: "40%" }}>
        <span className="attiki-sign-no">4</span>
        <span className="attiki-label t-label attiki-sign-text">{d.exit}</span>
      </span>
      <span className="attiki-label t-label attiki-place" style={{ right: "calc(100% - 64% + 38px)", top: "76%" }}>
        {d.placeLabel}
      </span>
    </div>
  );
}
