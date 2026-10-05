import type { Metadata } from "next";
import Image from "next/image";
import { MetaList, PageHero, Prose } from "@/components/page";
import { Eyebrow, MaskedLines, Reveal } from "@/components/ui";
import { EnquiryBand } from "@/components/catalog/views";
import { imagery, site } from "@/lib/content";

export const metadata: Metadata = {
  title: "Η Εταιρεία",
  description:
    "Η ALFA GLASS Α.Ε. συστάθηκε το 1999 και εδρεύει στον Ασπρόπυργο, σε ιδιόκτητο κτίριο 13.000 τ.μ. Όραμα, ιστορία, δραστηριότητα και οικονομικές καταστάσεις.",
};

export default function CompanyPage() {
  const { company, vision, history, activity, financials } = site;
  return (
    <>
      <PageHero
        crumbs={[{ label: "Η Εταιρεία" }]}
        title="Η Εταιρεία"
        lead="Από το 1999, η ALFA GLASS Α.Ε. εισάγει και εμπορεύεται υαλοπίνακες και πλαστικά φύλλα, με πολύ μεγάλη γκάμα ειδών και διαστάσεων καθώς και τα υλικά που τα συνοδεύουν."
        image={imagery.buildingStorm}
        meta={
          <MetaList
            items={[
              { label: "Ίδρυση", value: "1999" },
              { label: "Εγκαταστάσεις", value: "13.000 τ.μ." },
              { label: "Έδρα", value: "Ασπρόπυργος" },
              { label: "Πρόσβαση", value: "Έξοδος 4, Αττική Οδός" },
            ]}
          />
        }
      />

      {/* Story */}
      <section className="bg-paper text-on-paper section-y">
        <div className="shell grid gap-12 md:grid-cols-12 md:items-start">
          <div className="md:col-span-5">
            <Eyebrow index="01" tone="light">
              Ποιοι είμαστε
            </Eyebrow>
            <Reveal className="mt-8">
              <Prose html={company.html} />
            </Reveal>
          </div>
          <Reveal delay={0.1} className="relative aspect-[4/3] overflow-hidden rounded-sm md:col-span-6 md:col-start-7">
            <Image src={imagery.building} alt="Το κτίριο της ALFA GLASS στον Ασπρόπυργο" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
          </Reveal>
        </div>
      </section>

      {/* Vision */}
      <section id="orama" className="scroll-mt-20 bg-ink section-y">
        <div className="shell">
          <Eyebrow index="02">Όραμα & Αξίες</Eyebrow>
          <MaskedLines
            as="h2"
            lines={["Η πρώτη επιλογή", "του επαγγελματία."]}
            className="t-display mt-10"
          />
          <div className="mt-14 grid gap-10 md:grid-cols-12">
            <Reveal className="md:col-span-5 md:col-start-6">
              <Prose html={vision.html} tone="dark" />
            </Reveal>
          </div>
        </div>
      </section>

      {/* History */}
      <section id="istoria" className="scroll-mt-20 bg-paper text-on-paper section-y">
        <div className="shell">
          <div className="grid gap-8 md:grid-cols-12 md:items-end">
            <div className="md:col-span-7">
              <Eyebrow index="03" tone="light">
                Ιστορία
              </Eyebrow>
              <MaskedLines as="h2" lines={["Από τη Δραπετσώνα", "στον Ασπρόπυργο"]} className="t-h1 mt-8" />
            </div>
          </div>
          <ol className="mt-16 border-t border-paper-line md:mt-24">
            {history.timeline.map((t) => (
              <Reveal as="li" key={t.year} className="grid gap-4 border-b border-paper-line py-8 md:grid-cols-12 md:items-baseline md:py-10">
                <span className="font-display text-[clamp(3.5rem,7vw,7rem)] font-[200] leading-[0.8] tabular md:col-span-4">{t.year}</span>
                <p className="t-lead text-on-paper-muted md:col-span-6 md:col-start-6">{t.text}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* Activity */}
      <section id="drastiriotita" className="scroll-mt-20 bg-ink section-y">
        <div className="shell grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <Eyebrow index="04">Δραστηριότητα</Eyebrow>
            <MaskedLines as="h2" lines={["Κάθε ανάγκη", "του χώρου"]} className="t-h1 mt-8" />
            <Reveal className="mt-10">
              <Prose html={activity.html} tone="dark" />
            </Reveal>
          </div>
          <div className="grid gap-4 md:col-span-6 md:col-start-7">
            <Reveal className="relative aspect-[4/3] overflow-hidden rounded-sm">
              <Image src={imagery.warehouse} alt="Αποθήκη υαλοπινάκων" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
            </Reveal>
            <Reveal delay={0.1} className="relative aspect-[16/7] overflow-hidden rounded-sm">
              <Image src={imagery.trucks} alt="Φορτηγά διανομής ALFA GLASS" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
            </Reveal>
          </div>
        </div>
      </section>

      {/* Financial statements */}
      <section id="oikonomika" className="scroll-mt-20 bg-paper text-on-paper section-y">
        <div className="shell grid gap-12 md:grid-cols-12">
          <div className="md:col-span-4">
            <Eyebrow index="05" tone="light">
              Διαφάνεια
            </Eyebrow>
            <h2 className="t-h2 mt-8">Οικονομικές καταστάσεις</h2>
          </div>
          <ul className="border-t border-paper-line md:col-span-7 md:col-start-6">
            {[...financials].reverse().map((f) => (
              <li key={f.year} className="border-b border-paper-line">
                <a href={f.pdf ?? "#"} target="_blank" rel="noreferrer" className="group flex items-center justify-between gap-6 py-6">
                  <span className="flex items-baseline gap-6">
                    <span className="font-display text-4xl font-bold tabular">{f.year}</span>
                    <span className="text-on-paper-muted transition-colors group-hover:text-on-paper">{f.title}</span>
                  </span>
                  <span className="t-label flex items-center gap-3 text-cobalt">
                    PDF
                    <span aria-hidden className="flex size-10 items-center justify-center rounded-full border border-paper-line transition-colors group-hover:border-cobalt group-hover:bg-cobalt group-hover:text-paper">
                      ↓
                    </span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <EnquiryBand />
    </>
  );
}
