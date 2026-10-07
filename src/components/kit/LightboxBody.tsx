"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { t, type Lang } from "@/lib/i18n";
import type { GalleryItemSized } from "./MediaGallery";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * The inside of the lightbox: a horizontal scroll-snap track of full images (a swipe is the browser's own), previous and next buttons,
 * the arrow keys, a mono counter ("03 / 12") and the caption. Only the current image and its neighbours are loaded. Each image is
 * `object-contain` and never wider than its source. A film shows its poster with native controls and downloads nothing until played.
 * Shared by the modal `Lightbox` and by the static frame of the QA kit page.
 */
export function LightboxBody({
  items,
  index,
  lang,
  onIndex,
  onClose,
  keys = true,
}: {
  items: GalleryItemSized[];
  index: number;
  lang: Lang;
  onIndex: (i: number) => void;
  onClose?: () => void;
  /** Listen to ← and → on the window (off for the static frame). */
  keys?: boolean;
}) {
  const d = t(lang);
  const track = useRef<HTMLDivElement>(null);
  const current = useRef(index);
  const notify = useRef(onIndex);
  useEffect(() => {
    current.current = index;
    notify.current = onIndex;
  });

  const go = useCallback(
    (i: number, instant = false) => {
      const root = track.current;
      const slide = root?.querySelector<HTMLElement>(`[data-i="${i}"]`);
      if (!root || !slide) return;
      const smooth = !instant && !matchMedia("(prefers-reduced-motion: reduce)").matches;
      root.scrollTo({ left: slide.offsetLeft, behavior: smooth ? "smooth" : "instant" });
    },
    [],
  );

  // open on the image that was tapped, then follow the swipe. In a dialog the track has no size until the dialog is open, so the
  // first scroll waits for it (a ResizeObserver reports before the intersection observer below does).
  useEffect(() => {
    const root = track.current;
    if (!root) return;
    let placed = false;
    const place = () => {
      if (placed || root.clientWidth === 0) return;
      placed = true;
      go(current.current, true);
    };
    place();
    const ro = new ResizeObserver(place);
    ro.observe(root);
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const i = Number((e.target as HTMLElement).dataset.i);
          if (placed && e.isIntersecting && e.intersectionRatio >= 0.6 && i !== current.current) notify.current(i);
        }
      },
      { root, threshold: [0.6] },
    );
    root.querySelectorAll("[data-i]").forEach((el) => io.observe(el));
    return () => {
      ro.disconnect();
      io.disconnect();
    };
  }, [go]);

  useEffect(() => {
    if (!keys) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(Math.min(items.length - 1, current.current + 1));
      if (e.key === "ArrowLeft") go(Math.max(0, current.current - 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, items.length, keys]);

  const item = items[index];
  return (
    <div className="lb">
      <div className="lb-top">
        <p className="t-label text-fg-muted" aria-live="polite">
          {pad(index + 1)} / {pad(items.length)}
        </p>
        {onClose && (
          <button type="button" className="lb-close" onClick={onClose} aria-label={d.media.close}>
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
              <path d="M2 2l14 14M16 2L2 16" stroke="currentColor" strokeWidth="1.5" fill="none" />
            </svg>
          </button>
        )}
      </div>
      <div ref={track} className="lb-track" tabIndex={0} role="region" aria-roledescription="carousel" aria-label={d.media.lightbox}>
        {items.map((it, i) => (
          <div
            key={it.src}
            className="lb-slide"
            data-i={i}
            role="group"
            aria-roledescription="slide"
            aria-label={d.media.imageOf(i + 1, items.length)}
            onClick={(e) => {
              if (e.target === e.currentTarget) onClose?.();
            }}
          >
            {Math.abs(i - index) <= 1 &&
              (it.loop ? (
                <video className="lb-frame lb-video" controls playsInline preload="none" poster={it.loop.poster.src} aria-label={it.loop.label} style={it.w ? { maxWidth: it.w } : undefined}>
                  {it.loop.sources.map((s) => (
                    <source key={s.src} src={s.src} type={s.type} media={s.media} />
                  ))}
                </video>
              ) : (
                <div className="lb-frame" style={it.w ? { maxWidth: it.w } : undefined}>
                  <Image src={it.src} alt={it.alt} fill sizes="100vw" className="object-contain" loading="eager" />
                </div>
              ))}
          </div>
        ))}
      </div>
      {items.length > 1 && (
        <>
          <button type="button" className="lb-nav" data-dir="prev" aria-label={d.media.prev} disabled={index === 0} onClick={() => go(index - 1)}>
            ←
          </button>
          <button type="button" className="lb-nav" data-dir="next" aria-label={d.media.next} disabled={index === items.length - 1} onClick={() => go(index + 1)}>
            →
          </button>
        </>
      )}
      <p className="lb-cap t-small text-fg-muted">{item.caption ?? item.alt}</p>
    </div>
  );
}

/** The lightbox's inside, open in a box on the page (the QA kit page shows it without a dialog). It keeps its own place in the series. */
export function LightboxFrame({ items, lang, start = 0 }: { items: GalleryItemSized[]; lang: Lang; start?: number }) {
  const [index, setIndex] = useState(start);
  return (
    <div className="lightbox-inline" data-theme="night">
      <LightboxBody items={items} index={index} lang={lang} onIndex={setIndex} keys={false} />
    </div>
  );
}
