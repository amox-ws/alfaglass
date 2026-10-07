import { EdgeIndex, type EdgeRow } from "@/components/kit/EdgeIndex";
import { ArrowLink, SectionHeader } from "@/components/ui";
import { t, type Lang } from "@/lib/i18n";

/**
 * The glass catalogue as an index (P1, then `EdgeIndex`): a row per family with its thickness gauge where the content says the
 * thicknesses. Read together the gauges are the rack seen from its end; the cursor preview follows a mouse, a thumbnail serves touch.
 */
export function GlassIndex({ lang, rows, allHref }: { lang: Lang; rows: EdgeRow[]; allHref: string }) {
  const h = t(lang).home;
  return (
    <section data-theme="frost" className="relative bg-surface section-y" aria-labelledby="glass-title">
      <div className="shell">
        <SectionHeader
          index="02"
          eyebrow={h.catalogue}
          id="glass-title"
          title={h.glassTitle}
          intro={h.glassIntro}
          action={<ArrowLink href={allHref}>{h.allGlass}</ArrowLink>}
        />

        <div className="mt-16 md:mt-24">
          <EdgeIndex lang={lang} rows={rows} titleSize="h3" />
        </div>
      </div>
    </section>
  );
}
