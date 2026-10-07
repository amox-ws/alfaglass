import Link from "next/link";
import { Cta } from "@/components/Cta";
import { PillArrow } from "@/components/kit/PillArrow";
import { PageHero } from "@/components/page";
import { FixtureBanner } from "@/components/works/FixtureBanner";
import { FrameWall } from "@/components/works/FrameWall";
import { applicationLabel, materialLabel, shortMaterial, type WorkMaterial } from "@/components/works/meta";
import { WorkCard } from "@/components/works/WorkCard";
import { WorksBrowser } from "@/components/works/WorksBrowser";
import { works } from "@/content/works";
import { features } from "@/lib/features";
import { t, type Lang } from "@/lib/i18n";
import { APPLICATIONS, MATERIALS } from "@/lib/machine";
import { hrefFor } from "@/lib/routes";

/**
 * Έργα, the list. While there are fewer than three real works (`features.works` off) it is an honest empty state: the title, what is coming,
 * the frame wall (the grid the works will fill, drawn as empty frames) and two ways on, the cutting service and the products; answered with
 * status 200, noindex, linked from nowhere. With works it is the filterable list (`WorksBrowser`) of `WorkCard`s over the closing call for a cut.
 */
export function WorksView({ lang }: { lang: Lang }) {
  const d = t(lang);
  const crumbs = [{ label: d.nav.works }];

  if (!features.works) {
    return (
      <>
        <PageHero variant="index" lang={lang} crumbs={crumbs} title={d.nav.works}>
          <p className="hero-rise t-lead mt-5 max-w-[60ch] text-fg-muted" style={{ animationDelay: "0.3s" }}>
            {d.works.emptyLead}
          </p>
          <div className="hero-rise mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap" style={{ animationDelay: "0.4s" }}>
            <Link href={hrefFor(lang, { kind: "service" })} className="btn-pill btn-pill-dark">
              {d.nav.serviceLong}
              <PillArrow />
            </Link>
            <Link href={hrefFor(lang, { kind: "group", key: "yalopinakes" })} className="btn-pill btn-pill-line">
              {d.common.viewProducts}
            </Link>
          </div>
        </PageHero>
        <section data-theme="mist" className="bg-surface section-y">
          <div className="shell">
            <FrameWall lang={lang} />
          </div>
        </section>
        <Cta lang={lang} variant="cnc" />
      </>
    );
  }

  // the options that occur in the data, with the number of works behind each
  const materialKeys: WorkMaterial[] = ["glass", ...MATERIALS];
  const materials = materialKeys
    .map((key) => ({ key, label: shortMaterial(materialLabel(lang, key)), count: works.filter((w) => w.materials.includes(key)).length }))
    .filter((o) => o.count > 0);
  const applications = APPLICATIONS.map((key) => ({ key, label: applicationLabel(lang, key), count: works.filter((w) => w.applications.includes(key)).length })).filter(
    (o) => o.count > 0,
  );
  const items = works.map((w, i) => ({
    slug: w.slug,
    materials: w.materials as string[],
    applications: w.applications as string[],
    card: <WorkCard lang={lang} work={w} size="md" headingLevel={2} eager={i === 0} />,
  }));
  return (
    <>
      <PageHero variant="index" lang={lang} crumbs={crumbs} title={d.nav.works} facts={d.works.facts(works.length, materials.length)} lead={d.works.listLead} />
      <FixtureBanner lang={lang} />
      <section data-theme="frost" aria-label={d.nav.works} className="bg-surface section-y">
        <div className="shell">
          <WorksBrowser
            items={items}
            materials={materials}
            applications={applications}
            labels={{
              material: d.works.filterMaterial,
              application: d.works.filterApplication,
              all: d.works.filterAll,
              clear: d.works.filterClear,
              none: d.works.noResults,
              filters: d.works.filters,
              list: d.works.list,
              counts: Array.from({ length: works.length + 1 }, (_, n) => d.works.count(n)),
            }}
          />
        </div>
      </section>
      <Cta lang={lang} variant="cnc" />
    </>
  );
}
