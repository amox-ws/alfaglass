"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useMotionValue } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Reveal, ease } from "@/components/ui";
import { t, type Lang } from "@/lib/i18n";

export type IndexRow = { href: string; title: string; summary: string; image: string | null; count?: number };

/**
 * Where the summary column starts.
 * - `md` is the original layout: five columns from md, the summary clamped to two lines.
 * - `lg` is for the home index. From md it holds about 25 characters at 768px, which is noise, so below lg the summary sits
 *   under the title instead (the row keeps the phone's stacked layout: number and count above the title, the arrow at the end),
 *   and from lg it has its own column. Its text is cut at a word boundary by the caller (about 110 characters: two lines at 1440,
 *   three at 1024), so the clamp is only a safety net that never triggers.
 */
const COLUMNS = {
  md: {
    grid: "md:grid-cols-[4rem_minmax(0,1.2fr)_minmax(0,1fr)_6rem_3rem] md:py-7",
    summary: "md:line-clamp-2",
    inline: "hidden",
    number: "md:block",
    count: "md:block",
    label: "md:hidden",
  },
  lg: {
    grid: "md:grid-cols-[minmax(0,1fr)_auto] md:py-6 lg:grid-cols-[4rem_minmax(0,1.2fr)_minmax(0,1fr)_6rem_3rem] lg:py-7",
    summary: "lg:line-clamp-3 text-pretty",
    inline: "hidden md:block lg:hidden",
    number: "lg:block",
    count: "lg:block",
    label: "lg:hidden",
  },
} as const;

/** A device with a mouse or a trackpad: the cursor preview (the CSS twin of this query is on the preview's wrapper). */
const MOUSE = "(hover: hover) and (pointer: fine)";

/**
 * Typographic index with a cursor-following image preview on devices with a mouse (`hover: hover` and `pointer: fine`).
 * With `thumbnails`, every other device (CSS `hover: none`: phones and tablets, at any width) gets a small picture and the
 * count in every row instead: the preview needs a pointer, and the markup stays the same everywhere, so a mouse never
 * downloads the thumbnails.
 */
export function IndexList({
  lang,
  rows,
  thumbnails = false,
  summaryFrom = "md",
}: {
  lang: Lang;
  rows: IndexRow[];
  thumbnails?: boolean;
  summaryFrom?: keyof typeof COLUMNS;
}) {
  const d = t(lang);
  const [active, setActive] = useState<number | null>(null);
  // Preview images mount (and load) once the list nears the viewport on devices with a mouse,
  // so the first hover shows the photo instantly and touch devices never download them.
  const [armed, setArmed] = useState(false);
  const listRef = useRef<HTMLUListElement>(null);
  useEffect(() => {
    if (!window.matchMedia(MOUSE).matches || !listRef.current) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setArmed(true);
          io.disconnect();
        }
      },
      { rootMargin: "400px 0px" }
    );
    io.observe(listRef.current);
    return () => io.disconnect();
  }, []);
  // Viewport coordinates: the preview is fixed, so it stays under the cursor 1:1, even while the page scrolls.
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const track = (e: React.PointerEvent) => {
    x.set(e.clientX);
    y.set(e.clientY);
  };
  const columns = COLUMNS[summaryFrom];
  const line = "border-line";
  const muted = "text-fg-muted";
  const hover = "group-hover:text-accent";
  const ring = "border-line-strong group-hover:border-accent group-hover:bg-accent group-hover:text-accent-fg";

  return (
    <ul
      ref={listRef}
      className={`relative border-t ${line}`}
      onPointerEnter={track}
      onPointerMove={track}
      onPointerLeave={() => setActive(null)}
    >
      {rows.map((row, i) => {
        const number = String(i + 1).padStart(2, "0");
        const count = row.count !== undefined ? d.count(row.count) : "";
        return (
          <Reveal as="li" key={row.href} delay={Math.min(i, 8) * 0.03} y={16} className={`border-b ${line}`}>
            <Link
              href={row.href}
              onPointerEnter={(e) => {
                track(e);
                setActive(i);
              }}
              onFocus={() => setActive(i)}
              className={`group grid items-center gap-4 md:gap-8 ${columns.grid} ${
                thumbnails ? "grid-cols-[minmax(0,1fr)_auto] py-4" : "grid-cols-[2.5rem_1fr_auto] py-5"
              }`}
            >
              <span className={`t-label tabular ${muted} ${thumbnails ? `hidden ${columns.number}` : ""}`}>{number}</span>
              <span className="flex min-w-0 items-center gap-4 md:gap-6 lg:gap-4">
                {thumbnails && row.image && (
                  <span
                    aria-hidden
                    className="relative hidden size-18 shrink-0 overflow-hidden rounded-sm bg-surface-2 md:size-24 lg:size-18 [@media(hover:none)]:block"
                  >
                    <Image src={row.image} alt="" fill sizes="(min-width: 768px) and (max-width: 1023px) 96px, 72px" className="object-cover" />
                  </span>
                )}
                <span className="min-w-0">
                  {thumbnails && (
                    <span className={`t-label tabular mb-1 block ${columns.label} ${muted}`}>{count ? `${number} · ${count}` : number}</span>
                  )}
                  <span
                    className={`t-h3 block transition-[transform,color] duration-500 group-hover:translate-x-2 ${hover}`}
                    style={{ transitionTimingFunction: "var(--ease-out)" }}
                  >
                    {row.title}
                  </span>
                  {/* Below the summary column's breakpoint the summary sits in the free space under the title */}
                  {summaryFrom === "lg" && <span className={`t-small mt-2 text-pretty ${columns.inline} ${muted}`}>{row.summary}</span>}
                </span>
              </span>
              <span className={`t-small hidden ${columns.summary} ${muted}`}>{row.summary}</span>
              <span className={`t-label hidden text-right ${columns.count} tabular ${muted}`}>{count}</span>
              <span
                aria-hidden
                className={`flex size-10 items-center justify-center justify-self-end rounded-full border transition-colors duration-300 ${ring}`}
              >
                →
              </span>
            </Link>
          </Reveal>
        );
      })}

      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-30 hidden h-[17rem] w-[13rem] -translate-x-1/2 -translate-y-1/2 [@media(hover:hover)_and_(pointer:fine)]:block"
        style={{ x, y }}
      >
        {armed && (
          <motion.div
            initial={false}
            animate={
              active !== null && rows[active].image
                ? { opacity: 1, scale: 1, rotate: 0 }
                : { opacity: 0, scale: 0.85, rotate: -4 }
            }
            transition={{ duration: 0.4, ease }}
            className="glass absolute inset-0 rounded-[1.1rem] p-2"
          >
            <div className="relative size-full overflow-hidden rounded-[0.7rem] bg-surface-2">
              {rows.map(
                (row, i) =>
                  row.image && (
                    <motion.div
                      key={row.href}
                      initial={false}
                      animate={{ opacity: active === i ? 1 : 0, scale: active === i ? 1 : 1.08 }}
                      transition={{ duration: 0.45, ease }}
                      className="absolute inset-0"
                    >
                      <Image src={row.image} alt="" fill sizes="13rem" loading="eager" className="object-cover" />
                    </motion.div>
                  )
              )}
            </div>
          </motion.div>
        )}
      </motion.div>
    </ul>
  );
}
