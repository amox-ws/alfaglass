import Image from "next/image";
import { ArrowLink, Eyebrow, MaskedLines, Reveal } from "@/components/ui";
import { t, type Lang } from "@/lib/i18n";

export function Facilities({
  lang,
  trucks,
  facilitiesHref,
}: {
  lang: Lang;
  trucks: string;
  facilitiesHref: string;
}) {
  const h = t(lang).home;

  return (
    <section data-theme="frost" aria-labelledby="facilities-title" className="relative bg-surface section-y">
      <div className="shell">
        <div className="flex items-center justify-between gap-6">
          <Eyebrow index="03">{h.facilitiesEyebrow}</Eyebrow>
          <span className="t-label text-fg-muted">{h.facilitiesPlace}</span>
        </div>
        <div className="mt-10 grid gap-8 md:mt-14 md:grid-cols-12 md:items-end">
          <h2 id="facilities-title" className="t-display md:col-span-7">
            {h.facilitiesTitle[0]}
            <span className="block text-fg-muted">{h.facilitiesTitle[1]}</span>
          </h2>
          <Reveal className="md:col-span-4 md:col-start-9">
            <p className="t-lead text-fg-muted">{h.facilitiesText}</p>
          </Reveal>
        </div>

        {/* Logistics */}
        <div className="mt-16 grid gap-12 md:mt-24 md:grid-cols-12 md:items-center">
          <Reveal className="relative aspect-[16/10] overflow-hidden rounded-sm md:col-span-7 md:aspect-[16/9]">
            <Image
              src={trucks}
              alt={h.trucksAlt}
              fill
              sizes="(min-width: 768px) 58vw, 100vw"
              className="object-cover"
            />
          </Reveal>
          <div className="md:col-span-4 md:col-start-9">
            <MaskedLines as="h3" lines={h.logisticsTitle} className="t-h2" />
            <Reveal delay={0.1}>
              <p className="mt-6 text-fg-muted">
                {h.logisticsText}
              </p>
              <ArrowLink href={facilitiesHref} className="mt-10">
                {h.ourFacilities}
              </ArrowLink>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
