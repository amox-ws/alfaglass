import Image from "next/image";
import { mediaSize } from "@/lib/media";
import type { Slot } from "@/lib/media-slots";
import { t, type Lang } from "@/lib/i18n";
import { MediaSlot } from "./MediaSlot";

/**
 * The aerial band: full bleed (P6), a panorama today and the drone film when it exists, changed by data alone.
 *
 * - With a still (today: the aerial panorama, 1926 × 408, day grade) it settles into its frame as you scroll (`drift`, from md) and is
 *   never upscaled: wider screens cap it and centre it. Below md it is a 220px strip at its natural ratio that you pan with a finger,
 *   with a mono hint, instead of an 80px sliver.
 * - With a loop it is 21:9 from md and 4:5 below (the poster's mobile crop: the drone team delivers both framings) and plays under the
 *   rules of `MediaLoop`; `drift` still moves its container.
 * The caption is the mono line of coordinates (`geoCaption`): the same place as the map, formatted, not a new fact.
 * `theme` is the surface it sits on: night (the default), or a daylight one where the page already has its three night chapters.
 */
export function DroneBand({
  slot,
  caption,
  lang = "el",
  theme = "night",
  alt,
  className = "",
}: {
  slot: Slot;
  caption: string;
  lang?: Lang;
  theme?: "night" | "frost" | "mist" | "deep";
  alt?: string;
  className?: string;
}) {
  const d = t(lang).media;
  const still = slot.still ?? slot.loop?.poster;
  const size = still ? mediaSize(still.src) : null;
  const text = alt ?? still?.alt ?? "";
  return (
    <section data-theme={theme} className={`drone bg-surface ${className}`}>
      {slot.loop ? (
        <div className="drone-clip mx-auto" style={{ maxWidth: size?.w }}>
          <MediaSlot slot={slot} ratio="4 / 5" ratioMd="21 / 9" fill drift alt={alt} lang={lang} sizes="(min-width: 1920px) 1920px, 100vw" />
        </div>
      ) : (
        still && (
          <div className="drone-scroll" role="region" aria-label={text} tabIndex={0}>
            <div className="drone-frame mx-auto" style={{ "--drone-ratio": size ? size.w / size.h : 21 / 9, maxWidth: size?.w } as React.CSSProperties}>
              <Image
                src={still.src}
                alt={text}
                fill
                sizes="(min-width: 1926px) 1926px, (min-width: 768px) 100vw, 1040px"
                className="drift object-cover"
                style={still.focal ? { objectPosition: still.focal } : undefined}
              />
            </div>
          </div>
        )
      )}
      <div className="drone-cap">
        <div className="shell flex items-center justify-between gap-6">
          <p className="t-label text-fg-muted">{caption}</p>
          {!slot.loop && (
            <p aria-hidden className="drone-hint t-label text-fg-muted">
              {d.swipe} →
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
