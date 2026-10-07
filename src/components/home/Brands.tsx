import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/ui";
import type { Brand } from "@/lib/brands";
import { mediaSize } from "@/lib/media";
import { t, type Lang } from "@/lib/i18n";

/** Logos have very different proportions: each is sized by its area, so a wordmark and a stacked mark weigh the same. */
const AREA = 5200;

/**
 * A quiet band (half the space of a section): the glass manufacturers of the useful-links page, in grey, in one row
 * (it wraps on phones).
 * The whole band is one link to that page; the logos take their colour when it is hovered or focused.
 */
export function Brands({ lang, brands, href }: { lang: Lang; brands: Brand[]; href: string }) {
  const d = t(lang);
  return (
    <section data-theme="mist" aria-labelledby="brands-title" className="bg-surface py-[calc(var(--spacing-section)/2)]">
      <div className="shell">
        <Reveal>
          <Link href={href} className="group block">
            <div className="flex items-baseline justify-between gap-6">
              <h2 id="brands-title" className="t-label text-fg-muted">
                {d.home.brandsEyebrow}
              </h2>
              <span className="text-link t-label text-fg">
                <span>
                  {d.links.title}
                  <span aria-hidden> →</span>
                </span>
              </span>
            </div>
            <ul
              className="mt-6 flex flex-wrap items-center justify-between gap-x-8 gap-y-6 border-y border-line py-8 [--k:0.68] md:gap-x-8 md:py-10 md:[--k:0.7] lg:gap-x-12 lg:[--k:1]"
            >
              {brands.map((b) => {
                const size = mediaSize(b.logo);
                if (!size) return null;
                const h = Math.round(Math.sqrt(AREA / (size.w / size.h)));
                return (
                  <li key={b.logo} className="flex items-center">
                    <Image
                      src={b.logo}
                      alt={b.name}
                      width={Math.round((h * size.w) / size.h)}
                      height={h}
                      style={{ "--h": h } as CSSProperties}
                      className="h-[calc(var(--h)*var(--k)*1px)] w-auto opacity-85 mix-blend-multiply grayscale transition-[opacity,filter] duration-500 group-hover:opacity-100 group-hover:grayscale-0 group-focus-visible:opacity-100 group-focus-visible:grayscale-0"
                    />
                  </li>
                );
              })}
            </ul>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
