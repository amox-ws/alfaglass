import { Cta } from "@/components/Cta";
import { MachineBlueprint } from "@/components/kit/MachineBlueprint";
import { PageHero } from "@/components/page";
import { enquiryHref } from "@/lib/contact";
import { contact } from "@/lib/contact";
import { t, type Lang } from "@/lib/i18n";
import { slots } from "@/lib/media-slots";
import { formatNumber, BED } from "@/lib/machine";

/**
 * The CNC service page: a placeholder from the System, so that the page builds, passes the gates and has its anchors. The Catalogue +
 * Product + Service lane replaces it with the page of docs/redesign/DIRECTION.md §4.13 (the bed scene, the operations, the materials, the
 * spec plate, the estimator).
 */
export function ServiceView({ lang }: { lang: Lang }) {
  const d = t(lang);
  const m = d.machine;
  return (
    <>
      <PageHero
        variant="cinematic"
        theme="deep"
        lang={lang}
        crumbs={[{ label: d.nav.serviceLong }]}
        title={m.title}
        lead={`${m.promise} ${m.accuracy}`}
        media={slots.machineStill}
        fallback={
          <div className="mt-10 md:mt-14">
            <p className="t-giga tabular text-fg">
              {formatNumber(BED.y, d.locale)}
              <span className="t-label ml-3 align-baseline text-fg-muted">
                <span className="unit">mm</span>
              </span>
            </p>
            <svg viewBox="0 0 1000 12" preserveAspectRatio="none" aria-hidden className="mt-3 block h-3 w-full">
              <path d="M0 6H1000M0 0V12M1000 0V12" stroke="var(--edge)" strokeWidth="1" vectorEffect="non-scaling-stroke" fill="none" />
            </svg>
          </div>
        }
      >
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <a href="#aitima-kopis" className="inline-flex min-h-12 items-center justify-center rounded-full bg-snow px-7 font-semibold text-brand-indigo">
            {d.nav.estimator}
          </a>
          <a href={contact.phoneHref} className="glass glass-dark relative inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-7 font-semibold">
            {d.common.callUs} <span className="t-data tabular">{d.contact.phone}</span>
          </a>
        </div>
      </PageHero>

      <section data-theme="deep" className="bg-surface pb-section">
        <div className="shell">
          <MachineBlueprint lang={lang} variant="band" />
        </div>
      </section>

      <section id="aitima-kopis" data-theme="mist" className="scroll-mt-20 bg-surface section-y">
        <div className="shell">
          <p className="t-label text-accent">{m.requestEyebrow}</p>
          <h2 className="t-h1 mt-5 max-w-[20ch]">{d.nav.estimator}</h2>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <a href={enquiryHref({ subject: m.requestSubject })} className="inline-flex min-h-12 items-center justify-center rounded-full bg-fg px-7 font-semibold text-surface">
              {contact.email}
            </a>
            <a href={contact.phoneHref} className="inline-flex min-h-12 items-center justify-center rounded-full border border-line-strong px-7 font-semibold">
              {d.common.callUs} <span className="t-data tabular ml-2">{d.contact.phone}</span>
            </a>
          </div>
        </div>
      </section>
      <Cta lang={lang} variant="cnc" />
    </>
  );
}
