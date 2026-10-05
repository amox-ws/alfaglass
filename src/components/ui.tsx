"use client";

import Link from "next/link";
import { motion, useInView } from "motion/react";
import { useRef } from "react";

export const ease = [0.22, 1, 0.36, 1] as const;

/** Fade + rise when scrolled into view. */
export function Reveal({
  children,
  delay = 0,
  y = 28,
  className,
  as = "div",
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: "div" | "li" | "p" | "span" | "section";
}) {
  const Comp = motion[as];
  return (
    <Comp
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-8% 0px" }}
      transition={{ duration: 1, ease, delay }}
      className={className}
    >
      {children}
    </Comp>
  );
}

/** Headline whose lines rise out of a mask, one after another. */
export function MaskedLines({
  lines,
  className,
  as: Tag = "h2",
  delay = 0,
  id,
}: {
  lines: string[];
  className?: string;
  as?: "h1" | "h2" | "h3" | "p";
  delay?: number;
  id?: string;
}) {
  const ref = useRef<HTMLHeadingElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  return (
    <Tag ref={ref} id={id} className={className}>
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden pb-[0.06em]">
          <motion.span
            className="block"
            initial={{ y: "105%" }}
            animate={inView ? { y: "0%" } : undefined}
            transition={{ duration: 1.1, ease, delay: delay + i * 0.09 }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}

export function Eyebrow({ index, children, tone = "dark" }: { index?: string; children: React.ReactNode; tone?: "dark" | "light" }) {
  return (
    <p className={`t-label flex items-center gap-3 ${tone === "dark" ? "text-fg-muted" : "text-on-paper-muted"}`}>
      {index && <span className={tone === "dark" ? "text-edge" : "text-cobalt"}>{index}</span>}
      <span aria-hidden className={`h-px w-8 ${tone === "dark" ? "bg-line-strong" : "bg-paper-line"}`} />
      {children}
    </p>
  );
}

export function ArrowLink({
  href,
  children,
  tone = "dark",
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  tone?: "dark" | "light";
  className?: string;
}) {
  const ring = tone === "dark" ? "border-line-strong group-hover:border-edge group-hover:bg-edge group-hover:text-ink" : "border-paper-line group-hover:border-cobalt group-hover:bg-cobalt group-hover:text-paper";
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
