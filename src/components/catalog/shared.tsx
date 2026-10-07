import { EdgeIndex, type EdgeRow } from "@/components/kit/EdgeIndex";
import { SpecimenCard } from "@/components/kit/SpecimenCard";
import { Breadcrumbs, type Crumb } from "@/components/page";
import { MaskedLines, Reveal } from "@/components/ui";
import { cms, teaser, type Category, type Product } from "@/lib/content";
import type { Lang } from "@/lib/i18n";
import { thicknessOfProduct } from "./localized";

/** A product as a row of the index (phones) or a plate card (from md), with its thickness gauge where the content has the data. */
export function productRows(lang: Lang, products: Product[], gauges: boolean): EdgeRow[] {
  const c = cms(lang);
  return products.map((p) => ({
    href: c.productHref(p),
    title: p.title,
    image: p.image ?? p.thumb,
    values: gauges ? thicknessOfProduct(p) : undefined,
  }));
}

/**
 * The products of a category: on a phone one column of index rows (a 72px thumbnail, the name, a small gauge: five products fit one
 * screen), from md a grid of specimen cards, 2 across at 768 and 3 from lg. The plate of a card carries the view-transition name of the
 * product, so its photo morphs into the first plate of the data sheet.
 */
export function ProductList({
  lang,
  products,
  gauges = true,
  headingLevel = 2,
}: {
  lang: Lang;
  products: Product[];
  gauges?: boolean;
  headingLevel?: 2 | 3;
}) {
  const c = cms(lang);
  return (
    <>
      <EdgeIndex lang={lang} rows={productRows(lang, products, gauges)} titleSize="h3" headingLevel={headingLevel} className="md:hidden" />
      <Reveal className="hidden md:block">
        <ul className="plates-even plates-43 grid gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
          {products.map((p, i) => (
            <li key={p.slug}>
              <SpecimenCard
                lang={lang}
                href={c.productHref(p)}
                title={p.title}
                image={p.image ?? p.thumb}
                slug={p.slug}
                index={i + 1}
                values={gauges ? thicknessOfProduct(p) : []}
                headingLevel={headingLevel}
              />
            </li>
          ))}
        </ul>
      </Reveal>
    </>
  );
}

/** The rows of a list of categories (families): their photograph, count and, where at least half the products have data, the gauge. */
export function categoryRows(lang: Lang, categories: Category[], values: (c: Category) => number[] | undefined, summaries = true): EdgeRow[] {
  const c = cms(lang);
  return categories.map((cat) => ({
    href: c.categoryHref(cat),
    title: cat.title,
    summary: summaries ? teaser(cat.summary || stripTags(cat.intro), 140) || undefined : undefined,
    image: cat.image,
    count: cat.products.length,
    values: values(cat),
  }));
}

const stripTags = (html: string) => html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

const LONG_TITLE = 24;

/**
 * The compact hero of a category: crumbs (a single back link on a phone), the title, a mono facts line, the lead and, from md, the
 * family's gauge to the right of the title (below it on a phone). No photograph: stock lifestyle pictures live in the "about" section.
 * Everything is in the server HTML and enters with the same CSS animations as the page heroes.
 */
export function CatalogHero({
  lang,
  crumbs,
  title,
  facts,
  lead,
  gauge,
}: {
  lang: Lang;
  crumbs: Crumb[];
  title: string;
  facts?: React.ReactNode;
  lead?: string;
  gauge?: React.ReactNode;
}) {
  const long = title.length > LONG_TITLE;
  return (
    <section data-theme="frost" className="page-hero-tight relative overflow-hidden bg-surface pt-[calc(var(--header-h)+3rem)] md:pt-[calc(var(--header-h)+5rem)]">
      <div className="shell relative">
        <div className="hero-fade">
          <Breadcrumbs lang={lang} items={crumbs} />
        </div>
        <div className="mt-5 grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <MaskedLines as="h1" eager lines={[title]} className={long ? "t-h1 max-w-[30ch]" : "t-display max-w-[18ch]"} />
            {facts && (
              <p className="hero-rise t-label mt-6 text-fg-muted" style={{ animationDelay: "0.25s" }}>
                {facts}
              </p>
            )}
            {lead && (
              <p className="hero-rise t-lead mt-5 max-w-[60ch] text-fg-muted" style={{ animationDelay: "0.3s" }}>
                {teaser(lead, 100)}
              </p>
            )}
          </div>
          {gauge && (
            <div className="hero-rise lg:col-span-3 lg:col-start-10 lg:justify-self-end" style={{ animationDelay: "0.35s" }}>
              {gauge}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
