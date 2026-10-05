import Image from "next/image";
import Link from "next/link";
import { MaskedLines, Reveal } from "@/components/ui";

export type Crumb = { label: string; href?: string };

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Διαδρομή" className="t-label text-fg-dim">
      <ol className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
        <li>
          <Link href="/" className="transition-colors hover:text-accent">
            Αρχική
          </Link>
        </li>
        {items.map((c, i) => (
          <li key={i} className="flex items-center gap-2.5">
            <span aria-hidden>/</span>
            {c.href ? (
              <Link href={c.href} className="transition-colors hover:text-accent">
                {c.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-fg-muted">
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

export function PageHero({
  crumbs,
  title,
  lead,
  image,
  imageAlt = "",
  meta,
  children,
}: {
  crumbs: Crumb[];
  title: string;
  lead?: string;
  image?: string | null;
  imageAlt?: string;
  meta?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <section data-theme="frost" className="relative overflow-hidden bg-surface pb-16 pt-[calc(var(--header-h)+3rem)] md:pb-24 md:pt-[calc(var(--header-h)+5rem)]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[70%]"
        style={{ background: "radial-gradient(80% 100% at 85% 0%, oklch(0.93 0.025 250 / 0.6), transparent 70%)" }}
      />
      <div className="shell relative">
        <Breadcrumbs items={crumbs} />
        <MaskedLines as="h1" lines={headlineLines(title)} className="t-display mt-10 max-w-[18ch] md:mt-14" />
        {(lead || meta) && (
          <div className="mt-10 grid gap-8 md:mt-14 md:grid-cols-12 md:items-end">
            {lead && (
              <Reveal delay={0.15} className="md:col-span-6">
                <p className="t-lead text-fg-muted">{lead}</p>
              </Reveal>
            )}
            {meta && (
              <Reveal delay={0.25} className="md:col-span-5 md:col-start-8">
                {meta}
              </Reveal>
            )}
          </div>
        )}
        {image && (
          <Reveal delay={0.2} className="relative mt-14 aspect-[16/9] overflow-hidden rounded-sm bg-surface-2 md:mt-20 md:aspect-[21/8]">
            <Image src={image} alt={imageAlt} fill priority sizes="100vw" className="object-cover" />
          </Reveal>
        )}
        {children}
      </div>
    </section>
  );
}

export function Prose({ html, className = "" }: { html: string; className?: string }) {
  return (
    <div
      className={`prose-glass text-fg-muted [&_strong]:text-fg ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export function MetaList({ items }: { items: { label: string; value: React.ReactNode }[] }) {
  return (
    <dl className="grid grid-cols-2 gap-x-8 gap-y-5 border-t border-line pt-5">
      {items.map((it) => (
        <div key={it.label}>
          <dt className="t-label text-fg-dim">{it.label}</dt>
          <dd className="mt-1.5 text-lg font-medium text-fg tabular">{it.value}</dd>
        </div>
      ))}
    </dl>
  );
}
