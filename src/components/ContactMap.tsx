import { contact } from "@/lib/content";
import { t, type Lang } from "@/lib/i18n";

/** Google Maps embed, always visible, with a shortcut to directions in Google Maps. */
export function ContactMap({ lang }: { lang: Lang }) {
  const d = t(lang);
  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-[1.25rem] bg-surface-2 shadow-[0_30px_70px_-40px_oklch(0.29_0.085_282/0.45)] md:aspect-auto md:h-full md:min-h-[32rem]">
      <iframe
        title={d.contactPage.mapTitle}
        src={`https://www.google.com/maps?q=ALFA%20GLASS%20%CE%91%CF%83%CF%80%CF%81%CF%8C%CF%80%CF%85%CF%81%CE%B3%CE%BF%CF%82&hl=${lang}&output=embed`}
        className="absolute inset-0 size-full border-0 grayscale-[0.25]"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
      <a
        href={contact.mapsHref}
        target="_blank"
        rel="noreferrer"
        className="glass glass-thin glass-sheen absolute bottom-4 left-4 rounded-full px-5 py-2.5 text-sm font-semibold text-fg"
      >
        {d.common.openMaps}
      </a>
    </div>
  );
}
