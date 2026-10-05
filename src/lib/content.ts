import siteJson from "@/content/site.json";
import categoriesJson from "@/content/categories.json";
import productsJson from "@/content/products.json";

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

export type Group = {
  slug: string;
  title: string;
  intro: string;
  image: string | null;
  categories: string[];
};

type Page = { title: string; html: string; hero: string | null; gallery: Media[] };

type Site = {
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

export const site = siteJson as unknown as Site;
export const categories = categoriesJson as unknown as Record<string, Category>;
export const products = productsJson as unknown as Record<string, Product>;

export const contact = {
  company: "ALFA GLASS Α.Ε.",
  phone: "210 5593900",
  phoneHref: "tel:+302105593900",
  mobile: "6974 660774",
  mobileHref: "tel:+306974660774",
  email: "sales@alfaglass.gr",
  address: "Θέση Κύριλλος, Τ.Κ. 19300, Ασπρόπυργος",
  addressNote: "Δίπλα στην έξοδο 4 της Αττικής Οδού",
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

export function getGroup(slug: string) {
  return site.groups.find((g) => g.slug === slug);
}

export function categoriesOf(group: Group) {
  return group.categories.map((c) => categories[c]);
}

export function productsOf(category: Category) {
  return category.products.map((p) => products[p]);
}

/** Groups with a single category list products directly under the group. */
export function isFlatGroup(group: Group) {
  return group.categories.length === 1;
}

export function productHref(p: Product) {
  const group = getGroup(p.group)!;
  return isFlatGroup(group) ? `/${p.group}/${p.slug}` : `/${p.group}/${p.category}/${p.slug}`;
}

export function categoryHref(c: Category) {
  const group = getGroup(c.group)!;
  return isFlatGroup(group) ? `/${c.group}` : `/${c.group}/${c.slug}`;
}

export const nav = [
  {
    label: "Εταιρεία",
    href: "/etaireia",
    children: [
      { label: "Η Εταιρεία", href: "/etaireia" },
      { label: "Όραμα & Αξίες", href: "/etaireia#orama" },
      { label: "Ιστορία", href: "/etaireia#istoria" },
      { label: "Δραστηριότητα", href: "/etaireia#drastiriotita" },
      { label: "Οικονομικές Καταστάσεις", href: "/etaireia#oikonomika" },
    ],
  },
  { label: "Εγκαταστάσεις", href: "/egkatastaseis" },
  { label: "Υαλοπίνακες", href: "/yalopinakes", group: "yalopinakes" },
  { label: "Πλαστικά Φύλλα", href: "/plastika-fylla", group: "plastika-fylla" },
  { label: "Συναφή Προϊόντα", href: "/synafi-proionta", group: "synafi-proionta" },
  { label: "Νέα", href: "/nea" },
  { label: "Επικοινωνία", href: "/epikoinonia" },
] as const;

export const legalLinks = [
  { label: "Όροι Χρήσης", href: "/oroi-chrisis" },
  { label: "Πολιτική Απορρήτου", href: "/politiki-aporritou" },
  { label: "Πολιτική Cookies", href: "/politiki-cookies" },
  { label: "Πολιτική CCTV", href: "/politiki-cctv" },
];

export function formatDate(iso: string) {
  return new Intl.DateTimeFormat("el-GR", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(iso));
}

export function stripHtml(html: string) {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}
