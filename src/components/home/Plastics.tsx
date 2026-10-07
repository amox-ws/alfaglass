import Image from "next/image";
import Link from "next/link";
import { ArrowLink, Reveal, SectionHeader } from "@/components/ui";
import { t, type Lang } from "@/lib/i18n";

/** Plastic sheets: a section header (P1), the endless ticker of materials, then the photo and the list of materials (P3, mirrored). */
export function Plastics({
  lang,
  image,
  items,
  allHref,
}: {
  lang: Lang;
  image: string;
  items: { title: string; href: string }[];
  allHref: string;
}) {
  const d = t(lang);
  const h = d.home;
  return (
    <section data-theme="mist" aria-labelledby="plastics-title" className="relative overflow-hidden bg-surface section-y">
      <div className="shell">
        <SectionHeader
          index="04"
          eyebrow={h.plasticsEyebrow}
          id="plastics-title"
          title={h.plasticsTitle.join(" ")}
          intro={h.plasticsText}
          action={<ArrowLink href={allHref}>{h.allPlastics}</ArrowLink>}
        />
      </div>

      {/* Material ticker */}
      <div aria-hidden className="mt-16 flex overflow-hidden whitespace-nowrap border-y border-line py-6 md:mt-24">
        {[0, 1].map((k) => (
          <div key={k} className="flex shrink-0 animate-[marquee_38s_linear_infinite] items-center">
            {h.plasticsMarquee.map((m) => (
              <span key={m} className="font-display flex items-center text-[clamp(3rem,7vw,7rem)] font-extrabold uppercase leading-none">
                <span className="px-6 md:px-10">{m}</span>
                <span className="text-accent">✦</span>
              </span>
            ))}
          </div>
        ))}
      </div>

      <div className="shell mt-16 grid gap-8 md:mt-24 lg:grid-cols-12 lg:items-center">
        <Reveal className="relative aspect-[4/3] overflow-hidden rounded-sm md:aspect-[21/9] lg:col-span-7 lg:col-start-6 lg:row-start-1 lg:aspect-[4/3]">
          <Image src={image} alt={h.plasticsAlt} fill sizes="(min-width: 1024px) 54vw, 100vw" className="object-cover" />
        </Reveal>

        <div className="lg:col-span-4 lg:col-start-1 lg:row-start-1">
          <p className="t-label flex justify-between pb-4 text-fg-muted">
            <span>{d.common.materials}</span>
            <span className="tabular">{items.length}</span>
          </p>
          <ul className="border-t border-line md:grid md:grid-cols-2 md:gap-x-8 lg:block">
            {items.map((it, i) => (
              <Reveal as="li" key={it.href} delay={i * 0.03} y={14} className="border-b border-line">
                <Link href={it.href} className="group flex items-baseline justify-between gap-6 py-4">
                  <span className="flex items-baseline gap-5">
                    <span className="t-label tabular text-fg-muted">{String(i + 1).padStart(2, "0")}</span>
                    <span className="t-lead font-medium transition-colors group-hover:text-accent">{it.title}</span>
                  </span>
                  <span aria-hidden className="text-fg-muted transition-transform duration-500 group-hover:translate-x-1 group-hover:text-accent">
                    →
                  </span>
                </Link>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
