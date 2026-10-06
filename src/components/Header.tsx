"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Logo } from "./Logo";
import { contact } from "@/lib/content";
import { t, type Lang } from "@/lib/i18n";

const ease = [0.22, 1, 0.36, 1] as const;

type MegaItem = { label: string; href: string; image: string | null };

/** Everything the header needs, computed on the server so the catalogue never ships to the browser. */
export type HeaderData = {
  lang: Lang;
  homeHref: string;
  primary: { label: string; href: string; mega?: boolean; match: string[] }[];
  mobile: { label: string; href: string }[];
  columns: { title: string; href: string; image: string | null; items: MegaItem[] }[];
  defaultPreview: string | null;
  footnote: string;
  /** Path in this language -> same page in the other language. */
  alternates: Record<string, string>;
  otherHome: string;
};

export function Header({ data }: { data: HeaderData }) {
  const { lang, primary, columns } = data;
  const d = t(lang);
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mega, setMega] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hoverOpenedAt = useRef(0);

  // The header is always visible; scrolling only turns it into the floating glass capsule.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menus on navigation (state-during-render pattern, no effect needed).
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setMega(false);
    setMobile(false);
  }

  useEffect(() => {
    document.documentElement.style.overflow = mobile ? "hidden" : "";
  }, [mobile]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMega(false);
        setMobile(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const openMega = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setMega((open) => {
      if (!open) hoverOpenedAt.current = Date.now();
      return true;
    });
  };
  // A click right after hover-open must not immediately close the panel.
  const toggleMega = () => {
    if (Date.now() - hoverOpenedAt.current < 600) return setMega(true);
    setMega((m) => !m);
  };
  const closeMega = () => {
    closeTimer.current = setTimeout(() => setMega(false), 140);
  };

  // The capsule shows when scrolled or when the mega panel is open; the mobile sheet brings its own glass.
  const solid = (scrolled || mega) && !mobile;
  const isActive = (match: string[]) => match.some((m) => pathname === m || pathname.startsWith(`${m}/`));
  const otherLang: Lang = lang === "el" ? "en" : "el";
  const switchHref = data.alternates[pathname] ?? data.otherHome;

  return (
    <>
      <header data-theme="frost" className="fixed inset-x-0 top-0 z-50">
        {/* Floating glass capsule: settles into place once you scroll (opacity and scale only, so no layout work per frame) */}
        <div
          aria-hidden
          className={`glass glass-thick pointer-events-none absolute rounded-[1.15rem] transition-[opacity,scale] duration-700 ${
            solid ? "scale-100 opacity-100" : "scale-[1.03] opacity-0"
          }`}
          style={{ inset: "0.55rem var(--capsule-x)", transitionTimingFunction: "var(--ease-out)" }}
        />
        <div className="shell relative flex h-[var(--header-h)] items-center justify-between gap-8">
          <Link href={data.homeHref} aria-label={d.a11y.home} className="shrink-0">
            <Logo />
          </Link>

          <nav aria-label={d.a11y.mainNav} className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {primary.map((item) => {
                const active = isActive(item.match);
                return (
                  <li
                    key={item.label}
                    onMouseEnter={item.mega ? openMega : undefined}
                    onMouseLeave={item.mega ? closeMega : undefined}
                  >
                    {item.mega ? (
                      <button
                        type="button"
                        aria-expanded={mega}
                        aria-controls="mega-menu"
                        onClick={toggleMega}
                        className={`group relative flex items-center gap-1.5 px-4 py-2 text-[0.95rem] font-medium transition-colors ${
                          active || mega ? "text-fg" : "text-fg-muted hover:text-fg"
                        }`}
                      >
                        {item.label}
                        <svg
                          width="10"
                          height="10"
                          viewBox="0 0 10 10"
                          aria-hidden
                          className={`transition-transform duration-300 ${mega ? "rotate-180" : ""}`}
                        >
                          <path d="M1 3.5L5 7L9 3.5" stroke="currentColor" strokeWidth="1.4" fill="none" />
                        </svg>
                        <NavUnderline active={active} />
                      </button>
                    ) : (
                      <Link
                        href={item.href}
                        className={`relative block px-4 py-2 text-[0.95rem] font-medium transition-colors ${
                          active ? "text-fg" : "text-fg-muted hover:text-fg"
                        }`}
                      >
                        {item.label}
                        <NavUnderline active={active} />
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-3">
            <a
              href={contact.phoneHref}
              className={`group relative hidden items-center gap-3 rounded-full py-2 pl-3 pr-4 text-[0.92rem] font-semibold transition-colors hover:text-accent md:flex ${
                solid ? "border border-line-strong hover:border-accent" : "glass glass-thin glass-sheen"
              }`}
            >
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-60" />
                <span className="relative inline-flex size-2 rounded-full bg-accent" />
              </span>
              <span className="tabular">{d.contact.phone}</span>
            </a>
            <Link
              href={switchHref}
              hrefLang={otherLang}
              lang={otherLang}
              aria-label={d.switchTo}
              title={d.switchTo}
              className={`relative flex h-10 items-center rounded-full px-3.5 text-[0.85rem] font-semibold tracking-[0.06em] transition-colors hover:text-accent ${
                solid ? "border border-line-strong hover:border-accent" : "glass glass-thin glass-sheen"
              }`}
            >
              <span aria-hidden className="text-fg-dim">{lang === "el" ? "ΕΛ" : "EN"}</span>
              <span aria-hidden className="mx-1.5 h-3 w-px bg-line-strong" />
              <span>{lang === "el" ? "EN" : "ΕΛ"}</span>
            </Link>
            <button
              type="button"
              onClick={() => setMobile((m) => !m)}
              aria-expanded={mobile}
              aria-label={mobile ? d.a11y.closeMenu : d.a11y.openMenu}
              className="relative flex size-11 items-center justify-center lg:hidden"
            >
              <span
                className="absolute h-px w-6 bg-fg transition-transform duration-500"
                style={{ transform: mobile ? "rotate(45deg)" : "translateY(-4px)", transitionTimingFunction: "var(--ease-out)" }}
              />
              <span
                className="absolute h-px w-6 bg-fg transition-transform duration-500"
                style={{ transform: mobile ? "rotate(-45deg)" : "translateY(4px)", transitionTimingFunction: "var(--ease-out)" }}
              />
            </button>
          </div>
        </div>

        {/* Desktop mega menu */}
        <AnimatePresence>
          {mega && (
            <motion.div
              id="mega-menu"
              onMouseEnter={openMega}
              onMouseLeave={closeMega}
              initial={{ opacity: 0, y: -10, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.99, transition: { duration: 0.18 } }}
              transition={{ type: "spring", bounce: 0, duration: 0.45 }}
              style={{ left: "var(--capsule-x)", right: "var(--capsule-x)", transformOrigin: "32% 0%" }}
              className="glass glass-thick absolute top-[calc(100%-0.15rem)] hidden rounded-[1.4rem] lg:block"
            >
              <div className="grid grid-cols-[1fr_1fr_1fr_minmax(15rem,20rem)] gap-10 p-8 xl:p-10">
                {columns.map((group) => (
                  <div key={group.href}>
                    <Link
                      href={group.href}
                      className="t-label mb-5 flex items-center justify-between border-b border-line pb-3 text-accent"
                      onMouseEnter={() => setPreview(group.image)}
                    >
                      {group.title}
                      <span aria-hidden>→</span>
                    </Link>
                    <ul className="grid gap-0.5">
                      {group.items.map((it) => (
                        <li key={it.href}>
                          <Link
                            href={it.href}
                            onMouseEnter={() => setPreview(it.image)}
                            onFocus={() => setPreview(it.image)}
                            className="-mx-2 block rounded-lg px-2 py-1 text-[0.95rem] font-medium leading-snug text-fg-muted transition-colors hover:bg-[oklch(1_0_0/0.55)] hover:text-fg"
                          >
                            {it.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
                <div className="relative aspect-[4/5] overflow-hidden rounded-[0.9rem] bg-surface-2">
                  <AnimatePresence mode="popLayout">
                    <motion.div
                      key={preview ?? data.defaultPreview}
                      initial={{ opacity: 0, scale: 1.06 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.6, ease }}
                      className="absolute inset-0"
                    >
                      <Image
                        src={(preview ?? data.defaultPreview)!}
                        alt=""
                        fill
                        sizes="20rem"
                        className="object-cover"
                      />
                    </motion.div>
                  </AnimatePresence>
                  <p className="glass glass-thin t-label absolute bottom-3 left-3 right-3 rounded-[0.65rem] px-3 py-2.5 text-fg">
                    {data.footnote}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobile && (
          <motion.div
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.7, ease }}
            data-theme="frost"
            className="glass glass-thick fixed inset-0 z-40 overflow-y-auto pt-[var(--header-h)] lg:hidden"
          >
            <nav aria-label={d.a11y.mobileNav} className="shell pb-16 pt-6">
              <ul className="border-t border-line">
                {data.mobile.map((l, i) => (
                  <motion.li
                    key={l.href}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + i * 0.045, duration: 0.6, ease }}
                    className="border-b border-line"
                  >
                    <Link href={l.href} className="t-h2 flex items-center justify-between py-4">
                      {l.label}
                      <span className="text-base text-fg-dim tabular">{String(i + 1).padStart(2, "0")}</span>
                    </Link>
                  </motion.li>
                ))}
              </ul>
              <div className="mt-10 grid gap-2 text-fg-muted">
                <a href={contact.phoneHref} className="text-2xl font-semibold text-fg tabular">
                  {d.contact.phone}
                </a>
                <a href={`mailto:${contact.email}`} className="text-lg">
                  {contact.email}
                </a>
                <p>{d.contact.address}</p>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function NavUnderline({ active }: { active: boolean }) {
  return (
    <span
      aria-hidden
      className={`absolute inset-x-4 -bottom-0.5 h-px origin-left bg-accent transition-transform duration-500 ${
        active ? "scale-x-100" : "scale-x-0"
      }`}
      style={{ transitionTimingFunction: "var(--ease-out)" }}
    />
  );
}
