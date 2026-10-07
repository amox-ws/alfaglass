import { t, type Lang } from "@/lib/i18n";

/**
 * QA only: every page rendered from the fixture works (`NEXT_PUBLIC_WORKS_FIXTURE=1` at build time) carries this full-width banner, so that
 * nobody can take them for real jobs. The variable is inlined at build time, so a production build drops the whole component.
 */
export function FixtureBanner({ lang }: { lang: Lang }) {
  if (process.env.NEXT_PUBLIC_WORKS_FIXTURE !== "1") return null;
  return (
    <div role="note" className="works-fixture t-label">
      {t(lang).works.fixture}
    </div>
  );
}
