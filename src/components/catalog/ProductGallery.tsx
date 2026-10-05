"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { ease } from "@/components/ui";
import type { Media } from "@/lib/content";

export function ProductGallery({ images, title }: { images: Media[]; title: string }) {
  const [index, setIndex] = useState(0);
  if (!images.length) return null;
  const current = images[index];
  const go = (d: number) => setIndex((i) => (i + d + images.length) % images.length);

  return (
    <div className="flex flex-col gap-4">
      <div
        className="group relative aspect-[4/3] overflow-hidden rounded-sm bg-paper"
        role="region"
        aria-roledescription="carousel"
        aria-label={`Εικόνες: ${title}`}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") go(1);
          if (e.key === "ArrowLeft") go(-1);
        }}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={current.src}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease }}
            className="absolute inset-0"
          >
            <Image
              src={current.src}
              alt={current.caption ?? title}
              fill
              priority={index === 0}
              sizes="(min-width: 768px) 55vw, 100vw"
              className="object-contain"
            />
          </motion.div>
        </AnimatePresence>

        {images.length > 1 && (
          <>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between p-4">
              <span className="t-label rounded-full bg-ink/80 px-3 py-1.5 text-fg tabular backdrop-blur">
                {String(index + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
              </span>
              {current.caption && (
                <span className="t-label max-w-[60%] truncate rounded-full bg-ink/80 px-3 py-1.5 text-fg backdrop-blur">
                  {current.caption}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Προηγούμενη εικόνα"
              className="absolute left-3 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-ink/80 text-fg opacity-0 backdrop-blur transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Επόμενη εικόνα"
              className="absolute right-3 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-ink/80 text-fg opacity-0 backdrop-blur transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
            >
              →
            </button>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1" data-lenis-prevent>
          {images.map((img, i) => (
            <button
              key={img.src}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Εικόνα ${i + 1}${img.caption ? `: ${img.caption}` : ""}`}
              aria-current={i === index}
              className={`relative aspect-square w-16 shrink-0 overflow-hidden rounded-sm bg-paper transition-[opacity,outline-color] md:w-20 ${
                i === index ? "opacity-100 outline outline-1 outline-offset-2 outline-edge" : "opacity-50 hover:opacity-90"
              }`}
            >
              <Image src={img.src} alt="" fill sizes="5rem" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
