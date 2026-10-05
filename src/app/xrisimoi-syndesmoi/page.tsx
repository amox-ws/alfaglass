import type { Metadata } from "next";
import Image from "next/image";
import { PageHero } from "@/components/page";
import { Reveal } from "@/components/ui";
import { EnquiryBand } from "@/components/catalog/views";
import { site } from "@/lib/content";

export const metadata: Metadata = {
  title: "Χρήσιμοι Σύνδεσμοι",
  description: "Εργαλεία διαμόρφωσης υαλοπινάκων και σήμανση CE από τους μεγαλύτερους κατασκευαστές γυαλιού.",
};

const BRANDS = ["AGC", "Guardian Glass", "Pilkington", "Saint-Gobain", "Şişecam"];

export default function LinksPage() {
  return (
    <>
      <PageHero
        crumbs={[{ label: "Χρήσιμοι Σύνδεσμοι" }]}
        title="Χρήσιμοι σύνδεσμοι"
        lead="Configurators, υπολογιστές επιδόσεων και πληροφορίες σήμανσης CE από τους οίκους με τους οποίους συνεργαζόμαστε."
      />
      <section data-theme="mist" className="bg-surface section-y">
        <div className="shell">
          <ul className="border-t border-line">
            {site.links.map((b, i) => (
              <Reveal as="li" key={b.logo} className="grid gap-8 border-b border-line py-10 md:grid-cols-12 md:items-start">
                <div className="flex items-center gap-6 md:col-span-4">
                  <div className="relative flex h-20 w-40 shrink-0 items-center justify-center rounded-sm bg-[oklch(0.995_0.002_250)] p-3">
                    <Image src={b.logo} alt={BRANDS[i] ?? ""} fill sizes="10rem" className="object-contain p-3" />
                  </div>
                  <h2 className="t-h3">{BRANDS[i]}</h2>
                </div>
                <ul className="grid gap-x-8 sm:grid-cols-2 md:col-span-7 md:col-start-6">
                  {b.links.map((l) => (
                    <li key={l.href} className="border-b border-line last:border-0 sm:[&:nth-last-child(2):nth-child(odd)]:border-0">
                      <a href={l.href} target="_blank" rel="noreferrer" className="group flex items-center justify-between gap-4 py-3.5">
                        <span className="transition-colors group-hover:text-accent">{l.label.replace(/\s*\|\s*Guardian( Glass)?$/, "")}</span>
                        <span aria-hidden className="text-fg-muted transition-transform group-hover:translate-x-0.5 group-hover:text-accent">↗</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>
      <EnquiryBand />
    </>
  );
}
