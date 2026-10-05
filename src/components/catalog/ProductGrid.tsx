import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/ui";
import { productHref, type Product } from "@/lib/content";

export function ProductGrid({ items }: { items: Product[] }) {
  return (
    <ul className="grid gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((p, i) => (
        <Reveal as="li" key={p.slug} delay={(i % 3) * 0.06}>
          <Link href={productHref(p)} className="group block">
            <div className="relative aspect-[4/3] overflow-hidden rounded-sm bg-surface-2">
              {(p.thumb || p.image) && (
                <Image
                  src={(p.thumb || p.image)!}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-[1200ms] group-hover:scale-[1.05]"
                  style={{ transitionTimingFunction: "var(--ease-out)" }}
                />
              )}
              <span
                aria-hidden
                className="absolute right-3 top-3 flex size-10 items-center justify-center rounded-full bg-surface text-fg opacity-0 transition-all duration-500 group-hover:opacity-100 group-hover:[transform:rotate(-45deg)]"
              >
                →
              </span>
            </div>
            <div className="mt-5 flex gap-4">
              <span className="tabular pt-1 text-sm text-fg-muted">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <h3 className="font-display text-[1.65rem] font-bold uppercase leading-none transition-colors group-hover:text-accent">
                  {p.title}
                </h3>
                {p.summary && <p className="mt-3 line-clamp-3 text-[0.95rem] leading-relaxed text-fg-muted">{p.summary}</p>}
              </div>
            </div>
          </Link>
        </Reveal>
      ))}
    </ul>
  );
}
