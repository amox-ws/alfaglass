import Link from "next/link";
import { CRACK } from "@/components/crack";
import { RackLines } from "@/components/kit/RackLines";
import { MaskedLines } from "@/components/reveal";
import { cms } from "@/lib/content";
import { t, type Lang } from "@/lib/i18n";
import { hrefFor } from "@/lib/routes";

/**
 * The 404: a pane that was hit. The page's main content, inside the site frame, on the brand indigo over the rack lines: "404" in
 * outline at the largest size of the scale with hairline cracks (`--edge`) fanning out from the middle of it to the edges of the page, the title
 * "Ραγισμένο τζάμι", the text, and the three groups and the contact page as an index list (mono index, name, arrow). Labels and links come from
 * the dictionary, the content and the routes. The cracks are decoration (hidden from assistive technology) and fade in after the title (opacity only).
 */
export function NotFoundPage({ lang }: { lang: Lang }) {
  const d = t(lang);
  const c = cms(lang);
  const items = [...c.site.groups.map((g) => ({ label: g.title, href: c.groupHref(g) })), { label: d.nav.contact, href: hrefFor(lang, { kind: "contact" }) }];
  return (
    <section
      data-theme="deep"
      data-hero="dark"
      className="nf relative isolate flex min-h-[100svh] flex-col justify-center overflow-hidden bg-surface pb-16 pt-[calc(var(--header-h)+3rem)] md:pb-24"
    >
      <RackLines />
      {/* the surface fading out under the transparent header: it tells the harness what the header lies on, and keeps the cracks off the menu */}
      <div aria-hidden className="hero-cine-scrim" />
      <div className="shell relative z-[2] grid gap-x-8 lg:grid-cols-12">
        <p className="t-label hero-fade text-accent lg:col-span-7">{d.notFound.eyebrow}</p>
        <div className="nf-digits mt-5 lg:col-span-5 lg:col-start-8 lg:row-span-4 lg:row-start-1 lg:mt-0 lg:self-center lg:justify-self-center">
          <svg aria-hidden viewBox="-1000 -600 2000 1200" fill="none" strokeLinecap="round" strokeLinejoin="round" className="nf-crack hero-fade" style={{ animationDelay: "0.8s" }}>
            <path d={CRACK.main} strokeWidth="1" />
            <path d={CRACK.branch} strokeWidth="1" />
            <path d={CRACK.ring} strokeWidth="1" />
          </svg>
          <p aria-hidden className="nf-404 t-giga hero-fade">
            404
          </p>
        </div>
        <MaskedLines as="h1" eager lines={[d.notFound.title]} className="t-display relative z-[1] mt-8 lg:col-span-7" />
        <p className="t-lead hero-rise relative z-[1] mt-6 max-w-[36rem] text-fg-muted lg:col-span-7" style={{ animationDelay: "0.3s" }}>
          {d.notFound.text}
        </p>
        <nav aria-label={d.notFound.whereTo} className="hero-rise relative z-[1] mt-12 lg:col-span-7 lg:max-w-[40rem]" style={{ animationDelay: "0.4s" }}>
          <ul className="border-t border-line">
            {items.map((item, i) => (
              <li key={item.href} className="border-b border-line">
                <Link href={item.href} className="nf-row group lift glint">
                  <span className="t-label tabular text-fg-muted">{String(i + 1).padStart(2, "0")}</span>
                  <span className="t-h3 transition-colors group-hover:text-accent">{item.label}</span>
                  <span aria-hidden className="specimen-arrow nf-arrow">
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      {/* the cracks stop short of the menu */}
      <div aria-hidden className="nf-veil" />
    </section>
  );
}
