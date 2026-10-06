import Image from "next/image";
import Link from "next/link";
import { Hero } from "@/components/home/Hero";
import { Manifesto } from "@/components/home/Manifesto";
import { GlassIndex } from "@/components/home/GlassIndex";
import { Facilities } from "@/components/home/Facilities";
import { Plastics } from "@/components/home/Plastics";
import { History } from "@/components/home/History";
import { Related } from "@/components/home/Related";
import { Cta } from "@/components/home/Cta";
import { Reveal } from "@/components/ui";
import { cms, formatDate, imagery, stripHtml } from "@/lib/content";
import { t, type Lang } from "@/lib/i18n";
import { hrefFor } from "@/lib/routes";

export function HomeView({ lang }: { lang: Lang }) {
  const c = cms(lang);
  const d = t(lang);
  const glass = c.groupByKey("yalopinakes");
  const plastics = c.groupByKey("plastika-fylla");
  const related = c.groupByKey("synafi-proionta");
  const plasticsCategory = c.categories[plastics.categories[0]];
  const article = c.site.news[0];

  return (
    <>
      <Hero lang={lang} productsHref={c.groupHref(glass)} image={imagery.warehouse} />
      <Manifesto lang={lang} companyHref={hrefFor(lang, { kind: "company" })} />
      <GlassIndex
        lang={lang}
        allHref={c.groupHref(glass)}
        rows={c.categoriesOf(glass).map((cat) => ({
          href: c.categoryHref(cat),
          title: cat.title,
          summary: cat.summary || stripHtml(cat.intro),
          image: cat.image,
          count: cat.products.length,
        }))}
      />
      <Facilities lang={lang} trucks={imagery.trucks} facilitiesHref={hrefFor(lang, { kind: "facilities" })} />
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
          summary: cat.summary,
        }))}
      />

      {/* Latest news */}
      <section data-theme="frost" aria-labelledby="news-title" className="bg-surface pb-[clamp(5rem,11vw,11rem)]">
        <div className="shell">
          <div className="flex items-baseline justify-between border-t border-line pt-8">
            <h2 id="news-title" className="t-label text-fg-muted">
              {d.home.newsTitle}
            </h2>
            <Link href={hrefFor(lang, { kind: "news" })} className="link-underline t-label">
              {d.common.allNews} →
            </Link>
          </div>
          <Reveal>
            <Link href={hrefFor(lang, { kind: "article", index: 0 })} className="group mt-10 grid gap-8 md:grid-cols-12 md:items-center">
              <div className="relative aspect-[16/10] overflow-hidden rounded-sm bg-surface-2 md:col-span-5">
                <Image
                  src={article.images[1] ?? article.images[0]}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 40vw, 100vw"
                  className="object-cover transition-transform duration-[1200ms] group-hover:scale-[1.04]"
                  style={{ transitionTimingFunction: "var(--ease-out)" }}
                />
              </div>
              <div className="md:col-span-6 md:col-start-7">
                <p className="t-label tabular text-accent">{formatDate(article.date, d.locale)}</p>
                <h3 className="t-h2 mt-4 transition-colors group-hover:text-accent">{article.title}</h3>
                <p className="mt-5 max-w-[46ch] text-fg-muted">{stripHtml(article.html).slice(0, 150)}…</p>
              </div>
            </Link>
          </Reveal>
        </div>
      </section>

      <Cta lang={lang} />
    </>
  );
}
