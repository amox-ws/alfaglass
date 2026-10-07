import Link from "next/link";
import { notFound } from "next/navigation";
import { Cta } from "@/components/Cta";
import { EdgeGauge } from "@/components/kit/EdgeGauge";
import { MediaGallery } from "@/components/kit/MediaGallery";
import { MediaSlot } from "@/components/kit/MediaSlot";
import { SpecPlate, type SpecItem } from "@/components/kit/SpecPlate";
import { SpecimenCard } from "@/components/kit/SpecimenCard";
import { PageHero, Prose } from "@/components/page";
import { ArrowLink, Reveal, SectionHeader } from "@/components/ui";
import { FixtureBanner } from "@/components/works/FixtureBanner";
import { MetaLine } from "@/components/works/MetaLine";
import { applicationLabel, materialLabel } from "@/components/works/meta";
import { works } from "@/content/works";
import { cms, productThickness } from "@/lib/content";
import { t, type Lang } from "@/lib/i18n";
import { hrefFor } from "@/lib/routes";

const escapeHtml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** `work.body` is plain text or simple HTML: plain text becomes paragraphs. */
const bodyHtml = (body: string) =>
  /<[a-z][\s\S]*>/i.test(body)
    ? body
    : body
        .split(/\n{2,}/)
        .map((p) => `<p>${escapeHtml(p.trim())}</p>`)
        .join("");

/** The work before or after this one: a mono label, then its title (two lines at most). */
function Neighbour({ lang, slug, title, dir }: { lang: Lang; slug: string; title: string; dir: "prev" | "next" }) {
  const d = t(lang);
  return (
    <Link href={hrefFor(lang, { kind: "work", slug })} rel={dir} className={`group block max-w-[26rem] py-2 ${dir === "next" ? "sm:text-right sm:justify-self-end" : ""}`}>
      <span className="t-label block text-fg-muted">{dir === "prev" ? `← ${d.works.prev}` : `${d.works.next} →`}</span>
      <span className="t-h3 mt-2 line-clamp-2 transition-colors group-hover:text-accent">{title}</span>
    </Link>
  );
}

/**
 * A case study: the cover as a cinematic hero (the poster is the LCP; a loop plays only on a capable desktop), the data of the job on a spec
 * plate (materials with links to their products, the thickness as a gauge, the machining linked to the cutting service, the application,
 * place, year and, only with the client's permission, the client), the story, the photographs in the editorial rhythm opening the lightbox,
 * the film when there is one, the materials of the job as specimen cards, the neighbouring works and the closing call for a cut.
 */
export function WorkView({ lang, slug }: { lang: Lang; slug: string }) {
  const at = works.findIndex((w) => w.slug === slug);
  if (at < 0) notFound();
  const work = works[at];
  const prev = works[at - 1];
  const next = works[at + 1];
  const d = t(lang);
  const c = cms(lang);
  const service = hrefFor(lang, { kind: "service" });
  const products = (work.products ?? []).flatMap((s) => (c.products[s] ? [c.products[s]] : []));

  const facts: SpecItem[] = [
    {
      label: d.works.material,
      value: (
        <>
          {work.materials.map((m) => materialLabel(lang, m)).join(" · ")}
          {products.length > 0 && (
            <span className="mt-1 flex flex-wrap gap-x-5">
              {products.map((p) => (
                <Link key={p.slug} href={c.productHref(p)} className="text-link text-accent">
                  {p.title}
                </Link>
              ))}
            </span>
          )}
        </>
      ),
    },
    ...(work.thickness?.length ? [{ label: d.works.thickness, value: <EdgeGauge values={work.thickness} size="md" lang={lang} /> }] : []),
    ...(work.operations?.length
      ? [
          {
            label: d.works.operations,
            value: (
              <span className="flex flex-wrap gap-x-5">
                {work.operations.map((o) => (
                  <Link key={o} href={service} className="text-link text-accent">
                    {d.machine.operations[o]?.name ?? o}
                  </Link>
                ))}
              </span>
            ),
          },
        ]
      : []),
    { label: d.works.application, value: work.applications.map((a) => applicationLabel(lang, a)).join(" · ") },
    ...(work.place ? [{ label: d.works.place, value: work.place }] : []),
    { label: d.works.year, value: String(work.year) },
    ...(work.client ? [{ label: d.works.client, value: work.client }] : []),
  ];

  return (
    <>
      <PageHero
        variant="cinematic"
        lang={lang}
        crumbs={[{ label: d.nav.works, href: hrefFor(lang, { kind: "works" }) }, { label: work.title }]}
        title={work.title}
        lead={work.summary}
        facts={<MetaLine lang={lang} work={work} />}
        media={{ still: work.cover, loop: work.coverLoop }}
      />
      <FixtureBanner lang={lang} />

      <section data-theme="mist" aria-label={d.works.factsLabel} className="bg-surface section-y">
        <div className="shell">
          <Reveal>
            <SpecPlate layout="list" items={facts} label={d.works.factsLabel} />
          </Reveal>
        </div>
      </section>

      {(work.body || work.gallery.length > 0 || work.film) && (
        <section data-theme="frost" className="bg-surface section-y">
          <div className="shell">
            {work.body && (
              <div className="grid gap-8 lg:grid-cols-12">
                <p className="t-label text-fg-muted lg:col-span-4">{d.works.story}</p>
                <Reveal className="lg:col-span-7 lg:col-start-6">
                  <Prose html={bodyHtml(work.body)} size="lead" />
                </Reveal>
              </div>
            )}
            {work.gallery.length > 0 && (
              <div className={work.body ? "mt-16 md:mt-24" : ""}>
                <MediaGallery layout="editorial" lang={lang} label={d.works.gallery} items={work.gallery} />
              </div>
            )}
            {work.film && (
              <div className={work.body || work.gallery.length > 0 ? "mt-16 md:mt-24" : ""}>
                <MediaSlot slot={{ still: work.film.poster, loop: work.film }} ratio="16 / 9" ratioMd="21 / 9" sizes="(min-width: 1728px) 1616px, 100vw" lang={lang} />
              </div>
            )}
          </div>
        </section>
      )}

      {products.length > 0 && (
        <section data-theme="mist" aria-labelledby="work-materials" className="bg-surface section-y">
          <div className="shell">
            <SectionHeader eyebrow={d.works.material} title={d.works.materialsTitle} id="work-materials" size="h1" />
            <div className="mt-16 grid gap-12 md:mt-24 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
              {products.slice(0, 3).map((p, i) => (
                <SpecimenCard
                  key={p.slug}
                  lang={lang}
                  href={c.productHref(p)}
                  title={p.title}
                  image={p.image ?? p.thumb}
                  alt={p.title}
                  slug={p.slug}
                  index={i + 1}
                  values={productThickness(p.slug)}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      <section data-theme="frost" aria-label={d.works.neighbours} className="bg-surface pb-section pt-16 md:pt-24">
        <div className="shell">
          <nav className={`border-t border-line pt-10 ${prev || next ? "grid gap-8 sm:grid-cols-3 sm:items-center" : ""}`}>
            {prev ? <Neighbour lang={lang} slug={prev.slug} title={prev.title} dir="prev" /> : <span aria-hidden className="hidden sm:block" />}
            <ArrowLink href={hrefFor(lang, { kind: "works" })} className="sm:justify-self-center">
              {d.works.all}
            </ArrowLink>
            {next ? <Neighbour lang={lang} slug={next.slug} title={next.title} dir="next" /> : <span aria-hidden className="hidden sm:block" />}
          </nav>
        </div>
      </section>

      <Cta lang={lang} variant="cnc" subject={`${d.works.subject}: ${work.title}`} />
    </>
  );
}
