import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { MediaSlot } from "@/components/kit/MediaSlot";
import { RackLines } from "@/components/kit/RackLines";
import { MaskedLines } from "@/components/reveal";
import { excerpt, teaser } from "@/lib/content";
import { mediaSize } from "@/lib/media";
import type { Slot } from "@/lib/media-slots";
import { t, type Lang } from "@/lib/i18n";

export type Crumb = { label: string; href?: string };

/** The current page at the end of the trail is shortened (at a word) beyond this many characters: it repeats the headline below it. */
const CURRENT_CRUMB_MAX = 36;

/**
 * The trail above a page title, the "eyebrow" of the page, in mono.
 * From md it is the whole path: each crumb a 44px target, a separator attached to the crumb before it (so a row
 * never starts with "/"), and the current page shortened, because an article's crumb would repeat its headline.
 * On phones it is one back link (44px) to the nearest parent page, so the eyebrow of a product page is one row and
 * not three.
 */
export function Breadcrumbs({ lang, items }: { lang: Lang; items: Crumb[] }) {
  const d = t(lang);
  const home = { label: d.nav.home, href: lang === "el" ? "/" : `/${lang}` };
  const trail: Crumb[] = [home, ...items];
  const parent = [...items].reverse().find((c): c is Required<Crumb> => Boolean(c.href)) ?? home;
  const link = "inline-flex min-h-11 items-center text-fg-muted transition-colors hover:text-accent";
  return (
    <nav aria-label={d.a11y.breadcrumbs} className="t-label">
      <Link href={parent.href} className={`${link} gap-2.5 md:hidden`}>
        <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden className="shrink-0">
          <path d="M15 8H2M7 3 2 8l5 5" stroke="currentColor" strokeWidth="1.5" fill="none" />
        </svg>
        {parent.label}
      </Link>
      <ol className="hidden flex-wrap items-center md:flex">
        {trail.map((c, i) => (
          <li key={i} className={`flex items-center whitespace-nowrap ${c.href ? "shrink-0" : "min-w-0"}`}>
            {c.href ? (
              /* a short label such as "ΝΕΑ" gets a 44px wide target without moving its neighbours (padding cancelled by margin) */
              <Link href={c.href} className={`${link} ${i > 0 ? "-mx-2.5 px-2.5" : ""}`}>
                {c.label}
              </Link>
            ) : (
              <span aria-current="page" className="truncate text-fg">
                {excerpt(c.label, CURRENT_CRUMB_MAX)}
              </span>
            )}
            {i < trail.length - 1 && (
              <span aria-hidden className="px-2.5 text-fg-dim">
                /
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/** A title longer than this is set one size down (`t-h1`) so a long name stays within three or four lines. */
const LONG_TITLE = 24;

/** Width of the content column at 1440px (shell 1440 − 2 × 56px gutter): a photo narrower than this is never stretched across it. */
const STRIP_MIN_WIDTH = 1328;
/** A full-width strip is at least this wide for its height (21:8); a panorama keeps its own, wider, proportion. */
const STRIP_ASPECT = 21 / 8;
/** On phones a photo is 16:10; only a panorama (wider than 2:1) keeps its own proportion. */
const PHONE_ASPECT = 16 / 10;
/** The lead of a compact or index hero, at every width: two or three lines, ended at a word or a sentence ("…" added), never cut inside a word. */
const COMPACT_LEAD_MAX = 100;

type HeroProps = {
  lang: Lang;
  crumbs: Crumb[];
  title: string;
  lead?: string;
  /** Another page's children go under the text of the hero (actions, a drawing). */
  children?: React.ReactNode;
  /**
   * - `default` (the foundation's hero): a photo beside the title or as a strip, meta under the lead; `compact` is the catalogue's.
   * - `index`: no photo; the title, a mono facts line ("9 ΟΙΚΟΓΕΝΕΙΕΣ · 43 ΕΙΔΗ · 2–19 mm"), a lead clipped to 100 characters, rack lines behind.
   *   The catalogue groups and the news list.
   * - `cinematic`: a full-bleed photo (88svh, 70svh on a phone) with the title bottom-left on a scrim, lead and mono facts under it.
   */
  variant?: "default" | "index" | "cinematic";
  /** default */
  image?: string | null;
  imageAlt?: string;
  meta?: React.ReactNode;
  compact?: boolean;
  /** index and cinematic: the mono facts line. */
  facts?: React.ReactNode;
  /** cinematic: the photograph (or, one day, the film) of the slot; its poster is the LCP. */
  media?: Slot;
  /** cinematic: what an empty slot shows (the CNC hero's dimension line). */
  fallback?: React.ReactNode;
  /** cinematic: the surface under the photo and its scrim, `night` (the default) or `deep`. */
  theme?: "night" | "deep";
  /** cinematic: the alt text of the photo, when the page is not Greek. */
  alt?: string;
};

/**
 * Page title block. Everything in it is in the server HTML and enters with CSS animations, so the headline, lead
 * and photo never wait for JavaScript.
 *
 * The title is one block that wraps and balances itself (no hand-made line breaks, a hyphenated name never splits).
 *
 * `default`: the photo never shows larger than its source: a wide photo runs full width as a strip (a panorama as a wider strip,
 * on phones too), a narrower one sits beside the title at lg and above, at most as wide as the file. `compact`
 * (catalogue pages) always uses the side layout, shows only the start of the lead at every width (two or three lines;
 * the full text belongs in the page's "about" section), puts a 16:9 photo capped at 30svh after the meta on phones
 * and tablets (40svh beside the text from lg) and keeps the space below short, so the first list items stay above
 * the fold at 1440 × 900 and come within about 1.3 screens at 390 × 844.
 *
 * A hero without a strip photo (bare, compact or index) ends one half block gap below its text and the section after it
 * starts one half block gap further down (`.page-hero-tight`, globals.css): the title and the first text are 64px
 * (phones) or 96px (md and up) apart, not the hero's padding plus the next section's.
 */
export function PageHero(props: HeroProps) {
  if (props.variant === "cinematic") return <CinematicHero {...props} />;
  if (props.variant === "index") return <IndexHero {...props} />;
  return <DefaultHero {...props} />;
}

function IndexHero({ lang, crumbs, title, lead, facts, children }: HeroProps) {
  const long = title.length > LONG_TITLE;
  return (
    <section data-theme="frost" className="page-hero-tight relative overflow-hidden bg-surface pt-[calc(var(--header-h)+3rem)] md:pt-[calc(var(--header-h)+5rem)]">
      <RackLines />
      <div className="shell relative">
        <div className="hero-fade">
          <Breadcrumbs lang={lang} items={crumbs} />
        </div>
        <MaskedLines as="h1" eager lines={[title]} className={`mt-5 ${long ? "t-h1 max-w-[30ch]" : "t-display max-w-[18ch]"}`} />
        {facts && (
          <p className="hero-rise t-label mt-6 text-fg-muted" style={{ animationDelay: "0.25s" }}>
            {facts}
          </p>
        )}
        {lead && (
          <p className="hero-rise t-lead mt-5 max-w-[60ch] text-fg-muted" style={{ animationDelay: "0.3s" }}>
            {teaser(lead, COMPACT_LEAD_MAX)}
          </p>
        )}
        {children}
      </div>
    </section>
  );
}

function CinematicHero({ lang, crumbs, title, lead, facts, media = {}, fallback, theme = "night", alt, children }: HeroProps) {
  const still = media.still ?? media.loop?.poster;
  const size = still ? mediaSize(still.src) : null;
  const long = title.length > LONG_TITLE;
  return (
    <section data-theme={theme} data-hero="dark" data-media={still ? "photo" : "none"} className="hero-cine relative isolate flex flex-col justify-between overflow-hidden bg-surface">
      {still && (
        <div className="hero-cine-media" style={size ? { maxWidth: size.w } : undefined}>
          <MediaSlot slot={media} ratio="3 / 2" fill preload sizes="100vw" alt={alt} lang={lang} className="img-settle" />
        </div>
      )}
      {/* Always there, photo or not: over a flat colour the transparent header would otherwise look, to the harness, like text on the page's frost body */}
      <div aria-hidden className="hero-cine-scrim" />
      <div className="shell hero-cine-top relative">
        <div className="hero-fade">
          <Breadcrumbs lang={lang} items={crumbs} />
        </div>
      </div>
      <div className="shell hero-cine-body relative">
        <MaskedLines as="h1" eager lines={[title]} className={long ? "t-h1 max-w-[24ch]" : "t-display max-w-[18ch]"} />
        {lead && (
          <p className="hero-rise t-lead mt-6 max-w-[60ch] text-fg-muted" style={{ animationDelay: "0.25s" }}>
            {lead}
          </p>
        )}
        {facts && (
          <p className="hero-rise t-label mt-6 text-fg-muted" style={{ animationDelay: "0.35s" }}>
            {facts}
          </p>
        )}
        {children}
        {!still && fallback}
      </div>
    </section>
  );
}

function DefaultHero({ lang, crumbs, title, lead, image, imageAlt = "", meta, compact = false, children }: HeroProps) {
  const size = image ? mediaSize(image) : null;
  const ratio = size ? size.w / size.h : null;
  const side = Boolean(image) && (compact || (size !== null && size.w < STRIP_MIN_WIDTH));
  const tight = !image || compact;
  const stripAspect = Math.max(STRIP_ASPECT, ratio ?? 0);
  const phoneAspect = ratio !== null && ratio > 2 ? ratio : PHONE_ASPECT;
  const long = title.length > LONG_TITLE;
  const leadText = lead ? (compact ? teaser(lead, COMPACT_LEAD_MAX) : lead) : null;

  const text = (
    <>
      <div className="hero-fade">
        <Breadcrumbs lang={lang} items={crumbs} />
      </div>
      <MaskedLines as="h1" eager lines={[title]} className={`mt-5 ${long ? "t-h1 max-w-[30ch]" : "t-display max-w-[18ch]"}`} />
      {(lead || meta) && (
        <div className={side ? "" : "mt-6 grid gap-8 lg:grid-cols-12"}>
          {leadText && (
            <p className={`hero-rise t-lead max-w-[60ch] text-fg-muted ${side ? "mt-6" : "lg:col-span-6"}`} style={{ animationDelay: "0.25s" }}>
              {leadText}
            </p>
          )}
          {meta && (
            <div
              className={`hero-rise ${side ? (compact ? "mt-6" : "mt-10") : lead ? "lg:col-span-5 lg:col-start-8" : "lg:col-span-6"}`}
              style={{ animationDelay: "0.35s" }}
            >
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
      className={`relative overflow-hidden bg-surface pt-[calc(var(--header-h)+3rem)] ${compact ? "" : "md:pt-[calc(var(--header-h)+5rem)]"} ${
        tight ? "page-hero-tight" : "pb-16 md:pb-24"
      }`}
    >
      <div aria-hidden className="hero-glow pointer-events-none absolute inset-x-0 top-0 h-[70%]" />
      <div className="shell relative">
        {image && side ? (
          <div className={`grid lg:grid-cols-12 lg:items-start lg:gap-8 ${compact ? "gap-8" : "gap-12"}`}>
            <div className="lg:col-span-7">{text}</div>
            <div className="lg:col-span-5">
              <div
                className={`relative overflow-hidden rounded-sm bg-surface-2 ${compact ? "aspect-video max-h-[30svh] w-full lg:aspect-[4/3] lg:max-h-[40svh] lg:w-auto" : "aspect-[4/3] lg:max-h-[40svh]"}`}
                style={size ? { maxWidth: size.w } : undefined}
              >
                <Image src={image} alt={imageAlt} fill preload sizes="(min-width: 1024px) 40vw, 100vw" className="img-settle object-cover" />
              </div>
            </div>
          </div>
        ) : (
          <>
            {text}
            {image && (
              <div
                className="relative mt-16 aspect-(--hero-aspect-sm) overflow-hidden rounded-sm bg-surface-2 md:mt-24 md:aspect-(--hero-aspect)"
                style={{ "--hero-aspect": stripAspect, "--hero-aspect-sm": phoneAspect } as CSSProperties}
              >
                <Image src={image} alt={imageAlt} fill preload sizes="(min-width: 1728px) 1616px, 100vw" className="img-settle object-cover" />
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
