import Link from "next/link";
import { HistoryTimeline } from "@/components/company/HistoryTimeline";
import { Ledger } from "@/components/company/Ledger";
import { PanoStrip } from "@/components/company/PanoStrip";
import { withoutRepeated } from "@/components/company/prose";
import { Cta } from "@/components/Cta";
import { MediaSlot } from "@/components/kit/MediaSlot";
import { SpecPlate } from "@/components/kit/SpecPlate";
import { SpecimenPlate } from "@/components/kit/SpecimenPlate";
import { Units } from "@/components/kit/Units";
import { PageHero, Prose } from "@/components/page";
import { Eyebrow, MaskedLines, Reveal, SectionHeader } from "@/components/ui";
import { cms, imagery, stripHtml } from "@/lib/content";
import { t, type Lang } from "@/lib/i18n";
import { slots } from "@/lib/media-slots";
import { hrefFor } from "@/lib/routes";

/**
 * Company (DIRECTION §4.2): credibility. A cinematic hero on the façade; the facts on a plate that hangs from it; the story; the
 * vision as the page's one statement (deep); the history down an edge line that ends at the machine (2025); the operation; the
 * financial statements as a ledger.
 */
export function CompanyView({ lang }: { lang: Lang }) {
  const c = cms(lang);
  const { company, activity } = c.site;
  const d = t(lang);
  const dc = d.company;
  const glass = c.groupByKey("yalopinakes");

  // The legacy texts repeat each other: the activity text starts with the company text's last sentence. The page shows it once.
  const activityParas = withoutRepeated(activity.html, company.html);
  const goal = activityParas.length > 1 ? stripHtml(activityParas[activityParas.length - 1]) : null;
  const activityHtml = (goal ? activityParas.slice(0, -1) : activityParas).join("\n");

  return (
    <>
      <PageHero
        variant="cinematic"
        lang={lang}
        crumbs={[{ label: d.nav.theCompany }]}
        title={d.nav.theCompany}
        lead={dc.lead}
        facts={dc.facts.join(" · ")}
        media={slots.building}
        alt={dc.buildingAlt}
      />

      {/* Facts: an etched plate that hangs from the façade (the numbers are the content's: 1999, 13.000 τ.μ., the glass families and the products of the catalogue) */}
      <section data-theme="mist" className="co-facts bg-surface">
        <div className="shell">
          <SpecPlate
            className="glint-enter"
            items={[
              { label: dc.founded, value: "1999" },
              { label: dc.area, value: dc.areaValue, unit: dc.areaUnit },
              { label: dc.glass, value: String(glass.categories.length), unit: dc.glassUnit },
              { label: dc.catalogue, value: String(c.productCount), unit: dc.catalogueUnit },
            ]}
          />
        </div>
      </section>

      {/* Story (P2) */}
      <section data-theme="frost" className="bg-surface section-y">
        <div className="shell grid gap-6 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4">
            <Eyebrow index="01">{dc.since}</Eyebrow>
            <MaskedLines as="h2" lines={[dc.who]} className="t-h2 mt-5" />
          </div>
          <Reveal className="lg:col-span-7 lg:col-start-6">
            <Prose html={company.html} size="lead" className="[&>p:first-child]:text-fg" />
          </Reveal>
        </div>
      </section>

      {/* Vision: the page's one statement, static */}
      <section id="vision" data-theme="deep" className="co-vision bg-surface section-y">
        <div className="shell">
          <Eyebrow index="02">{d.nav.vision}</Eyebrow>
          <MaskedLines as="h2" lines={[dc.visionTitle.join(" ")]} className="t-display mt-5 max-w-[26ch]" />
          <div className="mt-10 grid gap-8 md:mt-16 lg:grid-cols-12">
            <Reveal className="lg:col-span-6 lg:col-start-6">
              <p className="t-lead max-w-[52ch] text-fg-muted">{dc.statement}</p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* History (P5): the engraving stays while the years scroll by on the edge line */}
      <section id="istoria" data-theme="frost" className="bg-surface section-y">
        <div className="shell grid gap-16 lg:grid-cols-12 lg:gap-8">
          <div className="lg:sticky lg:top-[calc(var(--header-h)+2rem)] lg:col-span-5 lg:self-start">
            <Eyebrow index="03">{d.nav.history}</Eyebrow>
            <MaskedLines as="h2" lines={[dc.historyTitle.join(" ")]} className="t-h1 mt-5" />
            <Reveal className="mt-10 md:mt-16">
              <SpecimenPlate
                src={imagery.engraving}
                alt={dc.engravingAlt}
                ratio="1299 / 789"
                index={1}
                caption={dc.engravingCaption}
                lang={lang}
                sizes="(min-width: 1024px) 40vw, 100vw"
              />
            </Reveal>
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <HistoryTimeline lang={lang} />
          </div>
        </div>
      </section>

      {/* Operation (P1 then P3), then the trucks as a panorama */}
      <section data-theme="frost" className="bg-surface pb-section">
        <div className="shell">
          <SectionHeader index="04" eyebrow={d.nav.activity} title={dc.activityTitle.join(" ")} size="h1" intro={goal} />
          <div className="mt-16 grid gap-8 md:mt-24 lg:grid-cols-12 lg:items-center">
            <Reveal className="lg:col-span-7">
              <MediaSlot
                slot={{ still: { src: imagery.warehouseDay, alt: dc.warehouseAlt } }}
                ratio="4 / 3"
                sizes="(min-width: 1728px) 900px, (min-width: 1024px) 58vw, 100vw"
                alt={dc.warehouseAlt}
                className="rounded-xs"
              />
            </Reveal>
            <Reveal delay={0.1} className="lg:col-span-4 lg:col-start-9">
              <Prose html={activityHtml} />
              <p className="t-body mt-6 text-fg-muted">{d.facilities.logisticsText}</p>
            </Reveal>
          </div>
        </div>
        <div className="mt-16 md:mt-24">
          <PanoStrip src={imagery.trucksDay} alt={dc.trucksAlt} caption={dc.trucksAlt} lang={lang} />
        </div>
        <div className="shell mt-10 md:mt-16">
          <div className="co-ledger">
            <div>
              <Link href={hrefFor(lang, { kind: "service" })} className="co-line">
                <span className="co-line-key t-label text-fg-muted">{d.machine.cardLabel}</span>
                <span className="co-line-title t-h3">
                  <Units>{dc.cncLink}</Units>
                </span>
                <span aria-hidden className="co-line-arrow">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M1 8h13M9 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Financial statements: the anchor of the Εταιρεία menu */}
      <section id="oikonomika" data-theme="mist" className="bg-surface section-y">
        <div className="shell">
          <SectionHeader index="05" eyebrow={dc.transparency} title={d.nav.financials} size="h1" />
          <div className="mt-16 md:mt-24">
            <Ledger lang={lang} />
          </div>
        </div>
      </section>

      <Cta lang={lang} />
    </>
  );
}
