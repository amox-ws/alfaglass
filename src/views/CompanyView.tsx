import Image from "next/image";
import { MetaList, PageHero, Prose } from "@/components/page";
import { Eyebrow, MaskedLines, Reveal } from "@/components/ui";
import { EnquiryBand } from "@/components/catalog/views";
import { cms, imagery } from "@/lib/content";
import { t, type Lang } from "@/lib/i18n";

export function CompanyView({ lang }: { lang: Lang }) {
  const { company, vision, history, activity, financials } = cms(lang).site;
  const d = t(lang);
  const dc = d.company;
  return (
    <>
      <PageHero
        lang={lang}
        crumbs={[{ label: d.nav.theCompany }]}
        title={d.nav.theCompany}
        lead={dc.lead}
        image={imagery.buildingStorm}
        meta={
          <MetaList
            items={[
              { label: dc.founded, value: "1999" },
              { label: dc.area, value: lang === "el" ? "13.000 τ.μ." : "13,000 m²" },
              { label: dc.seat, value: dc.seatValue },
              { label: dc.access, value: dc.accessValue },
            ]}
          />
        }
      />

      {/* Story */}
      <section data-theme="frost" className="bg-surface section-y">
        <div className="shell grid gap-12 md:grid-cols-12 md:items-start">
          <div className="md:col-span-5">
            <Eyebrow index="01">{dc.who}</Eyebrow>
            <Reveal className="mt-8">
              <Prose html={company.html} />
            </Reveal>
          </div>
          <Reveal delay={0.1} className="relative aspect-[4/3] overflow-hidden rounded-sm md:col-span-6 md:col-start-7">
            <Image src={imagery.building} alt={dc.buildingAlt} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
          </Reveal>
        </div>
      </section>

      {/* Vision */}
      <section id="vision" data-theme="deep" className="scroll-mt-20 bg-surface section-y">
        <div className="shell">
          <Eyebrow index="02">{d.nav.vision}</Eyebrow>
          <MaskedLines as="h2" lines={dc.visionTitle} className="t-display mt-10" />
          <div className="mt-14 grid gap-10 md:grid-cols-12">
            <Reveal className="md:col-span-5 md:col-start-6">
              <Prose html={vision.html} />
            </Reveal>
          </div>
        </div>
      </section>

      {/* History */}
      <section id="history" data-theme="mist" className="scroll-mt-20 bg-surface section-y">
        <div className="shell">
          <div className="grid gap-8 md:grid-cols-12 md:items-end">
            <div className="md:col-span-7">
              <Eyebrow index="03">{d.nav.history}</Eyebrow>
              <MaskedLines as="h2" lines={dc.historyTitle} className="t-h1 mt-8" />
            </div>
          </div>
          <ol className="mt-16 border-t border-line md:mt-24">
            {history.timeline.map((item) => (
              <Reveal as="li" key={item.year} className="grid gap-4 border-b border-line py-8 md:grid-cols-12 md:items-baseline md:py-10">
                <span className="font-display text-[clamp(3.5rem,7vw,7rem)] font-[200] leading-[0.8] tabular md:col-span-4">{item.year}</span>
                <p className="t-lead text-fg-muted md:col-span-6 md:col-start-6">{item.text}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* Activity */}
      <section id="operation" data-theme="frost" className="scroll-mt-20 bg-surface section-y">
        <div className="shell grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <Eyebrow index="04">{d.nav.activity}</Eyebrow>
            <MaskedLines as="h2" lines={dc.activityTitle} className="t-h1 mt-8" />
            <Reveal className="mt-10">
              <Prose html={activity.html} />
            </Reveal>
          </div>
          <div className="grid gap-4 md:col-span-6 md:col-start-7">
            <Reveal className="relative aspect-[4/3] overflow-hidden rounded-sm">
              <Image src={imagery.warehouse} alt={dc.warehouseAlt} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
            </Reveal>
            <Reveal delay={0.1} className="relative aspect-[16/7] overflow-hidden rounded-sm">
              <Image src={imagery.trucks} alt={dc.trucksAlt} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
            </Reveal>
          </div>
        </div>
      </section>

      {/* Financial statements */}
      <section id="financials" data-theme="mist" className="scroll-mt-20 bg-surface section-y">
        <div className="shell grid gap-12 md:grid-cols-12">
          <div className="md:col-span-4">
            <Eyebrow index="05">{dc.transparency}</Eyebrow>
            <h2 className="t-h2 mt-8">{d.nav.financials}</h2>
          </div>
          <ul className="border-t border-line md:col-span-7 md:col-start-6">
            {[...financials].reverse().map((f) => (
              <li key={f.year} className="border-b border-line">
                <a href={f.pdf ?? "#"} target="_blank" rel="noreferrer" className="group flex items-center justify-between gap-6 py-6">
                  <span className="flex items-baseline gap-6">
                    <span className="font-display text-4xl font-bold tabular">{f.year}</span>
                    <span className="text-fg-muted transition-colors group-hover:text-fg">{f.title}</span>
                  </span>
                  <span className="t-label flex items-center gap-3 text-accent">
                    {d.common.pdf}
                    <span
                      aria-hidden
                      className="flex size-10 items-center justify-center rounded-full border border-line transition-colors group-hover:border-accent group-hover:bg-accent group-hover:text-accent-fg"
                    >
                      ↓
                    </span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <EnquiryBand lang={lang} />
    </>
  );
}
