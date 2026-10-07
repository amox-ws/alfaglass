import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/ui";
import type { Brand } from "@/lib/brands";
import { mediaSize } from "@/lib/media";
import { t, type Lang } from "@/lib/i18n";

/**
 * A quiet band (half the space of a section): the glass manufacturers of the useful-links page in one tone, in one row
 * (on phones three and two, each row centred). Each logo has its own height (`brands.ts`), chosen so they weigh the same.
 * The whole band is one link to that page; the logos take their own colours when it is hovered or focused.
 */
export function Brands({ lang, brands, href }: { lang: Lang; brands: Brand[]; href: string }) {
  const d = t(lang);
  return (
    <section data-theme="frost" aria-labelledby="brands-title" className="bg-surface py-[calc(var(--spacing-section)/2)]">
      {/*
        One ink for every logo. Each is laid on white first (a JPEG has no transparency, a PNG does), then its darkness
        becomes the opacity of a single colour (the muted type colour): alpha = 2.4 × (1 − luminance) − 0.12. A heavy mark
        no longer outweighs a thin one, and the white box around a JPEG disappears.
      */}
      <svg aria-hidden focusable="false" width="0" height="0" className="absolute">
        <filter id="brand-ink" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feFlood floodColor="#fff" result="paper" />
          <feComposite in="SourceGraphic" in2="paper" operator="over" result="flat" />
          <feColorMatrix
            in="flat"
            type="matrix"
            values="0 0 0 0 0.26  0 0 0 0 0.312  0 0 0 0 0.422  -0.51 -1.716 -0.173 0 2.28"
          />
        </filter>
      </svg>
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
              className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-6 border-y border-line py-8 [--k:0.7] md:justify-between md:gap-x-8 md:py-10 md:[--k:0.8] lg:gap-x-12 lg:[--k:1]"
            >
              {brands.map((b) => {
                const size = mediaSize(b.logo);
                if (!size) return null;
                const h = b.height;
                return (
                  <li key={b.logo} className="flex items-center">
                    <Image
                      src={b.logo}
                      alt={b.name}
                      width={Math.round((h * size.w) / size.h)}
                      height={h}
                      style={{ "--h": h } as CSSProperties}
                      className="h-[calc(var(--h)*var(--k)*1px)] w-auto opacity-70 mix-blend-multiply filter-[url(#brand-ink)] transition-opacity duration-500 group-hover:opacity-100 group-hover:filter-none group-focus-visible:opacity-100 group-focus-visible:filter-none"
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
