import Link from "next/link";
import { t, type Lang } from "@/lib/i18n";

/**
 * The top of the closing chapter: the latest article in one line, a mono date, its title and an arrow, over a hairline. It lies on the
 * same night surface as the closing call that follows it, so the two read as one chapter. (One article does not deserve a section.)
 */
export function NewsStrip({ lang, article }: { lang: Lang; article: { href: string; date: string; title: string } }) {
  const d = t(lang);
  // "2024-11-06" → "06.11.2024"
  const date = article.date.split("-").reverse().join(".");
  return (
    <section data-theme="night" aria-label={d.nav.news} className="bg-surface pt-10 md:pt-14">
      <div className="shell">
        <Link href={article.href} className="news-strip group">
          <time dateTime={article.date} className="news-strip-date t-label tabular text-fg-muted">
            {date}
          </time>
          <span className="t-h3 transition-colors group-hover:text-accent">{article.title}</span>
          <span aria-hidden className="edge-row-arrow">
            →
          </span>
        </Link>
      </div>
    </section>
  );
}
