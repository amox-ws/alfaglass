"use client";

import { useEffect, useRef, useState } from "react";
import { t, type Lang } from "@/lib/i18n";
import type { Loop } from "@/lib/media-slots";

/** Where a loop may start by itself: a large screen with a mouse, no reduced motion, a good connection, and no data saver. */
function mayAutoplay() {
  try {
    const nav = navigator as Navigator & { connection?: { effectiveType?: string; saveData?: boolean } };
    const c = nav.connection;
    return (
      matchMedia("(min-width: 1024px) and (hover: hover) and (pointer: fine)").matches &&
      !matchMedia("(prefers-reduced-motion: reduce)").matches &&
      (!c || (c.effectiveType === "4g" && !c.saveData))
    );
  } catch {
    return false;
  }
}

/** One observer for every loop on the page: it reports how much of each slot is in view. */
const watchers = new Map<Element, (ratio: number) => void>();
let observer: IntersectionObserver | null = null;
function watch(el: Element, cb: (ratio: number) => void) {
  observer ??= new IntersectionObserver((entries) => entries.forEach((e) => watchers.get(e.target)?.(e.intersectionRatio)), { threshold: [0, 0.1, 0.25, 0.5] });
  watchers.set(el, cb);
  observer.observe(el);
  return () => {
    watchers.delete(el);
    observer?.unobserve(el);
  };
}

/** At most one loop plays at a time in the viewport. */
const playingNow = new Set<HTMLVideoElement>();

/**
 * The film of a slot: a silent loop over its poster (the poster is the LCP, never the video). It starts by itself only where
 * `mayAutoplay` allows, after the page has loaded and the browser is idle, once at least 25% of the slot is in view, and pauses below
 * 10%. Everywhere else (phones, tablets, reduced motion, slow networks) the poster stays and a 44px button plays it on demand.
 * The button is always there (WCAG 2.2.2: a loop over 5 seconds can be paused): it says what the loop shows.
 */
export function MediaLoop({ loop, lang = "el", drift = false }: { loop: Loop; lang?: Lang; drift?: boolean }) {
  const d = t(lang).media;
  const host = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [auto, setAuto] = useState(false);
  const [visible, setVisible] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [playing, setPlaying] = useState(false);
  // the visitor paused it (or asked for it): their choice outranks the rules above
  const [chosen, setChosen] = useState<"play" | "pause" | null>(null);

  // after load, when the browser is idle, a device that may autoplay arms the loop
  useEffect(() => {
    if (!mayAutoplay()) return;
    let handle = 0;
    const idle = "requestIdleCallback" in window;
    const arm = () => {
      handle = idle ? window.requestIdleCallback(() => setAuto(true), { timeout: 2500 }) : window.setTimeout(() => setAuto(true), 800);
    };
    if (document.readyState === "complete") arm();
    else window.addEventListener("load", arm, { once: true });
    return () => {
      window.removeEventListener("load", arm);
      if (idle) window.cancelIdleCallback(handle);
      else window.clearTimeout(handle);
    };
  }, []);

  useEffect(() => {
    if (!host.current) return;
    return watch(host.current, setVisible);
  }, []);

  const wantsPlay = chosen === "play" || (chosen === null && auto && visible >= 0.25);
  const shouldPause = chosen === "pause" || visible < 0.1;

  // mount the video the first time it is wanted (state adjusted while rendering, no effect needed); play and pause it as the rules say
  if (wantsPlay && !mounted) setMounted(true);
  useEffect(() => {
    const v = video.current;
    if (!v) return;
    if (wantsPlay && !shouldPause) void v.play().catch(() => setChosen(null));
    else if (shouldPause && !v.paused) v.pause();
  }, [wantsPlay, shouldPause, mounted]);
  useEffect(() => {
    const v = video.current;
    return () => {
      if (v) playingNow.delete(v);
    };
  }, [mounted]);

  const onPlaying = () => {
    const v = video.current;
    if (!v) return;
    for (const other of playingNow) if (other !== v) other.pause();
    playingNow.add(v);
    setPlaying(true);
  };
  const onPause = () => {
    const v = video.current;
    if (v) playingNow.delete(v);
    setPlaying(false);
  };

  const toggle = () => {
    if (playing) setChosen("pause");
    else {
      setChosen("play");
      if (!mounted) setMounted(true);
      else if (video.current && video.current.paused) void video.current.play().catch(() => {});
    }
  };

  return (
    <div ref={host} className="media-loop">
      {mounted && (
        <video
          ref={video}
          className={`media-loop-video ${drift ? "drift" : ""}`}
          data-playing={playing ? "" : undefined}
          data-qa-dynamic=""
          muted
          loop
          playsInline
          preload="none"
          aria-hidden="true"
          tabIndex={-1}
          onPlaying={onPlaying}
          onPause={onPause}
        >
          {loop.sources.map((s) => (
            <source key={s.src} src={s.src} type={s.type} media={s.media} />
          ))}
        </video>
      )}
      <button type="button" className="media-loop-btn glass glass-thin" aria-pressed={playing} aria-label={playing ? d.pause(loop.label) : d.play(loop.label)} onClick={toggle}>
        <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
          {playing ? <path d="M4 2h3v12H4zM9 2h3v12H9z" fill="currentColor" /> : <path d="M4 2l10 6-10 6z" fill="currentColor" />}
        </svg>
      </button>
    </div>
  );
}
