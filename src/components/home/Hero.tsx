import Image from "next/image";
import Link from "next/link";
import { contact } from "@/lib/content";
import { t, type Lang } from "@/lib/i18n";

/**
 * Plain HTML hero: headline, lead and calls to action render with the page, before any script.
 * The wide frame holds a photo of the warehouse; it is where the film of the cutting machine goes once it is shot.
 */
export function Hero({ lang, productsHref, image }: { lang: Lang; productsHref: string; image: string }) {
  const d = t(lang);
  const h = d.home;

  return (
    <section data-theme="frost" className="bg-surface pt-[calc(var(--header-h)+1.5rem)]" aria-label={d.a11y.intro}>
      <div className="shell">
        <div className="t-label flex justify-between text-fg-muted">
          <span>{h.since}</span>
          <span className="hidden sm:inline">{h.location}</span>
        </div>

        <div className="mt-8 grid gap-6 md:mt-12 md:grid-cols-12 md:items-end md:gap-8">
          <h1 className="t-display text-balance md:col-span-7">
            {h.heroTitle[0]} <br className="hidden sm:block" />
            {h.heroTitle[1]}
          </h1>
          <p className="t-lead text-fg-muted md:col-span-5 md:col-start-8 lg:col-span-4 lg:col-start-9">
            <span className="text-fg">{h.leadStrong}</span>
            {h.leadRest}
          </p>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href={productsHref}
            className="group inline-flex items-center gap-3 rounded-full bg-fg py-3 pl-6 pr-3 font-semibold text-surface transition-colors hover:bg-accent"
          >
            {d.common.viewProducts}
            <span className="flex size-8 items-center justify-center rounded-full bg-surface text-fg transition-transform duration-500 group-hover:translate-x-0.5">
              →
            </span>
          </Link>
          <a
            href={contact.phoneHref}
            className="glass glass-thin glass-sheen relative inline-flex items-center gap-2 rounded-full px-6 py-3 font-semibold"
          >
            {d.common.callUs} <span className="tabular text-fg-muted">{d.contact.phone}</span>
          </a>
        </div>

        <div className="relative mt-10 aspect-[4/3] overflow-hidden rounded-sm bg-surface-2 sm:aspect-[16/9] md:mt-14 lg:aspect-[21/9]">
          <Image
            src={image}
            alt={h.warehouseAlt}
            fill
            preload
            sizes="(min-width: 108rem) 104rem, 100vw"
            className="object-cover object-[center_62%]"
          />
        </div>
      </div>
    </section>
  );
}
