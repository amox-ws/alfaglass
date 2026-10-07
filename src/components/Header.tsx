"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Logo } from "./Logo";
import { Units } from "./kit/Units";
import { contact } from "@/lib/contact";
import { publicPath, t, type Lang } from "@/lib/i18n";

const ease = [0.22, 1, 0.36, 1] as const;

type NavLink = { label: string; href: string; match: string[] };
type NavItem =
  | ({ kind: "link" } & NavLink)
  /** Προϊόντα: the rack (a mega menu) */
  | ({ kind: "mega" } & NavLink)
  /** Εταιρεία: a small dropdown */
  | ({ kind: "menu"; items: { label: string; href: string }[] } & NavLink);

/** Everything the header needs, computed on the server so the catalogue never ships to the browser. */
export type HeaderData = {
  lang: Lang;
  homeHref: string;
  nav: NavItem[];
  /** The rack: one column per group (families or materials, each with its own count), a mono line, and the cutting card. */
  mega: {
    columns: { title: string; href: string; items: { label: string; href: string; count?: number }[] }[];
    count: string;
    cutting: { label: string; title: string; line: string; href: string; linkLabel: string; estimatorHref: string; estimatorLabel: string };
    /** The `MachineBlueprint mini`, drawn on the server. */
    drawing: ReactNode;
  };
  mobile: {
    products: { label: string; groups: { label: string; href: string }[] };
    service: { label: string; href: string };
    works: { label: string; href: string } | null;
    company: { label: string; links: { label: string; href: string }[] };
    contact: { label: string; href: string };
    estimator: { label: string; href: string };
  };
  quote: { label: string; href: string };
  /** Path in this language -> same page in the other language. */
  alternates: Record<string, string>;
  otherHome: string;
};

type Menu = "closed" | "open" | "closing";
type Panel = "mega" | "menu" | null;

/** Close the sheet this long after the exit animation starts (globals.css, `sheet-out`). */
const SHEET_EXIT_MS = 300;
/** A panel opens when the pointer has rested on its button this long (hover-intent). */
const HOVER_INTENT_MS = 150;

export function Header({ data }: { data: HeaderData }) {
  const { lang, nav, mega } = data;
  const d = t(lang);
  // Greek pages are rendered as "/el/…" and the router reports that internal path; compare with the public one.
  const path = publicPath(usePathname());
  const [scrolled, setScrolled] = useState(false);
  const [panel, setPanel] = useState<Panel>(null);
  const [menu, setMenu] = useState<Menu>("closed");
  const intentTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const exitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hoverOpenedAt = useRef(0);
  const sheet = useRef<HTMLDialogElement>(null);
  const burger = useRef<HTMLButtonElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const navRef = useRef<HTMLElement>(null);

  // The header is always visible; scrolling only turns it into the floating glass capsule. A mark 24px tall at the very top of the page
  // (SiteShell) tells when it has left the screen: the observer reports it once, where a scroll listener that reads `scrollY` forces a
  // layout on every scroll event, which cost more main-thread time than anything else in a long scroll.
  useEffect(() => {
    const mark = document.getElementById("page-top");
    if (!mark) return;
    const watch = new IntersectionObserver(([entry]) => setScrolled(!entry.isIntersecting));
    watch.observe(mark);
    return () => watch.disconnect();
  }, []);

  // Close menus on navigation (state-during-render pattern, no effect needed).
  const [lastPath, setLastPath] = useState(path);
  if (path !== lastPath) {
    setLastPath(path);
    setPanel(null);
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
      for (const timer of [intentTimer, closeTimer, exitTimer]) if (timer.current) clearTimeout(timer.current);
      document.documentElement.style.overflow = "";
    },
    [],
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

  // Esc closes a panel and gives the focus back to its button; a press anywhere else closes it too
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      const inside = navRef.current?.contains(document.activeElement);
      setPanel((open) => {
        if (open && inside) navRef.current?.querySelector<HTMLElement>(`[data-panel="${open}"]`)?.focus();
        return null;
      });
    };
    const onPointer = (e: PointerEvent) => {
      if (!navRef.current?.contains(e.target as Node)) setPanel(null);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointer);
    };
  }, []);

  const cancelTimers = () => {
    if (intentTimer.current) clearTimeout(intentTimer.current);
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };
  const intend = (which: Exclude<Panel, null>) => {
    cancelTimers();
    intentTimer.current = setTimeout(() => {
      hoverOpenedAt.current = Date.now();
      setPanel(which);
    }, HOVER_INTENT_MS);
  };
  const leave = () => {
    cancelTimers();
    closeTimer.current = setTimeout(() => setPanel(null), 140);
  };
  // A click right after a hover-open must not immediately close the panel.
  const toggle = (which: Exclude<Panel, null>) => {
    cancelTimers();
    if (Date.now() - hoverOpenedAt.current < 600) return setPanel(which);
    setPanel((open) => (open === which ? null : which));
  };

  // The capsule shows when scrolled or when a panel is open; the mobile sheet brings its own surface.
  const solid = (scrolled || panel !== null) && menu === "closed";
  const isActive = (match: string[]) => match.some((m) => path === m || path.startsWith(`${m}/`));
  const otherLang: Lang = lang === "el" ? "en" : "el";
  const switchHref = data.alternates[path] ?? data.otherHome;
  // Over the page the controls are glass; once the capsule is there they are plain outlines.
  const control = solid ? "border border-line-strong hover:border-accent" : "glass glass-thin glass-sheen";

  return (
    <>
      <header data-theme="frost" data-solid={solid ? "true" : "false"} className="site-header fixed inset-x-0 top-0 z-50">
        {/* Floating glass capsule: settles into place once you scroll (opacity and scale only, so no layout work per frame) */}
        <div
          aria-hidden
          className={`glass glass-thick pointer-events-none absolute rounded-[1.15rem] transition-[opacity,scale] duration-700 ${solid ? "scale-100 opacity-100" : "scale-[1.03] opacity-0"}`}
          style={{ inset: "0.55rem var(--capsule-x)", transitionTimingFunction: "var(--ease-out)" }}
        />
        <div className="shell relative flex h-[var(--header-h)] items-center justify-between gap-6 xl:gap-8">
          <Link href={data.homeHref} aria-label={d.a11y.home} className="flex h-11 shrink-0 items-center">
            <Logo className="logo-light" />
            {/* The white wordmark for a dark first screen (CSS shows one of the two); it is decoration, the link carries the name */}
            <Image src="/brand/logo-on-dark.png" alt="" width={289} height={56} unoptimized loading="eager" fetchPriority="low" className="logo-dark h-auto w-[138px] md:w-[156px]" />
          </Link>

          <nav ref={navRef} aria-label={d.a11y.mainNav} className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {nav.map((item) => {
                const active = isActive(item.match);
                const tone = active ? "text-fg" : "text-fg-muted hover:text-fg";
                if (item.kind === "link") {
                  return (
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className={`t-small relative flex min-h-11 items-center px-3 font-medium whitespace-nowrap transition-colors xl:px-4 ${tone}`}
                      >
                        {item.label}
                        <NavUnderline active={active} />
                      </Link>
                    </li>
                  );
                }
                const which = item.kind === "mega" ? "mega" : "menu";
                const open = panel === which;
                const panelId = which === "mega" ? "mega-menu" : "company-menu";
                return (
                  <li
                    key={item.label}
                    className="relative"
                    onMouseEnter={() => intend(which)}
                    onMouseLeave={leave}
                    onBlur={(e) => {
                      if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setPanel(null);
                    }}
                  >
                    <button
                      type="button"
                      data-panel={which}
                      aria-expanded={open}
                      aria-controls={panelId}
                      aria-current={active ? "true" : undefined}
                      onClick={() => toggle(which)}
                      className={`t-small group relative flex min-h-11 items-center gap-1.5 px-3 font-medium whitespace-nowrap transition-colors xl:px-4 ${open ? "text-fg" : tone}`}
                    >
                      {item.label}
                      <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`}>
                        <path d="M1 3.5L5 7L9 3.5" stroke="currentColor" strokeWidth="1.4" fill="none" />
                      </svg>
                      <NavUnderline active={active} />
                    </button>

                    {/* The rack: right after its button, so the keyboard reaches it next */}
                    {item.kind === "mega" && (
                      <AnimatePresence>
                        {open && (
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
                              maxHeight: "calc(100svh - var(--header-h) - 0.5rem)",
                              transformOrigin: "32% 0%",
                            }}
                            className="glass glass-thick fixed flex flex-col rounded-[1.4rem]"
                          >
                            <div className="grid min-h-0 grid-cols-[1fr_1fr_1fr_13rem] gap-8 overflow-y-auto p-8 xl:grid-cols-[1fr_1fr_1fr_minmax(18rem,22rem)] xl:gap-10 xl:p-10">
                              {mega.columns.map((group) => (
                                <div key={group.href}>
                                  <Link href={group.href} className="mb-4 flex min-h-8 items-baseline justify-between gap-3 border-b border-line pb-3 text-accent">
                                    <span className="t-h3">{group.title}</span>
                                    <span aria-hidden className="t-small">
                                      →
                                    </span>
                                  </Link>
                                  <ul className="grid gap-0.5">
                                    {group.items.map((it, i) => (
                                      <li key={it.href}>
                                        <Link href={it.href} className="mega-row glint t-small text-fg-muted">
                                          <span className="t-label shrink-0 text-fg-dim">{String(i + 1).padStart(2, "0")}</span>
                                          <span className="min-w-0 flex-1 leading-snug">{it.label}</span>
                                          {it.count !== undefined && <span className="t-label shrink-0 text-fg-dim">{it.count}</span>}
                                        </Link>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              ))}
                              {/* The cutting card: the second pillar, a blueprint on deep */}
                              <div data-theme="deep" className="mega-card">
                                <p className="t-label text-fg-muted">{mega.cutting.label}</p>
                                <Link href={mega.cutting.href} className="t-h3 text-fg hover:text-accent">
                                  {mega.cutting.title}
                                </Link>
                                <div className="hidden xl:block">{mega.drawing}</div>
                                <p className="t-label text-fg-muted">
                                  <Units>{mega.cutting.line}</Units>
                                </p>
                                <div className="mt-auto grid gap-1">
                                  <Link href={mega.cutting.href} className="t-small flex min-h-8 items-center font-medium text-fg hover:text-accent">
                                    {mega.cutting.linkLabel} →
                                  </Link>
                                  <Link href={mega.cutting.estimatorHref} className="t-small flex min-h-8 items-center font-medium text-accent hover:text-fg">
                                    {mega.cutting.estimatorLabel} →
                                  </Link>
                                </div>
                              </div>
                            </div>
                            <div className="flex shrink-0 items-center justify-between gap-6 border-t border-line px-8 py-4 xl:px-10">
                              <p className="t-label text-fg-muted">{mega.count}</p>
                              <a href={contact.phoneHref} className="t-label flex min-h-8 items-center text-fg hover:text-accent">
                                {d.contact.phone}
                              </a>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    )}

                    {/* The company menu: a small panel, not a mega menu */}
                    {item.kind === "menu" && (
                      <AnimatePresence>
                        {open && (
                          <motion.div
                            id="company-menu"
                            initial={{ opacity: 0, y: -8, scale: 0.985 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -4, scale: 0.99, transition: { duration: 0.15 } }}
                            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                            style={{ transformOrigin: "20% 0%" }}
                            className="glass glass-thick absolute left-0 top-full mt-2 w-72 rounded-[1.1rem] p-2"
                          >
                            <ul>
                              {item.items.map((it) => (
                                <li key={it.href}>
                                  <Link href={it.href} className="menu-row glint t-small text-fg-muted">
                                    {it.label}
                                  </Link>
                                </li>
                              ))}
                            </ul>
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
            {/* Phone: a 44px button on phones, the number itself from md (it never wraps) */}
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
              className={`group relative hidden min-h-11 items-center gap-3 whitespace-nowrap rounded-full pl-3 pr-4 font-semibold transition-colors hover:text-accent md:flex ${control}`}
            >
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-60" />
                <span className="relative inline-flex size-2 rounded-full bg-accent" />
              </span>
              <span className="t-data tabular">{d.contact.phone}</span>
            </a>
            <a
              href={data.quote.href}
              className="t-small hidden min-h-11 items-center whitespace-nowrap rounded-full bg-fg px-5 font-semibold text-surface transition-colors hover:bg-accent hover:text-accent-fg xl:flex"
            >
              {data.quote.label}
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
              <span className="font-medium text-fg-muted transition-colors group-hover:text-accent group-focus-visible:text-accent">{lang === "el" ? "EN" : "ΕΛ"}</span>
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

      {/* Mobile menu: a modal dialog on night with its own top bar, so the close button is inside it */}
      <dialog
        id="mobile-menu"
        ref={sheet}
        aria-modal="true"
        aria-label={d.a11y.mobileNav}
        data-theme="night"
        data-closing={menu === "closing" ? "" : undefined}
        onCancel={(e) => {
          e.preventDefault();
          if (menu === "open") closeSheet();
        }}
        className="menu-sheet lg:hidden"
      >
        {menu !== "closed" && <MobileMenu data={data} path={path} switchHref={switchHref} otherLang={otherLang} closeSheet={closeSheet} closeButton={closeButton} />}
      </dialog>
    </>
  );
}

function MobileMenu({
  data,
  path,
  switchHref,
  otherLang,
  closeSheet,
  closeButton,
}: {
  data: HeaderData;
  path: string;
  switchHref: string;
  otherLang: Lang;
  closeSheet: () => void;
  closeButton: React.RefObject<HTMLButtonElement | null>;
}) {
  const { lang, mobile } = data;
  const d = t(lang);
  const on = (href: string) => path === href || path.startsWith(`${href}/`);
  const rows: { key: string; node: (n: string) => ReactNode }[] = [
    {
      key: "products",
      node: (n) => (
        <details className="mobile-group" open={mobile.products.groups.some((g) => on(g.href))}>
          <summary className="mobile-row t-h2">
            <span className="flex items-baseline gap-4">
              <span className="t-label tabular text-fg-muted">{n}</span>
              {mobile.products.label}
            </span>
            <svg width="16" height="16" viewBox="0 0 10 10" aria-hidden className="mobile-chevron shrink-0 transition-transform duration-300">
              <path d="M1 3.5L5 7L9 3.5" stroke="currentColor" strokeWidth="1.2" fill="none" />
            </svg>
          </summary>
          <ul className="grid pb-3 pl-9">
            {mobile.products.groups.map((g) => (
              <li key={g.href}>
                <Link href={g.href} aria-current={on(g.href) ? "page" : undefined} className={`t-h3 flex min-h-12 items-center ${on(g.href) ? "text-accent" : "text-fg-muted"}`}>
                  {g.label}
                </Link>
              </li>
            ))}
          </ul>
        </details>
      ),
    },
    {
      key: "service",
      node: (n) => <MobileLink href={mobile.service.href} label={mobile.service.label} n={n} active={on(mobile.service.href)} />,
    },
    ...(mobile.works ? [{ key: "works", node: (n: string) => <MobileLink href={mobile.works!.href} label={mobile.works!.label} n={n} active={on(mobile.works!.href)} /> }] : []),
    {
      key: "company",
      node: (n) => (
        <details className="mobile-group" open={mobile.company.links.some((l) => path === l.href)}>
          <summary className="mobile-row t-h2">
            <span className="flex items-baseline gap-4">
              <span className="t-label tabular text-fg-muted">{n}</span>
              {mobile.company.label}
            </span>
            <svg width="16" height="16" viewBox="0 0 10 10" aria-hidden className="mobile-chevron shrink-0 transition-transform duration-300">
              <path d="M1 3.5L5 7L9 3.5" stroke="currentColor" strokeWidth="1.2" fill="none" />
            </svg>
          </summary>
          <ul className="grid pb-3 pl-9">
            {mobile.company.links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} aria-current={path === l.href ? "page" : undefined} className={`t-h3 flex min-h-12 items-center ${path === l.href ? "text-accent" : "text-fg-muted"}`}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </details>
      ),
    },
    { key: "contact", node: (n) => <MobileLink href={mobile.contact.href} label={mobile.contact.label} n={n} active={on(mobile.contact.href)} /> },
  ];

  return (
    <div className="min-h-full">
      <div className="shell flex h-[var(--header-h)] items-center justify-between gap-6">
        <Link href={data.homeHref} aria-label={d.a11y.home} className="flex h-11 shrink-0 items-center">
          <Logo variant="white" />
        </Link>
        <button ref={closeButton} type="button" onClick={closeSheet} aria-label={d.a11y.closeMenu} className="relative flex size-11 items-center justify-center">
          <span className="absolute h-px w-6 rotate-45 bg-fg" />
          <span className="absolute h-px w-6 -rotate-45 bg-fg" />
        </button>
      </div>
      <nav aria-label={d.a11y.mobileNav} className="shell pt-6">
        <ul className="border-t border-line">
          {rows.map((row, i) => (
            <motion.li
              key={row.key}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.045, duration: 0.6, ease }}
              className="border-b border-line"
            >
              {row.node(String(i + 1).padStart(2, "0"))}
            </motion.li>
          ))}
        </ul>
      </nav>
      <div className="shell grid gap-3 pb-16 pt-10">
        <a href={contact.phoneHref} className="flex min-h-14 items-center justify-center gap-3 rounded-full bg-accent px-6 font-semibold text-accent-fg">
          {d.common.callUs}
          <span className="t-data tabular">{d.contact.phone}</span>
        </a>
        <a href={`mailto:${contact.email}`} className="flex min-h-14 items-center justify-center rounded-full border border-line-strong px-6 font-semibold">
          {contact.email}
        </a>
        <Link href={mobile.estimator.href} className="flex min-h-14 items-center justify-center rounded-full border border-line-strong px-6 font-semibold text-accent">
          {mobile.estimator.label}
        </Link>
        <Link href={switchHref} hrefLang={otherLang} lang={otherLang} className="text-link t-label mt-4 w-fit">
          {t(otherLang).langName}
        </Link>
      </div>
    </div>
  );
}

function MobileLink({ href, label, n, active }: { href: string; label: string; n: string; active: boolean }) {
  return (
    <Link href={href} aria-current={active ? "page" : undefined} className={`mobile-row t-h2 ${active ? "text-accent" : ""}`}>
      <span className="flex items-baseline gap-4">
        <span className="t-label tabular text-fg-muted">{n}</span>
        {label}
      </span>
      <span aria-hidden className="t-small text-fg-muted">
        →
      </span>
    </Link>
  );
}

function NavUnderline({ active }: { active: boolean }) {
  return (
    <span
      aria-hidden
      className={`absolute inset-x-3 bottom-1.5 h-px origin-left bg-accent transition-transform duration-500 xl:inset-x-4 ${active ? "scale-x-100" : "scale-x-0"}`}
      style={{ transitionTimingFunction: "var(--ease-out)" }}
    />
  );
}
