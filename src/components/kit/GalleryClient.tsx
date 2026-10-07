"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { t, type Lang } from "@/lib/i18n";
import type { GalleryItemSized } from "./MediaGallery";
import { Morph } from "./Morph";

/** The lightbox's code loads on the first tap, not with the page. */
const Lightbox = dynamic(() => import("./Lightbox"), { ssr: false });

const RHYTHM = [7, 5, 5, 7, 4, 4, 4];
const SPAN: Record<number, string> = { 4: "lg:col-span-4", 5: "lg:col-span-5", 7: "lg:col-span-7" };

const pad = (n: number) => String(n).padStart(2, "0");

/** The client side of `MediaGallery`: the three layouts and the state of the lightbox. */
export function GalleryClient({
  items,
  layout,
  startIndex,
  lang,
  morph,
  preloadFirst,
  label,
  className,
}: {
  items: GalleryItemSized[];
  layout: "strip" | "plates" | "editorial";
  startIndex: number;
  lang: Lang;
  morph?: string;
  preloadFirst: boolean;
  label: string;
  className: string;
}) {
  const d = t(lang);
  const [open, setOpen] = useState<number | null>(null);
  const [everOpened, setEverOpened] = useState(false);
  const [current, setCurrent] = useState(Math.min(startIndex, items.length - 1));
  const track = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLElement | null>(null);

  const show = (i: number, e?: React.MouseEvent<HTMLElement>) => {
    opener.current = e?.currentTarget ?? null;
    setEverOpened(true);
    setOpen(i);
  };

  // strip: which plate is in front (the counter), and the way to a plate (arrows, thumbnails)
  useEffect(() => {
    const root = track.current;
    if (layout !== "strip" || !root) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting && e.intersectionRatio >= 0.6) setCurrent(Number((e.target as HTMLElement).dataset.i));
      },
      { root, threshold: [0.6] },
    );
    root.querySelectorAll("[data-i]").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [layout, items.length]);

  const go = useCallback(
    (i: number) => {
      const slide = track.current?.querySelector<HTMLElement>(`[data-i="${i}"]`);
      if (!slide || !track.current) return;
      const smooth = !matchMedia("(prefers-reduced-motion: reduce)").matches;
      track.current.scrollTo({ left: slide.offsetLeft, behavior: smooth ? "smooth" : "auto" });
    },
    [],
  );

  const plateRatio = (it: GalleryItemSized) => (it.w && it.h && it.h > it.w * 1.05 ? "5 / 4" : "4 / 3");

  const plate = (it: GalleryItemSized, i: number, sizes: string, caption: boolean, preload = false) => {
    const frame = (
      <span className="specimen-plate glint-edge" style={{ aspectRatio: plateRatio(it) }}>
        <Image src={it.src} alt={it.alt} fill sizes={sizes} preload={preload} className="object-contain" />
        {it.loop && (
          <span aria-hidden className="gallery-film">
            <svg width="14" height="14" viewBox="0 0 16 16">
              <path d="M4 2l10 6-10 6z" fill="currentColor" />
            </svg>
            {d.media.film}
          </span>
        )}
      </span>
    );
    return (
      <figure className="specimen" style={it.w ? { maxWidth: it.w } : undefined}>
        <button type="button" className="gallery-open" aria-label={d.media.enlarge(it.alt)} onClick={(e) => show(i, e)}>
          {morph && i === 0 ? <Morph name={morph}>{frame}</Morph> : frame}
        </button>
        {caption && (
          <figcaption className="specimen-cap t-label">
            <span className="text-fg-muted">{`${d.media.figure} ${pad(i + 1)}/${pad(items.length)}`}</span>
            {it.caption && <span className="text-fg-dim">{it.caption}</span>}
          </figcaption>
        )}
      </figure>
    );
  };

  return (
    <div className={`gallery ${className}`} data-layout={layout}>
      {layout === "strip" && (
        <>
          <div
            ref={track}
            className="gallery-track"
            role="region"
            aria-roledescription="carousel"
            aria-label={label}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight") go(Math.min(items.length - 1, current + 1));
              if (e.key === "ArrowLeft") go(Math.max(0, current - 1));
            }}
          >
            {items.map((it, i) => (
              <div key={it.src} className="gallery-slide" data-i={i} aria-label={d.media.imageOf(i + 1, items.length)} role="group" aria-roledescription="slide">
                {plate(it, i, "(min-width: 1024px) 55vw, 100vw", false, preloadFirst && i === 0)}
              </div>
            ))}
          </div>
          {items.length > 1 && (
            <div className="gallery-bar">
              <p className="t-label text-fg-muted" aria-live="polite">
                {`${pad(current + 1)} / ${pad(items.length)}`}
                {items[current].caption && <span className="gallery-bar-caption text-fg-dim">{items[current].caption}</span>}
              </p>
              <div className="flex gap-2">
                <button type="button" className="gallery-arrow" aria-label={d.a11y.prevImage} disabled={current === 0} onClick={() => go(Math.max(0, current - 1))}>
                  ←
                </button>
                <button type="button" className="gallery-arrow" aria-label={d.a11y.nextImage} disabled={current === items.length - 1} onClick={() => go(Math.min(items.length - 1, current + 1))}>
                  →
                </button>
              </div>
            </div>
          )}
          {items.length > 1 && (
            <div className="gallery-thumbs">
              {items.map((it, i) => (
                <button key={it.src} type="button" className="gallery-thumb specimen-plate" aria-label={`${d.a11y.image} ${i + 1}${it.caption ? `: ${it.caption}` : ""}`} aria-current={i === current} onClick={() => go(i)}>
                  <Image src={it.src} alt="" fill sizes="5rem" className="object-contain" />
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {layout === "plates" && (
        <ul className="gallery-plates" aria-label={label}>
          {items.map((it, i) => (
            <li key={it.src}>{plate(it, i, "(min-width: 1024px) 22vw, (min-width: 768px) 30vw, 46vw", true)}</li>
          ))}
        </ul>
      )}

      {layout === "editorial" && (
        <ul className="gallery-editorial" aria-label={label}>
          {items.map((it, i) => (
            <li key={it.src} className={`md:col-span-6 ${SPAN[RHYTHM[i % RHYTHM.length]]}`}>
              <figure style={it.w ? { maxWidth: it.w } : undefined}>
                <button type="button" className="gallery-open" aria-label={d.media.enlarge(it.alt)} onClick={(e) => show(i, e)}>
                  <span className="gallery-frame glint-edge" style={{ aspectRatio: it.w && it.h ? `${it.w} / ${it.h}` : "3 / 2" }}>
                    <Image src={it.src} alt={it.alt} fill sizes="(min-width: 1024px) 58vw, (min-width: 768px) 50vw, 100vw" className="object-cover" />
                  </span>
                </button>
                {it.caption && <figcaption className="specimen-cap t-label text-fg-muted">{it.caption}</figcaption>}
              </figure>
            </li>
          ))}
        </ul>
      )}

      {everOpened && (
        <Lightbox
          items={items}
          index={open}
          lang={lang}
          onIndex={(i) => {
            setOpen(i);
            setCurrent(i);
          }}
          onClose={() => {
            setOpen(null);
            opener.current?.focus();
          }}
        />
      )}
    </div>
  );
}
