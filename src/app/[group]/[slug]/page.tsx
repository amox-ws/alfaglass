import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CategoryView, ProductView, excerpt } from "@/components/catalog/views";
import { categories, categoriesOf, getGroup, isFlatGroup, products, site, stripHtml } from "@/lib/content";

export const dynamicParams = false;

export function generateStaticParams() {
  return site.groups.flatMap((g) =>
    isFlatGroup(g)
      ? categories[g.categories[0]].products.map((p) => ({ group: g.slug, slug: p }))
      : categoriesOf(g).map((c) => ({ group: g.slug, slug: c.slug }))
  );
}

function resolve(groupSlug: string, slug: string) {
  const group = getGroup(groupSlug);
  if (!group) return null;
  if (isFlatGroup(group)) {
    const p = products[slug];
    return p && p.group === group.slug ? { kind: "product" as const, product: p } : null;
  }
  const c = categories[slug];
  return c && c.group === group.slug ? { kind: "category" as const, category: c } : null;
}

export async function generateMetadata({ params }: PageProps<"/[group]/[slug]">): Promise<Metadata> {
  const { group, slug } = await params;
  const r = resolve(group, slug);
  if (!r) return {};
  if (r.kind === "product") return { title: r.product.title, description: excerpt(r.product.summary || stripHtml(r.product.body), 160) };
  return { title: r.category.title, description: excerpt(r.category.summary || stripHtml(r.category.intro), 160) };
}

export default async function Page({ params }: PageProps<"/[group]/[slug]">) {
  const { group, slug } = await params;
  const r = resolve(group, slug);
  if (!r) notFound();
  return r.kind === "product" ? <ProductView product={r.product} /> : <CategoryView category={r.category} />;
}
