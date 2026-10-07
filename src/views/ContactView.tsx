import Link from "next/link";
import { ContactMap } from "@/components/ContactMap";
import { AttikiExit } from "@/components/kit/AttikiExit";
import { RackLines } from "@/components/kit/RackLines";
import { Breadcrumbs } from "@/components/page";
import { MaskedLines, Reveal } from "@/components/ui";
import { cms, contact } from "@/lib/content";
import { enquiryHref } from "@/lib/contact";
import { t, type Lang } from "@/lib/i18n";
import { hrefFor } from "@/lib/routes";

/** The handset of the closing call, the same drawing. */
function Handset() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Contact: reach a person now. The title (`t-mega`, the signature) over the rack lines, then the lines of the page: the phone
 * as the largest type, the mobile, the email and the address, each one link and at least 64px tall; then the three preset
 * enquiries (an email that already knows what you want) and the way to the cutting estimator. From lg the lines take columns 1–6 and the
 * map and the exit schematic columns 8–12; on a phone they follow one another. The closing call would repeat this page, so it is
 * left out: the footer follows.
 */
export function ContactView({ lang }: { lang: Lang }) {
  const d = t(lang);
  const dc = d.contactPage;
  const c = cms(lang);
  const estimator = `${hrefFor(lang, { kind: "service" })}#aitima-kopis`;
  const rows = [
    { id: "phone", label: dc.phone, value: d.contact.phone, href: contact.phoneHref, size: "t-display" },
    { id: "mobile", label: dc.mobile, value: d.contact.mobile, href: contact.mobileHref, size: "t-h2" },
    { id: "email", label: dc.email, value: contact.email, href: `mailto:${contact.email}`, size: "t-h3" },
    { id: "address", label: dc.address, value: d.contact.address, note: d.contact.addressNote, href: contact.mapsHref, size: "t-h3" },
  ];
  return (
    <section data-theme="frost" className="relative overflow-hidden bg-surface pb-section pt-[calc(var(--header-h)+3rem)] md:pt-[calc(var(--header-h)+5rem)]">
      <RackLines className="contact-rack" />
      <div className="shell relative">
        <div className="hero-fade">
          <Breadcrumbs lang={lang} items={[{ label: d.nav.contact }]} />
        </div>
        <MaskedLines as="h1" eager lines={dc.title} className="t-mega mt-5" />

        <div className="mt-16 grid gap-16 lg:mt-10 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-6">
            <ul className="border-t border-line">
              {rows.map((r, i) => {
                const external = r.href.startsWith("http");
                return (
                  <Reveal as="li" key={r.id} delay={i * 0.05} className="border-b border-line">
                    <a
                      href={r.href}
                      target={external ? "_blank" : undefined}
                      rel={external ? "noreferrer" : undefined}
                      data-row={r.id}
                      className="contact-row group lift"
                    >
                      <span className="contact-row-label t-label text-fg-muted">{r.label}</span>
                      <span className="contact-row-value">
                        <span className={`${r.size} tabular block transition-colors group-hover:text-accent ${r.id === "address" ? "" : "whitespace-nowrap"}`}>{r.value}</span>
                        {r.note && <span className="t-small mt-2 block text-fg-muted">{r.note}</span>}
                        {external && <span className="t-label mt-3 block text-accent">{d.common.directions}</span>}
                      </span>
                      {r.id === "phone" ? (
                        <span aria-hidden className="cta-call contact-call">
                          <Handset />
                        </span>
                      ) : (
                        <span aria-hidden className="specimen-arrow contact-arrow">
                          {external ? "↗" : "→"}
                        </span>
                      )}
                    </a>
                  </Reveal>
                );
              })}
            </ul>

            <Reveal className="mt-12">
              <p className="t-label text-fg-muted" id="contact-quote">
                {dc.quoteFor}
              </p>
              <ul className="mt-5 flex flex-wrap gap-3" aria-labelledby="contact-quote">
                {c.site.groups.map((g) => (
                  <li key={g.key}>
                    <a href={enquiryHref({ subject: dc.quoteSubject(g.title) })} className="contact-chip t-small">
                      {g.title}
                    </a>
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
                <Link href={estimator} className="contact-chip contact-chip-cnc t-small">
                  {d.nav.service}
                  <span aria-hidden>→</span>
                </Link>
                <span className="t-label text-fg-muted">{dc.cncHint}</span>
              </div>
            </Reveal>
          </div>

          <div className="lg:col-span-5 lg:col-start-8">
            <p className="t-label text-fg-muted">{dc.findUs}</p>
            <Reveal delay={0.1} className="mt-4">
              <ContactMap lang={lang} />
            </Reveal>
            <Reveal delay={0.1} className="mt-8">
              <AttikiExit lang={lang} />
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
