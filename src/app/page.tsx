import Image from "next/image";
import Link from "next/link";
import { Hero } from "@/components/home/Hero";
import { Manifesto } from "@/components/home/Manifesto";
import { GlassIndex } from "@/components/home/GlassIndex";
import { Facilities } from "@/components/home/Facilities";
import { Plastics } from "@/components/home/Plastics";
import { History } from "@/components/home/History";
import { Related } from "@/components/home/Related";
import { Cta } from "@/components/home/Cta";
import { Reveal } from "@/components/ui";
import {
  categories,
  categoriesOf,
  categoryHref,
  formatDate,
  getGroup,
  imagery,
  productHref,
  productsOf,
  site,
  stripHtml,
} from "@/lib/content";

export default function Home() {
  const glass = getGroup("yalopinakes")!;
  const plastics = getGroup("plastika-fylla")!;
  const related = getGroup("synafi-proionta")!;
  const plasticsCategory = categories[plastics.categories[0]];
  const article = site.news[0];

  return (
    <>
      <Hero />
      <Manifesto />
      <GlassIndex
        intro="Από τον κοινό float υαλοπίνακα ως τα αλεξίσφαιρα και πυράντοχα κρύσταλλα: εννέα οικογένειες γυαλιού, σε πολύ μεγάλη γκάμα ειδών, χρωμάτων και διαστάσεων."
        rows={categoriesOf(glass).map((c) => ({
          href: categoryHref(c),
          title: c.title,
          summary: c.summary || stripHtml(c.intro),
          image: c.image,
          count: c.products.length,
        }))}
      />
      <Facilities warehouse={imagery.warehouse} trucks={imagery.trucks} />
      <Plastics
        image={plastics.image ?? plasticsCategory.image!}
        items={productsOf(plasticsCategory).map((p) => ({ title: p.title, href: productHref(p) }))}
      />
      <History items={site.history.timeline} engraving={imagery.engraving} />
      <Related
        items={categoriesOf(related).map((c) => ({
          href: categoryHref(c),
          title: c.title,
          image: c.image,
          count: c.products.length,
          summary: c.summary,
        }))}
      />

      {/* Latest news */}
      <section aria-labelledby="news-title" className="bg-paper pb-[clamp(5rem,11vw,11rem)] text-on-paper">
        <div className="shell">
          <div className="flex items-baseline justify-between border-t border-paper-line pt-8">
            <h2 id="news-title" className="t-label text-on-paper-muted">
              Τα νέα μας
            </h2>
            <Link href="/nea" className="link-underline t-label">
              Όλα τα νέα →
            </Link>
          </div>
          <Reveal>
            <Link href={`/nea/${article.slug}`} className="group mt-10 grid gap-8 md:grid-cols-12 md:items-center">
              <div className="relative aspect-[16/10] overflow-hidden rounded-sm bg-paper-2 md:col-span-5">
                <Image
                  src={article.images[1] ?? article.images[0]}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 40vw, 100vw"
                  className="object-cover transition-transform duration-[1200ms] group-hover:scale-[1.04]"
                  style={{ transitionTimingFunction: "var(--ease-out)" }}
                />
              </div>
              <div className="md:col-span-6 md:col-start-7">
                <p className="t-label tabular text-cobalt">{formatDate(article.date)}</p>
                <h3 className="t-h2 mt-4 transition-colors group-hover:text-cobalt">{article.title}</h3>
                <p className="mt-5 max-w-[46ch] text-on-paper-muted">{stripHtml(article.html).slice(0, 150)}…</p>
              </div>
            </Link>
          </Reveal>
        </div>
      </section>

      <Cta />
    </>
  );
}
