import { MediaSlot } from "@/components/kit/MediaSlot";
import { ArrowLink, Eyebrow } from "@/components/ui";
import { mediaSize } from "@/lib/media";
import { slots } from "@/lib/media-slots";
import { t, type Lang } from "@/lib/i18n";

const SIDES = ["top", "bottom", "left", "right"] as const;

/**
 * The home page's signature: you step into the warehouse at night. A narrow pane of the night-graded photograph opens as you scroll
 * (four night shutters slide away and the photograph settles), the numeral "13.000" rises, and a clear pane of glass climbs over the
 * right third with the text and the link. Driven by a CSS scroll timeline (home.css, "the warehouse") using only transform and
 * opacity, so the browser runs it off the main thread. Without scroll timelines, or with reduced motion, the scene shows its final
 * frame: one screen with everything in it.
 *
 * The photograph is the `warehouse` slot (`media-slots.ts`): a still today, an interior loop later, by changing one line of data. It sits
 * below the fold, so it loads lazily, and is never wider than its file.
 */
export function Warehouse({ lang, facilitiesHref }: { lang: Lang; facilitiesHref: string }) {
  const h = t(lang).home;
  const still = slots.warehouse.still ?? slots.warehouse.loop?.poster;
  const size = still ? mediaSize(still.src) : null;

  return (
    <section data-theme="night" aria-labelledby="warehouse-title" className="relative bg-surface">
      {/* Where day ends: a hairline of glass edge along the top of the chapter */}
      <div aria-hidden className="whs-edge" />
      <div className="whs-track">
        <div className="whs-stage grain">
          <div className="whs-zoom" style={size ? { maxWidth: size.w } : undefined}>
            <MediaSlot slot={slots.warehouse} ratio="4 / 3" fill sizes="100vw" alt={h.warehouseAlt} lang={lang} />
          </div>
          {/* Night under the type: the numeral, its facts and the pane's label always read against it */}
          <div aria-hidden className="whs-shade" />

          {/* Four night shutters frame a narrow pane, then slide away to open the view; their inner edges catch the light */}
          {SIDES.map((side) => (
            <div key={side} aria-hidden className="whs-shutter" data-side={side} />
          ))}

          <div className="whs-head shell">
            <Eyebrow index="01">{h.facilitiesEyebrow}</Eyebrow>
            <span className="t-label text-fg-muted">{h.facilitiesPlace}</span>
          </div>

          <div className="whs-copy shell">
            <div className="whs-fig">
              <h2 id="warehouse-title">
                <span className="whs-num t-giga">{h.warehouseNumber}</span> <span className="whs-unit t-h2">{h.warehouseTitle}</span>
              </h2>
              <ul className="whs-facts t-label">
                {h.warehouseFacts.map((fact) => (
                  <li key={fact} className="tabular">
                    {fact}
                  </li>
                ))}
              </ul>
            </div>

            <div className="whs-pane glass glass-dark">
              <div aria-hidden className="whs-glare" />
              <div className="whs-label">
                <p className="t-lead">{h.facilitiesText}</p>
                <ArrowLink href={facilitiesHref} className="mt-6">
                  {h.ourFacilities}
                </ArrowLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
