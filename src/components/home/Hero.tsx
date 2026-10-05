"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { motion } from "motion/react";
import { contact } from "@/lib/content";

const GlassScene = dynamic(() => import("./GlassScene"), { ssr: false });

const ease = [0.22, 1, 0.36, 1] as const;

let webglSupport: boolean | null = null;

/** WebGL available and the visitor has not asked for reduced motion. Cached: it never changes during a session. */
function wantsGlass() {
  if (webglSupport === null) {
    try {
      const c = document.createElement("canvas");
      const gl = !!(c.getContext("webgl2") || c.getContext("webgl"));
      webglSupport = gl && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch {
      webglSupport = false;
    }
  }
  return webglSupport;
}

const noopSubscribe = () => () => {};

export function Hero() {
  const section = useRef<HTMLElement>(null);
  const webgl = useSyncExternalStore(noopSubscribe, wantsGlass, () => false);
  const [ready, setReady] = useState(false);
  const [inView, setInView] = useState(true);

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin: "120px" });
    if (section.current) io.observe(section.current);
    return () => io.disconnect();
  }, []);

  return (
    <section ref={section} data-theme="frost" className="relative h-[100svh] min-h-[38rem] overflow-hidden bg-surface" aria-label="Εισαγωγή">
      {/* 3D stage */}
      <div className={`absolute inset-0 transition-opacity duration-[1600ms] ${ready ? "opacity-100" : "opacity-0"}`}>
        {webgl && (
          <GlassScene
            active={inView}
            onReady={() => setReady(true)}
            lines={[
              ["ΤΑ ΠΑΝΤΑ ΓΙΑ", "ΤΟ ΓΥΑΛΙ"],
              ["ΤΑ ΠΑΝΤΑ", "ΓΙΑ ΤΟ", "ΓΥΑΛΙ"],
            ]}
          />
        )}
      </div>

      {/* Headline (always in the DOM; visually replaced by the refracted 3D type once ready) */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-[var(--gutter)] pb-[6vh]">
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: ready ? 0 : 1, y: 0 }}
          transition={{ duration: ready ? 1.2 : 1.1, ease }}
          className="t-mega text-balance text-center"
        >
          Τα πάντα για <br className="hidden sm:block" />
          το γυαλί
        </motion.h1>
      </div>

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
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 1 }}
        className="shell t-label absolute inset-x-0 top-[calc(var(--header-h)+1.5rem)] flex justify-between text-fg-muted"
      >
        <span>Από το 1999</span>
        <span className="hidden sm:inline">Ασπρόπυργος · Έξοδος 4 Αττικής Οδού</span>
      </motion.div>

      {/* Bottom row */}
      <div className="shell absolute inset-x-0 bottom-0 pb-8 md:pb-12">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1, ease }}
            className="max-w-[34rem]"
          >
            <p className="t-lead text-fg-muted">
              <span className="text-fg">Εισαγωγή και εμπορία υαλοπινάκων και πλαστικών φύλλων</span>, με πολύ μεγάλη γκάμα
              ειδών και διαστάσεων και όλα τα υλικά που τα συνοδεύουν.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/yalopinakes"
                className="group inline-flex items-center gap-3 rounded-full bg-fg py-3 pl-6 pr-3 font-semibold text-surface transition-colors hover:bg-accent"
              >
                Δείτε τα προϊόντα
                <span className="flex size-8 items-center justify-center rounded-full bg-surface text-fg transition-transform duration-500 group-hover:translate-x-0.5">
                  →
                </span>
              </Link>
              <a
                href={contact.phoneHref}
                className="inline-flex items-center gap-2 rounded-full border border-line-strong px-6 py-3 font-semibold transition-colors hover:border-fg"
              >
                Καλέστε μας <span className="tabular text-fg-muted">{contact.phone}</span>
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1, duration: 1 }}
            className="hidden items-center gap-4 md:flex"
          >
            <span className="t-label text-fg-dim">Κύλιση</span>
            <span className="relative block h-14 w-px overflow-hidden bg-line">
              <span className="absolute inset-x-0 top-0 h-1/2 animate-[scrollcue_2.2s_var(--ease-in-out)_infinite] bg-accent" />
            </span>
          </motion.div>
        </div>
      </div>
      <style>{`@keyframes scrollcue{0%{transform:translateY(-100%)}100%{transform:translateY(200%)}}`}</style>
    </section>
  );
}
