import Link from "next/link";
import { Cta } from "@/components/Cta";
import { PageHero } from "@/components/page";
import { t, type Lang } from "@/lib/i18n";
import { hrefFor } from "@/lib/routes";

const EMPTY_LEAD: Record<Lang, string> = {
  el: "Ετοιμάζουμε την παρουσίαση των έργων μας με υαλοπίνακες, πλαστικά φύλλα και CNC κατεργασία. Μέχρι τότε, δείτε τι κόβει η μηχανή μας ή καλέστε μας.",
  en: "We are preparing the presentation of our projects in glass, plastic sheets and CNC machining. Until then, see what our machine cuts or call us.",
};

/**
 * Έργα, the list: a placeholder from the System (the empty state's words and the two actions), so that the page builds and the harness
 * can see it. The Έργα lane replaces it with the frame wall, the filters and the grid of docs/redesign/DIRECTION.md §4.15.
 */
export function WorksView({ lang }: { lang: Lang }) {
  const d = t(lang);
  return (
    <>
      <PageHero variant="index" lang={lang} crumbs={[{ label: d.nav.works }]} title={d.nav.works} lead={EMPTY_LEAD[lang]}>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link href={hrefFor(lang, { kind: "service" })} className="inline-flex min-h-12 items-center justify-center rounded-full bg-fg px-7 font-semibold text-surface">
            {d.nav.serviceLong}
          </Link>
          <Link href={hrefFor(lang, { kind: "group", key: "yalopinakes" })} className="inline-flex min-h-12 items-center justify-center rounded-full border border-line-strong px-7 font-semibold">
            {d.common.viewProducts}
          </Link>
        </div>
      </PageHero>
      <Cta lang={lang} variant="cnc" />
    </>
  );
}
