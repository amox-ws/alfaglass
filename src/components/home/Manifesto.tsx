import type { CSSProperties } from "react";
import { Eyebrow, Reveal, Stamp } from "@/components/ui";
import Link from "next/link";
import { t, type Lang } from "@/lib/i18n";

/** Words light up one after another as the statement scrolls through the view (CSS scroll timeline, see globals.css). */
export function Manifesto({ lang, companyHref }: { lang: Lang; companyHref: string }) {
  const h = t(lang).home;
  const emphasis = new Set(h.emphasis);
  const words = h.statement.split(" ");
  // Each word takes its slice of the 12%–68% stretch of the statement's pass through the viewport.
  const at = (i: number) => `${(12 + (56 * i) / words.length).toFixed(2)}%`;

  return (
    <section data-theme="frost" className="relative bg-surface section-y" aria-labelledby="manifesto-title">
      <div className="shell">
        <div className="mb-14 flex items-center justify-between gap-6 md:mb-20">
          <Eyebrow index="01">{h.aboutEyebrow}</Eyebrow>
          <Stamp lang={lang} />
        </div>

        <h2 id="manifesto-title" className="sr-only">
          {h.aboutEyebrow}
        </h2>
        <p className="manifesto font-display max-w-[22ch] text-[clamp(2.4rem,6.2vw,6.6rem)] font-semibold uppercase leading-[0.95] md:max-w-[24ch]">
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

        <div className="mt-16 grid gap-10 md:mt-24 md:grid-cols-12">
          <Reveal className="md:col-span-5 md:col-start-6">
            <p className="text-fg-muted">
              {h.founders}
            </p>
          </Reveal>
          <Reveal delay={0.1} className="flex items-end md:col-span-2 md:col-start-11 md:justify-end">
            <Link href={companyHref} className="text-link t-label text-fg">
              {h.companyLink}
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
