import { RackLines } from "@/components/kit/RackLines";
import { MaskedLines, Reveal } from "@/components/reveal";
import { contact, enquiryHref } from "@/lib/contact";
import { t, type Lang } from "@/lib/i18n";
import { hrefFor } from "@/lib/routes";

/**
 * The closing call: every page ends with the same night chapter, directly followed by the footer on the same night surface (one
 * continuous ending, a hairline between them). A title, then the phone number as the largest type on the screen, on a pane of fluted
 * glass (`t-display` below lg, `t-mega` from lg, never wrapping) with a round call button, then the mobile, the email (which already
 * knows what you want) and the address, each row at least 64px, over the rack lines.
 *
 * - `default`: "Καλέστε μας και θα έρθουμε κοντά σας." With `subject` (a product or category) the title asks about sizes and stock, and the
 *   email opens with that name in its subject.
 * - `home`: the same title, and the stamp cells as a mono line under the pane.
 * - `cnc` (the service page and Έργα): "Στείλτε μας το σχέδιό σας.", the subject "Αίτημα κοπής CNC" (or the `subject` given, written out in
 *   full) and, above the contact rows, a link to the estimator (`#aitima-kopis`).
 * `feature` and `band` are the foundation's names for `home` and `default`.
 */
export function Cta({
  lang,
  variant = "default",
  subject,
}: {
  lang: Lang;
  variant?: "default" | "home" | "cnc" | "feature" | "band";
  subject?: string;
}) {
  const d = t(lang);
  const kind = variant === "feature" ? "home" : variant === "band" ? "default" : variant;
  const cnc = kind === "cnc";
  const eyebrow = cnc ? d.machine.requestEyebrow : d.enquiry.eyebrow;
  const title = cnc ? d.machine.requestTitle : subject ? d.enquiry.productTitle : d.enquiry.title;
  const mailSubject = cnc ? (subject ?? d.machine.requestSubject) : subject ? `${d.common.enquirySubject}: ${subject}` : d.common.quoteSubject;
  const estimator = `${hrefFor(lang, { kind: "service" })}#aitima-kopis`;

  return (
    <section data-theme="night" aria-labelledby="cta-title" className="cta relative overflow-hidden bg-surface pb-section pt-chapter">
      <RackLines />
      <div className="shell relative grid gap-10 lg:grid-cols-12 lg:gap-x-8 lg:gap-y-16">
        <div className="lg:col-span-7 lg:row-start-1">
          <p className="t-label text-accent">{eyebrow}</p>
          <MaskedLines as="h2" id="cta-title" lines={[title]} className="t-h1 mt-5 max-w-[16ch]" />
        </div>

        <Reveal delay={0.1} className="lg:col-span-12 lg:row-start-2">
          <a href={contact.phoneHref} className="cta-pane glass glass-dark glint-enter group relative flex items-center justify-between gap-6 rounded-[1.25rem] p-6 md:p-8">
            <span className="cta-phone t-display t-lg-mega tabular whitespace-nowrap">{d.contact.phone}</span>
            <span aria-hidden className="cta-call">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                <path
                  d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </a>
          {kind === "home" && (
            <p className="t-label mt-5 text-fg-muted" aria-label={d.home.stampLabel}>
              {d.stamp.join(" · ")}
            </p>
          )}
        </Reveal>

        <div className="cta-rows lg:col-span-4 lg:col-start-9 lg:row-start-1 lg:self-end">
          {cnc && (
            <a href={estimator} className="cta-row">
              <span className="t-lead">{d.nav.estimator}</span>
              <span aria-hidden className="text-accent">
                →
              </span>
            </a>
          )}
          <a href={contact.mobileHref} className="cta-row">
            <span className="t-label text-fg-muted">{d.contactPage.mobile}</span>
            <span className="t-lead tabular">{d.contact.mobile}</span>
          </a>
          <a href={enquiryHref({ subject: mailSubject })} className="cta-row">
            <span className="t-label text-fg-muted">{d.contactPage.email}</span>
            <span className="t-lead text-link break-all">{contact.email}</span>
          </a>
          <a href={contact.mapsHref} target="_blank" rel="noreferrer" className="cta-row">
            <span className="t-label text-fg-muted">{d.contactPage.address}</span>
            <span className="t-body text-right">
              {d.contact.address}
              <span className="t-label mt-1 block text-fg-dim">{d.common.directionsLine}</span>
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
