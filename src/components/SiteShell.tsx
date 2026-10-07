import { Header, type HeaderData } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { cms } from "@/lib/content";
import { t, type Lang } from "@/lib/i18n";
import { hrefFor, switchMap } from "@/lib/routes";

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

/** Skip link, header, main and footer: the frame of every page, the 404 included. */
export function SiteShell({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  const d = t(lang);
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-fg focus:px-4 focus:py-2 focus:text-surface"
      >
        {d.a11y.skip}
      </a>
      <Header data={headerData(lang)} />
      <main id="main">{children}</main>
      <Footer lang={lang} />
    </>
  );
}
