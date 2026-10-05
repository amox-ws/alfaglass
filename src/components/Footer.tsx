import Link from "next/link";
import Image from "next/image";
import { cms, contact } from "@/lib/content";
import { t, type Lang } from "@/lib/i18n";
import { LEGAL_KEYS, hrefFor } from "@/lib/routes";

export function Footer({ lang }: { lang: Lang }) {
  const year = new Date().getFullYear();
  const d = t(lang);
  const c = cms(lang);
  const company = hrefFor(lang, { kind: "company" });
  return (
    <footer data-theme="deep" className="relative overflow-hidden border-t border-line bg-surface pt-20 md:pt-28">
      <div className="shell">
        <div className="grid gap-14 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="t-h2 max-w-[16ch]">{d.footer.headline}</p>
            <div className="mt-8 grid gap-1">
              <a href={contact.phoneHref} className="link-underline w-fit text-2xl font-semibold tabular">
                {d.contact.phone}
              </a>
              <a href={contact.mobileHref} className="link-underline w-fit text-lg text-fg-muted tabular">
                {d.contact.mobile}
              </a>
              <a href={`mailto:${contact.email}`} className="link-underline mt-2 w-fit text-lg">
                {contact.email}
              </a>
            </div>
          </div>

          <nav aria-label={d.a11y.sitemap} className="grid grid-cols-2 gap-10 sm:grid-cols-3 md:col-span-7">
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
            <div>
              <p className="t-label mb-5 text-fg-dim">{d.footer.headOffice}</p>
              <address className="not-italic leading-relaxed text-fg-muted">
                {d.contact.company}
                <br />
                {d.contact.address}
                <br />
                <span className="text-fg-dim">{d.contact.addressNote}</span>
              </address>
              <a
                href={contact.mapsHref}
                target="_blank"
                rel="noreferrer"
                className="link-underline mt-4 inline-block text-sm font-semibold text-accent"
              >
                {d.common.directions}
              </a>
            </div>
          </nav>
        </div>
      </div>

      {/* Wordmark */}
      <div aria-hidden className="pointer-events-none mt-20 select-none md:mt-28">
        <p
          className="font-display whitespace-nowrap text-center font-extrabold uppercase leading-[0.76] tracking-[-0.01em]"
          style={{
            fontSize: "clamp(5rem, 24.5vw, 30rem)",
            color: "transparent",
            WebkitTextStroke: "1px var(--line-strong)",
          }}
        >
          Alfaglass
        </p>
      </div>

      <div className="border-t border-line">
        <div className="shell flex flex-col gap-6 py-8 text-sm text-fg-dim lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-1.5">
            <p>
              © {year} {d.contact.company} {d.footer.rights}
            </p>
            <p>
              Powered by{" "}
              <a
                href="https://amox.gr"
                target="_blank"
                rel="noopener"
                className="link-underline font-semibold tracking-[0.04em] text-fg-muted transition-colors hover:text-accent"
              >
                AMOX
              </a>
            </p>
          </div>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {LEGAL_KEYS.map((key) => (
              <li key={key}>
                <Link href={hrefFor(lang, { kind: "legal", key })} className="transition-colors hover:text-fg">
                  {d.legal[key]}
                </Link>
              </li>
            ))}
          </ul>
          <a href="/docs/espa-alfaglass.pdf" target="_blank" rel="noreferrer" className="block w-fit rounded-sm bg-[oklch(0.99_0.003_250)] p-1.5">
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
      <p className="t-label mb-5 text-fg-dim">{title}</p>
      <ul className="grid gap-2">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="text-fg-muted transition-colors hover:text-fg">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
