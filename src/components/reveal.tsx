"use client";

import { createElement, Fragment, useEffect, useRef, type CSSProperties, type ReactNode } from "react";

export const ease = [0.22, 1, 0.36, 1] as const;

/* ------------------------------------------------------------------ arming */

let observer: IntersectionObserver | null = null;

function intersect(entries: IntersectionObserverEntry[]) {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    (entry.target as HTMLElement).dataset.rv = "in";
    observer?.unobserve(entry.target);
  }
}

/**
 * Hides an element that is below the fold and shows it (CSS transition, see globals.css) when it scrolls into view.
 * Everything is visible in the server HTML: an element that is already on screen, or above it, is left alone,
 * so first-screen content never waits for JavaScript; with reduced motion nothing is hidden at all.
 */
function arm(el: HTMLElement) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (el.getBoundingClientRect().top < window.innerHeight * 0.92) return;
  el.dataset.rv = "hidden";
  observer ??= new IntersectionObserver(intersect, { rootMargin: "0px 0px -8% 0px" });
  observer.observe(el);
  return () => {
    observer?.unobserve(el);
    delete el.dataset.rv;
  };
}

function useArm<T extends HTMLElement>(enabled = true) {
  const ref = useRef<T>(null);
  useEffect(() => {
    if (!enabled || !ref.current) return;
    return arm(ref.current);
  }, [enabled]);
  return ref;
}

/* ------------------------------------------------------------------ components */

/** Fade and rise when scrolled into view. */
export function Reveal({
  children,
  delay = 0,
  y = 28,
  className,
  as = "div",
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: "div" | "li" | "p" | "span" | "section";
}) {
  const ref = useArm<HTMLElement>();
  return createElement(as, { ref, className, style: { "--rv-delay": `${delay}s`, "--rv-y": `${y}px` } as CSSProperties }, children);
}

const HYPHENATED = /\p{L}-\p{L}/u;

/** A hyphenated word ("SAINT-GOBAIN", "LOW-E") stays on one line: the heading may wrap around it, never inside it. */
function keepHyphenated(line: string): ReactNode {
  if (!HYPHENATED.test(line)) return line;
  return line.split(/(\s+)/).map((part, i) =>
    HYPHENATED.test(part) ? (
      <span key={i} className="whitespace-nowrap">
        {part}
      </span>
    ) : (
      part
    ),
  );
}

/**
 * Headline whose lines rise out of a mask, one after another.
 * A title is best passed as one line and left to wrap (the scale classes balance it): the whole block then rises out
 * of its mask. Several lines are for headings that are broken by design, such as the big home titles.
 * `eager` is for headings in the first screen: the entrance is a CSS animation that starts with the first paint
 * and needs no JavaScript. Otherwise the lines rise when the heading scrolls into view.
 * The lines are blocks stacked in a grid, so the white space between them is not rendered and changes no layout;
 * it is what keeps the words apart in the text of the heading (copy and paste, search snippets, screen readers).
 */
export function MaskedLines({
  lines,
  className = "",
  as: Tag = "h2",
  delay = 0,
  id,
  eager = false,
}: {
  lines: string[];
  className?: string;
  as?: "h1" | "h2" | "h3" | "p";
  delay?: number;
  id?: string;
  eager?: boolean;
}) {
  const ref = useArm<HTMLHeadingElement>(!eager);
  return (
    <Tag
      ref={ref}
      id={id}
      className={`mask-lines ${eager ? "mask-eager" : ""} ${className}`}
      style={{ "--rv-delay": `${delay}s` } as CSSProperties}
    >
      {lines.map((line, i) => (
        <Fragment key={i}>
          {i > 0 && " "}
          <span className="mask-line">
            <span style={{ "--i": i } as CSSProperties}>{keepHyphenated(line)}</span>
          </span>
        </Fragment>
      ))}
    </Tag>
  );
}
