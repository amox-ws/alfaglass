import { Hero } from "@/components/home/Hero";
import { Manifesto } from "@/components/home/Manifesto";
import { GlassIndex } from "@/components/home/GlassIndex";
import { Facilities } from "@/components/home/Facilities";
import { Plastics } from "@/components/home/Plastics";
import { History } from "@/components/home/History";
import { Related } from "@/components/home/Related";
import { Brands } from "@/components/home/Brands";
import { News } from "@/components/home/News";
import { Cta } from "@/components/Cta";
import { cms, imagery, stripHtml, teaser } from "@/lib/content";
import { brandsOf } from "@/lib/brands";
import type { Lang } from "@/lib/i18n";
import { mediaSize } from "@/lib/media";
import { hrefFor } from "@/lib/routes";

export function HomeView({ lang }: { lang: Lang }) {
  const c = cms(lang);
  const glass = c.groupByKey("yalopinakes");
  const plastics = c.groupByKey("plastika-fylla");
  const related = c.groupByKey("synafi-proionta");
  const plasticsCategory = c.categories[plastics.categories[0]];
  const article = c.site.news[0];
  const trucks = mediaSize(imagery.trucks)!;

  return (
    <>
      <Hero lang={lang} productsHref={c.groupHref(glass)} />
      <Manifesto lang={lang} companyHref={hrefFor(lang, { kind: "company" })} />
      <GlassIndex
        lang={lang}
        allHref={c.groupHref(glass)}
        rows={c.categoriesOf(glass).map((cat) => ({
          href: c.categoryHref(cat),
          title: cat.title,
          // About two lines in the index, cut at a word; a family without a text of its own borrows its first product's
          summary: teaser(cat.summary || stripHtml(cat.intro) || c.productsOf(cat)[0]?.summary || "", 110),
          image: cat.image,
          count: cat.products.length,
        }))}
      />
      <Facilities
        lang={lang}
        warehouse={imagery.warehouse}
        trucks={{ src: imagery.trucks, ...trucks }}
        facilitiesHref={hrefFor(lang, { kind: "facilities" })}
      />
      <Plastics
        lang={lang}
        allHref={c.groupHref(plastics)}
        image={plastics.image ?? plasticsCategory.image!}
        items={c.productsOf(plasticsCategory).map((p) => ({ title: p.title, href: c.productHref(p) }))}
      />
      <History lang={lang} items={c.site.history.timeline} engraving={imagery.engraving} />
      <Related
        lang={lang}
        allHref={c.groupHref(related)}
        items={c.categoriesOf(related).map((cat) => ({
          href: c.categoryHref(cat),
          title: cat.title,
          image: cat.image,
          count: cat.products.length,
        }))}
      />
      <Brands lang={lang} brands={brandsOf(c.site.links)} href={hrefFor(lang, { kind: "links" })} />
      <News
        lang={lang}
        allHref={hrefFor(lang, { kind: "news" })}
        article={{
          href: hrefFor(lang, { kind: "article", index: 0 }),
          date: article.date,
          title: article.title,
          html: article.html,
          image: article.images[1] ?? article.images[0],
        }}
      />
      <Cta lang={lang} variant="feature" />
    </>
  );
}
