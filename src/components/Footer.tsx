import Link from "next/link";
import Image from "next/image";
import { cms } from "@/lib/content";
import { contact } from "@/lib/contact";
import { features } from "@/lib/features";
import { t, type Lang } from "@/lib/i18n";
import { LEGAL_KEYS, hrefFor } from "@/lib/routes";

/** Every link in the footer is a 44px-tall target. */
const row = "flex min-h-11 items-center py-1.5 transition-colors hover:text-fg";

/**
 * The footer is night and continues the closing call above it (one ending, a hairline between): the brand line, four columns (the two
 * pillars first: Προϊόντα, Κατεργασία, then Εταιρεία and the address; 2 × 2 on a phone), the outlined wordmark, and the legal row.
 * The address sits outside the `nav` landmark.
 */
export function Footer({ lang }: { lang: Lang }) {
  const year = new Date().getFullYear();
  const d = t(lang);
  const c = cms(lang);
  const company = hrefFor(lang, { kind: "company" });
  const service = hrefFor(lang, { kind: "service" });
  return (
    <footer data-theme="night" className="relative overflow-hidden border-t border-line bg-surface pt-20 md:pt-28">
      <div className="shell">
        <h2 className="t-h2 max-w-[16ch]">{d.footer.headline}</h2>
        <div className="mt-14 grid grid-cols-2 gap-x-6 gap-y-12 lg:mt-20 lg:grid-cols-4 lg:gap-x-8">
          <nav aria-label={d.a11y.sitemap} className="contents">
            <FooterCol
              title={d.nav.products}
              links={[
                ...c.site.groups.map((g) => ({ label: g.title, href: c.groupHref(g) })),
                { label: d.nav.links, href: hrefFor(lang, { kind: "links" }) },
              ]}
            />
            <FooterCol
              title={d.machine.cardLabel}
              links={[
                { label: d.nav.serviceLong, href: service },
                { label: d.nav.estimator, href: `${service}#aitima-kopis` },
                ...(features.works ? [{ label: d.nav.works, href: hrefFor(lang, { kind: "works" }) }] : []),
              ]}
            />
            <FooterCol
              title={d.nav.company}
              links={[
                { label: d.nav.aboutCompany, href: company },
                { label: d.nav.history, href: `${company}#istoria` },
                { label: d.nav.facilities, href: hrefFor(lang, { kind: "facilities" }) },
                { label: d.nav.financialsShort, href: `${company}#oikonomika` },
                { label: d.nav.news, href: hrefFor(lang, { kind: "news" }) },
              ]}
            />
          </nav>
          <div>
            <h3 className="t-label mb-3 text-fg-muted">{d.footer.headOffice}</h3>
            <address className="not-italic text-fg-muted">
              {d.contact.company}
              <br />
              {d.contact.address}
              <br />
              <span className="text-fg-dim">{d.contact.addressNote}</span>
            </address>
            <a href={contact.mapsHref} target="_blank" rel="noreferrer" className="text-link t-label mt-2 text-balance text-accent">
              {d.common.directions}
            </a>
          </div>
        </div>
      </div>

      {/* Wordmark */}
      <div aria-hidden className="pointer-events-none mt-20 select-none text-center md:mt-28">
        <p className="wordmark">Alfaglass</p>
      </div>

      <div className="border-t border-line">
        <div className="t-small shell flex flex-col gap-4 py-8 text-fg-dim lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p>
              © {year} {d.contact.company} {d.footer.rights}
            </p>
            <span className="flex items-center gap-1.5">
              {d.footer.credit}
              <a href="https://amox.gr" target="_blank" rel="noopener" className="text-link min-w-11 justify-center font-semibold tracking-[0.04em] text-fg-muted hover:text-accent">
                AMOX
              </a>
            </span>
          </div>
          <ul className="flex flex-wrap gap-x-6">
            {LEGAL_KEYS.map((key) => (
              <li key={key}>
                <Link href={hrefFor(lang, { kind: "legal", key })} className={row}>
                  {d.legal[key]}
                </Link>
              </li>
            ))}
          </ul>
          <a href="/docs/espa-alfaglass.pdf" target="_blank" rel="noreferrer" className="block w-fit rounded-sm bg-snow p-1.5">
            <Image src={c.site.espaBanner} alt={d.footer.espaAlt} width={220} height={44} className="h-9 w-auto" />
          </a>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <h3 className="t-label mb-3 text-fg-muted">{title}</h3>
      <ul className="grid">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className={`${row} text-fg-muted`}>
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
