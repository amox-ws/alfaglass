import { ArrowLink, Eyebrow, MaskedLines, Reveal } from "@/components/ui";
import { IndexList, type IndexRow } from "@/components/catalog/IndexList";

export function GlassIndex({ rows, intro }: { rows: IndexRow[]; intro: string }) {
  return (
    <section data-theme="mist" className="relative bg-surface section-y" aria-labelledby="glass-title">
      <div className="shell">
        <div className="grid gap-10 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <Eyebrow index="02">
              Κατάλογος
            </Eyebrow>
            <MaskedLines as="h2" id="glass-title" lines={["Υαλοπίνακες"]} className="t-display mt-6" />
          </div>
          <Reveal className="md:col-span-4 md:col-start-9">
            <p className="text-fg-muted">{intro}</p>
          </Reveal>
        </div>

        <div className="mt-16 md:mt-24">
          <IndexList rows={rows} />
        </div>

        <div className="mt-12 flex justify-end">
          <ArrowLink href="/yalopinakes">
            Όλοι οι υαλοπίνακες
          </ArrowLink>
        </div>
      </div>
    </section>
  );
}
