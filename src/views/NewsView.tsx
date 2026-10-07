import Link from "next/link";
import { Cta } from "@/components/Cta";
import { MediaGallery } from "@/components/kit/MediaGallery";
import { SpecimenPlate } from "@/components/kit/SpecimenPlate";
import { Breadcrumbs, PageHero, Prose } from "@/components/page";
import { ArrowLink, MaskedLines, Reveal } from "@/components/ui";
import { cms, stripHtml, teaser } from "@/lib/content";
import { t, type Lang } from "@/lib/i18n";
import { mediaSize } from "@/lib/media";
import { hrefFor } from "@/lib/routes";

/** "2024-11-06" -> "06.11.2024": a date in the spec voice (mono), the same in every language. */
export const monoDate = (iso: string) => iso.split("-").reverse().join(".");

/** What a row shows of an article: the start of its first paragraph, ended at a word; a paragraph that introduces a list ends in "…", not in a colon that leads nowhere. */
const EXCERPT_MAX = 180;

function excerptOf(html: string) {
  const first = /<p[^>]*>([\s\S]*?)<\/p>/i.exec(html)?.[1] ?? html;
  return teaser(stripHtml(first), EXCERPT_MAX).replace(/[:;,]$/, "…");
}

/** The picture of an article that stands for it: the photograph, not the logo (the logo is the first image of this one). */
function coverOf(images: string[]) {
  const photo = images.find((src) => {
    const size = mediaSize(src);
    return size !== null && size.w >= 640;
  });
  return photo ?? images[0];
}

/**
 * The news list (index hero, then one editorial row per article, newest first): the mono date, the title as the link (`t-h1`), the start of
 * the text, and the first photograph on a specimen plate in columns 9–12 (under the text on a phone). The whole row is the link. One article
 * today; the rows are built for many.
 */
export function NewsView({ lang }: { lang: Lang }) {
  const { news } = cms(lang).site;
  const d = t(lang);
  const rows = news.map((n, index) => ({ n, index })).sort((a, b) => b.n.date.localeCompare(a.n.date));
  return (
    <>
      <PageHero variant="index" lang={lang} crumbs={[{ label: d.nav.news }]} title={d.nav.news} lead={d.news.lead} />
      <section data-theme="mist" aria-label={d.nav.news} className="bg-surface section-y">
        <div className="shell">
          <ul className="border-t border-line">
            {rows.map(({ n, index }) => {
              const image = coverOf(n.images);
              const size = mediaSize(image);
              return (
                <Reveal as="li" key={n.slug} className="border-b border-line">
                  <div className="news-row group lift grid gap-10 py-12 lg:grid-cols-12 lg:items-center lg:gap-8 lg:py-16">
                    <div className="lg:col-span-8">
                      <p className="t-label flex items-center gap-3 text-fg-muted">
                        <time dateTime={n.date} className="tabular text-accent">
                          {monoDate(n.date)}
                        </time>
                        <span aria-hidden className="h-px w-8 bg-line-strong" />
                        <span>{d.nav.news}</span>
                      </p>
                      <Link href={hrefFor(lang, { kind: "article", index })} className="news-link mt-6 block">
                        <MaskedLines as="h2" lines={[n.title]} className="t-h1 max-w-[24ch] transition-colors group-hover:text-accent" />
                      </Link>
                      <p className="t-lead mt-6 max-w-[52ch] text-fg-muted">{excerptOf(n.html)}</p>
                      <span aria-hidden className="specimen-arrow news-arrow mt-10">
                        →
                      </span>
                    </div>
                    <div className="lg:col-span-4">
                      <SpecimenPlate
                        src={image}
                        alt=""
                        sizes="(min-width: 1024px) 30vw, 100vw"
                        ratio={size ? `${size.w} / ${size.h}` : undefined}
                        captionRow={false}
                        lang={lang}
                      />
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </ul>
        </div>
      </section>
      <Cta lang={lang} />
    </>
  );
}

/** The article before or after this one in time: a mono label, then its title (two lines at most). */
function Neighbour({ lang, index, dir }: { lang: Lang; index: number; dir: "prev" | "next" }) {
  const d = t(lang);
  const n = cms(lang).site.news[index];
  return (
    <Link href={hrefFor(lang, { kind: "article", index })} rel={dir} className={`group block max-w-[26rem] py-2 ${dir === "next" ? "sm:text-right" : ""}`}>
      <span className="t-label block text-fg-muted">{dir === "prev" ? `← ${d.news.previous}` : `${d.news.next} →`}</span>
      <span className="t-h3 mt-2 line-clamp-2 transition-colors group-hover:text-accent">{n.title}</span>
    </Link>
  );
}

/**
 * An article: crumbs, the mono date, the title (`t-h1`, three lines at most), the text at the lead size in columns 1–8 (68ch) and its
 * pictures on specimen plates in columns 9–12 (a logo is never larger than its file), opening the lightbox. The way back to the list
 * follows, with the neighbouring articles when there are any.
 */
export function ArticleView({ lang, index }: { lang: Lang; index: number }) {
  const { news } = cms(lang).site;
  const n = news[index];
  const d = t(lang);
  const newsHref = hrefFor(lang, { kind: "news" });
  // neighbours in time, whatever the order of the list
  const byDate = news.map((_, i) => i).sort((a, b) => news[a].date.localeCompare(news[b].date));
  const at = byDate.indexOf(index);
  const older = at > 0 ? byDate[at - 1] : undefined;
  const newer = at < byDate.length - 1 ? byDate[at + 1] : undefined;
  return (
    <>
      <section data-theme="frost" className="page-hero-tight relative overflow-hidden bg-surface pt-[calc(var(--header-h)+3rem)] md:pt-[calc(var(--header-h)+5rem)]">
        <div className="shell relative">
          <div className="hero-fade">
            <Breadcrumbs lang={lang} items={[{ label: d.nav.news, href: newsHref }, { label: n.title }]} />
          </div>
          <p className="hero-fade t-label mt-6 flex items-center gap-3 text-fg-muted" style={{ animationDelay: "0.1s" }}>
            <time dateTime={n.date} className="tabular text-accent">
              {monoDate(n.date)}
            </time>
            <span aria-hidden className="h-px w-8 bg-line-strong" />
            <span>{d.nav.news}</span>
          </p>
          <MaskedLines as="h1" eager lines={[n.title]} className="t-h1 mt-5 max-w-[26ch]" />
        </div>
      </section>
      <article data-theme="frost" className="bg-surface section-y">
        <div className="shell grid gap-16 lg:grid-cols-12 lg:gap-8">
          <Reveal className="lg:col-span-8">
            <Prose html={n.html} size="lead" className="[&_li]:text-fg" />
          </Reveal>
          <Reveal delay={0.08} className="article-media lg:col-span-4">
            <MediaGallery
              layout="plates"
              lang={lang}
              label={d.news.images}
              items={n.images.map((src, i) => ({ src, alt: d.news.imageAlt(n.title, i + 1) }))}
            />
          </Reveal>
        </div>
        <div className="shell">
          <nav
            aria-label={d.news.articleNav}
            className={`mt-16 border-t border-line pt-10 md:mt-24 ${older === undefined && newer === undefined ? "" : "grid gap-8 sm:grid-cols-3 sm:items-center"}`}
          >
            {older !== undefined && <Neighbour lang={lang} index={older} dir="prev" />}
            <ArrowLink href={newsHref} className={older === undefined && newer === undefined ? "" : "sm:col-start-2 sm:justify-self-center"}>
              {d.common.allNews}
            </ArrowLink>
            {newer !== undefined && <Neighbour lang={lang} index={newer} dir="next" />}
          </nav>
        </div>
      </article>
      <Cta lang={lang} />
    </>
  );
}
