import Link from "next/link";
import { EdgeGauge } from "@/components/kit/EdgeGauge";
import { MachineBlueprint } from "@/components/kit/MachineBlueprint";
import { SpecPlate } from "@/components/kit/SpecPlate";
import { Eyebrow, MaskedLines, Reveal, SectionHeader } from "@/components/ui";
import { cms, productThickness } from "@/lib/content";
import { productByGreekSlug } from "@/components/catalog/localized";
import { features } from "@/lib/features";
import { t, type Lang } from "@/lib/i18n";
import { MATERIALS, OPERATIONS, STOCKED } from "@/lib/machine";
import { hrefFor } from "@/lib/routes";
import { Pictogram } from "./Pictogram";

/* The sections of the CNC service page that follow the machine's scene (DIRECTION §4.13.3–7). Server components, no client JavaScript. */

/** 03 What we do: the seven operations, each with a cross-section pictogram in the blueprint's lines. */
export function WhatWeDo({ lang }: { lang: Lang }) {
  const d = t(lang);
  return (
    <section data-theme="frost" aria-labelledby="what-title" className="bg-surface section-y">
      <div className="shell">
        <SectionHeader id="what-title" index={d.service.whatIndex} eyebrow={d.service.whatEyebrow} title={d.service.whatTitle} size="h1" intro={d.machine.lead} />
        <Reveal className="mt-16 md:mt-24">
          <ul className="ops">
            {OPERATIONS.map((key) => (
              <li key={key} className="ops-row">
                <Pictogram kind={key} />
                <div className="ops-text min-w-0">
                  <h3 className="t-h3">{d.machine.operations[key].name}</h3>
                  <p className="t-body mt-1 text-fg-muted">{d.machine.operations[key].text}</p>
                </div>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}

/**
 * 04 Materials: one row per material the router cuts. A material ALFA GLASS stocks links to its product pages and shows the thicknesses
 * of the stock; every other row is the name alone: the page never says or implies that they are in stock. Glass is not a machine
 * material, and the footnote says so.
 */
export function Materials({ lang }: { lang: Lang }) {
  const d = t(lang);
  const c = cms(lang);
  const glass = hrefFor(lang, { kind: "group", key: "yalopinakes" });
  return (
    <section data-theme="mist" aria-labelledby="materials-title" className="bg-surface section-y">
      <div className="shell">
        <SectionHeader id="materials-title" index="02" eyebrow={d.service.materialsEyebrow} title={d.service.materialsTitle} size="h1" />
        <Reveal className="mt-16 md:mt-24">
          <ul className="mats">
            {MATERIALS.filter((k) => k !== "other").map((key) => {
              const slugs = STOCKED[key] ?? [];
              const values = [...new Set(slugs.flatMap(productThickness))].sort((a, b) => a - b);
              return (
                <li key={key} className="mats-row">
                  <h3 className="t-h3 mats-name">{d.machine.materials[key]}</h3>
                  {slugs.length > 0 && (
                    <div className="mats-stock">
                      <p className="t-label text-fg-muted">{d.service.fromStock}</p>
                      <ul className="mt-2 flex flex-wrap gap-x-6">
                        {slugs.map((slug) => {
                          const product = productByGreekSlug(lang, slug);
                          return (
                            product && (
                              <li key={slug}>
                                <Link href={c.productHref(product)} className="text-link t-body">
                                  {product.title}
                                </Link>
                              </li>
                            )
                          );
                        })}
                      </ul>
                    </div>
                  )}
                  {values.length > 0 && <EdgeGauge values={values} size="sm" lang={lang} className="mats-gauge" />}
                </li>
              );
            })}
          </ul>
        </Reveal>
        <p className="t-small mt-10 max-w-[68ch] text-fg-muted">
          {d.service.glassNote.before}
          <Link href={glass} className="inline-link text-fg">
            {d.service.glassNote.link}
          </Link>
          {d.service.glassNote.after}
        </p>
      </div>
    </section>
  );
}

/** 05 Who it's for: a sticky title and promise (P5), five audiences and what each gets; Έργα links only while there are works. */
export function Audience({ lang }: { lang: Lang }) {
  const d = t(lang);
  const s = d.service;
  const works = hrefFor(lang, { kind: "works" });
  return (
    <section data-theme="frost" aria-labelledby="audience-title" className="bg-surface section-y">
      <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-[calc(var(--header-h)+2rem)]">
            <Eyebrow index="03">{s.audienceEyebrow}</Eyebrow>
            <MaskedLines as="h2" id="audience-title" lines={[s.audienceTitle]} className="t-h1 mt-5" />
            <Reveal>
              <p className="t-lead mt-6 max-w-[34ch] text-fg-muted">{s.audiencePromise}</p>
            </Reveal>
          </div>
        </div>
        <Reveal className="lg:col-span-6 lg:col-start-7">
          <ul>
            {s.audiences.map((a) => (
              <li key={a.name} className="aud-row">
                <h3 className="t-h3">{a.name}</h3>
                <p className="t-body mt-2 max-w-[52ch] text-fg-muted">{a.text}</p>
                {a.apps.length > 0 && (
                  <ul className="mt-4 flex flex-wrap items-center gap-2">
                    {a.apps.map((app) => (
                      <li key={app} className="chip t-label">
                        {d.machine.applications[app]}
                      </li>
                    ))}
                    {features.works && (
                      <li>
                        <Link href={`${works}?app=${a.apps[0]}`} className="text-link t-label text-accent">
                          {s.worksLink} →
                        </Link>
                      </li>
                    )}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}

/** 06 The machine: its data sheet as an etched nameplate (the maker, its component makers and the price are never written). */
export function MachineSpec({ lang }: { lang: Lang }) {
  const d = t(lang);
  const s = d.service;
  return (
    <section data-theme="mist" aria-labelledby="machine-title" className="bg-surface section-y">
      <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-4">
          <Eyebrow index="04">{s.machineEyebrow}</Eyebrow>
          <MaskedLines as="h2" id="machine-title" lines={[s.machineTitle]} className="t-h2 mt-5" />
          <Reveal className="mt-10 max-w-md">
            <MachineBlueprint lang={lang} variant="mini" tone="light" id="bp-spec" />
          </Reveal>
        </div>
        <div className="lg:col-span-7 lg:col-start-6">
          <Reveal>
            <SpecPlate layout="list" label={s.machineLabel} items={d.machine.spec.map((r) => ({ label: r.term, value: r.value }))} />
          </Reveal>
          <p className="t-label mt-6 text-fg-muted">{d.machine.makerNote}</p>
        </div>
      </div>
    </section>
  );
}

/** 07 How ordering works: four steps on one edge line (horizontal from lg, vertical on a phone). No delivery times, no promises. */
export function Steps({ lang }: { lang: Lang }) {
  const s = t(lang).service;
  return (
    <section data-theme="frost" aria-labelledby="steps-title" className="bg-surface section-y">
      <div className="shell">
        <SectionHeader id="steps-title" index="05" eyebrow={s.stepsEyebrow} title={s.stepsTitle} size="h1" />
        <Reveal className="mt-16 md:mt-24">
          <ol className="steps">
            {s.steps.map((step, i) => (
              <li key={step.name} className="step">
                <span className="step-no t-label text-accent">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="t-h3">{step.name}</h3>
                <p className="t-body mt-2 text-fg-muted">{step.text}</p>
              </li>
            ))}
          </ol>
        </Reveal>
      </div>
    </section>
  );
}
