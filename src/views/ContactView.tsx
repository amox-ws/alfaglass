import { Breadcrumbs } from "@/components/page";
import { MaskedLines, Reveal } from "@/components/ui";
import { ContactMap } from "@/components/ContactMap";
import { contact } from "@/lib/content";
import { t, type Lang } from "@/lib/i18n";

export function ContactView({ lang }: { lang: Lang }) {
  const d = t(lang);
  const dc = d.contactPage;
  const rows = [
    { label: dc.phone, value: d.contact.phone, href: contact.phoneHref, big: true },
    { label: dc.mobile, value: d.contact.mobile, href: contact.mobileHref },
    { label: dc.email, value: contact.email, href: `mailto:${contact.email}` },
    { label: dc.address, value: d.contact.address, note: d.contact.addressNote, href: contact.mapsHref },
  ];
  return (
    <section data-theme="frost" className="bg-surface pb-[clamp(5rem,11vw,11rem)] pt-[calc(var(--header-h)+3rem)] md:pt-[calc(var(--header-h)+5rem)]">
      <div className="shell">
        <Breadcrumbs lang={lang} items={[{ label: d.nav.contact }]} />
        <MaskedLines as="h1" lines={dc.title} className="t-mega mt-10 md:mt-14" />

        <div className="mt-16 grid gap-12 md:mt-24 md:grid-cols-12">
          <div className="border-t border-line md:col-span-6">
            {rows.map((r, i) => (
              <Reveal key={r.label} delay={i * 0.06} className="border-b border-line">
                <a
                  href={r.href}
                  target={r.href.startsWith("http") ? "_blank" : undefined}
                  rel={r.href.startsWith("http") ? "noreferrer" : undefined}
                  className="group grid gap-2 py-7 sm:grid-cols-[9rem_1fr_auto] sm:items-baseline sm:gap-6"
                >
                  <span className="t-label text-fg-dim">{r.label}</span>
                  <span className="block">
                    <span
                      className={`block transition-colors group-hover:text-accent ${
                        r.big ? "font-display text-[clamp(2.5rem,5vw,4.5rem)] font-bold leading-none tabular" : "text-xl font-medium md:text-2xl"
                      }`}
                    >
                      {r.value}
                    </span>
                    {r.note && <span className="mt-2 block text-fg-muted">{r.note}</span>}
                  </span>
                  <span aria-hidden className="hidden text-fg-dim transition-transform group-hover:translate-x-1 group-hover:text-accent sm:block">
                    {r.href.startsWith("http") ? "↗" : "→"}
                  </span>
                </a>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.15} className="md:col-span-5 md:col-start-8">
            <ContactMap lang={lang} />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
