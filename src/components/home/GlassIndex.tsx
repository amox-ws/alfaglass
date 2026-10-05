import { ArrowLink, Eyebrow, MaskedLines, Reveal } from "@/components/ui";
import { IndexList, type IndexRow } from "@/components/catalog/IndexList";
import { t, type Lang } from "@/lib/i18n";

export function GlassIndex({ lang, rows, allHref }: { lang: Lang; rows: IndexRow[]; allHref: string }) {
  const h = t(lang).home;
  return (
    <section data-theme="mist" className="relative bg-surface section-y" aria-labelledby="glass-title">
      <div className="shell">
        <div className="grid gap-10 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <Eyebrow index="02">
              {h.catalogue}
            </Eyebrow>
            <MaskedLines as="h2" id="glass-title" lines={[h.glassTitle]} className="t-display mt-6" />
          </div>
          <Reveal className="md:col-span-4 md:col-start-9">
            <p className="text-fg-muted">{h.glassIntro}</p>
          </Reveal>
        </div>

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
