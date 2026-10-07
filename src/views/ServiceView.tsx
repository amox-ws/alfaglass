import { Cta } from "@/components/Cta";
import { PageHero } from "@/components/page";
import { SectionHead } from "@/components/catalog/SectionHead";
import { BedScene } from "@/components/service/BedScene";
import { EstimatorGate } from "@/components/service/EstimatorGate";
import { PillArrow } from "@/components/kit/PillArrow";
import { DimensionLine } from "@/components/service/DimensionLine";
import { Audience, Materials, MachineSpec, Steps, WhatWeDo } from "@/components/service/ServiceSections";
import { contact, enquiryHref } from "@/lib/contact";
import { productThickness } from "@/lib/content";
import { t, type Lang } from "@/lib/i18n";
import { STOCKED } from "@/lib/machine";
import { slots } from "@/lib/media-slots";

/**
 * CNC κοπή & κατεργασία (docs/redesign/DIRECTION.md §4.13): one blueprint chapter (the promise, then the bed that scroll draws), then what
 * the machine does, the materials, who it is for, its data sheet, how ordering works and the estimator. No photograph of the machine
 * until ALFA GLASS's own is shot (`slots.machineStill` empty: the hero shows the length of the bed as a dimension line instead), and
 * never its maker or a price.
 */
export function ServiceView({ lang }: { lang: Lang }) {
  const d = t(lang);
  const m = d.machine;
  const e = d.estimator;

  // The thicknesses of the stock, per material the machine cuts: the estimator's chips (only the numbers go to the browser)
  const thickness = Object.fromEntries(
    Object.entries(STOCKED).map(([key, slugs]) => [key, [...new Set(slugs.flatMap(productThickness))].sort((a, b) => a - b)]),
  );

  return (
    <>
      <PageHero
        variant="cinematic"
        theme="deep"
        lang={lang}
        crumbs={[{ label: d.nav.serviceLong }]}
        title={m.title}
        lead={`${m.promise} ${m.accuracy}`}
        facts={m.eyebrow}
        media={slots.machineStill}
        fallback={<DimensionLine lang={lang} />}
      >
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <a href="#aitima-kopis" className="btn-pill btn-pill-dark">
            {d.nav.estimator}
            <PillArrow />
          </a>
          <a href={contact.phoneHref} className="btn-pill glass glass-dark gap-2">
            {d.common.callUs} <span className="t-data tabular">{d.contact.phone}</span>
          </a>
        </div>
      </PageHero>

      <BedScene lang={lang} />
      <WhatWeDo lang={lang} />
      <Materials lang={lang} />
      <Audience lang={lang} />
      <MachineSpec lang={lang} />
      <Steps lang={lang} />

      <section id="aitima-kopis" data-theme="mist" aria-labelledby="estimator-title" className="bg-surface section-y">
        <div className="shell">
          <SectionHead
            id="estimator-title"
            index="06"
            eyebrow={e.eyebrow}
            title={d.nav.estimator}
            size="h1"
            intro={e.lead}
            action={
              <div>
                <p className="t-label text-fg-muted">{e.plain}</p>
                <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-x-6">
                  <a href={enquiryHref({ subject: m.requestSubject })} className="text-link t-small font-mono text-fg">
                    {contact.email}
                  </a>
                  <a href={contact.phoneHref} className="text-link t-small tabular font-mono text-fg">
                    {d.contact.phone}
                  </a>
                </div>
              </div>
            }
          />
          <div className="mt-16 md:mt-24">
            <EstimatorGate lang={lang} thickness={thickness} />
          </div>
        </div>
      </section>

      <Cta lang={lang} variant="cnc" />
    </>
  );
}
