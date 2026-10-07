import Image from "next/image";
import Link from "next/link";
import { ArrowLink, Reveal, SectionHeader } from "@/components/ui";
import { excerpt, formatDate, stripHtml } from "@/lib/content";
import { t, type Lang } from "@/lib/i18n";

type Article = { href: string; date: string; title: string; html: string; image: string };

/** The latest article as one card (P3): photo in columns 1–7, date, title and the start of the text in 9–12. */
export function News({ lang, article, allHref }: { lang: Lang; article: Article; allHref: string }) {
  const d = t(lang);
  return (
    <section data-theme="frost" aria-labelledby="news-title" className="bg-surface section-y">
      <div className="shell">
        <SectionHeader
          index="07"
          eyebrow={d.nav.news}
          id="news-title"
          title={d.home.newsTitle}
          size="h1"
          action={<ArrowLink href={allHref}>{d.common.allNews}</ArrowLink>}
        />

        <Reveal className="mt-16 md:mt-24">
          <Link href={article.href} className="group grid gap-8 lg:grid-cols-12 lg:items-center">
            <div className="relative aspect-[16/10] overflow-hidden rounded-sm bg-surface-2 md:aspect-[21/9] lg:col-span-7 lg:aspect-[16/10]">
              <Image
                src={article.image}
                alt=""
                fill
                sizes="(min-width: 1024px) 54vw, 100vw"
                className="object-cover transition-transform duration-[1200ms] group-hover:scale-[1.03]"
                style={{ transitionTimingFunction: "var(--ease-out)" }}
              />
            </div>
            <div className="lg:col-span-4 lg:col-start-9">
              <p className="t-label tabular text-accent">{formatDate(article.date, d.locale)}</p>
              <h3 className="t-h3 mt-5 transition-colors group-hover:text-accent">{article.title}</h3>
              <p className="mt-6 text-fg-muted">{excerpt(stripHtml(article.html), 150)}</p>
            </div>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
