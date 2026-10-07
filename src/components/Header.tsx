"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Logo } from "./Logo";
import { contact } from "@/lib/contact";
import { publicPath, t, type Lang } from "@/lib/i18n";

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

type Menu = "closed" | "open" | "closing";

/** Close the sheet this long after the exit animation starts (globals.css, `sheet-out`). */
const SHEET_EXIT_MS = 300;

export function Header({ data }: { data: HeaderData }) {
  const { lang, primary, columns } = data;
  const d = t(lang);
  // Greek pages are rendered as "/el/…" and the router reports that internal path; compare with the public one.
  const path = publicPath(usePathname());
  const [scrolled, setScrolled] = useState(false);
  const [mega, setMega] = useState(false);
  const [menu, setMenu] = useState<Menu>("closed");
  const [preview, setPreview] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const exitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hoverOpenedAt = useRef(0);
  const sheet = useRef<HTMLDialogElement>(null);
  const burger = useRef<HTMLButtonElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const megaItem = useRef<HTMLLIElement>(null);
  const megaButton = useRef<HTMLButtonElement>(null);

  // The header is always visible; scrolling only turns it into the floating glass capsule.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menus on navigation (state-during-render pattern, no effect needed).
  const [lastPath, setLastPath] = useState(path);
  if (path !== lastPath) {
    setLastPath(path);
    setMega(false);
    setMenu("closed");
  }

  // The sheet is a native modal dialog: it traps focus, closes on Esc and makes the page behind it inert.
  useEffect(() => {
    const el = sheet.current;
    if (!el) return;
    if (menu === "open" && !el.open) {
      el.showModal();
      closeButton.current?.focus();
    }
    if (menu === "closed" && el.open) el.close();
    document.documentElement.style.overflow = menu === "closed" ? "" : "hidden";
  }, [menu]);

  // The menu button only exists below lg: leaving that range closes the sheet.
  useEffect(() => {
    const wide = window.matchMedia("(min-width: 1024px)");
    const onChange = () => wide.matches && setMenu("closed");
    wide.addEventListener("change", onChange);
    return () => wide.removeEventListener("change", onChange);
  }, []);

  useEffect(
    () => () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
      if (exitTimer.current) clearTimeout(exitTimer.current);
      document.documentElement.style.overflow = "";
    },
    []
  );

  const openSheet = () => {
    if (exitTimer.current) clearTimeout(exitTimer.current);
    setMenu("open");
  };
  const closeSheet = () => {
    setMenu("closing");
    exitTimer.current = setTimeout(() => {
      setMenu("closed");
      burger.current?.focus();
    }, SHEET_EXIT_MS);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (megaItem.current?.contains(document.activeElement)) megaButton.current?.focus();
      setMega(false);
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
  const solid = (scrolled || mega) && menu === "closed";
  const isActive = (match: string[]) => match.some((m) => path === m || path.startsWith(`${m}/`));
  const otherLang: Lang = lang === "el" ? "en" : "el";
  const switchHref = data.alternates[path] ?? data.otherHome;
  // Over the page the controls are glass; once the capsule is there they are plain outlines.
  const control = solid ? "border border-line-strong hover:border-accent" : "glass glass-thin glass-sheen";

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
        <div className="shell relative flex h-[var(--header-h)] items-center justify-between gap-6 xl:gap-8">
          <Link href={data.homeHref} aria-label={d.a11y.home} className="flex h-11 shrink-0 items-center">
            <Logo />
          </Link>

          <nav aria-label={d.a11y.mainNav} className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {primary.map((item) => {
                const active = isActive(item.match);
                const tone = active ? "text-fg" : "text-fg-muted hover:text-fg";
                return (
                  <li
                    key={item.label}
                    ref={item.mega ? megaItem : undefined}
                    onMouseEnter={item.mega ? openMega : undefined}
                    onMouseLeave={item.mega ? closeMega : undefined}
                    onBlur={
                      item.mega
                        ? (e) => {
                            if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setMega(false);
                          }
                        : undefined
                    }
                  >
                    {item.mega ? (
                      <button
                        ref={megaButton}
                        type="button"
                        aria-expanded={mega}
                        aria-controls="mega-menu"
                        aria-current={active ? "true" : undefined}
                        onClick={toggleMega}
                        className={`t-small group relative flex min-h-11 items-center gap-1.5 px-3 font-medium transition-colors xl:px-4 ${mega ? "text-fg" : tone}`}
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
                        aria-current={active ? "page" : undefined}
                        className={`t-small relative flex min-h-11 items-center px-3 font-medium transition-colors xl:px-4 ${tone}`}
                      >
                        {item.label}
                        <NavUnderline active={active} />
                      </Link>
                    )}

                    {/* Desktop mega menu: right after its button, so the keyboard reaches it next */}
                    {item.mega && (
                      <AnimatePresence>
                        {mega && (
                          <motion.div
                            id="mega-menu"
                            initial={{ opacity: 0, y: -10, scale: 0.985 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -6, scale: 0.99, transition: { duration: 0.18 } }}
                            transition={{ type: "spring", bounce: 0, duration: 0.45 }}
                            style={{
                              left: "var(--capsule-x)",
                              right: "var(--capsule-x)",
                              top: "calc(var(--header-h) - 0.15rem)",
                              transformOrigin: "32% 0%",
                            }}
                            className="glass glass-thick fixed rounded-[1.4rem]"
                          >
                            <div className="grid grid-cols-[1fr_1fr_1fr_minmax(15rem,20rem)] gap-10 p-8 xl:p-10">
                              {columns.map((group) => (
                                <div key={group.href}>
                                  <Link
                                    href={group.href}
                                    className="t-label mb-5 flex min-h-8 items-center justify-between border-b border-line pb-3 text-accent"
                                    onMouseEnter={() => setPreview(group.image)}
                                    onFocus={() => setPreview(group.image)}
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
                                          className="t-small -mx-2 flex min-h-8 items-center rounded-lg px-2 font-medium leading-snug text-fg-muted transition-colors hover:bg-[oklch(1_0_0/0.55)] hover:text-fg"
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
                                    <Image src={(preview ?? data.defaultPreview)!} alt="" fill sizes="20rem" className="object-cover" />
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
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-2 md:gap-3">
            {/* Phone: a 44px button on phones, the number itself from md */}
            <a
              href={contact.phoneHref}
              aria-label={`${d.common.callUs} ${d.contact.phone}`}
              className={`relative flex size-11 items-center justify-center rounded-full transition-colors hover:text-accent md:hidden ${control}`}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
            <a
              href={contact.phoneHref}
              className={`t-small group relative hidden min-h-11 items-center gap-3 whitespace-nowrap rounded-full pl-3 pr-4 font-semibold transition-colors hover:text-accent md:flex ${control}`}
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
              className={`t-label group relative flex h-11 items-center rounded-full px-3.5 ${control}`}
            >
              {/* The language you are reading is the strong one; the other is the link to it */}
              <span aria-hidden className="font-semibold text-fg">
                {lang === "el" ? "ΕΛ" : "EN"}
              </span>
              <span aria-hidden className="mx-1.5 h-3 w-px bg-line-strong" />
              <span className="font-medium text-fg-muted transition-colors group-hover:text-accent group-focus-visible:text-accent">
                {lang === "el" ? "EN" : "ΕΛ"}
              </span>
            </Link>
            <button
              ref={burger}
              type="button"
              onClick={openSheet}
              aria-expanded={menu !== "closed"}
              aria-haspopup="dialog"
              aria-controls="mobile-menu"
              aria-label={d.a11y.openMenu}
              className="relative flex size-11 items-center justify-center lg:hidden"
            >
              <span className="absolute h-px w-6 -translate-y-1 bg-fg" />
              <span className="absolute h-px w-6 translate-y-1 bg-fg" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu: a modal dialog with its own top bar, so the close button is inside it */}
      <dialog
        id="mobile-menu"
        ref={sheet}
        aria-modal="true"
        aria-label={d.a11y.mobileNav}
        data-theme="frost"
        data-closing={menu === "closing" ? "" : undefined}
        onCancel={(e) => {
          e.preventDefault();
          if (menu === "open") closeSheet();
        }}
        className="menu-sheet glass glass-thick lg:hidden"
      >
        {menu !== "closed" && (
          <div className="min-h-full">
            <div className="shell flex h-[var(--header-h)] items-center justify-between gap-6">
              <Link href={data.homeHref} aria-label={d.a11y.home} className="flex h-11 shrink-0 items-center">
                <Logo />
              </Link>
              <button ref={closeButton} type="button" onClick={closeSheet} aria-label={d.a11y.closeMenu} className="relative flex size-11 items-center justify-center">
                <span className="absolute h-px w-6 rotate-45 bg-fg" />
                <span className="absolute h-px w-6 -rotate-45 bg-fg" />
              </button>
            </div>
            <nav aria-label={d.a11y.mobileNav} className="shell pt-6">
              <ul className="border-t border-line">
                {data.mobile.map((l, i) => {
                  const active = l.href === data.homeHref ? path === l.href : path === l.href || path.startsWith(`${l.href}/`);
                  return (
                    <motion.li
                      key={l.href}
                      initial={{ opacity: 0, y: 24 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 + i * 0.045, duration: 0.6, ease }}
                      className="border-b border-line"
                    >
                      <Link
                        href={l.href}
                        aria-current={active ? "page" : undefined}
                        className={`t-h2 flex min-h-14 items-center justify-between py-3 ${active ? "text-accent" : ""}`}
                      >
                        {l.label}
                        <span aria-hidden className="t-label tabular text-fg-muted">{String(i + 1).padStart(2, "0")}</span>
                      </Link>
                    </motion.li>
                  );
                })}
              </ul>
            </nav>
            <div className="shell grid gap-1 pb-16 pt-10 text-fg-muted">
              <a href={contact.phoneHref} className="t-h3 flex min-h-11 items-center tabular text-fg">
                {d.contact.phone}
              </a>
              <a href={`mailto:${contact.email}`} className="flex min-h-11 items-center">
                {contact.email}
              </a>
              <p className="mt-2">{d.contact.address}</p>
              <Link href={switchHref} hrefLang={otherLang} lang={otherLang} className="text-link t-label mt-4 w-fit">
                {t(otherLang).langName}
              </Link>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}

function NavUnderline({ active }: { active: boolean }) {
  return (
    <span
      aria-hidden
      className={`absolute inset-x-3 bottom-1.5 h-px origin-left bg-accent transition-transform duration-500 xl:inset-x-4 ${
        active ? "scale-x-100" : "scale-x-0"
      }`}
      style={{ transitionTimingFunction: "var(--ease-out)" }}
    />
  );
}
