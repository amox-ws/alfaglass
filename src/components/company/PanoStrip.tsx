import Image from "next/image";
import type { CSSProperties } from "react";
import { mediaSize } from "@/lib/media";
import { t, type Lang } from "@/lib/i18n";

/**
 * A panorama shown as the wide strip it is (full bleed, P6), at its own proportion and never larger than its file: wider screens
 * cap it and centre it. Below md it is a 220px strip that you pan with a finger, with a mono hint, instead of an 80px sliver.
 * It does not move (the aerial band is the page's one scroll-linked effect); it shares the frame of `DroneBand` (`.drone-*`, kit.css).
 */
export function PanoStrip({
  src,
  alt,
  caption,
  lang,
  theme = "frost",
}: {
  src: string;
  alt: string;
  caption: string;
  lang: Lang;
  theme?: "frost" | "mist" | "night";
}) {
  const size = mediaSize(src);
  return (
    <div data-theme={theme} className="drone bg-surface">
      <div className="drone-scroll" role="region" aria-label={alt} tabIndex={0}>
        <div className="drone-frame mx-auto" style={{ "--drone-ratio": size ? size.w / size.h : 21 / 9, maxWidth: size?.w } as CSSProperties}>
          <Image src={src} alt={alt} fill sizes="(min-width: 1936px) 1936px, (min-width: 768px) 100vw, 640px" className="object-cover" />
        </div>
      </div>
      <div className="drone-cap">
        <div className="shell flex items-center justify-between gap-6">
          <p className="t-label text-fg-muted">{caption}</p>
          <p aria-hidden className="drone-hint t-label text-fg-muted">
            {t(lang).media.swipe} →
          </p>
        </div>
      </div>
    </div>
  );
}
