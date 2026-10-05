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
  const veil = useTransform(scrollYProgress, [0.4, 0.7], [0, 0.8]);
  const copyOpacity = useTransform(scrollYProgress, [0.5, 0.68], [0, 1]);
  const copyY = useTransform(scrollYProgress, [0.5, 0.7], [40, 0]);
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
            <motion.div
              style={{ opacity: veil, backdropFilter: "blur(14px) saturate(120%)", WebkitBackdropFilter: "blur(14px) saturate(120%)" }}
              className="absolute inset-0 bg-surface/45"
            />
            <motion.div
              style={{ opacity: copyOpacity }}
              className="absolute inset-0 bg-gradient-to-t from-surface/90 via-surface/30 to-transparent"
            />
          </motion.div>

          <motion.div
            style={{ opacity: headOpacity }}
            className="shell pointer-events-none absolute inset-x-0 top-[calc(var(--header-h)+2rem)] flex justify-between"
          >
            <Eyebrow index="03">Εγκαταστάσεις</Eyebrow>
            <span className="t-label text-fg-muted">Θέση Κύριλλος</span>
          </motion.div>

          <motion.div style={{ opacity: copyOpacity, y: copyY }} className="shell absolute inset-x-0 bottom-0 pb-12 md:pb-20">
            <div className="grid gap-8 md:grid-cols-12 md:items-end">
              <h2 id="facilities-title" className="t-display md:col-span-7">
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
