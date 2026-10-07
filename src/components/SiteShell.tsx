import { Header, type HeaderData } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MachineBlueprint } from "@/components/kit/MachineBlueprint";
import { cms } from "@/lib/content";
import { enquiryHref } from "@/lib/contact";
import { features } from "@/lib/features";
import { t, type Lang } from "@/lib/i18n";
import { hrefFor, switchMap } from "@/lib/routes";

function headerData(lang: Lang): HeaderData {
  const c = cms(lang);
  const d = t(lang);
  const groupHrefs = c.site.groups.map((g) => c.groupHref(g));
  const company = hrefFor(lang, { kind: "company" });
  const facilities = hrefFor(lang, { kind: "facilities" });
  const news = hrefFor(lang, { kind: "news" });
  const contact = hrefFor(lang, { kind: "contact" });
  const service = hrefFor(lang, { kind: "service" });
  const works = hrefFor(lang, { kind: "works" });
  const estimator = `${service}#aitima-kopis`;
  const companyLinks = [
    { label: d.nav.aboutCompany, href: company },
    { label: d.nav.facilities, href: facilities },
    { label: d.nav.history, href: `${company}#istoria` },
    { label: d.nav.news, href: news },
    { label: d.nav.financialsShort, href: `${company}#oikonomika` },
  ];
  return {
    lang,
    homeHref: hrefFor(lang, { kind: "home" }),
    // The two pillars first: Προϊόντα, CNC κοπή; Έργα only while there are works to show
    nav: [
      { kind: "mega", label: d.nav.products, href: groupHrefs[0], match: groupHrefs },
      { kind: "link", label: d.nav.service, href: service, match: [service] },
      ...(features.works ? [{ kind: "link" as const, label: d.nav.works, href: works, match: [works] }] : []),
      { kind: "menu", label: d.nav.company, href: company, match: [company, facilities, news], items: companyLinks },
      { kind: "link", label: d.nav.contact, href: contact, match: [contact] },
    ],
    mega: {
      columns: c.site.groups.map((g) => {
        const cats = c.categoriesOf(g);
        return {
          title: g.title,
          href: c.groupHref(g),
          items: c.isFlat(g)
            ? c.productsOf(cats[0]).map((p) => ({ label: p.title, href: c.productHref(p) }))
            : cats.map((cat) => ({ label: cat.title, href: c.categoryHref(cat), count: cat.products.length })),
        };
      }),
      count: d.megaCount(c.productCount, c.categoryCount),
      cutting: {
        label: d.machine.cardLabel,
        title: d.nav.serviceLong,
        line: d.machine.cardLine,
        href: service,
        linkLabel: d.machine.serviceLink,
        estimatorHref: estimator,
        estimatorLabel: d.nav.estimator,
      },
      drawing: <MachineBlueprint lang={lang} variant="mini" />,
    },
    mobile: {
      products: { label: d.nav.products, groups: c.site.groups.map((g) => ({ label: g.title, href: c.groupHref(g) })) },
      service: { label: d.nav.serviceLong, href: service },
      works: features.works ? { label: d.nav.works, href: works } : null,
      company: { label: d.nav.company, links: companyLinks },
      contact: { label: d.nav.contact, href: contact },
      estimator: { label: d.nav.estimator, href: estimator },
    },
    quote: { label: d.common.requestQuote, href: enquiryHref({ subject: d.common.quoteSubject }) },
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
