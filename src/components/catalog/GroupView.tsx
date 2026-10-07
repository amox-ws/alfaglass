import Link from "next/link";
import { Cta } from "@/components/Cta";
import { EdgeIndex } from "@/components/kit/EdgeIndex";
import { MachineBlueprint } from "@/components/kit/MachineBlueprint";
import { Marquee } from "@/components/kit/Marquee";
import { PillArrow } from "@/components/kit/PillArrow";
import { SpecimenPlate } from "@/components/kit/SpecimenPlate";
import { Units } from "@/components/kit/Units";
import { PageHero, Prose } from "@/components/page";
import { Eyebrow } from "@/components/ui";
import { cms, stripHtml, thicknessRange, type Cms, type Group } from "@/lib/content";
import { t, type Lang } from "@/lib/i18n";
import { hrefFor } from "@/lib/routes";
import { thicknessOfFamily, thicknessOfProduct } from "./localized";
import { categoryRows, ProductList, productRows } from "./shared";

/** The first paragraph of a group's legacy text (its lead), and the rest of it. */
function splitIntro(html: string) {
  const paras = html.match(/<p>[\s\S]*?<\/p>/g) ?? [];
  return { lead: paras[0] ? stripHtml(paras[0]) : stripHtml(html), paras };
}

/** A sentence that ends where its list does ("…αναλώσιμα μηχανών και εργαλεία.", not "…εργαλεία: ό,τι…"): the lead of a hero is clipped at 100 characters. */
const leadOf = (text: string) => (text.includes(":") ? `${text.split(":")[0]}.` : text);

/** The thicknesses of every product of a group (for the "2–19 mm" of its facts line). */
function groupThickness(c: Cms, group: Group) {
  const products = c.categoriesOf(group).flatMap((cat) => c.productsOf(cat));
  return [...new Set(products.flatMap(thicknessOfProduct))].sort((a, b) => a - b);
}

/**
 * The three groups of the catalogue, one template each (docs/redesign/DIRECTION.md §4.4, §4.7, §4.8):
 * - glass: nine families as an index whose gauges, seen together, read as a rack from its end;
 * - plastics (one category): the materials as cards or rows, a band for the CNC service between the products and the "about";
 * - related products: the four families as a tool wall, then every product under its family.
 */
export function GroupView({ lang, group }: { lang: Lang; group: Group }) {
  const c = cms(lang);
  const cats = c.categoriesOf(group);
  const items = cats.reduce((n, cat) => n + cat.products.length, 0);
  if (c.isFlat(group)) return <PlasticsGroup lang={lang} group={group} items={items} />;
  if (group.key === "synafi-proionta") return <RelatedGroup lang={lang} group={group} items={items} />;
  return <GlassGroup lang={lang} group={group} items={items} />;
}

/* ------------------------------------------------------------------ glass */

function GlassGroup({ lang, group, items }: { lang: Lang; group: Group; items: number }) {
  const c = cms(lang);
  const d = t(lang);
  const cats = c.categoriesOf(group);
  const { lead } = splitIntro(group.intro);
  const range = thicknessRange(groupThickness(c, group));
  return (
    <>
      <PageHero
        variant="index"
        lang={lang}
        crumbs={[{ label: group.title }]}
        title={group.title}
        facts={<Units>{d.catalogue.factsGlass(cats.length, items, range)}</Units>}
        lead={lead}
      />

      <section data-theme="frost" aria-label={group.title} className="bg-surface section-y">
        <div className="shell">
          <EdgeIndex lang={lang} headingLevel={2} titleSize="h3" rows={categoryRows(lang, cats, (cat) => thicknessOfFamily(lang, cat))} />
        </div>
      </section>

      <section data-theme="frost" aria-labelledby="about-title" className="bg-surface pb-section">
        <div className="shell grid gap-10 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4">
            <Eyebrow>
              <span id="about-title">{d.common.about}</span>
            </Eyebrow>
            {group.image && (
              <div className="rise mt-10">
                <SpecimenPlate src={group.image} alt={d.catalogue.engravingAlt} sizes="(min-width: 1024px) 30vw, 100vw" lang={lang} />
              </div>
            )}
          </div>
          <div className="rise lg:col-span-7 lg:col-start-6">
            <Prose html={group.intro} />
          </div>
        </div>
      </section>
      <Cta lang={lang} subject={group.title} />
    </>
  );
}

/* ------------------------------------------------------------------ plastics */

function PlasticsGroup({ lang, group, items }: { lang: Lang; group: Group; items: number }) {
  const c = cms(lang);
  const d = t(lang);
  const cat = c.categoriesOf(group)[0];
  const products = c.productsOf(cat);
  const { lead } = splitIntro(group.intro);
  const service = hrefFor(lang, { kind: "service" });
  return (
    <>
      <PageHero variant="index" lang={lang} crumbs={[{ label: group.title }]} title={group.title} facts={d.catalogue.factsPlastics(items)} lead={lead} />

      {/* the only marquee of the page: the materials, across the screen, as a band under the hero */}
      <div data-theme="frost" className="bg-surface pb-10 md:pb-16">
        <Marquee items={d.home.plasticsMarquee} />
      </div>

      <section data-theme="frost" aria-label={group.title} className="bg-surface pb-section">
        <div className="shell">
          <ProductList lang={lang} products={products} />
        </div>
      </section>

      {/* The cutting band: the sheets above are the ones the machine was bought for (a blueprint, static: the machine moves on its own page) */}
      <section data-theme="deep" aria-labelledby="cut-title" className="bg-surface section-y">
        <div className="shell">
          <div className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-8">
            <div className="lg:col-span-7">
              <p className="t-label text-accent">{d.machine.eyebrow}</p>
              <h2 id="cut-title" className="mask-lines rise-mask t-h2 mt-5">
                <span className="mask-line">
                  <span>{d.catalogue.cutTitle}</span>
                </span>
              </h2>
            </div>
            <p className="t-lead text-fg-muted lg:col-span-4 lg:col-start-9">{d.machine.promise}</p>
          </div>
          <div className="rise mt-10 md:mt-16">
            <MachineBlueprint lang={lang} variant="band" id="bp-cut" />
          </div>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-8">
            <Link href={service} className="btn-pill btn-pill-dark">
              {d.nav.serviceLong}
              <PillArrow />
            </Link>
            <Link href={`${service}#aitima-kopis`} className="text-link inline-flex items-center justify-center font-semibold sm:justify-start">
              {d.nav.estimator} →
            </Link>
          </div>
        </div>
      </section>

      <section data-theme="mist" aria-labelledby="about-title" className="bg-surface section-y">
        <div className="shell grid items-center gap-10 lg:grid-cols-12 lg:gap-8">
          <div className="rise lg:col-span-5 lg:col-start-1">
            <Eyebrow>
              <span id="about-title">{d.common.about}</span>
            </Eyebrow>
            <p className="t-lead mt-5 max-w-[34ch]">{d.home.plasticsText}</p>
          </div>
          {group.image && (
            <div className="rise lg:col-span-6 lg:col-start-7">
              <SpecimenPlate src={group.image} alt={d.catalogue.canopyAlt} sizes="(min-width: 1024px) 50vw, 100vw" lang={lang} />
            </div>
          )}
        </div>
      </section>
      <Cta lang={lang} subject={group.title} />
    </>
  );
}

/* ------------------------------------------------------------------ related products */

function RelatedGroup({ lang, group, items }: { lang: Lang; group: Group; items: number }) {
  const c = cms(lang);
  const d = t(lang);
  const cats = c.categoriesOf(group);
  return (
    <>
      <PageHero
        variant="index"
        lang={lang}
        crumbs={[{ label: group.title }]}
        title={group.title}
        facts={d.catalogue.factsRelated(cats.length, items)}
        lead={leadOf(d.home.relatedText)}
      />

      {/* The tool wall: the four families as tall plates (a row each on a phone) */}
      <section data-theme="frost" aria-labelledby="wall-title" className="bg-surface section-y">
        <div className="shell">
          <h2 id="wall-title" className="sr-only">
            {d.catalogue.toolWall}
          </h2>
          <EdgeIndex lang={lang} headingLevel={3} rows={categoryRows(lang, cats, () => undefined, false)} className="md:hidden" />
          <ul className="wall plates-even hidden md:grid">
            {cats.map((cat, i) => (
              <li key={cat.slug} className="rise">
                <Link href={c.categoryHref(cat)} className="group lift block">
                  {cat.image && <SpecimenPlate src={cat.image} alt="" ratio="var(--wall-r)" sizes="(min-width: 1280px) 24vw, 46vw" captionRow={false} lang={lang} />}
                  <div className="mt-5 flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="t-label tabular text-fg-muted">
                        {String(i + 1).padStart(2, "0")} · {d.count(cat.products.length)}
                      </p>
                      <h3 className="t-h3 mt-2 transition-colors group-hover:text-accent">{cat.title}</h3>
                    </div>
                    <span aria-hidden className="specimen-arrow">
                      →
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Every product under its family, as index rows (no gauges: nothing here is sold by thickness) */}
      <section data-theme="mist" aria-label={d.catalogue.allItems} className="bg-surface section-y">
        <div className="shell grid gap-16 md:gap-24">
          {cats.map((cat) => (
            <div key={cat.slug}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2">
                <h2 className="mask-lines rise-mask t-h3 max-w-[40ch]">
                  <span className="mask-line">
                    <span>{cat.title}</span>
                  </span>
                </h2>
                <Link href={c.categoryHref(cat)} className="text-link t-label text-fg">
                  {d.count(cat.products.length)} →
                </Link>
              </div>
              <div className="mt-6">
                <EdgeIndex lang={lang} headingLevel={3} titleSize="h3" rows={productRows(lang, c.productsOf(cat), false)} />
              </div>
            </div>
          ))}
        </div>
      </section>
      <Cta lang={lang} subject={group.title} />
    </>
  );
}
