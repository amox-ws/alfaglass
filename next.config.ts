import type { NextConfig } from "next";
import elSite from "./src/content/el/site.json";
import elCategories from "./src/content/el/categories.json";
import elProducts from "./src/content/el/products.json";
import enSite from "./src/content/en/site.json";
import enCategories from "./src/content/en/categories.json";
import enProducts from "./src/content/en/products.json";

type Group = { key: string; slug: string; categories: string[] };
type Cat = { id: number; slug: string; group: string };
type Prod = { id: number; slug: string; category: string; group: string };
type Lang = "el" | "en";

const data = {
  el: { site: elSite, cats: elCategories as unknown as Record<string, Cat>, prods: elProducts as unknown as Record<string, Prod> },
  en: { site: enSite, cats: enCategories as unknown as Record<string, Cat>, prods: enProducts as unknown as Record<string, Prod> },
};

const STATIC = {
  el: {
    company: "/etaireia",
    facilities: "/egkatastaseis",
    news: "/nea",
    contact: "/epikoinonia",
    links: "/xrisimoi-syndesmoi",
    terms: "/oroi-chrisis",
    privacy: "/politiki-aporritou",
    cookies: "/politiki-cookies",
    cctv: "/politiki-cctv",
  },
  en: {
    company: "/en/company",
    facilities: "/en/facilities",
    news: "/en/news",
    contact: "/en/contact",
    links: "/en/useful-links",
    terms: "/en/terms-of-use",
    privacy: "/en/privacy-policy",
    cookies: "/en/cookie-policy",
    cctv: "/en/cctv-policy",
  },
};

/** Legacy page id -> new URL, per language (mirrors src/lib/routes.ts). */
function legacyPages(lang: Lang): Record<number, string> {
  const { site, cats } = data[lang];
  const s = STATIC[lang];
  const prefix = lang === "el" ? "" : "/en";
  const groups = site.groups as unknown as Group[];
  const group = (key: string) => groups.find((g) => g.key === key)!;
  const flat = new Set(groups.filter((g) => g.categories.length === 1).map((g) => g.key));
  const pages: Record<number, string> = {
    42: s.company, 48: s.company, 49: s.company, 50: s.company, 79: s.company, 80: s.company, 85: s.company, 86: s.company,
    43: s.facilities,
    44: `${prefix}/${group("yalopinakes").slug}`,
    46: s.news,
    47: s.contact,
    60: s.terms,
    61: `${prefix}/${group("plastika-fylla").slug}`,
    62: `${prefix}/${group("synafi-proionta").slug}`,
    75: s.links,
    82: s.privacy,
    83: s.cctv,
    84: s.cookies,
  };
  for (const c of Object.values(cats)) {
    if (!flat.has(c.group)) pages[c.id] = `${prefix}/${group(c.group).slug}/${c.slug}`;
  }
  return pages;
}

function legacyProducts(lang: Lang): Record<number, string> {
  const { site, prods } = data[lang];
  const prefix = lang === "el" ? "" : "/en";
  const groups = site.groups as unknown as Group[];
  const out: Record<number, string> = {};
  for (const p of Object.values(prods)) {
    const g = groups.find((x) => x.key === p.group)!;
    out[p.id] = g.categories.length === 1 ? `${prefix}/${g.slug}/${p.slug}` : `${prefix}/${g.slug}/${p.category}/${p.slug}`;
  }
  return out;
}

/** Permanent redirects from the legacy alfaglass.gr URL scheme (both languages), so links and rankings carry over. */
function legacyRedirects() {
  const rules: { source: string; destination: string; permanent: boolean }[] = [
    { source: "/el", destination: "/", permanent: true },
    { source: "/Article/1/en/:rest*", destination: `${STATIC.en.news}/${enSite.news[0].slug}`, permanent: true },
    { source: "/Article/1/:rest*", destination: `${STATIC.el.news}/${elSite.news[0].slug}`, permanent: true },
  ];
  const [elPages, enPages] = [legacyPages("el"), legacyPages("en")];
  for (const id of Object.keys(elPages)) {
    rules.push({ source: `/${id}/en/:rest*`, destination: enPages[Number(id)], permanent: true });
    rules.push({ source: `/${id}/:rest*`, destination: elPages[Number(id)], permanent: true });
  }
  const [elProds, enProds] = [legacyProducts("el"), legacyProducts("en")];
  for (const id of Object.keys(elProds)) {
    rules.push({ source: `/Product/${id}/Page/:cid/en/:rest*`, destination: enProds[Number(id)], permanent: true });
    rules.push({ source: `/Product/${id}/:rest*`, destination: elProds[Number(id)], permanent: true });
  }
  return rules;
}

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [75, 85],
  },
  async redirects() {
    return legacyRedirects();
  },
};

export default nextConfig;
