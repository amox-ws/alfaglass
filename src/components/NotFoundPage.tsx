import Link from "next/link";
import { MaskedLines } from "@/components/reveal";
import { cms } from "@/lib/content";
import { t, type Lang } from "@/lib/i18n";
import { hrefFor } from "@/lib/routes";

/** The 404: the page's main content, inside the site frame. Labels and links come from the dictionary and the routes. */
export function NotFoundPage({ lang }: { lang: Lang }) {
  const d = t(lang);
  const c = cms(lang);
  const links = [
    { label: d.nav.home, href: hrefFor(lang, { kind: "home" }) },
    ...c.site.groups.map((g) => ({ label: g.title, href: c.groupHref(g) })),
    { label: d.nav.contact, href: hrefFor(lang, { kind: "contact" }) },
  ];
  return (
    <section data-theme="frost" className="relative flex min-h-[100svh] items-center overflow-hidden bg-surface pb-16 pt-[calc(var(--header-h)+3rem)]">
      <div aria-hidden className="hero-glow pointer-events-none absolute inset-x-0 top-0 h-[70%]" />
      <div className="shell relative">
        <p className="t-label hero-fade text-accent">{d.notFound.eyebrow}</p>
        <MaskedLines as="h1" eager lines={d.notFound.title.split(" ")} className="t-mega mt-5" />
        <p className="t-lead hero-rise mt-6 max-w-[36rem] text-fg-muted" style={{ animationDelay: "0.3s" }}>
          {d.notFound.text}
        </p>
        <ul className="hero-rise mt-10 flex flex-wrap gap-3" style={{ animationDelay: "0.4s" }}>
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="inline-flex min-h-11 items-center rounded-full border border-line-strong px-5 font-semibold transition-colors hover:border-accent hover:text-accent"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
