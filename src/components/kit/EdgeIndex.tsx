"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useMotionValue } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Reveal, ease } from "@/components/reveal";
import { t, type Lang } from "@/lib/i18n";
import { EdgeGauge } from "./EdgeGauge";

export type EdgeRow = {
  href: string;
  title: string;
  /** Shown from lg, two lines (cut it at a word with `teaser`). */
  summary?: string;
  image: string | null;
  /** How many items the row holds: "5 ΕΙΔΗ". */
  count?: number;
  /** The thicknesses of the row's family or product: its gauge. */
  values?: number[];
};

/** A device with a mouse or a trackpad: the cursor preview (the CSS twin of this query is on the preview's wrapper). */
const MOUSE = "(hover: hover) and (pointer: fine)";

/**
 * The catalogue as an index: a row per family or product, read like a list in a rack. Mono index, name (`t-h3`, `t-h2` from lg),
 * a two-line summary (from lg), the thickness gauge (`md` from md, `sm` on phones), a mono count and a round arrow; hairlines
 * between rows, 96px tall from lg. The whole row is one link.
 *
 * Columns (every row has the same ones, so the gauges and counts line up down the list): a phone has name and arrow, md adds the index and
 * the count, lg a column for the gauge, xl a column for the summary.
 *
 * On devices with a mouse a photo follows the cursor (it never downloads on touch); every other device (phones and tablets, at
 * any width) gets a small specimen thumbnail in the row instead. Hover and focus lift the row 4px and let a glint cross it.
 * `titleSize="h3"` keeps the name at `t-h3` from lg too, for compact lists (the siblings of a family, the home related tool wall).
 */
export function EdgeIndex({
  lang,
  rows,
  thumbnails = true,
  titleSize = "h2",
  headingLevel = 3,
  className = "",
}: {
  lang: Lang;
  rows: EdgeRow[];
  thumbnails?: boolean;
  titleSize?: "h2" | "h3";
  headingLevel?: 2 | 3 | 4;
  className?: string;
}) {
  const d = t(lang);
  const Heading = `h${headingLevel}` as "h2" | "h3" | "h4";
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
      { rootMargin: "400px 0px" },
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

  return (
    <ul ref={listRef} className={`edge-index relative border-t border-line ${className}`} onPointerEnter={track} onPointerMove={track} onPointerLeave={() => setActive(null)}>
      {rows.map((row, i) => {
        const number = String(i + 1).padStart(2, "0");
        const count = row.count !== undefined ? d.count(row.count) : "";
        const hasValues = (row.values?.length ?? 0) > 0;
        return (
          <Reveal as="li" key={row.href} delay={Math.min(i, 8) * 0.03} y={12} className="border-b border-line">
            <Link
              href={row.href}
              onPointerEnter={(e) => {
                track(e);
                setActive(i);
              }}
              onFocus={() => setActive(i)}
              className="edge-row group lift glint"
            >
              <span className="edge-row-index t-label text-fg-muted">{number}</span>
              <span className="edge-row-main">
                {thumbnails && row.image && (
                  <span aria-hidden className="edge-thumb specimen-plate">
                    <Image src={row.image} alt="" fill sizes="(min-width: 768px) 96px, 72px" className="object-contain" />
                  </span>
                )}
                <span className="min-w-0">
                  <span className="edge-row-lead t-label text-fg-muted">{count ? `${number} · ${count}` : number}</span>
                  <Heading className={`edge-row-name ${titleSize === "h2" ? "t-h3 t-lg-h2" : "t-h3"} transition-colors group-hover:text-accent`}>{row.title}</Heading>
                  {/* under the name below lg (sm on a phone, md from md); from lg it has a column of its own */}
                  {hasValues && <EdgeGauge values={row.values!} size="sm" lang={lang} className="edge-row-gauge-in" />}
                </span>
              </span>
              <span className="edge-row-summary t-small text-fg-muted">{row.summary}</span>
              <span className="edge-row-gauge">{hasValues && <EdgeGauge values={row.values!} size="md" lang={lang} />}</span>
              <span className="edge-row-count t-label text-fg-muted">{count}</span>
              <span aria-hidden className="edge-row-arrow">
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
            animate={active !== null && rows[active].image ? { opacity: 1, scale: 1, rotate: 0 } : { opacity: 0, scale: 0.85, rotate: -4 }}
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
                  ),
              )}
            </div>
          </motion.div>
        )}
      </motion.div>
    </ul>
  );
}
