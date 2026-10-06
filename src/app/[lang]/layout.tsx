import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { Sofia_Sans, Sofia_Sans_Extra_Condensed } from "next/font/google";
import "../globals.css";
import { Header, type HeaderData } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { cms } from "@/lib/content";
import { LANGS, isLang, t, type Lang } from "@/lib/i18n";
import { hrefFor, switchMap } from "@/lib/routes";

const sofia = Sofia_Sans({
  subsets: ["greek", "latin"],
  variable: "--font-sofia",
  display: "swap",
});

const sofiaXC = Sofia_Sans_Extra_Condensed({
  subsets: ["greek", "latin"],
  variable: "--font-sofia-xc",
  display: "swap",
});

export const dynamicParams = false;

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const d = t(lang);
  return {
    metadataBase: new URL("https://alfaglass.gr"),
    title: { default: d.meta.title, template: "%s | ALFA GLASS" },
    description: d.meta.description,
    openGraph: { locale: d.ogLocale, siteName: "ALFA GLASS", type: "website" },
  };
}

export const viewport: Viewport = {
  themeColor: "#f8fafd",
};

function headerData(lang: Lang): HeaderData {
  const c = cms(lang);
  const d = t(lang);
  const groupHrefs = c.site.groups.map((g) => c.groupHref(g));
  return {
    lang,
    homeHref: hrefFor(lang, { kind: "home" }),
    primary: [
      { label: d.nav.company, href: hrefFor(lang, { kind: "company" }), match: [hrefFor(lang, { kind: "company" })] },
      { label: d.nav.products, href: groupHrefs[0], mega: true, match: groupHrefs },
      { label: d.nav.facilities, href: hrefFor(lang, { kind: "facilities" }), match: [hrefFor(lang, { kind: "facilities" })] },
      { label: d.nav.news, href: hrefFor(lang, { kind: "news" }), match: [hrefFor(lang, { kind: "news" })] },
      { label: d.nav.contact, href: hrefFor(lang, { kind: "contact" }), match: [hrefFor(lang, { kind: "contact" })] },
    ],
    mobile: [
      { label: d.nav.home, href: hrefFor(lang, { kind: "home" }) },
      { label: d.nav.company, href: hrefFor(lang, { kind: "company" }) },
      ...c.site.groups.map((g) => ({ label: g.title, href: c.groupHref(g) })),
      { label: d.nav.facilities, href: hrefFor(lang, { kind: "facilities" }) },
      { label: d.nav.news, href: hrefFor(lang, { kind: "news" }) },
      { label: d.nav.links, href: hrefFor(lang, { kind: "links" }) },
      { label: d.nav.contact, href: hrefFor(lang, { kind: "contact" }) },
    ],
    columns: c.site.groups.map((g) => {
      const cats = c.categoriesOf(g);
      return {
        title: g.title,
        href: c.groupHref(g),
        image: g.image,
        items: c.isFlat(g)
          ? c.productsOf(cats[0]).map((p) => ({ label: p.title, href: c.productHref(p), image: p.thumb }))
          : cats.map((cat) => ({ label: cat.title, href: c.categoryHref(cat), image: cat.image })),
      };
    }),
    defaultPreview: c.categoriesOf(c.groupByKey("yalopinakes"))[0]?.image ?? null,
    footnote: d.megaFootnote(c.productCount, c.categoryCount),
    alternates: switchMap(),
    otherHome: hrefFor(lang === "el" ? "en" : "el", { kind: "home" }),
  };
}

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const d = t(lang);
  return (
    <html lang={lang} className={`${sofia.variable} ${sofiaXC.variable}`}>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-fg focus:px-4 focus:py-2 focus:text-surface"
        >
          {d.a11y.skip}
        </a>
        <Header data={headerData(lang)} />
        <main id="main">{children}</main>
        <Footer lang={lang} />
      </body>
    </html>
  );
}
