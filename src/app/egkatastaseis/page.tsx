import type { Metadata } from "next";
import Image from "next/image";
import { MetaList, PageHero, Prose } from "@/components/page";
import { Eyebrow, MaskedLines, Reveal } from "@/components/ui";
import { EnquiryBand } from "@/components/catalog/views";
import { contact, imagery, site } from "@/lib/content";

export const metadata: Metadata = {
  title: "Εγκαταστάσεις",
  description: "Ιδιόκτητες εγκαταστάσεις 13.000 τ.μ. στον Ασπρόπυργο, ακριβώς στην έξοδο 4 της Αττικής Οδού.",
};

export default function FacilitiesPage() {
  const { facilities } = site;
  return (
    <>
      <PageHero
        crumbs={[{ label: "Εγκαταστάσεις" }]}
        title="Εγκαταστάσεις"
        lead="Ιδιόκτητο ακίνητο 13.000 τετραγωνικών μέτρων στον Ασπρόπυργο, ακριβώς στην έξοδο 4 της Αττικής Οδού."
        image={imagery.warehouse}
        meta={
          <MetaList
            items={[
              { label: "Συνολική επιφάνεια", value: "13.000 τ.μ." },
              { label: "Επέκταση 2021", value: "+4.000 τ.μ." },
            ]}
          />
        }
      />

      <section className="bg-ink pb-[clamp(5rem,11vw,11rem)]">
        <div className="shell">
          <Reveal className="relative aspect-[16/9] overflow-hidden rounded-sm md:aspect-[21/9]">
            <Image src={imagery.warehouse} alt="Το εσωτερικό των αποθηκών με κιβώτια υαλοπινάκων" fill sizes="100vw" className="object-cover" />
          </Reveal>
          <div className="mt-16 grid gap-12 md:mt-24 md:grid-cols-12">
            <div className="md:col-span-5">
              <Eyebrow index="01">Αποθήκευση & διανομή</Eyebrow>
              <MaskedLines as="h2" lines={["Ειδικά διαμορφωμένοι", "χώροι, ειδικά", "φορτηγά"]} className="t-h1 mt-8" />
            </div>
            <Reveal className="md:col-span-5 md:col-start-8 md:pt-16">
              <Prose html={facilities.html} tone="dark" />
            </Reveal>
          </div>
        </div>
      </section>

      <section className="bg-ink pb-[clamp(5rem,11vw,11rem)]">
        <div className="shell grid gap-4 md:grid-cols-12">
          <Reveal className="relative aspect-[4/3] overflow-hidden rounded-sm md:col-span-7">
            <Image src={imagery.building} alt="Η πρόσοψη του κτιρίου ALFA GLASS" fill sizes="(min-width: 768px) 58vw, 100vw" className="object-cover" />
          </Reveal>
          <div className="grid gap-4 md:col-span-5">
            <Reveal delay={0.08} className="relative aspect-[16/9] overflow-hidden rounded-sm md:aspect-auto">
              <Image src={imagery.trucks} alt="Τα φορτηγά της εταιρείας" fill sizes="(min-width: 768px) 40vw, 100vw" className="object-cover" />
            </Reveal>
            <Reveal delay={0.16} className="relative aspect-[16/9] overflow-hidden rounded-sm md:aspect-auto">
              <Image src={imagery.aerial} alt="Αεροφωτογραφία της περιοχής των εγκαταστάσεων" fill sizes="(min-width: 768px) 40vw, 100vw" className="object-cover" />
            </Reveal>
          </div>
        </div>
      </section>

      <section className="bg-paper text-on-paper section-y">
        <div className="shell grid gap-12 md:grid-cols-12 md:items-end">
          <div className="md:col-span-6">
            <Eyebrow index="02" tone="light">
              Πώς θα μας βρείτε
            </Eyebrow>
            <p className="t-h1 mt-8">{contact.address}</p>
            <p className="t-lead mt-6 text-on-paper-muted">{contact.addressNote}</p>
          </div>
          <div className="md:col-span-5 md:col-start-8">
            <a
              href={contact.mapsHref}
              target="_blank"
              rel="noreferrer"
              className="group flex items-center justify-between gap-6 border-b border-paper-line pb-5 text-xl font-semibold transition-colors hover:border-cobalt hover:text-cobalt"
            >
              Οδηγίες στο Google Maps
              <span aria-hidden className="flex size-12 items-center justify-center rounded-full border border-paper-line transition-colors group-hover:border-cobalt group-hover:bg-cobalt group-hover:text-paper">
                ↗
              </span>
            </a>
          </div>
        </div>
      </section>
      <EnquiryBand />
    </>
  );
}
