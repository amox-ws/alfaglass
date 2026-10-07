import { ArrowLink, SectionHeader } from "@/components/ui";
import { IndexList, type IndexRow } from "@/components/catalog/IndexList";
import { t, type Lang } from "@/lib/i18n";

export function GlassIndex({ lang, rows, allHref }: { lang: Lang; rows: IndexRow[]; allHref: string }) {
  const h = t(lang).home;
  return (
    <section data-theme="mist" className="relative bg-surface section-y" aria-labelledby="glass-title">
      <div className="shell">
        <SectionHeader index="02" eyebrow={h.catalogue} id="glass-title" title={h.glassTitle} intro={h.glassIntro} />

        <div className="mt-16 md:mt-24">
          <IndexList lang={lang} rows={rows} />
        </div>

        <div className="mt-12 flex justify-end">
          <ArrowLink href={allHref}>
            {h.allGlass}
          </ArrowLink>
        </div>
      </div>
    </section>
  );
}
