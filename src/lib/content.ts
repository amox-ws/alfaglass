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

/** Language-independent contact data. Localized labels live in i18n. */
export const contact = {
  phoneHref: "tel:+302105593900",
  mobileHref: "tel:+306974660774",
  email: "sales@alfaglass.gr",
  mapsHref: "https://www.google.com/maps/search/?api=1&query=ALFA+GLASS+Ασπρόπυργος",
};

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
