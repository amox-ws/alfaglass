import Image from "next/image";
import { MetaList, PageHero, Prose } from "@/components/page";
import { Eyebrow, MaskedLines, Reveal } from "@/components/ui";
import { Cta } from "@/components/Cta";
import { cms, contact, imagery } from "@/lib/content";
import { t, type Lang } from "@/lib/i18n";

export function FacilitiesView({ lang }: { lang: Lang }) {
  const { facilities } = cms(lang).site;
  const d = t(lang);
  const df = d.facilities;
  return (
    <>
      <PageHero
        lang={lang}
        crumbs={[{ label: d.nav.facilities }]}
        title={d.nav.facilities}
        lead={df.lead}
        image={imagery.warehouse}
        imageAlt={df.interiorAlt}
        meta={
          <MetaList
            items={[
              { label: df.totalArea, value: lang === "el" ? "13.000 τ.μ." : "13,000 m²" },
              { label: df.extension, value: lang === "el" ? "+4.000 τ.μ." : "+4,000 m²" },
            ]}
          />
        }
      />

      <section data-theme="frost" className="bg-surface pb-section">
        <div className="shell">
          <div className="grid gap-12 md:grid-cols-12">
            <div className="md:col-span-5">
              <Eyebrow index="01">{df.storage}</Eyebrow>
              <MaskedLines as="h2" lines={df.storageTitle} className="t-h1 mt-8" />
            </div>
            <Reveal className="md:col-span-5 md:col-start-8 md:pt-16">
              <Prose html={facilities.html} />
            </Reveal>
          </div>
        </div>
      </section>

      <section data-theme="frost" className="bg-surface pb-section">
        <div className="shell grid gap-4 md:grid-cols-12">
          <Reveal className="relative aspect-[4/3] overflow-hidden rounded-sm md:col-span-7">
            <Image src={imagery.building} alt={df.facadeAlt} fill sizes="(min-width: 768px) 58vw, 100vw" className="object-cover" />
          </Reveal>
          <div className="grid gap-4 md:col-span-5">
            <Reveal delay={0.08} className="relative aspect-[16/9] overflow-hidden rounded-sm md:aspect-auto">
              <Image src={imagery.trucks} alt={df.trucksAlt} fill sizes="(min-width: 768px) 40vw, 100vw" className="object-cover" />
            </Reveal>
            <Reveal delay={0.16} className="relative aspect-[16/9] overflow-hidden rounded-sm md:aspect-auto">
              <Image src={imagery.aerial} alt={df.aerialAlt} fill sizes="(min-width: 768px) 40vw, 100vw" className="object-cover" />
            </Reveal>
          </div>
        </div>
      </section>

      <section data-theme="mist" className="bg-surface section-y">
        <div className="shell grid gap-12 md:grid-cols-12 md:items-end">
          <div className="md:col-span-6">
            <Eyebrow index="02">{df.findUs}</Eyebrow>
            <p className="t-h1 mt-8">{d.contact.address}</p>
            <p className="t-lead mt-6 text-fg-muted">{d.contact.addressNote}</p>
          </div>
          <div className="md:col-span-5 md:col-start-8">
            <a
              href={contact.mapsHref}
              target="_blank"
              rel="noreferrer"
              className="group flex items-center justify-between gap-6 border-b border-line pb-5 text-xl font-semibold transition-colors hover:border-accent hover:text-accent"
            >
              {df.mapsLink}
              <span
                aria-hidden
                className="flex size-12 items-center justify-center rounded-full border border-line transition-colors group-hover:border-accent group-hover:bg-accent group-hover:text-accent-fg"
              >
                ↗
              </span>
            </a>
          </div>
        </div>
      </section>
      <Cta lang={lang} />
    </>
  );
}
