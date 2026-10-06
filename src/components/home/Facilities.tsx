import Image from "next/image";
import { ArrowLink, Eyebrow, MaskedLines, Reveal } from "@/components/ui";
import { t, type Lang } from "@/lib/i18n";

/**
 * A narrow pane opens onto the warehouse as you scroll, then a clear pane of glass rises in front of it.
 * Driven by a CSS scroll timeline (globals.css, "facilities scene") using only transform and opacity,
 * so the browser runs it off the main thread. Without scroll timelines, or with reduced motion,
 * the scene shows its final frame.
 */
export function Facilities({
  lang,
  warehouse,
  trucks,
  facilitiesHref,
}: {
  lang: Lang;
  warehouse: string;
  trucks: string;
  facilitiesHref: string;
}) {
  const h = t(lang).home;

  return (
    <section data-theme="frost" aria-labelledby="facilities-title" className="relative bg-surface">
      <div className="fac-track">
        <div className="fac-stage">
          <div className="fac-zoom">
            <Image src={warehouse} alt={h.warehouseAlt} fill sizes="100vw" className="object-cover" />
          </div>
          {/* Shade low in the frame so lettering on the pane stays legible */}
          <div className="fac-shade bg-gradient-to-t from-deep/75 via-deep/20 to-transparent" />

          {/* Four frost shutters frame a narrow pane, then slide away to open the view */}
          <div aria-hidden className="fac-shutter" data-side="top" />
          <div aria-hidden className="fac-shutter" data-side="bottom" />
          <div aria-hidden className="fac-shutter" data-side="left" />
          <div aria-hidden className="fac-shutter" data-side="right" />

          {/* The pane: ultra-clear glass, read through its rim, bevel and a travelling glare rather than blur */}
          <div
            aria-hidden
            className="fac-pane glass pointer-events-none absolute inset-x-[max(0.75rem,2.5vw)] bottom-[max(0.75rem,2.5vw)] top-[calc(var(--header-h)+1rem)] rounded-[1.75rem] [--glass-tint:oklch(1_0_0/0.05)] [--glass-rim-lo:oklch(0.88_0.015_255/0.7)] [--glass-shadow:0_40px_90px_-40px_oklch(0.2_0.06_280/0.55)]"
          >
            <div className="fac-glare" />
          </div>

          <div className="fac-head shell pointer-events-none absolute inset-x-0 top-[calc(var(--header-h)+2rem)] flex justify-between">
            <Eyebrow index="03">{h.facilitiesEyebrow}</Eyebrow>
            <span className="t-label text-fg-muted">{h.facilitiesPlace}</span>
          </div>

          <div
            data-theme="deep"
            className="fac-copy shell absolute inset-x-0 bottom-0 pb-[calc(max(0.75rem,2.5vw)+2.5rem)] md:pb-[calc(2.5vw+4rem)]"
          >
            <div className="grid gap-8 md:grid-cols-12 md:items-end">
              <h2 id="facilities-title" className="t-display [text-shadow:0_2px_24px_oklch(0.2_0.06_280/0.35)] md:col-span-7">
                {h.facilitiesTitle[0]}
                <span className="block text-fg-muted">{h.facilitiesTitle[1]}</span>
              </h2>
              <p className="t-lead text-fg-muted md:col-span-4 md:col-start-9">
                {h.facilitiesText}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Logistics */}
      <div className="shell section-y">
        <div className="grid gap-12 md:grid-cols-12 md:items-center">
          <Reveal className="relative aspect-[16/10] overflow-hidden rounded-sm md:col-span-7 md:aspect-[16/9]">
            <Image
              src={trucks}
              alt={h.trucksAlt}
              fill
              sizes="(min-width: 768px) 58vw, 100vw"
              className="object-cover"
            />
          </Reveal>
          <div className="md:col-span-4 md:col-start-9">
            <MaskedLines as="h3" lines={h.logisticsTitle} className="t-h2" />
            <Reveal delay={0.1}>
              <p className="mt-6 text-fg-muted">
                {h.logisticsText}
              </p>
              <ArrowLink href={facilitiesHref} className="mt-10">
                {h.ourFacilities}
              </ArrowLink>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
