import Link from "next/link";
import { Cta } from "@/components/Cta";
import { EdgeGauge } from "@/components/kit/EdgeGauge";
import { EdgeIndex } from "@/components/kit/EdgeIndex";
import { MediaGallery } from "@/components/kit/MediaGallery";
import { SpecimenPlate } from "@/components/kit/SpecimenPlate";
import { Units } from "@/components/kit/Units";
import { Eyebrow } from "@/components/ui";
import { cms, stripHtml, thicknessRange, type Category } from "@/lib/content";
import { t, type Lang } from "@/lib/i18n";
import { mediaSize } from "@/lib/media";
import { thicknessOfFamily } from "./localized";
import { SectionHead } from "./SectionHead";
import { CatalogHero, categoryRows, ProductList } from "./shared";

/**
 * A family of glass (or of related products): its products as cards and rows, the thicknesses of the family as a gauge, what the family
 * is (with the stock photographs, which never stand in a first screen) and its sibling families (docs/redesign/DIRECTION.md §4.5).
 */
export function CategoryView({ lang, category }: { lang: Lang; category: Category }) {
  const c = cms(lang);
  const d = t(lang);
  const group = c.groupOf(category);
  const products = c.productsOf(category);
  const siblings = c.categoriesOf(group).filter((x) => x.slug !== category.slug);
  const values = thicknessOfFamily(lang, category);
  const text = stripHtml(category.summary || category.intro);
  const aboutText = text.length > 100 ? text : "";
  // the content often lists the family's photograph again as its one gallery picture (the same photograph at another size): not twice
  const main = mediaSize(category.image);
  const gallery = category.gallery.filter((g) => {
    const size = mediaSize(g.src);
    return g.src !== category.image && !(main && size && Math.abs(main.w / main.h - size.w / size.h) < 0.05);
  });
  const hasAbout = Boolean(aboutText || category.image || gallery.length);

  return (
    <>
      <CatalogHero
        lang={lang}
        crumbs={[{ label: group.title, href: c.groupHref(group) }, { label: category.title }]}
        title={category.title}
        facts={<Units>{d.catalogue.factsCategory(d.count(products.length), thicknessRange(values), values.length === 1)}</Units>}
        lead={text}
        gauge={values.length > 0 ? <EdgeGauge values={values} size="md" lang={lang} /> : undefined}
      />

      <section data-theme="frost" aria-label={d.common.products} className="bg-surface section-y">
        <div className="shell">
          <ProductList lang={lang} products={products} />
        </div>
      </section>

      {hasAbout && (
        <section data-theme="mist" aria-labelledby="about-title" className="bg-surface section-y">
          <div className="shell grid gap-10 lg:grid-cols-12 lg:gap-8">
            <div className="rise lg:col-span-6">
              <Eyebrow>
                <span id="about-title">{d.common.about}</span>
              </Eyebrow>
              {aboutText && <p className="prose-glass mt-8 text-fg-muted">{aboutText}</p>}
            </div>
            {(category.image || gallery.length > 0) && (
              <div className="grid content-start gap-8 lg:col-span-5 lg:col-start-8">
                {category.image && (
                  <div className="rise">
                    <SpecimenPlate src={category.image} alt={category.title} sizes="(min-width: 1024px) 40vw, 100vw" lang={lang} />
                  </div>
                )}
                {gallery.length > 0 && (
                  <div className="rise">
                    <MediaGallery
                      layout="plates"
                      lang={lang}
                      label={d.catalogue.galleryLabel(category.title)}
                      items={gallery.map((g, i) => ({ src: g.src, alt: g.caption ?? d.catalogue.imageAlt(category.title, i + 1), caption: g.caption }))}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {siblings.length > 0 && (
        <section data-theme="frost" aria-labelledby="siblings-title" className="bg-surface section-y">
          <div className="shell">
            <SectionHead
              id="siblings-title"
              size="h2"
              title={d.common.otherCategories}
              action={
                <Link href={c.groupHref(group)} className="text-link t-label text-fg">
                  {d.common.allCategories}
                </Link>
              }
            />
            <div className="mt-10 md:mt-16">
              <EdgeIndex lang={lang} titleSize="h3" headingLevel={3} rows={categoryRows(lang, siblings, (cat) => thicknessOfFamily(lang, cat), false)} />
            </div>
          </div>
        </section>
      )}
      <Cta lang={lang} subject={category.title} />
    </>
  );
}
