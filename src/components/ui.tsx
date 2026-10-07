import Link from "next/link";
import { MaskedLines, Reveal } from "@/components/reveal";
import { t, type Lang } from "@/lib/i18n";

export { Reveal, MaskedLines, ease } from "@/components/reveal";

export function Eyebrow({ index, children }: { index?: string; children: React.ReactNode }) {
  return (
    <p className="t-label flex items-center gap-3 text-fg-muted">
      {index && <span className="tabular text-accent">{index}</span>}
      <span aria-hidden className="h-px w-8 bg-line-strong" />
      {children}
    </p>
  );
}

export function ArrowLink({
  href,
  children,
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  const ring = "border-line-strong group-hover:border-accent group-hover:bg-accent group-hover:text-accent-fg";
  return (
    <Link href={href} className={`group inline-flex items-center gap-4 font-semibold ${className}`}>
      <span className={`flex size-12 items-center justify-center rounded-full border transition-colors duration-300 ${ring}`}>
        <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden className="transition-transform duration-500 group-hover:translate-x-0.5" style={{ transitionTimingFunction: "var(--ease-out)" }}>
          <path d="M1 8h13M9 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" fill="none" />
        </svg>
      </span>
      <span className="link-underline">{children}</span>
    </Link>
  );
}

const TITLE_SIZE = { display: "t-display", h1: "t-h1", h2: "t-h2" } as const;

/**
 * The one section header (grid pattern P1): eyebrow with index and title on the left (cols 1–7),
 * running text and a link on the right (cols 9–12, bottom-aligned). Below lg the columns stack, because a
 * quarter of the page is too narrow for running text at tablet widths.
 */
export function SectionHeader({
  index,
  eyebrow,
  title,
  as = "h2",
  id,
  size = "display",
  intro,
  action,
  className = "",
}: {
  index?: string;
  eyebrow?: React.ReactNode;
  /** One string per line: each line rises out of its own mask. */
  title: string | string[];
  as?: "h1" | "h2" | "h3";
  id?: string;
  size?: keyof typeof TITLE_SIZE;
  intro?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  const lines = Array.isArray(title) ? title : [title];
  return (
    <div className={`grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-8 ${className}`}>
      <div className="lg:col-span-7">
        {eyebrow && <Eyebrow index={index}>{eyebrow}</Eyebrow>}
        <MaskedLines as={as} id={id} lines={lines} className={`${TITLE_SIZE[size]} ${eyebrow ? "mt-5" : ""}`} />
      </div>
      {(intro || action) && (
        <div className="lg:col-span-4 lg:col-start-9">
          {intro && (
            <Reveal>
              <p className="t-body max-w-[44ch] text-fg-muted">{intro}</p>
            </Reveal>
          )}
          {action && <div className={intro ? "mt-10" : ""}>{action}</div>}
        </div>
      )}
    </div>
  );
}

/**
 * The etched manufacturer's stamp found in the corner of a tempered pane,
 * reinterpreted as the company's own mark of origin.
 */
export function Stamp({ lang, className = "" }: { lang: Lang; className?: string }) {
  const d = t(lang);
  return (
    <div
      role="group"
      aria-label={d.home.stampLabel}
      className={`t-label etched hidden select-none items-stretch rounded-[0.4rem] border border-line-strong leading-none md:flex ${className}`}
    >
      {d.stamp.map((cell, i) => (
        <span key={i} className={`flex items-center px-3 py-2 tabular ${i < d.stamp.length - 1 ? "border-r border-line-strong" : ""}`}>
          {cell}
        </span>
      ))}
    </div>
  );
}
