"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Plays a short CSS sequence once, when half of the element is on screen. On mount, an element that is not yet half in view is put in
 * its first frame (`data-play="wait"`) and switches to `data-play="go"` as it comes in; after `duration` ms it is `data-play="done"`.
 * The stylesheet keys the sequence to "wait" and "go" (anything else is the finished state). Without JavaScript, with reduced motion,
 * or when the element is already in view at load, nothing is set: the finished state. `replay` adds a "↻" button that plays it again.
 */
export function PlayOnView({
  className = "",
  duration,
  replay,
  children,
}: {
  className?: string;
  duration: number;
  /** The accessible name of the replay button; without it there is none. */
  replay?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const timer = useRef(0);

  const play = (el: HTMLElement) => {
    window.clearTimeout(timer.current);
    el.dataset.play = "go";
    timer.current = window.setTimeout(() => (el.dataset.play = "done"), duration);
  };

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = el.getBoundingClientRect();
    const visible = Math.min(r.bottom, innerHeight) - Math.max(r.top, 0);
    if (visible >= r.height * 0.5) return;
    el.dataset.play = "wait";
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        play(el);
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      window.clearTimeout(timer.current);
    };
    // `play` only reads refs and `duration`, which is fixed for an element
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const again = () => {
    const el = ref.current;
    if (!el) return;
    el.dataset.play = "wait";
    // the first frame has to be applied before the sequence starts again, or the transitions have nothing to run from
    void el.offsetWidth;
    play(el);
  };

  return (
    <div ref={ref} className={className}>
      {children}
      {replay && (
        <button type="button" className="play-again" onClick={again} aria-label={replay}>
          <span aria-hidden>↻</span>
        </button>
      )}
    </div>
  );
}
