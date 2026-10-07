"use client";

import dynamic from "next/dynamic";
import { startTransition, useEffect, useRef, useState } from "react";
import type { Lang } from "@/lib/i18n";

/** The estimator's code is a chunk of its own, fetched and rendered after the page has settled. */
const CncEstimator = dynamic(() => import("./CncEstimator").then((m) => m.CncEstimator), { ssr: false });

/**
 * The estimator is far below the fold and the biggest island of the page, so it is not part of the page's load: this small shell lets
 * the page hydrate, paint and settle first, then fetches and renders the form while the browser is idle, in a transition (React renders
 * it in slices of a few milliseconds that give way to input and scrolling, so there is no long task and no long frame). The address
 * can ask for it at once (`#aitima-kopis`, `?material=`), and if the section comes within a screen and a half before the idle moment
 * has come, it starts then. Until it is there the section holds the height of the form (`min-height`, set once the shell is alive), so
 * the page below never moves; without JavaScript the header above it offers the plain links.
 */
export function EstimatorGate({ lang, thickness }: { lang: Lang; thickness: Record<string, number[]> }) {
  const box = useRef<HTMLDivElement>(null);
  const [alive, setAlive] = useState(false);
  const [on, setOn] = useState(false);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const mount = () => startTransition(() => setOn(true));
    const wanted = window.location.hash === "#aitima-kopis" || new URLSearchParams(window.location.search).has("material");
    // every state change is made from a callback (an animation frame, a timer, an observer), never in the body of the effect
    const frame = requestAnimationFrame(() => {
      setAlive(true);
      if (wanted) setOn(true);
    });
    let timer = 0;
    let idle = 0;
    const later = () => {
      timer = window.setTimeout(() => {
        if ("requestIdleCallback" in window) idle = window.requestIdleCallback(mount, { timeout: 6000 });
        else mount();
      }, 1500);
    };
    if (document.readyState === "complete") later();
    else window.addEventListener("load", later, { once: true });
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) mount();
      },
      { rootMargin: "1500px 0px" },
    );
    io.observe(el);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(timer);
      if (idle) window.cancelIdleCallback(idle);
      window.removeEventListener("load", later);
      io.disconnect();
    };
  }, []);

  return (
    <div ref={box} className="est-gate" data-alive={alive ? "" : undefined} data-on={on ? "" : undefined}>
      {on && <CncEstimator lang={lang} thickness={thickness} />}
    </div>
  );
}
