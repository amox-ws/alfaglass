import { contact } from "@/lib/content";
import { t, type Lang } from "@/lib/i18n";

/**
 * Google Maps embed, always visible, with a shortcut to directions in Google Maps (the client's decision: the embed loads directly).
 * A cut sheet like the specimen plates: 2px corners, a hairline, no shadow. What shows until the map has loaded, and if it never does,
 * is a drafting grid with a pin.
 */
export function ContactMap({ lang }: { lang: Lang }) {
  const d = t(lang);
  return (
    <div className="contact-map relative aspect-[4/3] overflow-hidden rounded-sm border border-line bg-surface-2">
      <div aria-hidden className="contact-map-grid absolute inset-0 flex items-center justify-center text-accent">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25">
          <path d="M12 21s7-6.2 7-11.2A7 7 0 0 0 5 9.8C5 14.8 12 21 12 21Z" />
          <circle cx="12" cy="9.8" r="2.4" />
        </svg>
      </div>
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
        className="t-small glass glass-thin glass-sheen absolute bottom-4 left-4 flex min-h-11 items-center rounded-full px-5 font-semibold text-fg"
      >
        {d.common.openMaps}
      </a>
    </div>
  );
}
