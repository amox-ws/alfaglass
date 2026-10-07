"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import { contact } from "@/lib/content";
import { t, type Lang } from "@/lib/i18n";

const GlassScene = dynamic(() => import("./GlassScene"), { ssr: false });

let glassSupport: boolean | null = null;

/**
 * Real-time glass only where it stays smooth: a large screen with a mouse, at least four cores and 4 GB,
 * no reduced motion and no data saver (WebGL 2 is checked later, when the browser is idle: opening a GL context
 * is a round trip to the GPU process and must not sit in the middle of hydration).
 * Everything else gets the CSS panes. Cached: it never changes during a session.
 */
function mayRunGlass() {
  if (glassSupport === null) {
    try {
      const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
      glassSupport =
        matchMedia("(min-width: 1024px) and (hover: hover) and (pointer: fine)").matches &&
        !matchMedia("(prefers-reduced-motion: reduce)").matches &&
        (nav.hardwareConcurrency ?? 4) >= 4 &&
        (nav.deviceMemory ?? 8) >= 4 &&
        !nav.connection?.saveData;
    } catch {
      glassSupport = false;
    }
  }
  return glassSupport;
}

function hasWebGL2() {
  try {
    return !!document.createElement("canvas").getContext("webgl2");
  } catch {
    return false;
  }
}

const noopSubscribe = () => () => {};

export function Hero({ lang, productsHref }: { lang: Lang; productsHref: string }) {
  const d = t(lang);
  const h = d.home;
  const section = useRef<HTMLElement>(null);
  // null on the server and while hydrating, then the device's answer
  const glass = useSyncExternalStore(noopSubscribe, mayRunGlass, () => null);
  const [load3d, setLoad3d] = useState(false);
  const [ready, setReady] = useState(false);
  const [inView, setInView] = useState(true);
  // Set if the 3D scene cannot hold its frame rate here, or WebGL 2 turns out to be missing: the CSS panes take over for good.
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin: "120px" });
    if (section.current) io.observe(section.current);
    return () => io.disconnect();
  }, []);

  // The 3D scene waits for the page to load and the browser to go idle, so it never delays the page or a first tap.
  useEffect(() => {
    if (!glass) return;
    const hasIdle = "requestIdleCallback" in window;
    let handle = 0;
    const start = () => (hasWebGL2() ? setLoad3d(true) : setSlow(true));
    const schedule = () => {
      handle = hasIdle ? window.requestIdleCallback(start, { timeout: 2500 }) : window.setTimeout(start, 800);
    };
    if (document.readyState === "complete") schedule();
    else window.addEventListener("load", schedule, { once: true });
    return () => {
      window.removeEventListener("load", schedule);
      if (hasIdle) window.cancelIdleCallback(handle);
      else window.clearTimeout(handle);
    };
  }, [glass]);

  const mode = glass === null ? "auto" : glass && !slow ? "3d" : "css";
  const show3d = ready && !slow;

  return (
    <section
      ref={section}
      data-theme="frost"
      data-glass={mode}
      className="hero relative h-[100svh] min-h-[41rem] overflow-hidden md:min-h-[38rem]"
      aria-label={d.a11y.intro}
    >
      {/* 3D stage (desktop) */}
      {/* If the scene proves too slow it stops rendering at once and fades out while the CSS panes come in. */}
      {load3d && (
        <div className={`absolute inset-0 transition-opacity duration-[1600ms] ${show3d ? "opacity-100" : "opacity-0"}`}>
          <GlassScene active={inView && !slow} onReady={() => setReady(true)} onSlow={() => setSlow(true)} lines={h.heroLines} />
        </div>
      )}

      {/* Headline: in the HTML from the first paint; the 3D type replaces it once the scene is ready */}
      <div className="hero-title-stage pointer-events-none">
        <h1
          className={`hero-rise t-mega text-balance text-center transition-opacity duration-[1200ms] ${show3d ? "opacity-0" : ""}`}
          style={{ transitionTimingFunction: "var(--ease-out)" }}
        >
          {h.heroTitle[0]} <br className="hidden sm:block" />
          {h.heroTitle[1]}
        </h1>
      </div>

      <HeroPanes title={h.heroTitle} />

      {/* Vignette for legibility of overlay copy */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, color-mix(in oklch, var(--surface) 70%, transparent) 0%, transparent 22%, transparent 62%, var(--surface) 100%)",
        }}
      />

      {/* Top meta row */}
      <div
        className="hero-fade shell t-label absolute inset-x-0 top-[calc(var(--header-h)+1.5rem)] flex justify-between text-fg-muted"
        style={{ animationDelay: "0.6s" }}
      >
        <span>{h.since}</span>
        <span className="hidden sm:inline">{h.location}</span>
      </div>

      {/* Bottom row */}
      <div className="shell absolute inset-x-0 bottom-0 pb-8 md:pb-12">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          {/* Barely delayed: on phones this paragraph is the largest text in view, so it is what "loaded" waits for */}
          <div className="hero-rise max-w-[34rem]" style={{ animationDelay: "0.1s" }}>
            <p className="t-lead text-fg-muted">
              <span className="text-fg">{h.leadStrong}</span>
              {h.leadRest}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href={productsHref}
                className="group inline-flex items-center gap-3 rounded-full bg-fg py-3 pl-6 pr-3 font-semibold text-surface transition-colors hover:bg-accent"
              >
                {d.common.viewProducts}
                <span className="flex size-8 items-center justify-center rounded-full bg-surface text-fg transition-transform duration-500 group-hover:translate-x-0.5">
                  →
                </span>
              </Link>
              <a
                href={contact.phoneHref}
                className="glass glass-thin glass-sheen relative inline-flex items-center gap-2 rounded-full px-6 py-3 font-semibold"
              >
                {d.common.callUs} <span className="tabular text-fg-muted">{d.contact.phone}</span>
              </a>
            </div>
          </div>

          <div className="hero-fade hidden items-center gap-4 md:flex" style={{ animationDelay: "1.1s" }}>
            <span className="t-label text-fg-dim">{d.common.scroll}</span>
            <span className="relative block h-14 w-px overflow-hidden bg-line">
              <span className="absolute inset-x-0 top-0 h-1/2 animate-[scrollcue_2.2s_var(--ease-in-out)_infinite] bg-accent" />
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Same layout as the 3D panes (x offset, angle, relative height). */
const PANES = [
  { x: -0.34, rot: 0.62, h: 1.0 },
  { x: -0.12, rot: -0.38, h: 1.12 },
  { x: 0.1, rot: 0.48, h: 0.94 },
  { x: 0.32, rot: -0.56, h: 1.06 },
];

/**
 * Glass panes in plain CSS for phones, tablets and any desktop that skips the 3D scene.
 * Each pane shows a shifted, softened copy of the headline behind it, which reads as refraction,
 * and nothing in it repaints while scrolling: only transform and opacity move.
 */
function HeroPanes({ title }: { title: string[] }) {
  return (
    <div aria-hidden className="hero-panes">
      {PANES.map((p, i) => (
        <div
          key={i}
          className="hero-pane"
          data-edge={i === 0 || i === PANES.length - 1 ? "" : undefined}
          style={{ "--x": p.x, "--rot": `${p.rot}rad`, "--h": p.h, "--i": i } as CSSProperties}
        >
          <div className="hero-pane-view">
            <div className="hero-title-stage">
              <p className="t-mega text-balance text-center">
                {title[0]} <br className="hidden sm:block" />
                {title[1]}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
