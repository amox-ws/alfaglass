"use client";

import Image from "next/image";
import { useState } from "react";
import { contact, imagery } from "@/lib/content";

/** Google Maps embed that only loads after consent (no third-party cookies until clicked). */
export function ContactMap() {
  const [load, setLoad] = useState(false);
  return (
    <div data-theme="deep" className="relative aspect-[4/3] overflow-hidden rounded-sm bg-surface-2 md:aspect-auto md:h-full md:min-h-[32rem]">
      {load ? (
        <iframe
          title="Χάρτης: ALFA GLASS, Ασπρόπυργος"
          src="https://www.google.com/maps?q=ALFA%20GLASS%20%CE%91%CF%83%CF%80%CF%81%CF%8C%CF%80%CF%85%CF%81%CE%B3%CE%BF%CF%82&output=embed"
          className="absolute inset-0 size-full border-0 grayscale-[0.4]"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      ) : (
        <>
          <Image src={imagery.aerial} alt="" fill sizes="50vw" className="object-cover opacity-50" />
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/50 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 flex flex-col gap-4 p-6 md:p-8">
            <p className="max-w-[34ch] text-sm text-fg-muted">
              Ο χάρτης φορτώνεται από την Google και ενδέχεται να χρησιμοποιήσει cookies.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setLoad(true)}
                className="rounded-full bg-fg px-5 py-2.5 font-semibold text-surface transition-colors hover:bg-accent"
              >
                Εμφάνιση χάρτη
              </button>
              <a
                href={contact.mapsHref}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-line-strong px-5 py-2.5 font-semibold transition-colors hover:border-fg"
              >
                Άνοιγμα στο Google Maps ↗
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
