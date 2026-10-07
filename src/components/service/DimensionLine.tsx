import { t, type Lang } from "@/lib/i18n";
import { BED, formatNumber } from "@/lib/machine";

/**
 * The length of the bed, at the width of the screen: an arrowed 1px edge line from gutter to gutter with "6.050" standing on it in
 * the giant display digits. It is the top edge of the bed that the scene below draws, so it is part of the drawing (inline, static),
 * not a metric: the number never counts up.
 */
export function DimensionLine({ lang }: { lang: Lang }) {
  const d = t(lang);
  return (
    <div className="dim">
      <p className="dim-value t-giga tabular">
        <span className="sr-only">{d.service.bedLength}: </span>
        {formatNumber(BED.y, d.locale)}
        <span className="dim-unit t-label">
          <span className="unit">mm</span>
        </span>
      </p>
      <div aria-hidden className="dim-line">
        <span className="dim-tick" />
        <span className="dim-arrow" data-side="start" />
        <span className="dim-rule" />
        <span className="dim-arrow" data-side="end" />
        <span className="dim-tick" />
      </div>
    </div>
  );
}
