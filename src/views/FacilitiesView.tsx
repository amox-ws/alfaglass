import { PanoStrip } from "@/components/company/PanoStrip";
import { preloadImage } from "@/components/company/preload-image";
import { paragraphs } from "@/components/company/prose";
import { Cta } from "@/components/Cta";
import { AttikiExit } from "@/components/kit/AttikiExit";
import { DroneBand } from "@/components/kit/DroneBand";
import { MediaSlot } from "@/components/kit/MediaSlot";
import { SpecPlate } from "@/components/kit/SpecPlate";
import { PageHero } from "@/components/page";
import { Eyebrow, MaskedLines, Reveal, SectionHeader } from "@/components/ui";
import { cms, contact, imagery, stripHtml } from "@/lib/content";
import { t, type Lang } from "@/lib/i18n";
import { mediaSize } from "@/lib/media";
import { slots } from "@/lib/media-slots";
import { geoCaption } from "@/lib/seo";

/**
 * Facilities (DIRECTION §4.3): the scale of the premises and how goods leave. Hero with the three numbers on a plate; the aerial
 * band (the page's one scroll-linked effect, and the slot of the drone film); storage; the warehouse inside (a night chapter, the
 * slot of the interior loop); the trucks; where to turn off.
 */
export function FacilitiesView({ lang }: { lang: Lang }) {
  const { facilities } = cms(lang).site;
  const d = t(lang);
  const df = d.facilities;
  // The legacy text is two sentences: where the company is, and how goods are stored and leave. The second is the logistics text below.
  const [location = ""] = paragraphs(facilities.html);
  const insideSize = mediaSize(slots.warehouse.still?.src);

  // On a phone the aerial strip is in the first screen and the largest thing painted there: it starts loading from the head (the sizes are DroneBand's own)
  const aerial = slots.drone.loop ? slots.drone.loop.poster : slots.drone.still;
  if (aerial) preloadImage(aerial.src, slots.drone.loop ? "(min-width: 1920px) 1920px, 100vw" : "(min-width: 1926px) 1926px, (min-width: 768px) 100vw, 1040px");

  return (
    <>
      <PageHero lang={lang} crumbs={[{ label: d.nav.facilities }]} title={d.nav.facilities} lead={df.lead}>
        <div className="fa-plate hero-rise mt-10 md:mt-16" style={{ animationDelay: "0.4s" }}>
          <SpecPlate
            columns={3}
            items={[
              { label: df.totalArea, value: d.company.areaValue, unit: d.company.areaUnit },
              { label: df.extension, value: df.extensionValue, unit: d.company.areaUnit },
              { label: df.exitUnit, value: <span className="whitespace-nowrap">{df.exit}</span> },
            ]}
          />
        </div>
      </PageHero>

      {/* The aerial: the same place as the map, from above; the drone film replaces it by data alone */}
      <DroneBand slot={slots.drone} caption={geoCaption(lang)} lang={lang} alt={df.aerialAlt} className="fa-aerial" />

      {/* Storage (P1, then the façade across the page) */}
      <section data-theme="frost" className="bg-surface section-y">
        <div className="shell">
          <SectionHeader index="01" eyebrow={df.storage} title={df.storageTitle.join(" ")} size="h1" intro={stripHtml(location)} />
          <Reveal className="mt-16 md:mt-24">
            <MediaSlot
              slot={{ still: { src: imagery.facadeDay, alt: df.facadeAlt } }}
              ratio="4 / 3"
              ratioMd="21 / 9"
              sizes="(min-width: 1728px) 1616px, 100vw"
              alt={df.facadeAlt}
              className="rounded-xs"
            />
          </Reveal>
        </div>
      </section>

      {/* Inside: the warehouse at night, full bleed, one picture and one line (the slot of the interior loop) */}
      <section data-theme="night" aria-label={df.interiorAlt} className="fa-inside grain bg-surface">
        <div className="fa-inside-frame" style={{ maxWidth: insideSize?.w }}>
          <MediaSlot slot={slots.warehouse} ratio="4 / 3" fill sizes="100vw" alt={df.interiorAlt} caption={df.interiorAlt} lang={lang} />
        </div>
      </section>

      {/* Logistics: the trucks at their own proportion */}
      <section data-theme="frost" className="bg-surface pt-section">
        <div className="shell">
          <SectionHeader index="02" eyebrow={df.delivery} title={df.logisticsTitle} size="h1" intro={df.logisticsText} />
        </div>
        <div className="mt-16 md:mt-24">
          <PanoStrip src={imagery.trucksDay} alt={df.trucksAlt} caption={df.trucksAlt} lang={lang} />
        </div>
      </section>

      {/* Find us (P3) */}
      <section data-theme="mist" className="bg-surface section-y">
        <div className="shell grid gap-8 lg:grid-cols-12 lg:items-center">
          <Reveal className="lg:col-span-7">
            <AttikiExit lang={lang} />
          </Reveal>
          <div className="lg:col-span-4 lg:col-start-9">
            <Eyebrow index="03">{df.findUs}</Eyebrow>
            {/* the postcode stays with "Τ.Κ." when the address wraps */}
            <MaskedLines as="h2" lines={[d.contact.address.replace(/(Τ\.Κ\.) /, "$1\u00a0")]} className="t-h2 mt-5" />
            <p className="t-lead mt-6 text-fg-muted">{d.contact.addressNote}</p>
            <div className="mt-10 grid">
              <a href={contact.mapsHref} target="_blank" rel="noreferrer" className="text-link t-lead w-fit">
                {df.mapsLink} ↗
              </a>
              <a href={contact.phoneHref} className="text-link t-lead tabular w-fit">
                {d.contact.phone}
              </a>
            </div>
          </div>
        </div>
      </section>

      <Cta lang={lang} />
    </>
  );
}
