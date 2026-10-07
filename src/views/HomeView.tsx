import { Hero } from "@/components/home/Hero";
import { Warehouse } from "@/components/home/Warehouse";
import { DroneBand } from "@/components/kit/DroneBand";
import { GlassIndex } from "@/components/home/GlassIndex";
import { Plastics } from "@/components/home/Plastics";
import { Machine } from "@/components/home/Machine";
import { Related } from "@/components/home/Related";
import { History } from "@/components/home/History";
import { Brands } from "@/components/home/Brands";
import { NewsStrip } from "@/components/home/NewsStrip";
import { WorksTeaser } from "@/components/works/WorksTeaser";
import { Cta } from "@/components/Cta";
import { works } from "@/content/works";
import { cms, familyThickness, historyTimeline, imagery, productThickness, stripHtml, teaser } from "@/lib/content";
import { brandsOf } from "@/lib/brands";
import { features } from "@/lib/features";
import type { Lang } from "@/lib/i18n";
import { slots } from "@/lib/media-slots";
import { hrefFor } from "@/lib/routes";
import { geoCaption } from "@/lib/seo";

/**
 * The home page, in the rhythm of DIRECTION.md §4.1: frost hero · night warehouse · frost glass index · mist plastics · deep machine ·
 * (frost Έργα, while there are works) · frost related · night history · frost brands · night closing with the footer. Three night
 * chapters; the machine is a blueprint, not a night.
 */
export function HomeView({ lang }: { lang: Lang }) {
  const c = cms(lang);
  const glass = c.groupByKey("yalopinakes");
  const plastics = c.groupByKey("plastika-fylla");
  const related = c.groupByKey("synafi-proionta");
  const plasticsCategory = c.categories[plastics.categories[0]];
  const article = c.site.news[0];
  const service = hrefFor(lang, { kind: "service" });
  // The three latest jobs, newest first (an empty list, and the whole section, until there are real works)
  const latest = [...works].sort((a, b) => b.year - a.year).slice(0, 3);

  return (
    <>
      <Hero lang={lang} productsHref={c.groupHref(glass)} serviceHref={service} />
      <Warehouse lang={lang} facilitiesHref={hrefFor(lang, { kind: "facilities" })} />
      {/* The drone film, once it exists (until then the warehouse chapter carries the scale); daylight, because the page already has its three night chapters */}
      {slots.drone.loop && <DroneBand slot={slots.drone} caption={geoCaption(lang)} lang={lang} theme="frost" />}
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
          values: familyThickness(cat),
        }))}
      />
      <Plastics
        lang={lang}
        allHref={c.groupHref(plastics)}
        image={plastics.image ?? plasticsCategory.image!}
        items={c.productsOf(plasticsCategory).map((p) => ({
          title: p.title,
          href: c.productHref(p),
          image: p.thumb ?? p.image,
          values: productThickness(p.slug),
        }))}
      />
      <Machine lang={lang} serviceHref={service} estimatorHref={`${service}#aitima-kopis`} film={Boolean(slots.machineFilm.loop)} />
      {features.works && <WorksTeaser lang={lang} works={latest} />}
      <Related
        lang={lang}
        allHref={c.groupHref(related)}
        items={c.categoriesOf(related).map((cat) => ({
          href: c.categoryHref(cat),
          title: cat.title,
          summary: teaser(cat.summary || stripHtml(cat.intro), 96),
          image: cat.image,
          count: cat.products.length,
        }))}
      />
      <History lang={lang} items={historyTimeline(lang)} engraving={imagery.engravingNight} serviceHref={service} />
      <Brands lang={lang} brands={brandsOf(c.site.links)} href={hrefFor(lang, { kind: "links" })} />
      <NewsStrip lang={lang} article={{ href: hrefFor(lang, { kind: "article", index: 0 }), date: article.date, title: article.title }} />
      <Cta lang={lang} variant="home" />
    </>
  );
}
