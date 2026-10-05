import Image from "next/image";
import Link from "next/link";
import { PageHero, Prose } from "@/components/page";
import { ArrowLink, Reveal } from "@/components/ui";
import { EnquiryBand } from "@/components/catalog/views";
import { cms, formatDate, stripHtml } from "@/lib/content";
import { t, type Lang } from "@/lib/i18n";
import { hrefFor } from "@/lib/routes";

export function NewsView({ lang }: { lang: Lang }) {
  const { news } = cms(lang).site;
  const d = t(lang);
  return (
    <>
      <PageHero lang={lang} crumbs={[{ label: d.nav.news }]} title={d.home.newsTitle} lead={d.news.lead} />
      <section data-theme="mist" className="bg-surface section-y">
        <div className="shell">
          <ul className="border-t border-line">
            {news.map((n, index) => (
              <Reveal as="li" key={n.slug} className="border-b border-line">
                <Link href={hrefFor(lang, { kind: "article", index })} className="group grid gap-8 py-10 md:grid-cols-12 md:items-center">
                  <div className="relative aspect-[16/10] overflow-hidden rounded-sm bg-surface-2 md:col-span-4">
                    <Image
                      src={n.images[1] ?? n.images[0]}
                      alt=""
                      fill
                      sizes="(min-width: 768px) 33vw, 100vw"
                      className="object-cover transition-transform duration-[1200ms] group-hover:scale-[1.04]"
                    />
                  </div>
                  <div className="md:col-span-7 md:col-start-6">
                    <p className="t-label tabular text-accent">{formatDate(n.date, d.locale)}</p>
                    <h2 className="t-h2 mt-4 transition-colors group-hover:text-accent">{n.title}</h2>
                    <p className="mt-5 max-w-[52ch] text-fg-muted">{stripHtml(n.html).slice(0, 160)}…</p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>
      <EnquiryBand lang={lang} />
    </>
  );
}

export function ArticleView({ lang, index }: { lang: Lang; index: number }) {
  const n = cms(lang).site.news[index];
  const d = t(lang);
  const newsHref = hrefFor(lang, { kind: "news" });
  return (
    <>
      <PageHero
        lang={lang}
        crumbs={[{ label: d.nav.news, href: newsHref }, { label: n.title }]}
        title={n.title}
        meta={<p className="t-label tabular text-accent">{formatDate(n.date, d.locale)}</p>}
      />
      <article data-theme="frost" className="bg-surface section-y">
        <div className="shell grid gap-12 md:grid-cols-12">
          <Reveal className="md:col-span-6">
            <Prose html={n.html} className="t-lead [&_li]:text-fg" />
            <ArrowLink href={newsHref} className="mt-14">
              {d.common.allNews}
            </ArrowLink>
          </Reveal>
          <div className="grid gap-4 md:col-span-5 md:col-start-8">
            {n.images.map((src, i) => (
              <Reveal key={src} delay={i * 0.08} className="relative aspect-[4/3] overflow-hidden rounded-sm bg-surface-2">
                <Image src={src} alt="" fill sizes="(min-width: 768px) 40vw, 100vw" className={i === 0 ? "object-contain p-10" : "object-cover"} />
              </Reveal>
            ))}
          </div>
        </div>
      </article>
      <EnquiryBand lang={lang} />
    </>
  );
}
