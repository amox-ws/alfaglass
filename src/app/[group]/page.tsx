import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GroupView, excerpt } from "@/components/catalog/views";
import { getGroup, site, stripHtml } from "@/lib/content";

export const dynamicParams = false;

export function generateStaticParams() {
  return site.groups.map((g) => ({ group: g.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[group]">): Promise<Metadata> {
  const { group: slug } = await params;
  const group = getGroup(slug);
  if (!group) return {};
  return { title: group.title, description: excerpt(stripHtml(group.intro), 160) };
}

export default async function GroupPage({ params }: PageProps<"/[group]">) {
  const { group: slug } = await params;
  const group = getGroup(slug);
  if (!group) notFound();
  return <GroupView group={group} />;
}
