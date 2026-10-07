"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import { PillArrow } from "@/components/kit/PillArrow";
import { RackLines } from "@/components/kit/RackLines";
import { Units } from "@/components/kit/Units";
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

export function Hero({ lang, productsHref, serviceHref }: { lang: Lang; productsHref: string; serviceHref: string }) {
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

      {/* The twelve column lines of the shell: the uprights of a glass rack (four on a phone). Over the 3D canvas, which paints its own frost, and under everything else */}
      <RackLines />

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

      {/* Top meta row: two mono labels */}
      <div
        className="hero-fade shell t-label absolute inset-x-0 top-[calc(var(--header-h)+1.5rem)] flex justify-between text-fg-muted"
        style={{ animationDelay: "0.6s" }}
      >
        <span>{h.since}</span>
        <span className="hidden sm:inline">{h.location}</span>
      </div>

      {/* Bottom row */}
      <div className="shell absolute inset-x-0 bottom-0 pb-8 md:pb-12">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          {/* Barely delayed: on phones this paragraph is the largest text in view, so it is what "loaded" waits for */}
          <div className="hero-rise max-w-[34rem]" style={{ animationDelay: "0.1s" }}>
            <p className="t-lead text-fg-muted">
              <span className="text-fg">{h.leadStrong}</span>
              {h.leadRest}
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link href={productsHref} className="btn-pill btn-pill-dark">
                {d.common.viewProducts}
                <PillArrow />
              </Link>
              <a
                href={contact.phoneHref}
                className="btn-pill glass glass-thin glass-sheen gap-2"
              >
                {d.common.callUs} <span className="font-mono tabular text-fg-muted">{d.contact.phone}</span>
              </a>
            </div>
            {/* The second pillar: one mono line, not a banner. Under the buttons; on a short screen from lg it moves to the right-hand column instead */}
            <CncLine href={serviceHref} text={h.cncLine} className="hero-cnc-main mt-3" />
          </div>

          {/* The right-hand column (from lg): the crate label, what is stencilled on the side of every crate that leaves the warehouse (from xl),
              and, on a short screen, the second pillar's line */}
          <div className="hero-fade hidden flex-col items-end gap-3 lg:flex" style={{ animationDelay: "1.1s" }}>
            <div role="group" aria-label={h.stampLabel} className="hero-crate t-label hidden xl:flex">
              {d.stamp.map((cell) => (
                <span key={cell} className="hero-crate-cell tabular">
                  <Units>{cell}</Units>
                </span>
              ))}
            </div>
            <CncLine href={serviceHref} text={h.cncLine} className="hero-cnc-side" />
          </div>
        </div>
      </div>
    </section>
  );
}

/** "Νέο · CNC κοπή φύλλων έως 2,1 × 6,05 m →": a mono link line, its units in SI case, a 44px target. */
function CncLine({ href, text, className = "" }: { href: string; text: string; className?: string }) {
  return (
    <Link href={href} className={`text-link t-label text-fg ${className}`}>
      <span>
        <Units>{text}</Units>
      </span>
      <span aria-hidden className="ml-3 text-accent">
        →
      </span>
    </Link>
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
 * Each pane shows a copy of the headline that lies exactly on the real one (a lighter ink and a colour fringe read as
 * glass; the geometry is in globals.css, "scroll scenes"), and nothing in it repaints while scrolling:
 * only transform and opacity move.
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
