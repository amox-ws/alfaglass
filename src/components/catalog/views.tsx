import Link from "next/link";
import { Eyebrow, MaskedLines, Reveal } from "@/components/ui";
import { Cta } from "@/components/Cta";
import { MetaList, PageHero, Prose, Breadcrumbs, headlineLines } from "@/components/page";
import { IndexList } from "./IndexList";
import { ProductGrid } from "./ProductGrid";
import { ProductGallery } from "./ProductGallery";
import { cms, contact, excerpt, productCopy, stripHtml, type Category, type Group, type Product } from "@/lib/content";
import { t, type Lang } from "@/lib/i18n";

function splitIntro(html: string) {
  const paras = html.match(/<p>[\s\S]*?<\/p>/g) ?? [];
  const lead = paras[0] ? stripHtml(paras[0]) : "";
  const rest = html.replace(paras[0] ?? "", "").trim();
  return { lead, rest };
}

/* ------------------------------------------------------------------ group */

export function GroupView({ lang, group }: { lang: Lang; group: Group }) {
  const c = cms(lang);
  const d = t(lang);
  const cats = c.categoriesOf(group);
  const flat = c.isFlat(group);
  const { lead, rest } = splitIntro(flat ? cats[0].intro || group.intro : group.intro);
  const total = cats.reduce((n, c) => n + c.products.length, 0);

  return (
    <>
      <PageHero
        lang={lang}
        crumbs={[{ label: group.title }]}
        title={group.title}
        lead={excerpt(lead, 260)}
        image={group.image ?? cats[0]?.image}
        compact
        meta={
          <MetaList
            items={[
              { label: flat ? d.common.materials : d.common.categories, value: flat ? total : cats.length },
              { label: d.common.items, value: total },
            ]}
          />
        }
      />

      {rest && stripHtml(rest).length > 40 && (
        <section data-theme="mist" className="bg-surface section-y">
          <div className="shell grid gap-10 md:grid-cols-12">
            <div className="md:col-span-4">
              <Eyebrow>{d.common.about}</Eyebrow>
            </div>
            <Reveal className="md:col-span-7 md:col-start-6">
              <Prose html={rest} />
            </Reveal>
          </div>
        </section>
      )}

      <section data-theme="frost" className="bg-surface section-y">
        <div className="shell">
          <div className="mb-12 flex items-baseline justify-between border-b border-line pb-6 md:mb-16">
            <h2 className="t-h2">{flat ? d.common.materials : d.common.categories}</h2>
            <span className="t-label text-fg-muted tabular">{flat ? total : cats.length}</span>
          </div>
          {flat ? (
            <ProductGrid lang={lang} items={c.productsOf(cats[0])} />
          ) : (
            <IndexList
              lang={lang}
              rows={cats.map((cat) => ({
                href: c.categoryHref(cat),
                title: cat.title,
                summary: cat.summary || stripHtml(cat.intro),
                image: cat.image,
                count: cat.products.length,
              }))}
            />
          )}
        </div>
      </section>
      <Cta lang={lang} />
    </>
  );
}

/* ------------------------------------------------------------------ category */

export function CategoryView({ lang, category }: { lang: Lang; category: Category }) {
  const c = cms(lang);
  const d = t(lang);
  const group = c.groupOf(category);
  const items = c.productsOf(category);
  const siblings = c.categoriesOf(group).filter((x) => x.slug !== category.slug);
  const introText = stripHtml(category.intro);
  const full = (category.summary || introText).replace(/\s+/g, " ").trim();
  const lead = excerpt(full, 280);
  const rest = full.slice(lead.replace(/…$/, "").length).trim();

  return (
    <>
      <PageHero
        lang={lang}
        crumbs={[{ label: group.title, href: c.groupHref(group) }, { label: category.title }]}
        title={category.title}
        lead={lead}
        image={category.image}
        compact
        meta={
          <MetaList
            items={[
              { label: d.common.items, value: items.length },
              { label: d.common.family, value: group.title },
            ]}
          />
        }
      />

      {rest.length > 60 && (
        <section data-theme="frost" className="bg-surface pt-[clamp(5rem,9vw,8rem)]">
          <div className="shell grid gap-10 md:grid-cols-12">
            <div className="md:col-span-4">
              <Eyebrow>{d.common.about}</Eyebrow>
            </div>
            <Reveal className="md:col-span-7 md:col-start-6">
              <p className="prose-glass text-fg-muted">{rest}</p>
            </Reveal>
          </div>
        </section>
      )}

      <section data-theme="frost" className="bg-surface section-y">
        <div className="shell">
          <div className="mb-12 flex items-baseline justify-between border-b border-line pb-6 md:mb-16">
            <h2 className="t-h2">{d.common.products}</h2>
            <span className="t-label text-fg-muted tabular">{items.length}</span>
          </div>
          <ProductGrid lang={lang} items={items} />
        </div>
      </section>

      {siblings.length > 0 && (
        <section data-theme="mist" className="bg-surface section-y">
          <div className="shell">
            <div className="mb-12 flex items-end justify-between gap-6">
              <MaskedLines as="h2" lines={[d.common.otherCategories]} className="t-h2" />
              <Link href={c.groupHref(group)} className="text-link t-label hidden text-fg-muted sm:inline-flex">
                {d.common.allCategories}
              </Link>
            </div>
            <IndexList
              lang={lang}
              rows={siblings.map((cat) => ({
                href: c.categoryHref(cat),
                title: cat.title,
                summary: cat.summary || stripHtml(cat.intro),
                image: cat.image,
                count: cat.products.length,
              }))}
            />
          </div>
        </section>
      )}
      <Cta lang={lang} subject={category.title} />
    </>
  );
}

/* ------------------------------------------------------------------ product */

export function ProductView({ lang, product }: { lang: Lang; product: Product }) {
  const c = cms(lang);
  const d = t(lang);
  const { products } = c;
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

  const gallery = product.gallery.length
    ? product.gallery
    : product.image
      ? [{ src: product.image, caption: null }]
      : [];

  const copy = productCopy(product);
  const sections = [
    ...(stripHtml(copy.description).length > 20 ? [{ id: "description", title: d.common.description, html: copy.description }] : []),
    ...product.tabs
      .filter((tab) => stripHtml(tab.html) && stripHtml(tab.html) !== stripHtml(product.body))
      .map((tab, i) => ({ id: `tab-${i}`, title: tab.title, html: tab.html })),
  ];

  const siblings = category.products;
  const pos = siblings.indexOf(product.slug);
  const next = products[siblings[(pos + 1) % siblings.length]];
  const related = (product.related.length ? product.related : siblings.filter((s) => s !== product.slug))
    .slice(0, 3)
    .map((s) => products[s])
    .filter(Boolean);

  const mailSubject = encodeURIComponent(`${d.common.enquirySubject}: ${product.title}`);

  return (
    <>
      <section data-theme="mist" className="relative bg-surface pb-16 pt-[calc(var(--header-h)+3rem)] md:pb-24 md:pt-[calc(var(--header-h)+4rem)]">
        <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <Breadcrumbs lang={lang} items={crumbs} />
            <p className="t-label mt-10 text-accent md:mt-14">{flat ? group.title : category.title}</p>
            <MaskedLines as="h1" eager lines={headlineLines(product.title, 16)} className="t-h1 mt-4" />
            {copy.summary && (
              <Reveal delay={0.15}>
                <p className="t-lead mt-6 text-fg-muted">{copy.summary}</p>
              </Reveal>
            )}
            <Reveal delay={0.25} className="mt-10 flex flex-wrap gap-3">
              <a
                href={`mailto:${contact.email}?subject=${mailSubject}`}
                className="group inline-flex items-center gap-3 rounded-full bg-fg py-3 pl-6 pr-3 font-semibold text-surface transition-colors hover:bg-accent"
              >
                {d.common.requestQuote}
                <span className="flex size-8 items-center justify-center rounded-full bg-surface text-fg">→</span>
              </a>
              <a
                href={contact.phoneHref}
                className="inline-flex items-center gap-2 rounded-full border border-line-strong px-6 py-3 font-semibold transition-colors hover:border-fg"
              >
                <span className="tabular">{d.contact.phone}</span>
              </a>
            </Reveal>
          </div>
          <Reveal delay={0.1} className="lg:col-span-7">
            <ProductGallery lang={lang} images={gallery} title={product.title} />
          </Reveal>
        </div>
      </section>

      {sections.length > 0 && (
        <section data-theme="frost" className="bg-surface section-y">
          <div className="shell grid grid-cols-[minmax(0,1fr)] gap-12 lg:grid-cols-12">
            <nav aria-label={d.a11y.productSections} className="hidden lg:col-span-3 lg:block">
              <ul className="sticky top-[calc(var(--header-h)+2rem)] grid gap-1 border-l border-line">
                {sections.map((s, i) => (
                  <li key={s.id}>
                    <a href={`#${s.id}`} className="-ml-px flex gap-3 border-l border-transparent py-1.5 pl-5 text-fg-muted transition-colors hover:border-accent hover:text-fg">
                      <span className="t-label tabular">{String(i + 1).padStart(2, "0")}</span>
                      {s.title}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-20 lg:col-span-8 lg:col-start-5">
              {sections.map((s, i) => (
                <Reveal key={s.id}>
                  <article id={s.id} className="scroll-mt-28">
                    <div className="mb-8 flex items-baseline gap-4 border-b border-line pb-5">
                      <span className="t-label tabular text-accent">{String(i + 1).padStart(2, "0")}</span>
                      <h2 className="t-h3">{s.title}</h2>
                    </div>
                    <Prose
                      html={s.html}
                      className={/εφαρμογ|application/i.test(s.title) ? "[&_ul]:flex [&_ul]:flex-wrap [&_ul]:gap-2 [&_ul>li]:rounded-full [&_ul>li]:border [&_ul>li]:border-line [&_ul>li]:px-4 [&_ul>li]:py-1.5 [&_ul>li]:pl-4 [&_ul>li]:text-fg [&_ul>li::before]:hidden" : ""}
                    />
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section data-theme="frost" className={`bg-surface ${sections.length ? "pb-section" : "section-y"}`}>
          <div className="shell">
            <div className="mb-12 flex items-baseline justify-between border-t border-line pt-8">
              <h2 className="t-h2">{d.common.relatedProducts}</h2>
              {next && next.slug !== product.slug && (
                <Link href={c.productHref(next)} className="text-link t-label hidden text-fg sm:inline-flex">
                  {d.common.next}: {next.title} →
                </Link>
              )}
            </div>
            <ProductGrid lang={lang} items={related} />
          </div>
        </section>
      )}
      <Cta lang={lang} subject={product.title} />
    </>
  );
}
