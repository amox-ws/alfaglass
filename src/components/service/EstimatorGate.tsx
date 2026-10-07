"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import type { Lang } from "@/lib/i18n";

/** The estimator's code is a chunk of its own, fetched and rendered only when the section is near. */
const CncEstimator = dynamic(() => import("./CncEstimator").then((m) => m.CncEstimator), { ssr: false });

/**
 * The estimator is far below the fold and the biggest island of the page, so it is not part of the page's load: this small shell waits
 * until the section is within a screen and a half of the viewport (or the address asks for it: `#aitima-kopis`, `?material=`) and only
 * then fetches and renders the form. Until then the section holds its place (`min-height`, set once the shell is alive, so the page
 * below does not move when the form arrives) and, without JavaScript, the header above it offers the plain links.
 */
export function EstimatorGate({ lang, thickness }: { lang: Lang; thickness: Record<string, number[]> }) {
  const box = useRef<HTMLDivElement>(null);
  const [alive, setAlive] = useState(false);
  const [on, setOn] = useState(false);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const wanted = window.location.hash === "#aitima-kopis" || new URLSearchParams(window.location.search).has("material");
    // every state change is made from a callback (an animation frame, an observer), never in the body of the effect
    const frame = requestAnimationFrame(() => {
      setAlive(true);
      if (wanted) setOn(true);
    });
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setOn(true);
      },
      { rootMargin: "1500px 0px" },
    );
    io.observe(el);
    return () => {
      cancelAnimationFrame(frame);
      io.disconnect();
    };
  }, []);

  return (
    <div ref={box} className="est-gate" data-alive={alive ? "" : undefined} data-on={on ? "" : undefined}>
      {on && <CncEstimator lang={lang} thickness={thickness} />}
    </div>
  );
}
