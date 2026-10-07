import Image from "next/image";
import { Cta } from "@/components/Cta";
import { PageHero } from "@/components/page";
import { Reveal } from "@/components/ui";
import { brandsOf } from "@/lib/brands";
import { cms } from "@/lib/content";
import { t, type Lang } from "@/lib/i18n";
import { mediaSize } from "@/lib/media";

/** Logos are shown a little larger than the home band's, never larger than their file (the smallest, Pilkington's, is 50px tall: 42px here). */
const LOGO_SCALE = 1.4;

/** "https://www.guardianglass.com/eu/en/tools" -> "guardianglass.com": where a link leads, in the spec voice. */
function hostOf(href: string) {
  try {
    return new URL(href).hostname.replace(/^www\./, "");
  } catch {
    return href;
  }
}

/** The label of a link without the brand name that the old site appended to it ("… | Guardian"). */
const cleanLabel = (label: string) => label.replace(/\s*\|\s*Guardian( Glass)?$/, "");

/**
 * The tools of the glass manufacturers: an index hero, then one row per brand. The logo sits on a snow plate in columns 1–3 (at its own
 * size, never larger than its file), the tools of that house in columns 5–12, each a row with its Greek label in `t-h3`, the address it
 * leads to in mono and a round ↗. Names come from `lib/brands` by logo file, never by the order of the list.
 */
export function LinksView({ lang }: { lang: Lang }) {
  const { links } = cms(lang).site;
  const d = t(lang);
  const brands = brandsOf(links).map((b, i) => ({ ...b, index: i + 1, tools: links.find((l) => l.logo === b.logo)?.links ?? [] }));
  const toolCount = brands.reduce((sum, b) => sum + b.tools.length, 0);
  return (
    <>
      <PageHero variant="index" lang={lang} crumbs={[{ label: d.nav.links }]} title={d.links.title} facts={d.links.facts(brands.length, toolCount)} lead={d.links.lead} />
      <section data-theme="mist" aria-label={d.links.title} className="bg-surface section-y">
        <div className="shell">
          <ul className="border-t border-line">
            {brands.map((b) => {
              const size = mediaSize(b.logo);
              return (
                <Reveal as="li" key={b.logo} className="border-b border-line">
                  <div className="grid gap-8 py-12 lg:grid-cols-12 lg:items-start lg:gap-8 lg:py-16">
                    <div className="lg:col-span-3">
                      <p className="t-label tabular text-fg-muted">{String(b.index).padStart(2, "0")}</p>
                      <div className="links-plate specimen-plate mt-4">
                        {size ? (
                          <Image
                            src={b.logo}
                            alt={b.name}
                            width={size.w}
                            height={size.h}
                            sizes="(min-width: 1024px) 20vw, 60vw"
                            className="links-logo"
                            style={{ height: Math.min(b.height * LOGO_SCALE, size.h), width: "auto" }}
                          />
                        ) : (
                          <span className="t-h3">{b.name}</span>
                        )}
                      </div>
                      <div className="mt-4 flex flex-wrap items-center gap-x-3">
                        <h2 className="t-label text-fg">{b.name}</h2>
                        <p className="t-label text-fg-muted">{d.links.count(b.tools.length)}</p>
                      </div>
                    </div>
                    <ul className="lg:col-span-8 lg:col-start-5">
                      {b.tools.map((l, i) => (
                        <li key={l.href} className={i > 0 ? "border-t border-line" : ""}>
                          <a href={l.href} target="_blank" rel="noreferrer" className="links-tool group lift glint">
                            <span className="min-w-0">
                              <span className="t-h3 block transition-colors group-hover:text-accent">{cleanLabel(l.label)}</span>
                              <span className="t-small mt-1 block text-fg-muted">
                                {hostOf(l.href)}
                                <span className="sr-only"> ({d.links.newTab})</span>
                              </span>
                            </span>
                            <span aria-hidden className="specimen-arrow links-arrow">
                              ↗
                            </span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Reveal>
              );
            })}
          </ul>
        </div>
      </section>
      <Cta lang={lang} />
    </>
  );
}
