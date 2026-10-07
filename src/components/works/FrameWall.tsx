import { Reveal } from "@/components/ui";
import { t, type Lang } from "@/lib/i18n";
import type { ApplicationKey } from "@/lib/machine";

/** The five applications of the cutting service that Έργα will show, in the order of the wall: 7 + 5, then 4 + 4 + 4 (at lg). */
const FRAMES: { key: ApplicationKey; at: string; ratio: string }[] = [
  { key: "signage", at: "md:col-span-6 lg:col-span-7", ratio: "aspect-[3/2]" },
  { key: "facade", at: "md:col-span-6 lg:col-span-5", ratio: "aspect-[3/2]" },
  { key: "displays", at: "md:col-span-6 lg:col-span-4", ratio: "aspect-[3/2]" },
  { key: "shopfit", at: "md:col-span-6 lg:col-span-4", ratio: "aspect-[3/2]" },
  { key: "interior", at: "col-span-2 md:col-span-12 lg:col-span-4", ratio: "aspect-[2/1] md:aspect-[3/1] lg:aspect-[3/2]" },
];

/**
 * The empty state of Έργα: the exact grid the works will fill, drawn as empty frames (a drawing of the shelves before the stock arrives):
 * a dashed frame with a mat, the diagonals of an opening in an architect's plan, and the application it is waiting for in the corner.
 * Decoration, so hidden from assistive technology; no fake cards, no placeholder text.
 */
export function FrameWall({ lang }: { lang: Lang }) {
  const d = t(lang);
  return (
    <div aria-hidden className="grid grid-cols-2 gap-4 md:grid-cols-12 md:gap-8">
      {FRAMES.map((f, i) => (
        <Reveal key={f.key} delay={Math.min(i, 5) * 0.06} className={`${f.at}`}>
          <div className={`frame ${f.ratio}`}>
            <svg className="frame-cross" viewBox="0 0 100 100" preserveAspectRatio="none">
              <line x1="0" y1="0" x2="100" y2="100" />
              <line x1="100" y1="0" x2="0" y2="100" />
            </svg>
            <span className="frame-tab t-label">
              <span className="tabular text-accent">{String(i + 1).padStart(2, "0")}</span>
              <span>{d.machine.applications[f.key]}</span>
            </span>
          </div>
        </Reveal>
      ))}
    </div>
  );
}
