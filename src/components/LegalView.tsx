import type { Metadata } from "next";
import { PageHero, Prose } from "@/components/page";
import { site } from "@/lib/content";

export function legalMetadata(slug: string): Metadata {
  return { title: site.legal[slug].title };
}

export function LegalView({ slug }: { slug: string }) {
  const page = site.legal[slug];
  return (
    <>
      <PageHero crumbs={[{ label: page.title }]} title={page.title} />
      <section className="bg-paper text-on-paper section-y">
        <div className="shell">
          <Prose html={page.html} className="mx-auto [&_p]:break-words" />
        </div>
      </section>
    </>
  );
}
