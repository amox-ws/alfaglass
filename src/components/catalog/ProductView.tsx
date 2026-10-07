import Link from "next/link";
import { Cta } from "@/components/Cta";
import { EdgeGauge } from "@/components/kit/EdgeGauge";
import { MediaGallery, type GalleryItem } from "@/components/kit/MediaGallery";
import { SpecTable } from "@/components/kit/SpecTable";
import { Breadcrumbs, Prose } from "@/components/page";
import { MaskedLines, Reveal, SectionHeader } from "@/components/ui";
import { contact, enquiryHref } from "@/lib/contact";
import { cms, productCopy, stripHtml, type Product } from "@/lib/content";
import { t, type Dict, type Lang } from "@/lib/i18n";
import { hrefFor } from "@/lib/routes";
import { splitSpecHtml, type SpecBlock, type SpecTableData } from "@/lib/spec-table";
import { materialOf, thicknessOfProduct } from "./localized";
import { ProductList } from "./shared";

type Kind = "description" | "specs" | "applications" | "other";
type Block = { id: string; kind: Kind; title: string; html: string };

const kindOf = (title: string): Kind => (/προδιαγρ|specif/i.test(title) ? "specs" : /εφαρμογ|applic/i.test(title) ? "applications" : "other");

/** The sections of the page in order: the description (without the summary, which the data sheet already shows), then the content's tabs. */
function blocksOf(product: Product, description: string, d: Dict): Block[] {
  const blocks: Block[] = [];
  if (stripHtml(description).length > 20) blocks.push({ id: "description", kind: "description", title: d.catalogue.sections.description, html: description });
  product.tabs
    .filter((tab) => stripHtml(tab.html) && stripHtml(tab.html) !== stripHtml(product.body))
    .forEach((tab, i) => {
      const kind = kindOf(tab.title);
      blocks.push({ id: kind === "other" ? `tab-${i}` : kind, kind, title: kind === "other" ? tab.title : d.catalogue.sections[kind], html: tab.html });
    });
  return blocks;
}

/** The codes a table lists: the distinct cells of a column titled "Κωδικός". */
function codeCount(tables: SpecTableData[]) {
  const codes = new Set<string>();
  for (const table of tables) {
    const col = table.headers.findIndex((h) => /κωδικ|code/i.test(h ?? ""));
    if (col < 0) continue;
    for (const row of table.rows.slice(table.headRows)) for (const cell of row) if (cell.col === col) cell.lines.forEach((l) => codes.add(l));
  }
  return codes.size;
}

/** The items of a list of applications, as the words of each (null when the html is not a list). */
function listItems(html: string): string[] | null {
  const items = [...html.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)].map((m) => stripHtml(m[1])).filter(Boolean);
  return items.length > 0 ? items : null;
}

function BlockLabel({ index, children }: { index: number; children: React.ReactNode }) {
  return (
    <h2 className="t-label flex items-center gap-3 text-fg-muted">
      <span className="tabular text-accent">{String(index).padStart(2, "0")}</span>{" "}
      <span aria-hidden className="h-px w-8 bg-line-strong" />{" "}
      {children}
    </h2>
  );
}

/**
 * A product, as a data sheet (docs/redesign/DIRECTION.md §4.6): the photographs on specimen plates beside the name, the summary, the
 * thicknesses as a gauge and the two ways to ask; then the description, the engineered specification tables and the applications, with a
 * bar of anchors (and the quote button, from lg) that stays under the header while the tables are read.
 */
export function ProductView({ lang, product }: { lang: Lang; product: Product }) {
  const c = cms(lang);
  const d = t(lang);
  const group = c.groupOf(product);
  const category = c.categories[product.category];
  const flat = c.isFlat(group);
  const crumbs = flat
    ? [{ label: group.title, href: c.groupHref(group) }, { label: product.title }]
    : [
        { label: group.title, href: c.groupHref(group) },
        { label: category.title, href: c.categoryHref(category) },
        { label: product.title },
      ];

  // The summary is the start of the text (at most four lines beside the title); the description carries on from where it stops
  const copy = productCopy(product, 180);
  const blocks = blocksOf(product, copy.description, d);
  const values = thicknessOfProduct(product);
  const tableBlocks = blocks.filter((b) => b.kind === "specs").flatMap((b) => splitSpecHtml(b.html));
  const codes = codeCount(tableBlocks.flatMap((b) => (b.kind === "table" ? [b.table] : [])));

  // The main photograph first (it is the card's photograph, so it morphs into the first plate), then the gallery
  const photos = [...new Set([product.image, ...product.gallery.map((g) => g.src)].filter((s): s is string => Boolean(s)))];
  const captions = new Map(product.gallery.map((g) => [g.src, g.caption]));
  const items: GalleryItem[] = photos.map((src, i) => ({
    src,
    alt: captions.get(src) || (i === 0 ? product.title : d.catalogue.imageAlt(product.title, i + 1)),
    caption: captions.get(src),
  }));

  const siblings = category.products;
  const next = c.products[siblings[(siblings.indexOf(product.slug) + 1) % siblings.length]];
  const related = (product.related.length ? product.related : siblings.filter((s) => s !== product.slug))
    .slice(0, 3)
    .map((s) => c.products[s])
    .filter(Boolean);

  const material = materialOf(product);
  const quote = enquiryHref({ subject: `${d.common.enquirySubject}: ${product.title}` });
  const long = product.title.length > 34;
  const pill = "pill t-label";

  return (
    <>
      <section data-theme="frost" className="bg-surface pb-16 pt-[calc(var(--header-h)+3rem)] md:pb-24 md:pt-[calc(var(--header-h)+4rem)]">
        <div className="shell">
          <div className="hero-fade">
            <Breadcrumbs lang={lang} items={crumbs} />
          </div>
          {/* A phone reads title, photographs, summary and actions in that order; from lg the photographs fill the left and the sheet the right */}
          <div className="mt-6 grid gap-x-8 gap-y-8 lg:grid-cols-12 lg:grid-rows-[auto_1fr] lg:gap-y-0">
            <header className="lg:col-span-5 lg:col-start-8 lg:row-start-1">
              {/* On a phone the back link above already names the family */}
              <p className="t-label hidden text-accent md:block">{flat ? group.title : category.title}</p>
              <MaskedLines as="h1" eager lines={[product.title]} className={`${long ? "t-h2" : "t-h1"} md:mt-5`} />
            </header>

            <div className="plates-even plates-43 hero-fade min-w-0 lg:col-span-7 lg:col-start-1 lg:row-span-2 lg:row-start-1" style={{ animationDelay: "0.1s" }}>
              <MediaGallery items={items} layout="strip" lang={lang} morph={`spec-${product.slug}`} preloadFirst label={d.catalogue.galleryLabel(product.title)} />
            </div>

            <div className="lg:col-span-5 lg:col-start-8 lg:row-start-2 lg:self-start lg:pt-6">
              {copy.summary && (
                <p className="hero-rise t-lead text-fg-muted" style={{ animationDelay: "0.2s" }}>
                  {copy.summary}
                </p>
              )}
              {values.length > 0 && (
                <div className="mt-8">
                  <EdgeGauge values={values} size="lg" label={d.common.availableThickness} lang={lang} />
                </div>
              )}
              {codes > 0 && <p className="t-label mt-6 text-fg-muted">{d.catalogue.codes(codes)}</p>}
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <a
                  href={quote}
                  className="group inline-flex min-h-12 items-center justify-between gap-3 rounded-full bg-fg py-2 pl-6 pr-2 font-semibold text-surface transition-colors hover:bg-accent"
                >
                  {d.common.requestQuote}
                  <span aria-hidden className="flex size-8 items-center justify-center rounded-full bg-surface text-fg">
                    →
                  </span>
                </a>
                <a href={contact.phoneHref} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-line-strong px-6 font-semibold transition-colors hover:border-fg">
                  <span className="tabular">{d.contact.phone}</span>
                </a>
              </div>
              {material && (
                <p className="mt-6 flex flex-wrap items-baseline gap-x-4">
                  <span className="t-label text-fg-muted">{d.machine.cardLabel}</span>
                  <Link href={`${hrefFor(lang, { kind: "service" })}?material=${material}#aitima-kopis`} className="text-link font-semibold">
                    {d.catalogue.cncLine} →
                  </Link>
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {blocks.length > 0 && (
        <div data-theme="frost" className="bg-surface">
          {blocks.length > 1 && (
            <nav aria-label={d.a11y.productSections} className="sheet-bar">
              <div className="shell flex items-center gap-2">
                <ul className="flex min-w-0 flex-1 gap-2 overflow-x-auto py-2 [scrollbar-width:none]">
                  {blocks.map((b, i) => (
                    <li key={b.id} className="shrink-0">
                      <a href={`#${b.id}`} className={pill}>
                        {/* the numbers join the labels from sm: on a phone three labels fit the row only without them */}
                        <span className="tabular hidden text-accent sm:inline">{String(i + 1).padStart(2, "0")}</span>
                        {b.title}
                      </a>
                    </li>
                  ))}
                </ul>
                <a href={quote} className="hidden min-h-11 shrink-0 items-center rounded-full bg-fg px-5 t-small font-semibold text-surface transition-colors hover:bg-accent lg:inline-flex">
                  {d.common.requestQuote}
                </a>
                <a href={contact.phoneHref} className="t-data tabular hidden min-h-11 shrink-0 items-center px-3 lg:inline-flex">
                  {d.contact.phone}
                </a>
              </div>
            </nav>
          )}

          <div className="shell grid gap-16 pb-section pt-16 md:gap-24 md:pt-24">
            {blocks.map((b, i) => (
              <Reveal key={b.id}>
                <section id={b.id} aria-labelledby={`${b.id}-title`} className="scroll-mt-32">
                  {b.kind === "specs" ? (
                    <>
                      <div id={`${b.id}-title`}>
                        <BlockLabel index={i + 1}>{b.title}</BlockLabel>
                      </div>
                      <div className="mt-8 grid min-w-0 gap-10">
                        {splitSpecHtml(b.html).map((part: SpecBlock, k) =>
                          part.kind === "table" ? (
                            <SpecTable key={k} table={part.table} label={`${product.title}: ${b.title}`} />
                          ) : (
                            <Prose key={k} html={part.html} />
                          ),
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
                      <div id={`${b.id}-title`} className="lg:col-span-4">
                        <BlockLabel index={i + 1}>{b.title}</BlockLabel>
                      </div>
                      <div className="min-w-0 lg:col-span-7 lg:col-start-6">
                        {b.kind === "applications" && listItems(b.html) ? (
                          <ul className="flex flex-wrap gap-2">
                            {listItems(b.html)!.map((item) => (
                              <li key={item} className="pill t-small">
                                {item}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <Prose html={b.html} />
                        )}
                      </div>
                    </div>
                  )}
                </section>
              </Reveal>
            ))}
          </div>
        </div>
      )}

      {related.length > 0 && (
        <section data-theme="mist" aria-labelledby="related-title" className="bg-surface section-y">
          <div className="shell">
            <SectionHeader
              id="related-title"
              size="h2"
              title={d.common.relatedProducts}
              action={
                next &&
                next.slug !== product.slug && (
                  <Link href={c.productHref(next)} className="text-link t-small font-semibold text-fg">
                    {d.common.next}: {next.title} →
                  </Link>
                )
              }
            />
            <div className="mt-10 md:mt-16">
              <ProductList lang={lang} products={related} />
            </div>
          </div>
        </section>
      )}
      <Cta lang={lang} subject={product.title} />
    </>
  );
}
