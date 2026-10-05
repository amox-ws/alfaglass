"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Eyebrow } from "@/components/ui";

type Item = { year: string; text: string };

export function History({ items, engraving }: { items: Item[]; engraving: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [distance, setDistance] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0, 1], [0, -distance]);
  const bar = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  useEffect(() => {
    const measure = () => {
      if (!track.current) return;
      setDistance(Math.max(0, track.current.scrollWidth - window.innerWidth));
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (track.current) ro.observe(track.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  return (
    <section aria-labelledby="history-title" className="relative bg-ink">
      <div ref={ref} style={{ height: `calc(100svh + ${distance}px)` }} className="relative">
        <div className="sticky top-0 flex h-[100svh] flex-col justify-center overflow-hidden">
          <div className="shell mb-10 flex items-end justify-between gap-6 md:mb-14">
            <div>
              <Eyebrow index="05">Ιστορία</Eyebrow>
              <h2 id="history-title" className="t-h1 mt-5">
                Ένα τέταρτο του αιώνα
              </h2>
            </div>
            <div className="hidden w-48 md:block">
              <div className="h-px w-full bg-line">
                <motion.div style={{ width: bar }} className="h-px bg-edge" />
              </div>
              <p className="t-label mt-3 flex justify-between text-fg-dim tabular">
                <span>1999</span>
                <span>{items[items.length - 1]?.year}</span>
              </p>
            </div>
          </div>

          <motion.div ref={track} style={{ x }} className="flex w-max gap-[clamp(1.5rem,3vw,3rem)] pl-[var(--gutter)] pr-[var(--gutter)]">
            <figure className="relative h-[52svh] w-[min(78vw,30rem)] shrink-0 overflow-hidden rounded-sm">
              <Image src={engraving} alt="Χαλκογραφία εργαστηρίου επεξεργασίας γυαλιού" fill sizes="30rem" className="object-cover grayscale" />
              <div className="absolute inset-0 bg-indigo/40 mix-blend-multiply" />
              <figcaption className="t-label absolute bottom-4 left-4 right-4 text-fg">Μια παράδοση στο γυαλί πριν από το 1999</figcaption>
            </figure>
            {items.map((it, i) => (
              <article
                key={it.year}
                className="flex h-[52svh] w-[min(82vw,34rem)] shrink-0 flex-col justify-between border-l border-line pl-[clamp(1.25rem,2.5vw,2.5rem)]"
              >
                <p className="font-display text-[clamp(6rem,15vw,15rem)] font-[200] leading-[0.8] text-fg tabular">{it.year}</p>
                <div>
                  <p className="t-label mb-4 text-edge">{String(i + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}</p>
                  <p className="t-lead max-w-[26rem] text-fg-muted">{it.text}</p>
                </div>
              </article>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
