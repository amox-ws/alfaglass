import { Cta } from "@/components/Cta";
import { PageHero, Prose } from "@/components/page";
import { cms, stripHtml } from "@/lib/content";
import type { Lang } from "@/lib/i18n";

const DATE = /(\d{2})\/(\d{2})\/(\d{4})/;

/** Longest first paragraph that can be the formal name of a document (a sentence ends in a full stop and is not one). */
const FORMAL_TITLE_MAX = 100;
/** Longest first paragraph that can be a validity line ("Ισχύει από 01/11/2023"). */
const VALIDITY_MAX = 60;

/**
 * The legacy texts open with a line or two before the text: the formal name of the document ("Πολιτική Προστασίας Δεδομένων …") and
 * the date it applies from. They are lifted into the hero (the name as the lead, the date as a mono line) so that the text starts with
 * its first real paragraph and nothing repeats the title.
 */
function peel(html: string) {
  let rest = html.trimStart();
  let lead: string | null = null;
  let valid: string | null = null;
  for (let i = 0; i < 2; i++) {
    const block = /^<p>([\s\S]*?)<\/p>\s*/.exec(rest);
    if (!block) break;
    const text = stripHtml(block[1]).replace(/\s+:/g, ":");
    if (!valid && DATE.test(text) && text.length <= VALIDITY_MAX) {
      valid = text.replace(DATE, "$1.$2.$3");
    } else if (i === 0 && text.length <= FORMAL_TITLE_MAX && !/[.;:]$/.test(text)) {
      lead = text;
    } else break;
    rest = rest.slice(block[0].length);
  }
  return { lead, valid, html: rest };
}

/**
 * A legal text: crumbs, the title, the date it applies from, then the text flush left with the title at 68 characters (the sections it
 * is divided into have real headings, hairlines between them); wide tables scroll inside their own box.
 */
export function LegalView({ lang, legalKey }: { lang: Lang; legalKey: string }) {
  const page = cms(lang).site.legal[legalKey];
  const { lead, valid, html } = peel(page.html);
  return (
    <>
      <PageHero
        lang={lang}
        crumbs={[{ label: page.title }]}
        title={page.title}
        lead={lead ?? undefined}
      >
        {valid && (
          <p className="hero-rise t-label tabular mt-6 text-fg-muted" style={{ animationDelay: "0.35s" }}>
            {valid}
          </p>
        )}
      </PageHero>
      <section data-theme="frost" className="bg-surface section-y">
        <div className="shell">
          <Prose html={html} className="legal-prose" />
        </div>
      </section>
      <Cta lang={lang} />
    </>
  );
}
