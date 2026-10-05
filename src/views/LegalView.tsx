import { PageHero, Prose } from "@/components/page";
import { cms } from "@/lib/content";
import type { Lang } from "@/lib/i18n";

export function LegalView({ lang, legalKey }: { lang: Lang; legalKey: string }) {
  const page = cms(lang).site.legal[legalKey];
  return (
    <>
      <PageHero lang={lang} crumbs={[{ label: page.title }]} title={page.title} />
      <section data-theme="frost" className="bg-surface section-y">
        <div className="shell">
          <Prose html={page.html} className="mx-auto [&_p]:break-words" />
        </div>
      </section>
    </>
  );
}
