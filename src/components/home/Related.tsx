import Image from "next/image";
import Link from "next/link";
import { ArrowLink, Eyebrow, MaskedLines, Reveal } from "@/components/ui";

type Item = { href: string; title: string; image: string | null; count: number; summary: string };

/** Related products: an asymmetric spread rather than a uniform card grid. */
export function Related({ items }: { items: Item[] }) {
  const spans = [
    "md:col-span-7 md:row-span-2 aspect-[4/5] md:aspect-auto",
    "md:col-span-5 aspect-[4/3] md:aspect-[16/11]",
    "md:col-span-5 aspect-[4/3] md:aspect-[16/11]",
    "md:col-span-12 aspect-[4/3] md:aspect-[16/6]",
  ];
  return (
    <section data-theme="frost" aria-labelledby="related-title" className="bg-surface section-y">
      <div className="shell">
        <div className="grid gap-8 md:grid-cols-12 md:items-end">
          <div className="md:col-span-8">
            <Eyebrow index="06">
              Από το 2018
            </Eyebrow>
            <MaskedLines as="h2" id="related-title" lines={["Συναφή", "προϊόντα"]} className="t-display mt-6" />
          </div>
          <Reveal className="md:col-span-4">
            <p className="text-fg-muted">
              Συσκευές ελέγχου, μηχανισμοί γυάλινων θυρών, εξαρτήματα, αναλώσιμα μηχανών και εργαλεία: ό,τι χρειάζεται ο
              επαγγελματίας γύρω από το γυαλί.
            </p>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-4 md:mt-20 md:grid-cols-12 md:gap-5">
          {items.map((it, i) => (
            <Reveal key={it.href} delay={i * 0.06} className={`${spans[i % spans.length]} relative`}>
              <Link href={it.href} className="group absolute inset-0 flex flex-col overflow-hidden rounded-sm bg-surface-2">
                <div className="relative min-h-0 flex-1">
                  {it.image && (
                    <Image
                      src={it.image}
                      alt=""
                      fill
                      sizes="(min-width: 768px) 60vw, 100vw"
                      className="object-contain p-[6%] mix-blend-multiply transition-transform duration-[1200ms] group-hover:scale-[1.05]"
                      style={{ transitionTimingFunction: "var(--ease-out)" }}
                    />
                  )}
                </div>
                <div className="flex items-end justify-between gap-6 border-t border-line p-5 md:px-7 md:py-6">
                  <div>
                    <p className="t-label tabular text-fg-muted">
                      {it.count} {it.count === 1 ? "είδος" : "είδη"}
                    </p>
                    <h3 className="t-h3 mt-2 max-w-[22ch] !text-[clamp(1.35rem,1.9vw,2rem)]">{it.title}</h3>
                  </div>
                  <span
                    aria-hidden
                    className="flex size-11 shrink-0 items-center justify-center rounded-full border border-line bg-surface transition-colors duration-300 group-hover:border-accent group-hover:bg-accent group-hover:text-accent-fg"
                  >
                    →
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>

        <div className="mt-12 flex justify-end">
          <ArrowLink href="/synafi-proionta">
            Όλα τα συναφή προϊόντα
          </ArrowLink>
        </div>
      </div>
    </section>
  );
}
