import Link from "next/link";
import { Eyebrow, Reveal } from "@/components/ui";
import { MetaList, PageHero, Prose, Breadcrumbs, headlineLines } from "@/components/page";
import { IndexList } from "./IndexList";
import { ProductGrid } from "./ProductGrid";
import { ProductGallery } from "./ProductGallery";
import { MaskedLines } from "@/components/ui";
import {
  categories,
  categoriesOf,
  categoryHref,
  contact,
  getGroup,
  isFlatGroup,
  productHref,
  products,
  productsOf,
  stripHtml,
  type Category,
  type Group,
  type Product,
} from "@/lib/content";

/** First sentence(s) of a long text, cut at a sentence boundary. */
export function excerpt(text: string, max = 240) {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  const dot = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("! "));
  return dot > 80 ? cut.slice(0, dot + 1) : cut.replace(/\s+\S*$/, "") + "…";
}

function splitIntro(html: string) {
  const paras = html.match(/<p>[\s\S]*?<\/p>/g) ?? [];
  const lead = paras[0] ? stripHtml(paras[0]) : "";
  const rest = html.replace(paras[0] ?? "", "").trim();
  return { lead, rest };
}

/* ------------------------------------------------------------------ group */

export function GroupView({ group }: { group: Group }) {
  const cats = categoriesOf(group);
  const flat = isFlatGroup(group);
  const { lead, rest } = splitIntro(flat ? cats[0].intro || group.intro : group.intro);
  const total = cats.reduce((n, c) => n + c.products.length, 0);

  return (
    <>
      <PageHero
        crumbs={[{ label: group.title }]}
        title={group.title}
        lead={excerpt(lead, 260)}
        image={group.image ?? cats[0]?.image}
        meta={
          <MetaList
            items={[
              { label: flat ? "Υλικά" : "Κατηγορίες", value: flat ? total : cats.length },
              { label: "Είδη", value: total },
            ]}
          />
        }
      />

      {rest && stripHtml(rest).length > 40 && (
        <section className="bg-paper text-on-paper section-y">
          <div className="shell grid gap-10 md:grid-cols-12">
            <div className="md:col-span-4">
              <Eyebrow tone="light">Σχετικά</Eyebrow>
            </div>
            <Reveal className="md:col-span-7 md:col-start-6">
              <Prose html={rest} />
            </Reveal>
          </div>
        </section>
      )}

      <section className={`bg-paper text-on-paper ${rest ? "pb-[clamp(5rem,11vw,11rem)]" : "section-y"}`}>
        <div className="shell">
          <div className="mb-12 flex items-baseline justify-between border-b border-paper-line pb-6 md:mb-16">
            <h2 className="t-h2">{flat ? "Υλικά" : "Κατηγορίες"}</h2>
            <span className="t-label text-on-paper-muted tabular">{flat ? total : cats.length}</span>
          </div>
          {flat ? (
            <ProductGrid items={productsOf(cats[0])} />
          ) : (
            <IndexList
              rows={cats.map((c) => ({
                href: categoryHref(c),
                title: c.title,
                summary: c.summary || stripHtml(c.intro),
                image: c.image,
                count: c.products.length,
              }))}
            />
          )}
        </div>
      </section>
      <EnquiryBand />
    </>
  );
}

/* ------------------------------------------------------------------ category */

export function CategoryView({ category }: { category: Category }) {
  const group = getGroup(category.group)!;
  const items = productsOf(category);
  const siblings = categoriesOf(group).filter((c) => c.slug !== category.slug);
  const introText = stripHtml(category.intro);
  const full = (category.summary || introText).replace(/\s+/g, " ").trim();
  const lead = excerpt(full, 280);
  const rest = full.slice(lead.replace(/…$/, "").length).trim();

  return (
    <>
      <PageHero
        crumbs={[{ label: group.title, href: `/${group.slug}` }, { label: category.title }]}
        title={category.title}
        lead={lead}
        image={category.image}
        meta={
          <MetaList
            items={[
              { label: "Είδη", value: items.length },
              { label: "Οικογένεια", value: group.title },
            ]}
          />
        }
      />

      {rest.length > 60 && (
        <section className="bg-paper text-on-paper pt-[clamp(5rem,9vw,8rem)]">
          <div className="shell grid gap-10 md:grid-cols-12">
            <div className="md:col-span-4">
              <Eyebrow tone="light">Σχετικά</Eyebrow>
            </div>
            <Reveal className="md:col-span-7 md:col-start-6">
              <p className="prose-glass text-on-paper-muted">{rest}</p>
            </Reveal>
          </div>
        </section>
      )}

      <section className="bg-paper text-on-paper section-y">
        <div className="shell">
          <div className="mb-12 flex items-baseline justify-between border-b border-paper-line pb-6 md:mb-16">
            <h2 className="t-h2">Προϊόντα</h2>
            <span className="t-label text-on-paper-muted tabular">{items.length}</span>
          </div>
          <ProductGrid items={items} />
        </div>
      </section>

      {siblings.length > 0 && (
        <section className="bg-ink section-y">
          <div className="shell">
            <div className="mb-12 flex items-end justify-between gap-6">
              <MaskedLines as="h2" lines={["Άλλες κατηγορίες"]} className="t-h2" />
              <Link href={`/${group.slug}`} className="link-underline t-label hidden text-fg-muted sm:block">
                Όλες οι κατηγορίες →
              </Link>
            </div>
            <IndexList
              tone="dark"
              rows={siblings.map((c) => ({
                href: categoryHref(c),
                title: c.title,
                summary: c.summary || stripHtml(c.intro),
                image: c.image,
                count: c.products.length,
              }))}
            />
          </div>
        </section>
      )}
      <EnquiryBand />
    </>
  );
}

/* ------------------------------------------------------------------ product */

export function ProductView({ product }: { product: Product }) {
  const group = getGroup(product.group)!;
  const category = categories[product.category];
  const flat = isFlatGroup(group);
  const crumbs = flat
    ? [{ label: group.title, href: `/${group.slug}` }, { label: product.title }]
    : [
        { label: group.title, href: `/${group.slug}` },
        { label: category.title, href: categoryHref(category) },
        { label: product.title },
      ];

  const gallery = product.gallery.length
    ? product.gallery
    : product.image
      ? [{ src: product.image, caption: null }]
      : [];

  const sections = [
    ...(product.body && stripHtml(product.body).length > 20 ? [{ id: "perigrafi", title: "Περιγραφή", html: product.body }] : []),
    ...product.tabs
      .filter((t) => stripHtml(t.html) && stripHtml(t.html) !== stripHtml(product.body))
      .map((t, i) => ({ id: `tab-${i}`, title: t.title, html: t.html })),
  ];

  const siblings = category.products;
  const pos = siblings.indexOf(product.slug);
  const next = products[siblings[(pos + 1) % siblings.length]];
  const related = (product.related.length ? product.related : siblings.filter((s) => s !== product.slug))
    .slice(0, 3)
    .map((s) => products[s])
    .filter(Boolean);

  const mailSubject = encodeURIComponent(`Ενδιαφέρον για: ${product.title}`);

  return (
    <>
      <section className="relative bg-ink pb-16 pt-[calc(var(--header-h)+3rem)] md:pb-24 md:pt-[calc(var(--header-h)+4rem)]">
        <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <Breadcrumbs items={crumbs} />
            <p className="t-label mt-10 text-edge md:mt-14">{flat ? group.title : category.title}</p>
            <MaskedLines as="h1" lines={headlineLines(product.title, 16)} className="t-h1 mt-4" />
            {product.summary && (
              <Reveal delay={0.15}>
                <p className="mt-8 text-lg leading-relaxed text-fg-muted">{excerpt(product.summary, 320)}</p>
              </Reveal>
            )}
            <Reveal delay={0.25} className="mt-10 flex flex-wrap gap-3">
              <a
                href={`mailto:${contact.email}?subject=${mailSubject}`}
                className="group inline-flex items-center gap-3 rounded-full bg-fg py-3 pl-6 pr-3 font-semibold text-ink transition-colors hover:bg-edge"
              >
                Ζητήστε προσφορά
                <span className="flex size-8 items-center justify-center rounded-full bg-ink text-fg">→</span>
              </a>
              <a
                href={contact.phoneHref}
                className="inline-flex items-center gap-2 rounded-full border border-line-strong px-6 py-3 font-semibold transition-colors hover:border-fg"
              >
                <span className="tabular">{contact.phone}</span>
              </a>
            </Reveal>
          </div>
          <Reveal delay={0.1} className="lg:col-span-7">
            <ProductGallery images={gallery} title={product.title} />
          </Reveal>
        </div>
      </section>

      {sections.length > 0 && (
        <section className="bg-paper text-on-paper section-y">
          <div className="shell grid gap-12 lg:grid-cols-12">
            <nav aria-label="Ενότητες προϊόντος" className="hidden lg:col-span-3 lg:block">
              <ul className="sticky top-[calc(var(--header-h)+2rem)] grid gap-1 border-l border-paper-line">
                {sections.map((s, i) => (
                  <li key={s.id}>
                    <a href={`#${s.id}`} className="-ml-px flex gap-3 border-l border-transparent py-1.5 pl-5 text-on-paper-muted transition-colors hover:border-cobalt hover:text-on-paper">
                      <span className="tabular text-sm">{String(i + 1).padStart(2, "0")}</span>
                      {s.title}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="grid gap-20 lg:col-span-8 lg:col-start-5">
              {sections.map((s, i) => (
                <Reveal key={s.id}>
                  <article id={s.id} className="scroll-mt-28">
                    <div className="mb-8 flex items-baseline gap-4 border-b border-paper-line pb-5">
                      <span className="tabular text-sm text-cobalt">{String(i + 1).padStart(2, "0")}</span>
                      <h2 className="t-h3">{s.title}</h2>
                    </div>
                    <Prose
                      html={s.html}
                      className={/εφαρμογ/i.test(s.title) ? "[&_ul]:flex [&_ul]:flex-wrap [&_ul]:gap-2 [&_ul>li]:rounded-full [&_ul>li]:border [&_ul>li]:border-paper-line [&_ul>li]:px-4 [&_ul>li]:py-1.5 [&_ul>li]:pl-4 [&_ul>li]:text-on-paper [&_ul>li::before]:hidden" : ""}
                    />
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className={`bg-paper text-on-paper ${sections.length ? "pb-[clamp(5rem,11vw,11rem)]" : "section-y"}`}>
          <div className="shell">
            <div className="mb-12 flex items-baseline justify-between border-t border-paper-line pt-8">
              <h2 className="t-h2">Σχετικά προϊόντα</h2>
              {next && next.slug !== product.slug && (
                <Link href={productHref(next)} className="link-underline t-label hidden text-on-paper sm:block">
                  Επόμενο: {next.title} →
                </Link>
              )}
            </div>
            <ProductGrid items={related} />
          </div>
        </section>
      )}
      <EnquiryBand product={product.title} />
    </>
  );
}

/* ------------------------------------------------------------------ enquiry band */

export function EnquiryBand({ product }: { product?: string }) {
  return (
    <section className="relative overflow-hidden bg-cobalt">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          background:
            "repeating-linear-gradient(90deg, transparent 0 46px, oklch(1 0 0 / 0.07) 46px 47px, transparent 47px 92px)",
        }}
      />
      <div className="shell relative flex flex-col gap-8 py-14 md:flex-row md:items-center md:justify-between md:py-20">
        <div>
          <p className="t-label text-fg/75">{product ? "Διαθεσιμότητα & τιμές" : "Τα πάντα για το γυαλί"}</p>
          <p className="t-h2 mt-4 max-w-[20ch]">
            {product ? "Ρωτήστε μας για διαστάσεις και απόθεμα." : "Καλέστε μας και θα έρθουμε κοντά σας."}
          </p>
        </div>
        <div className="flex flex-col gap-3 md:items-end">
          <a href={contact.phoneHref} className="font-display text-[clamp(2.25rem,4.5vw,4rem)] font-bold leading-none tabular">
            {contact.phone}
          </a>
          <a href={`mailto:${contact.email}`} className="link-underline w-fit text-fg/85">
            {contact.email}
          </a>
        </div>
      </div>
    </section>
  );
}

