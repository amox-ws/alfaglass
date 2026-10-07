import { contact } from "@/lib/content";
import { MaskedLines, Reveal } from "@/components/reveal";
import { t, type Lang } from "@/lib/i18n";

/**
 * The one call to action, on fluted glass: phone first, then mobile and email.
 * `feature` closes the home page (big title, a line of text); `band` closes every other page.
 * `subject` is the product or category the visitor is looking at: the title asks about sizes and stock,
 * and the email link opens a message with that name in the subject line.
 */
export function Cta({ lang, variant = "band", subject }: { lang: Lang; variant?: "feature" | "band"; subject?: string }) {
  const d = t(lang);
  const feature = variant === "feature";
  const eyebrow = feature ? d.home.ctaEyebrow : subject ? d.enquiry.productEyebrow : d.enquiry.eyebrow;
  const title = feature ? d.home.ctaTitle : [subject ? d.enquiry.productTitle : d.enquiry.title];
  const mailto = `mailto:${contact.email}${subject ? `?subject=${encodeURIComponent(`${d.common.enquirySubject}: ${subject}`)}` : ""}`;

  const intro = (
    <>
      <p className="t-label text-fg-muted">{eyebrow}</p>
      <MaskedLines as="h2" id="cta-title" lines={title} className={`mt-5 ${feature ? "t-display" : "t-h2 max-w-[20ch]"}`} />
    </>
  );

  const pane = (
    <Reveal delay={0.1} className={`glass relative rounded-[1.5rem] p-6 md:p-8 ${feature ? "lg:col-span-6 lg:col-start-7" : "lg:col-span-5 lg:col-start-8"}`}>
      <a
        href={contact.phoneHref}
        className="group flex items-center justify-between gap-6 border-b border-line-strong pb-4 transition-colors hover:border-fg"
      >
        <span className={`tabular ${feature ? "t-h1" : "t-h2"}`}>{d.contact.phone}</span>
        <span
          aria-hidden
          className="flex size-14 shrink-0 items-center justify-center rounded-full bg-fg text-surface transition-transform duration-500 group-hover:rotate-[-45deg]"
          style={{ transitionTimingFunction: "var(--ease-out)" }}
        >
          →
        </span>
      </a>
      <div className="mt-4 grid gap-x-8 sm:grid-cols-2">
        <a href={contact.mobileHref} className="t-body flex min-h-11 items-center gap-3 tabular">
          <span className="t-label text-fg-muted">{d.contactPage.mobile}</span>
          {d.contact.mobile}
        </a>
        <a href={mailto} className="text-link text-fg">
          {contact.email}
        </a>
      </div>
      {feature && <p className="t-small mt-2 text-fg-muted">{d.contact.address}</p>}
    </Reveal>
  );

  return (
    <section data-theme="azure" aria-labelledby="cta-title" className="relative overflow-hidden bg-surface section-y">
      <div aria-hidden className="fluted pointer-events-none absolute inset-0" />
      {feature ? (
        <div className="shell relative">
          {intro}
          <div className="mt-16 grid gap-10 md:mt-24 lg:grid-cols-12 lg:items-end lg:gap-8">
            <Reveal className="lg:col-span-5">
              <p className="t-lead max-w-[34ch] text-fg-muted">{d.home.ctaText}</p>
            </Reveal>
            {pane}
          </div>
        </div>
      ) : (
        <div className="shell relative grid gap-10 lg:grid-cols-12 lg:items-end lg:gap-8">
          <div className="lg:col-span-6">{intro}</div>
          {pane}
        </div>
      )}
    </section>
  );
}
