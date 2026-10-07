import Link from "next/link";
import Image from "next/image";
import { cms } from "@/lib/content";
import { contact } from "@/lib/contact";
import { t, type Lang } from "@/lib/i18n";
import { LEGAL_KEYS, hrefFor } from "@/lib/routes";

/** Every link in the footer is a 44px-tall target. */
const row = "flex min-h-11 items-center transition-colors hover:text-fg";

export function Footer({ lang }: { lang: Lang }) {
  const year = new Date().getFullYear();
  const d = t(lang);
  const c = cms(lang);
  const company = hrefFor(lang, { kind: "company" });
  return (
    <footer data-theme="deep" className="relative overflow-hidden border-t border-line bg-surface pt-20 md:pt-28">
      <div className="shell">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-5">
            <h2 className="t-h2 max-w-[16ch]">{d.footer.headline}</h2>
            <div className="mt-8 grid">
              <a href={contact.phoneHref} className="t-h3 flex min-h-11 w-fit items-center tabular transition-colors hover:text-accent">
                {d.contact.phone}
              </a>
              <a href={contact.mobileHref} className="t-lead flex min-h-11 w-fit items-center tabular text-fg-muted transition-colors hover:text-fg">
                {d.contact.mobile}
              </a>
              <a href={`mailto:${contact.email}`} className="flex min-h-11 w-fit items-center transition-colors hover:text-accent">
                {contact.email}
              </a>
            </div>
          </div>

          <div className="grid gap-10 sm:grid-cols-3 lg:col-span-7">
            <nav aria-label={d.a11y.sitemap} className="grid grid-cols-2 gap-10 sm:col-span-2">
              <FooterCol
                title={d.nav.company}
                links={[
                  { label: d.nav.theCompany, href: company },
                  { label: d.nav.history, href: `${company}#history` },
                  { label: d.nav.facilities, href: hrefFor(lang, { kind: "facilities" }) },
                  { label: d.nav.financials, href: `${company}#financials` },
                  { label: d.nav.news, href: hrefFor(lang, { kind: "news" }) },
                ]}
              />
              <FooterCol
                title={d.nav.products}
                links={[
                  ...c.site.groups.map((g) => ({ label: g.title, href: c.groupHref(g) })),
                  { label: d.nav.links, href: hrefFor(lang, { kind: "links" }) },
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
              <a href={contact.mapsHref} target="_blank" rel="noreferrer" className="text-link t-label mt-2 font-semibold text-accent">
                {d.common.directions}
              </a>
            </div>
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
