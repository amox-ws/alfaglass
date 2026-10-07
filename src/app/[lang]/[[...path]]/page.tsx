import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HomeView } from "@/views/HomeView";
import { CompanyView } from "@/views/CompanyView";
import { FacilitiesView } from "@/views/FacilitiesView";
import { ArticleView, NewsView } from "@/views/NewsView";
import { ContactView } from "@/views/ContactView";
import { LinksView } from "@/views/LinksView";
import { LegalView } from "@/views/LegalView";
import { CategoryView, GroupView, ProductView } from "@/components/catalog/views";
import { JsonLd } from "@/components/JsonLd";
import { cms, excerpt, imagery, stripHtml } from "@/lib/content";
import { LANGS, isLang, t, type Lang } from "@/lib/i18n";
import { mediaSize } from "@/lib/media";
import { alternatesFor, resolve, staticSegments, type Route } from "@/lib/routes";
import { breadcrumbLd, organizationLd } from "@/lib/seo";

/** Every page of both languages is prerendered; anything else is a 404 (app/global-not-found.tsx). */
export const dynamicParams = false;

export function generateStaticParams() {
  return LANGS.flatMap((lang) => staticSegments(lang).map((path) => ({ lang, path })));
}

function lookup(lang: string, path?: string[]): { lang: Lang; route: Route } | null {
  if (!isLang(lang)) return null;
  const route = resolve(lang, path ?? []);
  return route ? { lang, route } : null;
}

function find(lang: Lang, route: Route) {
  const c = cms(lang);
  if (route.kind === "category") return Object.values(c.categories).find((x) => x.id === route.id)!;
  if (route.kind === "product") return Object.values(c.products).find((x) => x.id === route.id)!;
  return null;
}

function titleAndDescription(lang: Lang, route: Route): { title?: string; description?: string } {
  const c = cms(lang);
  const d = t(lang);
  switch (route.kind) {
    case "home":
      return {};
    case "company":
      return { title: d.nav.theCompany, description: d.company.metaDescription };
    case "facilities":
      return { title: d.nav.facilities, description: d.facilities.metaDescription };
    case "news":
      return { title: d.nav.news, description: d.news.metaDescription };
    case "article": {
      const a = c.site.news[route.index];
      return { title: a.title, description: excerpt(stripHtml(a.html), 160) };
    }
    case "contact":
      return { title: d.nav.contact, description: `${d.contact.phone} · ${d.contact.address}` };
    case "links":
      return { title: d.nav.links, description: d.links.metaDescription };
    case "legal":
      return { title: c.site.legal[route.key].title };
    case "group": {
      const g = c.groupByKey(route.key);
      return { title: g.title, description: excerpt(stripHtml(g.intro), 160) };
    }
    case "category": {
      const cat = find(lang, route) as ReturnType<typeof cms>["categories"][string];
      return { title: cat.title, description: excerpt(cat.summary || stripHtml(cat.intro), 160) };
    }
    case "product": {
      const p = find(lang, route) as ReturnType<typeof cms>["products"][string];
      return { title: p.title, description: excerpt(p.summary || stripHtml(p.body), 160) };
    }
  }
}

/** The picture that stands for a page when it is shared: the page's own image, else the building. */
function shareImage(lang: Lang, route: Route): string {
  const c = cms(lang);
  switch (route.kind) {
    case "company":
      return imagery.buildingStorm;
    case "facilities":
      return imagery.warehouse;
    case "article": {
      const { images } = c.site.news[route.index];
      return images[1] ?? images[0] ?? imagery.building;
    }
    case "group": {
      const g = c.groupByKey(route.key);
      return g.image ?? c.categoriesOf(g)[0]?.image ?? imagery.building;
    }
    case "category": {
      const cat = find(lang, route) as ReturnType<typeof cms>["categories"][string];
      return cat.image ?? imagery.building;
    }
    case "product": {
      const p = find(lang, route) as ReturnType<typeof cms>["products"][string];
      return p.image ?? p.thumb ?? imagery.building;
    }
    default:
      return imagery.building;
  }
}

export async function generateMetadata({ params }: PageProps<"/[lang]/[[...path]]">): Promise<Metadata> {
  const { lang, path } = await params;
  const hit = lookup(lang, path);
  if (!hit) return {};
  const d = t(hit.lang);
  const alt = alternatesFor(hit.route);
  const { title, description } = titleAndDescription(hit.lang, hit.route);
  const src = shareImage(hit.lang, hit.route);
  const size = mediaSize(src);
  const shared = {
    title: title ? `${title} | ALFA GLASS` : d.meta.title,
    description: description ?? d.meta.description,
    images: [{ url: src, alt: src === imagery.building ? d.company.buildingAlt : (title ?? "ALFA GLASS"), ...(size && { width: size.w, height: size.h }) }],
  };
  return {
    // Only what the page has: an empty title or description would replace the site's default from the layout
    ...(title && { title }),
    ...(description && { description }),
    alternates: {
      canonical: alt[hit.lang],
      languages: { el: alt.el, en: alt.en, "x-default": alt.el },
    },
    openGraph: { locale: d.ogLocale, siteName: "ALFA GLASS", type: "website", url: alt[hit.lang], ...shared },
    twitter: { card: "summary_large_image", ...shared },
  };
}

function view(lang: Lang, route: Route) {
  const c = cms(lang);
  switch (route.kind) {
    case "home":
      return <HomeView lang={lang} />;
    case "company":
      return <CompanyView lang={lang} />;
    case "facilities":
      return <FacilitiesView lang={lang} />;
    case "news":
      return <NewsView lang={lang} />;
    case "article":
      return <ArticleView lang={lang} index={route.index} />;
    case "contact":
      return <ContactView lang={lang} />;
    case "links":
      return <LinksView lang={lang} />;
    case "legal":
      return <LegalView lang={lang} legalKey={route.key} />;
    case "group":
      return <GroupView lang={lang} group={c.groupByKey(route.key)} />;
    case "category":
      return <CategoryView lang={lang} category={Object.values(c.categories).find((x) => x.id === route.id)!} />;
    case "product":
      return <ProductView lang={lang} product={Object.values(c.products).find((x) => x.id === route.id)!} />;
  }
}

export default async function Page({ params }: PageProps<"/[lang]/[[...path]]">) {
  const { lang: rawLang, path } = await params;
  const hit = lookup(rawLang, path);
  if (!hit) notFound();
  const { lang, route } = hit;
  const structured = route.kind === "home" || route.kind === "contact" ? organizationLd(lang) : breadcrumbLd(lang, route);

  return (
    <>
      {view(lang, route)}
      {structured && <JsonLd data={structured} />}
    </>
  );
}
