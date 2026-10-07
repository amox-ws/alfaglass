import { notFound } from "next/navigation";
import { Cta } from "@/components/Cta";
import { PageHero } from "@/components/page";
import { works } from "@/content/works";
import { t, type Lang } from "@/lib/i18n";
import { hrefFor } from "@/lib/routes";

/**
 * A case study: a placeholder from the System (the cinematic hero on the work's cover and the closing call), so that every route
 * builds. The Έργα lane replaces it with the page of docs/redesign/DIRECTION.md §4.15.3.
 */
export function WorkView({ lang, slug }: { lang: Lang; slug: string }) {
  const work = works.find((w) => w.slug === slug);
  if (!work) notFound();
  const d = t(lang);
  return (
    <>
      <PageHero
        variant="cinematic"
        lang={lang}
        crumbs={[{ label: d.nav.works, href: hrefFor(lang, { kind: "works" }) }, { label: work.title }]}
        title={work.title}
        lead={work.summary}
        media={{ still: work.cover, loop: work.coverLoop }}
      />
      <Cta lang={lang} variant="cnc" subject={work.title} />
    </>
  );
}
