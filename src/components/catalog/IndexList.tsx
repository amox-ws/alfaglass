"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useMotionValue, useSpring } from "motion/react";
import { useState } from "react";
import { Reveal, ease } from "@/components/ui";

export type IndexRow = { href: string; title: string; summary: string; image: string | null; count?: number };

/** Typographic index with a cursor-following image preview on pointer devices. */
export function IndexList({ rows }: { rows: IndexRow[] }) {
  const [active, setActive] = useState<number | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 26, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 220, damping: 26, mass: 0.6 });
  const line = "border-line";
  const muted = "text-fg-muted";
  const hover = "group-hover:text-accent";
  const ring = "border-line-strong group-hover:border-accent group-hover:bg-accent group-hover:text-accent-fg";

  return (
    <ul
      className={`relative border-t ${line}`}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        x.set(e.clientX - r.left);
        y.set(e.clientY - r.top);
      }}
      onPointerLeave={() => setActive(null)}
    >
      {rows.map((row, i) => (
        <Reveal as="li" key={row.href} delay={Math.min(i, 8) * 0.03} y={16} className={`border-b ${line}`}>
          <Link
            href={row.href}
            onPointerEnter={() => setActive(i)}
            onFocus={() => setActive(i)}
            className="group grid grid-cols-[2.5rem_1fr_auto] items-center gap-4 py-5 md:grid-cols-[4rem_minmax(0,1.2fr)_minmax(0,1fr)_6rem_3rem] md:gap-8 md:py-7"
          >
            <span className={`tabular text-sm ${muted}`}>{String(i + 1).padStart(2, "0")}</span>
            <span
              className={`t-h3 transition-[transform,color] duration-500 group-hover:translate-x-2 ${hover}`}
              style={{ transitionTimingFunction: "var(--ease-out)" }}
            >
              {row.title}
            </span>
            <span className={`hidden text-[0.95rem] leading-snug md:line-clamp-2 ${muted}`}>{row.summary}</span>
            <span className={`t-label hidden text-right md:block tabular ${muted}`}>
              {row.count !== undefined ? `${row.count} ${row.count === 1 ? "είδος" : "είδη"}` : ""}
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
        className="pointer-events-none absolute left-0 top-0 z-10 hidden h-[17rem] w-[13rem] -translate-x-1/2 -translate-y-1/2 [@media(hover:hover)]:block"
        style={{ x: sx, y: sy }}
      >
        <AnimatePresence>
          {active !== null && rows[active].image && (
            <motion.div
              key={active}
              initial={{ opacity: 0, scale: 0.85, rotate: -4 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.45, ease }}
              className="absolute inset-0 overflow-hidden rounded-sm bg-surface-2 shadow-[0_30px_60px_-20px_oklch(0.2_0.06_282/0.45)]"
            >
              <Image src={rows[active].image!} alt="" fill sizes="13rem" className="object-cover" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </ul>
  );
}
