import type { MetadataRoute } from "next";
import { categories, categoryHref, productHref, products, site } from "@/lib/content";

const BASE = "https://alfaglass.gr";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = [
    "/",
    "/etaireia",
    "/egkatastaseis",
    "/nea",
    "/epikoinonia",
    "/xrisimoi-syndesmoi",
    "/oroi-chrisis",
    "/politiki-aporritou",
    "/politiki-cookies",
    "/politiki-cctv",
  ];
  const paths = new Set<string>([
    ...staticPaths,
    ...site.groups.map((g) => `/${g.slug}`),
    ...Object.values(categories).map(categoryHref),
    ...Object.values(products).map(productHref),
    ...site.news.map((n) => `/nea/${n.slug}`),
  ]);
  return [...paths].map((p) => ({ url: `${BASE}${p === "/" ? "" : p}`, changeFrequency: "monthly", priority: p === "/" ? 1 : 0.7 }));
}
