import { Reveal } from "@/components/ui";
import { cms } from "@/lib/content";
import { t, type Lang } from "@/lib/i18n";
import { docBytes, formatBytes } from "./docs";

/**
 * The financial statements as a ledger: a row per year, newest first. The year in display type, the title, "PDF" and the weight of
 * the file in mono, and the whole row is the link (a round arrow that fills on hover). The documents are public/docs files.
 */
export function Ledger({ lang }: { lang: Lang }) {
  const d = t(lang);
  const rows = cms(lang)
    .site.financials.filter((f) => f.pdf)
    .reverse();
  return (
    <Reveal>
      <ul className="co-ledger">
        {rows.map((f) => {
          const bytes = docBytes(f.pdf);
          return (
            <li key={f.year}>
              <a href={f.pdf ?? undefined} target="_blank" rel="noreferrer" className="co-line">
                <span className="co-line-key t-h2 tabular">{f.year}</span>
                <span className="co-line-title t-lead">{f.title.replace(new RegExp(`\\s*${f.year}$`), "")}</span>
                <span className="co-line-meta t-label text-fg-muted">
                  {d.common.pdf}
                  {bytes !== null && ` · ${formatBytes(bytes, d.locale)}`}
                </span>
                <span aria-hidden className="co-line-arrow">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M8 1v12M3 8.5l5 5 5-5" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </Reveal>
  );
}
