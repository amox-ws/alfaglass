"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { ArrowLink, Eyebrow, MaskedLines, Reveal } from "@/components/ui";

export function Facilities({ warehouse, trucks }: { warehouse: string; trucks: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  // A single pane of glass opens into the full warehouse.
  const clip = useTransform(
    scrollYProgress,
    [0, 0.55],
    ["inset(14% 38% 14% 38% round 6px)", "inset(0% 0% 0% 0% round 0px)"]
  );
  const scale = useTransform(scrollYProgress, [0, 0.6], [1.25, 1]);
  // A clear pane rises in front of the warehouse: no frost, just edges and reflections.
  const paneY = useTransform(scrollYProgress, [0.42, 0.72], ["104%", "0%"]);
  const glare = useTransform(scrollYProgress, [0.42, 1], ["-35% 0%", "35% 0%"]);
  const shade = useTransform(scrollYProgress, [0.5, 0.72], [0, 1]);
  const copyOpacity = useTransform(scrollYProgress, [0.58, 0.74], [0, 1]);
  const copyY = useTransform(scrollYProgress, [0.58, 0.76], [30, 0]);
  const headOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0]);

  return (
    <section data-theme="frost" aria-labelledby="facilities-title" className="relative bg-surface">
      <div ref={ref} className="relative h-[260vh]">
        <div className="sticky top-0 h-[100svh] overflow-hidden">
          <motion.div style={{ clipPath: clip }} className="absolute inset-0">
            <motion.div style={{ scale }} className="absolute inset-0">
              <Image
                src={warehouse}
                alt="Οι αποθήκες της ALFA GLASS στον Ασπρόπυργο, με κιβώτια υαλοπινάκων σε σειρές"
                fill
                sizes="100vw"
                className="object-cover"
              />
            </motion.div>
            {/* Shade low in the frame so lettering on the pane stays legible */}
            <motion.div
              style={{ opacity: shade }}
              className="absolute inset-0 bg-gradient-to-t from-deep/75 via-deep/20 to-transparent"
            />
          </motion.div>

          {/* The pane: ultra-clear glass, read through its rim, bevel and glare rather than blur */}
          <motion.div
            aria-hidden
            className="glass pointer-events-none absolute inset-x-[max(0.75rem,2.5vw)] bottom-[max(0.75rem,2.5vw)] top-[calc(var(--header-h)+1rem)] rounded-[1.75rem] [--glass-tint:oklch(1_0_0/0.03)] [--glass-blur:1.5px] [--glass-rim-lo:oklch(0.88_0.015_255/0.7)] [--glass-shadow:0_40px_90px_-40px_oklch(0.2_0.06_280/0.55)]"
            style={{
              y: paneY,
              backgroundImage:
                "linear-gradient(112deg, transparent 0 33%, oklch(1 0 0 / 0.26) 39%, oklch(1 0 0 / 0.06) 46%, transparent 51%, transparent 62%, oklch(1 0 0 / 0.14) 66%, transparent 70%), linear-gradient(180deg, oklch(1 0 0 / 0.08), oklch(1 0 0 / 0.02))",
              backgroundSize: "200% 100%, 100% 100%",
              backgroundPosition: glare,
            }}
          />

          <motion.div
            style={{ opacity: headOpacity }}
            className="shell pointer-events-none absolute inset-x-0 top-[calc(var(--header-h)+2rem)] flex justify-between"
          >
            <Eyebrow index="03">Εγκαταστάσεις</Eyebrow>
            <span className="t-label text-fg-muted">Θέση Κύριλλος</span>
          </motion.div>

          <motion.div
            data-theme="deep"
            style={{ opacity: copyOpacity, y: copyY }}
            className="shell absolute inset-x-0 bottom-0 pb-[calc(max(0.75rem,2.5vw)+2.5rem)] md:pb-[calc(2.5vw+4rem)]"
          >
            <div className="grid gap-8 md:grid-cols-12 md:items-end">
              <h2 id="facilities-title" className="t-display [text-shadow:0_2px_24px_oklch(0.2_0.06_280/0.35)] md:col-span-7">
                13.000 τ.μ.
                <span className="block text-fg-muted">ιδιόκτητων χώρων</span>
              </h2>
              <p className="t-lead text-fg-muted md:col-span-4 md:col-start-9">
                Η εταιρεία εδρεύει στον Ασπρόπυργο, ακριβώς στην έξοδο 4 της Αττικής Οδού, σε ιδιόκτητο κτίριο αποθηκών και
                γραφείων.
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Logistics */}
      <div className="shell section-y">
        <div className="grid gap-12 md:grid-cols-12 md:items-center">
          <Reveal className="relative aspect-[16/10] overflow-hidden rounded-sm md:col-span-7 md:aspect-[16/9]">
            <Image
              src={trucks}
              alt="Φορτηγά της ALFA GLASS έξω από τις αποθήκες"
              fill
              sizes="(min-width: 768px) 58vw, 100vw"
              className="object-cover"
            />
          </Reveal>
          <div className="md:col-span-4 md:col-start-9">
            <MaskedLines as="h3" lines={["Από την αποθήκη", "στον πελάτη"]} className="t-h2" />
            <Reveal delay={0.1}>
              <p className="mt-6 text-fg-muted">
                Τα εμπορεύματα αποθηκεύονται σε κατάλληλα διαμορφωμένους και εξοπλισμένους χώρους, από τους οποίους
                μεταφορτώνονται στα ειδικά φορτηγά για να παραδοθούν στους πελάτες.
              </p>
              <ArrowLink href="/egkatastaseis" className="mt-10">
                Οι εγκαταστάσεις μας
              </ArrowLink>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
