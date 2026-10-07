import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { MaskedLines } from "@/components/reveal";
import { mediaSize } from "@/lib/media";
import { t, type Lang } from "@/lib/i18n";

export type Crumb = { label: string; href?: string };

/** Each crumb is a 44px-tall target; the row is the "eyebrow" of a page title. */
export function Breadcrumbs({ lang, items }: { lang: Lang; items: Crumb[] }) {
  const d = t(lang);
  const link = "flex min-h-11 min-w-11 items-center text-fg-muted transition-colors hover:text-accent";
  return (
    <nav aria-label={d.a11y.breadcrumbs} className="t-label">
      <ol className="flex flex-wrap items-center gap-x-2.5">
        <li>
          <Link href={lang === "el" ? "/" : `/${lang}`} className={link}>
            {d.nav.home}
          </Link>
        </li>
        {items.map((c, i) => (
          <li key={i} className="flex items-center gap-2.5">
            <span aria-hidden className="text-fg-dim">
              /
            </span>
            {c.href ? (
              <Link href={c.href} className={link}>
                {c.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-fg">
                {c.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/** Split line breaks for display headlines: long titles are broken into ~2-3 lines. */
export function headlineLines(title: string, maxChars = 18) {
  const words = title.split(" ");
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    if ((cur + " " + w).trim().length > maxChars && cur) {
      lines.push(cur);
      cur = w;
    } else cur = (cur + " " + w).trim();
  }
  if (cur) lines.push(cur);
  return lines;
}

/** A title longer than this is set one size down (`t-h1`) so a long name stays within three or four lines. */
const LONG_TITLE = 24;

/** Width of the content column at 1440px (shell 1440 − 2 × 56px gutter): a photo narrower than this is never stretched across it. */
const STRIP_MIN_WIDTH = 1328;
/** A full-width strip is at least this wide for its height (21:8); a panorama keeps its own, wider, proportion. */
const STRIP_ASPECT = 21 / 8;

/**
 * Page title block. Everything in it is in the server HTML and enters with CSS animations, so the headline, lead
 * and photo never wait for JavaScript.
 *
 * The photo never shows larger than its source: a wide photo runs full width as a strip (a panorama as a wider strip),
 * a narrower one sits beside the title at lg and above, at most as wide as the file. `compact` (catalogue pages)
 * always uses the side layout, caps the photo at 40svh and keeps the space below it short, so the first list
 * items stay above the fold.
 */
export function PageHero({
  lang,
  crumbs,
  title,
  lead,
  image,
  imageAlt = "",
  meta,
  compact = false,
  children,
}: {
  lang: Lang;
  crumbs: Crumb[];
  title: string;
  lead?: string;
  image?: string | null;
  imageAlt?: string;
  meta?: React.ReactNode;
  compact?: boolean;
  children?: React.ReactNode;
}) {
  const size = image ? mediaSize(image) : null;
  const side = Boolean(image) && (compact || (size !== null && size.w < STRIP_MIN_WIDTH));
  const stripAspect = size ? Math.max(STRIP_ASPECT, size.w / size.h) : STRIP_ASPECT;
  const long = title.length > LONG_TITLE;

  const text = (
    <>
      <div className="hero-fade">
        <Breadcrumbs lang={lang} items={crumbs} />
      </div>
      <MaskedLines
        as="h1"
        eager
        lines={headlineLines(title, long ? 28 : 18)}
        className={`mt-5 ${long ? "t-h1 max-w-[30ch]" : "t-display max-w-[18ch]"}`}
      />
      {(lead || meta) && (
        <div className={side ? "" : "mt-6 grid gap-8 lg:grid-cols-12"}>
          {lead && (
            <p className={`hero-rise t-lead max-w-[52ch] text-fg-muted ${side ? "mt-6" : "lg:col-span-6"}`} style={{ animationDelay: "0.25s" }}>
              {lead}
            </p>
          )}
          {meta && (
            <div className={`hero-rise ${side ? "mt-10" : "lg:col-span-5 lg:col-start-8"}`} style={{ animationDelay: "0.35s" }}>
              {meta}
            </div>
          )}
        </div>
      )}
    </>
  );

  return (
    <section
      data-theme="frost"
      className={`relative overflow-hidden bg-surface pt-[calc(var(--header-h)+3rem)] md:pt-[calc(var(--header-h)+5rem)] ${
        compact ? "pb-12 md:pb-14" : "pb-16 md:pb-24"
      }`}
    >
      <div aria-hidden className="hero-glow pointer-events-none absolute inset-x-0 top-0 h-[70%]" />
      <div className="shell relative">
        {image && side ? (
          <div className="grid gap-12 lg:grid-cols-12 lg:items-start lg:gap-8">
            <div className="lg:col-span-7">{text}</div>
            <div className="lg:col-span-5">
              <div
                className="relative aspect-[4/3] overflow-hidden rounded-sm bg-surface-2 lg:max-h-[40svh]"
                style={size ? { maxWidth: size.w } : undefined}
              >
                <Image src={image} alt={imageAlt} fill priority sizes="(min-width: 1024px) 40vw, 100vw" className="img-settle object-cover" />
              </div>
            </div>
          </div>
        ) : (
          <>
            {text}
            {image && (
              <div
                className="relative mt-16 aspect-[16/10] overflow-hidden rounded-sm bg-surface-2 md:mt-24 md:aspect-(--hero-aspect)"
                style={{ "--hero-aspect": stripAspect } as CSSProperties}
              >
                <Image src={image} alt={imageAlt} fill priority sizes="(min-width: 1728px) 1616px, 100vw" className="img-settle object-cover" />
              </div>
            )}
          </>
        )}
        {children}
      </div>
    </section>
  );
}

/** Legacy CMS html. `size="lead"` sets it in the lead size (news articles). */
export function Prose({ html, className = "", size = "body" }: { html: string; className?: string; size?: "body" | "lead" }) {
  return (
    <div
      className={`prose-glass ${size === "lead" ? "prose-lead" : ""} text-fg-muted [&_strong]:text-fg ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export function MetaList({ items }: { items: { label: string; value: React.ReactNode }[] }) {
  return (
    <dl className="grid grid-cols-2 gap-x-8 gap-y-5 border-t border-line pt-5">
      {items.map((it) => (
        <div key={it.label}>
          <dt className="t-label text-fg-muted">{it.label}</dt>
          <dd className="t-lead mt-2 font-medium text-fg tabular">{it.value}</dd>
        </div>
      ))}
    </dl>
  );
}
