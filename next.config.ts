import type { NextConfig } from "next";
import site from "./src/content/site.json";
import categories from "./src/content/categories.json";
import products from "./src/content/products.json";

type Cat = { id: number; slug: string; group: string };
type Prod = { id: number; slug: string; category: string; group: string };

const cats = categories as unknown as Record<string, Cat>;
const prods = products as unknown as Record<string, Prod>;
const flatGroups = new Set(site.groups.filter((g) => g.categories.length === 1).map((g) => g.slug));

/** Permanent redirects from the legacy alfaglass.gr URL scheme, so links and rankings carry over. */
function legacyRedirects() {
  const pages: Record<number, string> = {
    42: "/etaireia",
    43: "/egkatastaseis",
    44: "/yalopinakes",
    46: "/nea",
    47: "/epikoinonia",
    48: "/etaireia",
    49: "/etaireia",
    50: "/etaireia",
    60: "/oroi-chrisis",
    61: "/plastika-fylla",
    62: "/synafi-proionta",
    75: "/xrisimoi-syndesmoi",
    79: "/etaireia",
    80: "/etaireia",
    82: "/politiki-aporritou",
    83: "/politiki-cctv",
    84: "/politiki-cookies",
    85: "/etaireia",
    86: "/etaireia",
  };
  for (const c of Object.values(cats)) {
    if (!flatGroups.has(c.group)) pages[c.id] = `/${c.group}/${c.slug}`;
  }

  const rules: { source: string; destination: string; permanent: boolean }[] = [
    { source: "/el", destination: "/", permanent: true },
    { source: "/en", destination: "/", permanent: false },
    { source: "/Article/1/:rest*", destination: `/nea/${site.news[0].slug}`, permanent: true },
  ];
  for (const [id, dest] of Object.entries(pages)) {
    rules.push({ source: `/${id}/:rest*`, destination: dest, permanent: true });
  }
  for (const p of Object.values(prods)) {
    const dest = flatGroups.has(p.group) ? `/${p.group}/${p.slug}` : `/${p.group}/${p.category}/${p.slug}`;
    rules.push({ source: `/Product/${p.id}/:rest*`, destination: dest, permanent: true });
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
