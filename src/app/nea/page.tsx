import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHero } from "@/components/page";
import { Reveal } from "@/components/ui";
import { EnquiryBand } from "@/components/catalog/views";
import { formatDate, site, stripHtml } from "@/lib/content";

export const metadata: Metadata = { title: "Νέα", description: "Νέα και ανακοινώσεις της ALFA GLASS." };

export default function NewsPage() {
  return (
    <>
      <PageHero crumbs={[{ label: "Νέα" }]} title="Τα νέα μας" lead="Νέα προϊόντα σε απόθεμα, συνεργασίες και ανακοινώσεις." />
      <section className="bg-paper text-on-paper section-y">
        <div className="shell">
          <ul className="border-t border-paper-line">
            {site.news.map((n) => (
              <Reveal as="li" key={n.slug} className="border-b border-paper-line">
                <Link href={`/nea/${n.slug}`} className="group grid gap-8 py-10 md:grid-cols-12 md:items-center">
                  <div className="relative aspect-[16/10] overflow-hidden rounded-sm bg-paper-2 md:col-span-4">
                    <Image src={n.images[1] ?? n.images[0]} alt="" fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover transition-transform duration-[1200ms] group-hover:scale-[1.04]" />
                  </div>
                  <div className="md:col-span-7 md:col-start-6">
                    <p className="t-label tabular text-cobalt">{formatDate(n.date)}</p>
                    <h2 className="t-h2 mt-4 transition-colors group-hover:text-cobalt">{n.title}</h2>
                    <p className="mt-5 max-w-[52ch] text-on-paper-muted">{stripHtml(n.html).slice(0, 160)}…</p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>
      <EnquiryBand />
    </>
  );
}
