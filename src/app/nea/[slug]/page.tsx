import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { PageHero, Prose } from "@/components/page";
import { ArrowLink, Reveal } from "@/components/ui";
import { EnquiryBand } from "@/components/catalog/views";
import { formatDate, site, stripHtml } from "@/lib/content";

export const dynamicParams = false;

export function generateStaticParams() {
  return site.news.map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({ params }: PageProps<"/nea/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const n = site.news.find((x) => x.slug === slug);
  return n ? { title: n.title, description: stripHtml(n.html).slice(0, 160) } : {};
}

export default async function ArticlePage({ params }: PageProps<"/nea/[slug]">) {
  const { slug } = await params;
  const n = site.news.find((x) => x.slug === slug);
  if (!n) notFound();
  return (
    <>
      <PageHero
        crumbs={[{ label: "Νέα", href: "/nea" }, { label: n.title }]}
        title={n.title}
        meta={<p className="t-label tabular text-accent">{formatDate(n.date)}</p>}
      />
      <article className="bg-surface text-fg section-y">
        <div className="shell grid gap-12 md:grid-cols-12">
          <Reveal className="md:col-span-6">
            <Prose html={n.html} className="t-lead [&_li]:text-fg" />
            <ArrowLink href="/nea" className="mt-14">
              Όλα τα νέα
            </ArrowLink>
          </Reveal>
          <div className="grid gap-4 md:col-span-5 md:col-start-8">
            {n.images.map((src, i) => (
              <Reveal key={src} delay={i * 0.08} className="relative aspect-[4/3] overflow-hidden rounded-sm bg-surface-2">
                <Image src={src} alt="" fill sizes="(min-width: 768px) 40vw, 100vw" className={i === 0 ? "object-contain p-10" : "object-cover"} />
              </Reveal>
            ))}
          </div>
        </div>
      </article>
      <EnquiryBand />
    </>
  );
}
