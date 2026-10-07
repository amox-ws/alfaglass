import elSite from "@/content/el/site.json";
import elCategories from "@/content/el/categories.json";
import elProducts from "@/content/el/products.json";
import enSite from "@/content/en/site.json";
import enCategories from "@/content/en/categories.json";
import enProducts from "@/content/en/products.json";
import type { Lang } from "./i18n";

export type Media = { src: string; caption: string | null };

export type Product = {
  id: number;
  slug: string;
  title: string;
  category: string;
  group: string;
  summary: string;
  thumb: string | null;
  image: string | null;
  body: string;
  gallery: Media[];
  tabs: { title: string; html: string }[];
  related: string[];
};

export type Category = {
  id: number;
  slug: string;
  group: string;
  title: string;
  summary: string;
  intro: string;
  image: string | null;
  gallery: Media[];
  products: string[];
};

/** `key` is stable across languages (the Greek slug); `slug` is the localized URL segment. */
export type Group = {
  key: string;
  slug: string;
  title: string;
  intro: string;
  image: string | null;
  categories: string[];
};

type Page = { title: string; html: string; hero: string | null; gallery: Media[] };

export type Site = {
  groups: Group[];
  company: Page;
  facilities: Page;
  vision: Page;
  activity: Page;
  history: Page & { timeline: { year: string; text: string }[] };
  financials: { title: string; year: string; pdf: string | null }[];
  news: { slug: string; date: string; title: string; html: string; images: string[] }[];
  links: { logo: string; links: { label: string; href: string }[] }[];
  legal: Record<string, { title: string; html: string }>;
  slides: string[];
  espaBanner: string;
};

type Store = { site: Site; categories: Record<string, Category>; products: Record<string, Product> };

const stores: Record<Lang, Store> = {
  el: {
    site: elSite as unknown as Site,
    categories: elCategories as unknown as Record<string, Category>,
    products: elProducts as unknown as Record<string, Product>,
  },
  en: {
    site: enSite as unknown as Site,
    categories: enCategories as unknown as Record<string, Category>,
    products: enProducts as unknown as Record<string, Product>,
  },
};

export const SITE_URL = "https://alfaglass.gr";

export { contact } from "./contact";

/** Hand-picked imagery from the legacy media library. */
export const imagery = {
  warehouse: "/media/439a284966.jpg",
  trucks: "/media/4b79e00574.jpg",
  building: "/media/d32636d1bc.jpg",
  buildingStorm: "/media/b2fdf78b2e.jpg",
  aerial: "/media/9a0710970e.jpg",
  floatStack: "/media/b47b25db6e.jpg",
  engraving: "/media/c0c7dff009.jpg",
};

/** Localized content plus the helpers that depend on it. */
export function cms(lang: Lang) {
  const { site, categories, products } = stores[lang];
  const prefix = lang === "el" ? "" : `/${lang}`;

  const groupByKey = (key: string) => site.groups.find((g) => g.key === key)!;
  const groupBySlug = (slug: string) => site.groups.find((g) => g.slug === slug);
  const isFlat = (g: Group) => g.categories.length === 1;
  const groupOf = (c: Category | Product) => groupByKey(c.group);
  const categoriesOf = (g: Group) => g.categories.map((c) => categories[c]);
  const productsOf = (c: Category) => c.products.map((p) => products[p]);

  const groupHref = (g: Group) => `${prefix}/${g.slug}`;
  const categoryHref = (c: Category) => {
    const g = groupOf(c);
    return isFlat(g) ? groupHref(g) : `${prefix}/${g.slug}/${c.slug}`;
  };
  const productHref = (p: Product) => {
    const g = groupOf(p);
    return isFlat(g) ? `${prefix}/${g.slug}/${p.slug}` : `${prefix}/${g.slug}/${p.category}/${p.slug}`;
  };

  return {
    lang,
    site,
    categories,
    products,
    groupByKey,
    groupBySlug,
    isFlat,
    groupOf,
    categoriesOf,
    productsOf,
    groupHref,
    categoryHref,
    productHref,
    productCount: Object.keys(products).length,
    categoryCount: Object.keys(categories).length,
  };
}

export type Cms = ReturnType<typeof cms>;

export function formatDate(iso: string, locale: string) {
  return new Intl.DateTimeFormat(locale, { day: "2-digit", month: "long", year: "numeric" }).format(new Date(iso));
}

export function stripHtml(html: string) {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

/**
 * The start of a text, cut at a word boundary and ended with "…", never in the middle of a word.
 * A text that fits is returned as it is; a longer one ends at a sentence when one ends after the first 80 characters
 * (a full stop after a word of at least four letters, so "π.χ." and "κλπ." do not count).
 */
export function excerpt(text: string, max = 240) {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  let sentence = 0;
  for (const m of cut.matchAll(/([\p{L}\p{N}]+)[.!](?=\s|$)/gu)) if (m[1].length >= 4) sentence = m.index + m[0].length;
  if (sentence > 80) return cut.slice(0, sentence);
  const words = /\s/.test(t[max]) ? cut : cut.replace(/\s+\S*$/, "");
  return words.replace(/[\s,;:·–-]+$/, "") + "…";
}

/** A text should not stop on a little word ("…χρησιμοποιήθηκαν για να…" reads as cut off): one to three letters. */
const HANGING_WORDS = /(?:\s+\p{L}{1,3})+$/u;

/** Where a bracket or a quotation is still open at the end of `text` (the last such mark), or -1. */
function lastOpenMark(text: string) {
  const open = [["(", ")"], ["«", "»"], ["“", "”"]].map(([o, c]) => (text.lastIndexOf(o) > text.lastIndexOf(c) ? text.lastIndexOf(o) : -1));
  const straight = text.split('"').length % 2 === 0 ? text.lastIndexOf('"') : -1; // an odd number of straight quotes
  return Math.max(...open, straight);
}

/**
 * `excerpt` for a hero or a card, where nothing has to continue at the cut: it also stops before a bracket or a quotation
 * that the cut would leave open ("(έκδοση που…", "“Energy…") and before the little words (up to three letters) hanging
 * at the end, as long as that keeps at least 60 % of `max`.
 */
export function teaser(text: string, max = 240) {
  const short = excerpt(text, max);
  if (!short.endsWith("…")) return short;
  let words = short.slice(0, -1);
  for (let open = lastOpenMark(words); open >= max * 0.6; open = lastOpenMark(words)) {
    words = words.slice(0, open).replace(/[\s,;:·–-]+$/, "");
  }
  const trimmed = words.replace(HANGING_WORDS, "").replace(/[\s,;:·–-]+$/, "");
  return `${trimmed.length >= max * 0.6 ? trimmed : words}…`;
}

const ENTITIES: Record<string, string> = { "&amp;": "&", "&gt;": ">", "&lt;": "<", "&quot;": '"', "&#39;": "'", "&nbsp;": " " };

/**
 * `html` without the text `lead` at its start (tags are kept), or `html` itself when it does not start with that text.
 * Product pages show the summary in the hero; the description must not repeat it.
 */
function dropLeadingText(html: string, lead: string) {
  const target = lead.replace(/\s+/g, " ").trim();
  if (!target) return html;
  let kept = "";
  let i = 0;
  let ti = 0;
  while (ti < target.length) {
    const ch = html[i];
    if (ch === undefined) return html;
    if (ch === "<") {
      const end = html.indexOf(">", i);
      if (end < 0) return html;
      kept += html.slice(i, end + 1);
      i = end + 1;
    } else if (/\s/.test(ch)) {
      while (i < html.length && /\s/.test(html[i])) i++;
      if (target[ti] !== " ") return html;
      ti++;
    } else {
      const entity = ch === "&" ? /^&(#39|[a-z]+);/i.exec(html.slice(i, i + 8))?.[0] : undefined;
      const text = entity ? (ENTITIES[entity] ?? entity) : ch;
      if (target.startsWith(text, ti)) {
        ti += text.length;
        i += entity ? entity.length : 1;
      } else return html;
    }
  }
  const rest = (kept + html.slice(i))
    .replace(/(<p[^>]*>)\s*(<br\s*\/?>\s*)*/i, "$1")
    .replace(/^\s*<p[^>]*>\s*<\/p>\s*/i, "")
    .trim();
  return stripHtml(rest) ? rest : "";
}

/** A product's hero summary and its description, with the summary not repeated in the description. */
export function productCopy(product: Product, max = 320) {
  const summary = excerpt(product.summary, max);
  return { summary, description: dropLeadingText(product.body, summary.replace(/…$/, "")) };
}
