import { contact } from "@/lib/content";
import { MaskedLines, Reveal } from "@/components/ui";

export function Cta() {
  return (
    <section data-theme="azure" aria-labelledby="cta-title" className="relative overflow-hidden bg-surface section-y">
      {/* Refraction lines: light split by a fluted pane */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-100"
        style={{
          background:
            "repeating-linear-gradient(90deg, transparent 0 46px, oklch(1 0 0 / 0.28) 46px 47px, transparent 47px 92px), radial-gradient(120% 90% at 85% 0%, oklch(0.95 0.03 240 / 0.85), transparent 60%), linear-gradient(160deg, transparent 40%, oklch(0.7 0.1 240 / 0.6))",
        }}
      />
      <div className="shell relative">
        <p className="t-label text-fg/80">Τα πάντα για το γυαλί</p>
        <MaskedLines
          as="h2"
          id="cta-title"
          lines={["Καλέστε μας", "και θα έρθουμε", "κοντά σας."]}
          className="t-mega mt-8 !text-[clamp(3.5rem,11vw,12rem)]"
        />
        <div className="mt-14 grid gap-10 md:mt-20 md:grid-cols-12 md:items-end">
          <Reveal className="md:col-span-5">
            <p className="t-lead text-fg/85">Είμαστε δίπλα στον επαγγελματία για να καλύψουμε κάθε του ανάγκη.</p>
          </Reveal>
          <Reveal delay={0.1} className="glass relative rounded-[1.5rem] p-6 md:col-span-6 md:col-start-7 md:p-8">
            <a
              href={contact.phoneHref}
              className="group flex items-center justify-between gap-6 border-b border-fg/40 pb-4 transition-colors hover:border-fg"
            >
              <span className="font-display text-[clamp(2.5rem,5.5vw,5.5rem)] font-bold leading-none tabular">{contact.phone}</span>
              <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-fg text-surface transition-transform duration-500 group-hover:rotate-[-45deg]" style={{ transitionTimingFunction: "var(--ease-out)" }}>
                →
              </span>
            </a>
            <div className="mt-5 flex flex-wrap justify-between gap-x-8 gap-y-2 text-fg/85">
              <a href={`mailto:${contact.email}`} className="link-underline">
                {contact.email}
              </a>
              <a href={contact.mobileHref} className="link-underline tabular">
                {contact.mobile}
              </a>
              <span>{contact.address}</span>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
