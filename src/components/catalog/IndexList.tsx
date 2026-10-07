"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useMotionValue } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Reveal, ease } from "@/components/ui";
import { t, type Lang } from "@/lib/i18n";

export type IndexRow = { href: string; title: string; summary: string; image: string | null; count?: number };

/** Typographic index with a cursor-following image preview on pointer devices. */
export function IndexList({ lang, rows }: { lang: Lang; rows: IndexRow[] }) {
  const d = t(lang);
  const [active, setActive] = useState<number | null>(null);
  // Preview images mount (and load) once the list nears the viewport on hover-capable devices,
  // so the first hover shows the photo instantly and touch devices never download them.
  const [armed, setArmed] = useState(false);
  const listRef = useRef<HTMLUListElement>(null);
  useEffect(() => {
    if (!window.matchMedia("(hover: hover)").matches || !listRef.current) return;
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
      {rows.map((row, i) => (
        <Reveal as="li" key={row.href} delay={Math.min(i, 8) * 0.03} y={16} className={`border-b ${line}`}>
          <Link
            href={row.href}
            onPointerEnter={(e) => {
              track(e);
              setActive(i);
            }}
            onFocus={() => setActive(i)}
            className="group grid grid-cols-[2.5rem_1fr_auto] items-center gap-4 py-5 md:grid-cols-[4rem_minmax(0,1.2fr)_minmax(0,1fr)_6rem_3rem] md:gap-8 md:py-7"
          >
            <span className={`t-label tabular ${muted}`}>{String(i + 1).padStart(2, "0")}</span>
            <span
              className={`t-h3 transition-[transform,color] duration-500 group-hover:translate-x-2 ${hover}`}
              style={{ transitionTimingFunction: "var(--ease-out)" }}
            >
              {row.title}
            </span>
            <span className={`t-small hidden md:line-clamp-2 ${muted}`}>{row.summary}</span>
            <span className={`t-label hidden text-right md:block tabular ${muted}`}>
              {row.count !== undefined ? d.count(row.count) : ""}
            </span>
            <span
              aria-hidden
              className={`flex size-10 items-center justify-center justify-self-end rounded-full border transition-colors duration-300 ${ring}`}
            >
              →
            </span>
          </Link>
        </Reveal>
      ))}

      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-30 hidden h-[17rem] w-[13rem] -translate-x-1/2 -translate-y-1/2 [@media(hover:hover)]:block"
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
