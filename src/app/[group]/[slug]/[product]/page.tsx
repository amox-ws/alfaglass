import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductView, excerpt } from "@/components/catalog/views";
import { categories, products, site, isFlatGroup, stripHtml } from "@/lib/content";

export const dynamicParams = false;

export function generateStaticParams() {
  return site.groups
    .filter((g) => !isFlatGroup(g))
    .flatMap((g) => g.categories.flatMap((c) => categories[c].products.map((p) => ({ group: g.slug, slug: c, product: p }))));
}

function resolve(group: string, slug: string, product: string) {
  const p = products[product];
  return p && p.group === group && p.category === slug ? p : null;
}

export async function generateMetadata({ params }: PageProps<"/[group]/[slug]/[product]">): Promise<Metadata> {
  const { group, slug, product } = await params;
  const p = resolve(group, slug, product);
  if (!p) return {};
  return { title: p.title, description: excerpt(p.summary || stripHtml(p.body), 160) };
}

export default async function ProductPage({ params }: PageProps<"/[group]/[slug]/[product]">) {
  const { group, slug, product } = await params;
  const p = resolve(group, slug, product);
  if (!p) notFound();
  return <ProductView product={p} />;
}
