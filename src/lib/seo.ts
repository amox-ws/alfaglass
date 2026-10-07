import { SITE_URL, cms, contact, imagery } from "./content";
import { t, type Lang } from "./i18n";
import { hrefFor, type Route } from "./routes";

const absolute = (href: string) => `${SITE_URL}${href === "/" ? "" : href}`;

/** Where the premises are: the place "ALFA GLASS A.E.E." on Google Maps, the same one the contact page embeds. */
const GEO = { latitude: 38.085753, longitude: 23.618321 };

const ADDRESS: Record<Lang, { streetAddress: string; addressLocality: string }> = {
  el: { streetAddress: "Θέση Κύριλλος", addressLocality: "Ασπρόπυργος" },
  en: { streetAddress: "Kyrillos Position", addressLocality: "Aspropyrgos" },
};

/** The company and its premises (home and contact pages). */
export function organizationLd(lang: Lang) {
  const d = t(lang);
  const url = absolute(hrefFor(lang, { kind: "home" }));
  const telephone = "+30 210 5593900";
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: d.contact.company,
        url,
        logo: `${SITE_URL}/brand/logo-color.png`,
        foundingDate: "1999",
        email: contact.email,
        telephone,
      },
      {
        "@type": "LocalBusiness",
        "@id": `${SITE_URL}/#localbusiness`,
        name: d.contact.company,
        url,
        image: `${SITE_URL}${imagery.building}`,
        telephone,
        email: contact.email,
        address: { "@type": "PostalAddress", ...ADDRESS[lang], postalCode: "19300", addressCountry: "GR" },
        geo: { "@type": "GeoCoordinates", ...GEO },
        hasMap: contact.mapsHref,
        parentOrganization: { "@id": `${SITE_URL}/#organization` },
      },
    ],
  };
}

/** Home → group → category → product, the same trail the page shows (null for pages without one). */
export function breadcrumbLd(lang: Lang, route: Route) {
  const c = cms(lang);
  const trail = [{ name: t(lang).nav.home, href: hrefFor(lang, { kind: "home" }) }];
  if (route.kind === "group") {
    const g = c.groupByKey(route.key);
    trail.push({ name: g.title, href: c.groupHref(g) });
  } else if (route.kind === "category") {
    const cat = Object.values(c.categories).find((x) => x.id === route.id)!;
    trail.push({ name: c.groupOf(cat).title, href: c.groupHref(c.groupOf(cat)) }, { name: cat.title, href: c.categoryHref(cat) });
  } else if (route.kind === "product") {
    const p = Object.values(c.products).find((x) => x.id === route.id)!;
    const g = c.groupOf(p);
    trail.push({ name: g.title, href: c.groupHref(g) });
    if (!c.isFlat(g)) trail.push({ name: c.categories[p.category].title, href: c.categoryHref(c.categories[p.category]) });
    trail.push({ name: p.title, href: c.productHref(p) });
  } else return null;
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((step, i) => ({ "@type": "ListItem", position: i + 1, name: step.name, item: absolute(step.href) })),
  };
}
