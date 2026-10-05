"use client";

import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef } from "react";
import { Eyebrow, Reveal } from "@/components/ui";
import Link from "next/link";

const STATEMENT =
  "Ο συνδυασμός της μεγάλης γκάμας υλικών και διαστάσεων, ενός έμπειρου και πολυπληθούς προσωπικού και η σφραγίδα εγγύησης της ποιότητας, συντελεί στη γρήγορη ικανοποίηση οποιασδήποτε ανάγκης με ποιοτικά εγγυημένο αποτέλεσμα.";

const EMPHASIS = new Set(["γκάμας", "υλικών", "διαστάσεων,", "προσωπικού", "ποιότητας,", "γρήγορη"]);

export function Manifesto() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.45"] });
  const words = STATEMENT.split(" ");

  return (
    <section data-theme="frost" className="relative bg-surface section-y" aria-labelledby="manifesto-title">
      <div className="shell">
        <div className="mb-14 flex items-center justify-between gap-6 md:mb-20">
          <Eyebrow index="01">Λίγα λόγια για μας</Eyebrow>
          <Stamp />
        </div>

        <div ref={ref}>
          <h2 id="manifesto-title" className="sr-only">
            Λίγα λόγια για μας
          </h2>
          <p className="font-display max-w-[22ch] text-[clamp(2.4rem,6.2vw,6.6rem)] font-semibold uppercase leading-[0.95] md:max-w-[24ch]">
            {words.map((w, i) => (
              <Word key={i} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]} accent={EMPHASIS.has(w)}>
                {w}
              </Word>
            ))}
          </p>
        </div>

        <div className="mt-16 grid gap-10 md:mt-24 md:grid-cols-12">
          <Reveal className="md:col-span-5 md:col-start-6">
            <p className="text-fg-muted">
              Η ALFA GLASS Α.Ε. συστάθηκε το 1999 από τους κ.κ. Χρήστο Γαρυφάλλου, Γεώργιο Βλαβιανό και Ιωάννη Ρουμπάνη,
              με πολυετή παράδοση και εμπειρία στον κλάδο των υαλοπινάκων. Η διεθνής αναγνώρισή μας μάς επιτρέπει να
              προσφέρουμε γρήγορες και ειδικές λύσεις σε συνεργασία με πολλούς οίκους του εξωτερικού.
            </p>
          </Reveal>
          <Reveal delay={0.1} className="flex items-end md:col-span-2 md:col-start-11 md:justify-end">
            <Link href="/etaireia" className="link-underline t-label text-fg">
              Η εταιρεία →
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Word({
  children,
  progress,
  range,
  accent,
}: {
  children: string;
  progress: MotionValue<number>;
  range: [number, number];
  accent: boolean;
}) {
  const opacity = useTransform(progress, range, [0.14, 1]);
  return (
    <motion.span style={{ opacity }} className={`inline-block pr-[0.22em] ${accent ? "text-accent" : ""}`}>
      {children}
    </motion.span>
  );
}

/**
 * The etched manufacturer's stamp found in the corner of a tempered pane,
 * reinterpreted as the company's own mark of origin.
 */
export function Stamp({ className = "" }: { className?: string }) {
  return (
    <div
      className={`hidden select-none items-stretch rounded-[0.4rem] border border-line-strong text-[0.66rem] font-semibold uppercase leading-none tracking-[0.18em] text-fg-muted sm:flex ${className}`}
      aria-label="ALFA GLASS, από το 1999, 13.000 τ.μ., Ασπρόπυργος"
    >
      <span className="flex items-center border-r border-line-strong px-3 py-2 text-fg">Alfa Glass</span>
      <span className="flex items-center border-r border-line-strong px-3 py-2 tabular">Est. 1999</span>
      <span className="flex items-center border-r border-line-strong px-3 py-2 tabular">13.000 m²</span>
      <span className="flex items-center px-3 py-2">GR · Aspropyrgos</span>
    </div>
  );
}
