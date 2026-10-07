import { ArrowLink, SectionHeader } from "@/components/ui";
import type { Work } from "@/content/works";
import { t, type Lang } from "@/lib/i18n";
import { hrefFor } from "@/lib/routes";
import { FixtureBanner } from "./FixtureBanner";
import { WorkCard } from "./WorkCard";

/**
 * Home's Έργα section (frost): the P1 header (the mono eyebrow, "ΕΡΓΑ", "Όλα τα έργα"), then the three latest works: one large card in
 * columns 1–7 and two medium ones stacked in columns 9–12; three cards in one column on a phone. No filters on home. Placed by the Home lane
 * behind `features.works`; with no works it renders nothing, so there is never an empty section on home.
 */
export type WorksTeaserProps = { lang: Lang; works: Work[] };

export function WorksTeaser({ lang, works }: WorksTeaserProps) {
  if (works.length === 0) return null;
  const d = t(lang);
  const [first, ...rest] = works.slice(0, 3);
  return (
    <section data-theme="frost" aria-labelledby="works-teaser-title" className="bg-surface">
      <FixtureBanner lang={lang} />
      <div className="shell section-y">
        <SectionHeader
          eyebrow={d.works.latest}
          title={d.nav.works}
          id="works-teaser-title"
          action={<ArrowLink href={hrefFor(lang, { kind: "works" })}>{d.works.all}</ArrowLink>}
        />
        <div className="mt-16 grid gap-12 md:mt-24 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-7">
            <WorkCard lang={lang} work={first} size="lg" headingLevel={3} />
          </div>
          {rest.length > 0 && (
            <div className="grid content-start gap-12 lg:col-span-4 lg:col-start-9">
              {rest.map((w) => (
                <WorkCard key={w.slug} lang={lang} work={w} size="md" headingLevel={3} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
