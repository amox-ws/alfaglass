"use client";

import { useEffect, useRef, useState } from "react";
import { t, type Lang } from "@/lib/i18n";
import { LightboxBody } from "./LightboxBody";
import type { GalleryItemSized } from "./MediaGallery";

/**
 * The lightbox: a native modal `<dialog>` on night (`showModal()` brings the focus trap and an inert page; Esc and a click on the
 * backdrop close it; focus goes back to the item that opened it). It opens and closes with opacity and a scale of 0.98 → 1 (240ms,
 * none with reduced motion). `index` is the image on show, or null while it is closed. Loaded on first use (`next/dynamic`).
 */
export default function Lightbox({
  items,
  index,
  lang,
  onIndex,
  onClose,
}: {
  items: GalleryItemSized[];
  index: number | null;
  lang: Lang;
  onIndex: (i: number) => void;
  onClose: () => void;
}) {
  const d = t(lang);
  const dialog = useRef<HTMLDialogElement>(null);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    if (index !== null && !el.open) el.showModal();
    if (index === null && el.open) el.close();
    document.documentElement.style.overflow = index === null ? "" : "hidden";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [index]);

  const close = () => {
    setClosing(true);
    window.setTimeout(() => {
      setClosing(false);
      dialog.current?.close();
      onClose();
    }, 200);
  };

  return (
    <dialog
      ref={dialog}
      className="lightbox"
      data-theme="night"
      data-closing={closing ? "" : undefined}
      aria-label={d.media.lightbox}
      onCancel={(e) => {
        e.preventDefault();
        if (!closing) close();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !closing) close();
      }}
    >
      {index !== null && <LightboxBody items={items} index={index} lang={lang} onIndex={onIndex} onClose={close} />}
    </dialog>
  );
}
