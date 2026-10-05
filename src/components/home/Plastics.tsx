import Image from "next/image";
import Link from "next/link";
import { ArrowLink, Eyebrow, MaskedLines, Reveal } from "@/components/ui";

export function Plastics({
  image,
  items,
}: {
  image: string;
  items: { title: string; href: string }[];
}) {
  const marquee = ["Ακρυλικά XT", "Χυτά Ακρυλικά", "Πολυκαρβονικά", "PET-G", "PVC Foam", "Bond", "Πολυστερίνες", "Πάνελ πολυουρεθάνης"];
  return (
    <section aria-labelledby="plastics-title" className="relative overflow-hidden bg-indigo section-y">
      <div className="shell">
        <div className="flex items-center justify-between">
          <Eyebrow index="04">Από το 2014</Eyebrow>
          <span className="t-label hidden text-fg-muted sm:block">{items.length} κατηγορίες υλικών</span>
        </div>
      </div>

      {/* Material marquee */}
      <div aria-hidden className="mt-12 flex overflow-hidden whitespace-nowrap border-y border-line py-6 md:mt-16">
        {[0, 1].map((k) => (
          <div key={k} className="flex shrink-0 animate-[marquee_38s_linear_infinite] items-center">
            {marquee.map((m) => (
              <span key={m} className="font-display flex items-center text-[clamp(3rem,7vw,7rem)] font-extrabold uppercase leading-none">
                <span className="px-6 md:px-10">{m}</span>
                <span className="text-edge">✦</span>
              </span>
            ))}
          </div>
        ))}
      </div>

      <div className="shell mt-16 grid gap-12 md:mt-24 md:grid-cols-12">
        <div className="md:col-span-5">
          <MaskedLines as="h2" id="plastics-title" lines={["Πλαστικά", "φύλλα"]} className="t-display" />
          <Reveal delay={0.1}>
            <p className="t-lead mt-8 max-w-[30rem] text-fg-muted">
              Από το 2014 η ALFA GLASS επέκτεινε τις δραστηριότητές της στα ακρυλικά, πολυκαρβονικά, PVC και Bond φύλλα,
              για επιγραφοποιούς, κατασκευαστές και κτίρια.
            </p>
          </Reveal>
          <Reveal delay={0.15} className="relative mt-12 aspect-[4/3] overflow-hidden rounded-sm">
            <Image src={image} alt="Στέγαστρο από πολυκαρβονικά φύλλα" fill sizes="(min-width: 768px) 40vw, 100vw" className="object-cover" />
          </Reveal>
        </div>

        <ul className="self-end md:col-span-6 md:col-start-7">
          {items.map((it, i) => (
            <Reveal as="li" key={it.href} delay={i * 0.03} y={14} className="border-b border-line first:border-t">
              <Link href={it.href} className="group flex items-baseline justify-between gap-6 py-4">
                <span className="flex items-baseline gap-5">
                  <span className="tabular text-sm text-fg-dim">{String(i + 1).padStart(2, "0")}</span>
                  <span className="text-xl font-medium transition-colors group-hover:text-edge md:text-2xl">{it.title}</span>
                </span>
                <span aria-hidden className="text-fg-dim transition-transform duration-500 group-hover:translate-x-1 group-hover:text-edge">
                  →
                </span>
              </Link>
            </Reveal>
          ))}
          <li className="pt-10">
            <ArrowLink href="/plastika-fylla">Όλα τα πλαστικά φύλλα</ArrowLink>
          </li>
        </ul>
      </div>
    </section>
  );
}
