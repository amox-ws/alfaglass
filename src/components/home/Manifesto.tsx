import type { CSSProperties } from "react";
import Link from "next/link";
import { Eyebrow, Reveal, Stamp } from "@/components/ui";
import { t, type Lang } from "@/lib/i18n";

/** Words light up one after another as the statement scrolls through the view (CSS scroll timeline, see globals.css). */
export function Manifesto({ lang, companyHref }: { lang: Lang; companyHref: string }) {
  const h = t(lang).home;
  const emphasis = new Set(h.emphasis);
  const words = h.statement.split(" ");
  // Each word takes its slice of the 11%–63% stretch of the statement's pass through the viewport.
  const at = (i: number) => `${(11 + (52 * i) / words.length).toFixed(2)}%`;

  return (
    <section data-theme="frost" className="relative bg-surface section-y" aria-labelledby="manifesto-title">
      <div className="shell">
        <div className="flex items-center justify-between gap-6">
          <Eyebrow index="01">{h.aboutEyebrow}</Eyebrow>
          <Stamp lang={lang} />
        </div>

        <h2 id="manifesto-title" className="sr-only">
          {h.aboutEyebrow}
        </h2>
        <p className="manifesto font-display mt-16 max-w-[22ch] text-[clamp(2.4rem,6.2vw,6.6rem)] font-semibold uppercase leading-[0.95] md:mt-24 md:max-w-[24ch]">
          {words.map((w, i) => (
            <span
              key={i}
              className={`manifesto-word inline-block pr-[0.22em] ${emphasis.has(w) ? "text-accent" : ""}`}
              style={{ "--from": at(i), "--to": at(i + 1) } as CSSProperties}
            >
              {w}
            </span>
          ))}
        </p>

        {/* P2: running text from column 6; the link sits under it */}
        <div className="mt-16 grid md:mt-24 lg:grid-cols-12 lg:gap-8">
          <Reveal className="lg:col-span-5 lg:col-start-6">
            <p className="max-w-[68ch] text-fg-muted">{h.founders}</p>
            <Link href={companyHref} className="text-link mt-10 font-semibold text-fg">
              {h.companyLink}
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
