import { works } from "@/content/works";
import { cms } from "./content";
import { features } from "./features";
import { LANGS, type Lang } from "./i18n";

/** A page, independent of language. Ids/keys are shared by both languages. */
export type Route =
  | { kind: "home" }
  | { kind: "company" }
  | { kind: "facilities" }
  | { kind: "news" }
  | { kind: "article"; index: number }
  | { kind: "contact" }
  | { kind: "links" }
  | { kind: "service" }
  | { kind: "works" }
  | { kind: "work"; slug: string }
  | { kind: "legal"; key: string }
  | { kind: "group"; key: string }
  | { kind: "category"; id: number }
  | { kind: "product"; id: number };

const STATIC: Record<Lang, Record<"company" | "facilities" | "news" | "contact" | "links" | "service" | "works", string>> = {
  el: {
    company: "etaireia",
    facilities: "egkatastaseis",
    news: "nea",
    contact: "epikoinonia",
    links: "xrisimoi-syndesmoi",
    service: "cnc-kopi-katergasia",
    works: "erga",
  },
  // The English slugs of the cutting service and of the works are provisional: phase 4 reviews them
  en: {
    company: "company",
    facilities: "facilities",
    news: "news",
    contact: "contact",
    links: "useful-links",
    service: "cnc-cutting",
    works: "projects",
  },
};

const LEGAL: Record<Lang, Record<string, string>> = {
  el: {
    "oroi-chrisis": "oroi-chrisis",
    "politiki-aporritou": "politiki-aporritou",
    "politiki-cookies": "politiki-cookies",
    "politiki-cctv": "politiki-cctv",
  },
  en: {
    "oroi-chrisis": "terms-of-use",
    "politiki-aporritou": "privacy-policy",
    "politiki-cookies": "cookie-policy",
    "politiki-cctv": "cctv-policy",
  },
};

export const LEGAL_KEYS = Object.keys(LEGAL.el);

function routeKey(r: Route) {
  switch (r.kind) {
    case "article":
      return `article:${r.index}`;
    case "legal":
    case "group":
      return `${r.kind}:${r.key}`;
    case "work":
      return `work:${r.slug}`;
    case "category":
    case "product":
      return `${r.kind}:${r.id}`;
    default:
      return r.kind;
  }
}

/** "/en/glass/x" -> ["glass", "x"]; "/yalopinakes/x" -> ["yalopinakes", "x"] */
function unprefix(lang: Lang, href: string) {
  const path = lang === "el" ? href : href.slice(lang.length + 1);
  return path.split("/").filter(Boolean);
}

/** Path segments (without the language prefix) for a route in a language. */
function segmentsFor(lang: Lang, r: Route): string[] | null {
  const c = cms(lang);
  switch (r.kind) {
    case "home":
      return [];
    case "company":
    case "facilities":
    case "news":
    case "contact":
    case "links":
    case "service":
    case "works":
      return [STATIC[lang][r.kind]];
    case "work":
      return [STATIC[lang].works, r.slug];
    case "article": {
      const a = c.site.news[r.index];
      return a ? [STATIC[lang].news, a.slug] : null;
    }
    case "legal":
      return [LEGAL[lang][r.key]];
    case "group":
      return [c.groupByKey(r.key).slug];
    case "category": {
      const cat = Object.values(c.categories).find((x) => x.id === r.id);
      return cat ? unprefix(lang, c.categoryHref(cat)) : null;
    }
    case "product": {
      const p = Object.values(c.products).find((x) => x.id === r.id);
      return p ? unprefix(lang, c.productHref(p)) : null;
    }
  }
}

export function hrefFor(lang: Lang, r: Route) {
  const segs = segmentsFor(lang, r) ?? [];
  const path = segs.join("/");
  if (lang === "el") return `/${path}`;
  return path ? `/${lang}/${path}` : `/${lang}`;
}

/** Every route that exists in a language (both languages currently share the same set). */
function allRoutes(lang: Lang): Route[] {
  const c = cms(lang);
  const routes: Route[] = [
    { kind: "home" },
    { kind: "company" },
    { kind: "facilities" },
    { kind: "news" },
    { kind: "contact" },
    { kind: "links" },
    { kind: "service" },
    { kind: "works" },
    ...works.map((w) => ({ kind: "work" as const, slug: w.slug })),
    ...c.site.news.map((_, index) => ({ kind: "article" as const, index })),
    ...LEGAL_KEYS.map((key) => ({ kind: "legal" as const, key })),
    ...c.site.groups.map((g) => ({ kind: "group" as const, key: g.key })),
  ];
  for (const g of c.site.groups) {
    if (!c.isFlat(g)) for (const cat of c.categoriesOf(g)) routes.push({ kind: "category", id: cat.id });
    for (const cat of c.categoriesOf(g)) for (const p of c.productsOf(cat)) routes.push({ kind: "product", id: p.id });
  }
  return routes;
}

type Table = { byPath: Map<string, Route>; byKey: Map<string, string> };
const tables = new Map<Lang, Table>();

function table(lang: Lang): Table {
  let tb = tables.get(lang);
  if (!tb) {
    tb = { byPath: new Map(), byKey: new Map() };
    for (const r of allRoutes(lang)) {
      const segs = segmentsFor(lang, r);
      if (!segs) continue;
      const path = segs.join("/");
      tb.byPath.set(path, r);
      tb.byKey.set(routeKey(r), hrefFor(lang, r));
    }
    tables.set(lang, tb);
  }
  return tb;
}

export function resolve(lang: Lang, segments: string[] = []): Route | null {
  return table(lang).byPath.get(segments.map(decodeURIComponent).join("/")) ?? null;
}

export function staticSegments(lang: Lang): string[][] {
  return [...table(lang).byPath.keys()].map((p) => (p ? p.split("/") : []));
}

/** Same page in every language, e.g. { el: "/etaireia", en: "/en/company" }. */
export function alternatesFor(r: Route): Record<Lang, string> {
  return Object.fromEntries(LANGS.map((l) => [l, table(l).byKey.get(routeKey(r)) ?? hrefFor(l, { kind: "home" })])) as Record<
    Lang,
    string
  >;
}

/** Compact map used by the language switcher: path in one language -> path in the other. */
export function switchMap(): Record<string, string> {
  const map: Record<string, string> = {};
  for (const r of allRoutes("el")) {
    const a = alternatesFor(r);
    map[a.el] = a.en;
    map[a.en] = a.el;
  }
  return map;
}

/**
 * Whether a page belongs in the sitemap and may be indexed. Έργα (the list and every case study) stays out while there are
 * fewer than three real works: until then /erga is an honest, unlinked empty state.
 */
export function indexable(r: Route) {
  return features.works || (r.kind !== "works" && r.kind !== "work");
}
