"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Logo } from "./Logo";
import { categories, categoryHref, contact, products, productHref, site, getGroup } from "@/lib/content";
import { getLenis } from "./SmoothScroll";

const ease = [0.22, 1, 0.36, 1] as const;

const primary = [
  { label: "Εταιρεία", href: "/etaireia" },
  { label: "Προϊόντα", href: "/yalopinakes", mega: true },
  { label: "Εγκαταστάσεις", href: "/egkatastaseis" },
  { label: "Νέα", href: "/nea" },
  { label: "Επικοινωνία", href: "/epikoinonia" },
];

type MegaItem = { label: string; href: string; image: string | null };

function megaColumns() {
  return site.groups.map((g) => {
    const flat = g.categories.length === 1;
    const items: MegaItem[] = flat
      ? categories[g.categories[0]].products.map((p) => ({
          label: products[p].title,
          href: productHref(products[p]),
          image: products[p].thumb,
        }))
      : g.categories.map((c) => ({ label: categories[c].title, href: categoryHref(categories[c]), image: categories[c].image }));
    return { group: g, items };
  });
}

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [mega, setMega] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hoverOpenedAt = useRef(0);
  const columns = megaColumns();

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      setHidden(y > 320 && y > last + 4);
      if (y < last - 4) setHidden(false);
      last = y;
    };
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
    const lenis = getLenis();
    if (mobile) lenis?.stop();
    else lenis?.start();
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

  const solid = scrolled || mega || mobile;
  const productsActive = ["/yalopinakes", "/plastika-fylla", "/synafi-proionta"].some((p) => pathname.startsWith(p));

  return (
    <>
      <header
        className="fixed inset-x-0 top-0 z-50 transition-transform duration-500"
        style={{
          transform: hidden && !mega && !mobile ? "translateY(-100%)" : "translateY(0)",
          transitionTimingFunction: "var(--ease-out)",
        }}
      >
        <div
          className={`absolute inset-0 transition-[opacity,backdrop-filter] duration-500 ${
            solid ? "opacity-100" : "opacity-0"
          }`}
          style={{
            background: "color-mix(in oklch, var(--ink) 78%, transparent)",
            backdropFilter: "blur(18px) saturate(140%)",
            WebkitBackdropFilter: "blur(18px) saturate(140%)",
            borderBottom: "1px solid var(--line)",
          }}
        />
        <div className="shell relative flex h-[var(--header-h)] items-center justify-between gap-8">
          <Link href="/" aria-label="ALFA GLASS, αρχική σελίδα" className="shrink-0">
            <Logo />
          </Link>

          <nav aria-label="Κύρια πλοήγηση" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {primary.map((item) => {
                const active = item.mega ? productsActive : pathname.startsWith(item.href);
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
              className="group hidden items-center gap-3 rounded-full border border-line-strong py-2 pl-3 pr-4 text-[0.92rem] font-semibold transition-colors hover:border-edge hover:text-edge md:flex"
            >
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-edge opacity-60" />
                <span className="relative inline-flex size-2 rounded-full bg-edge" />
              </span>
              <span className="tabular">{contact.phone}</span>
            </a>
            <button
              type="button"
              onClick={() => setMobile((m) => !m)}
              aria-expanded={mobile}
              aria-label={mobile ? "Κλείσιμο μενού" : "Άνοιγμα μενού"}
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
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8, transition: { duration: 0.2 } }}
              transition={{ duration: 0.45, ease }}
              className="absolute inset-x-0 top-full hidden lg:block"
            >
              <div
                className="border-b border-line"
                style={{
                  background: "color-mix(in oklch, var(--ink) 92%, transparent)",
                  backdropFilter: "blur(24px) saturate(140%)",
                  WebkitBackdropFilter: "blur(24px) saturate(140%)",
                }}
              >
                <div className="shell grid grid-cols-[1fr_1fr_1fr_minmax(16rem,22rem)] gap-10 py-10">
                  {columns.map(({ group, items }) => (
                    <div key={group.slug}>
                      <Link
                        href={`/${group.slug}`}
                        className="t-label mb-5 flex items-center justify-between border-b border-line pb-3 text-edge"
                        onMouseEnter={() => setPreview(group.image)}
                      >
                        {group.title}
                        <span aria-hidden>→</span>
                      </Link>
                      <ul className="grid gap-0.5">
                        {items.map((it) => (
                          <li key={it.href}>
                            <Link
                              href={it.href}
                              onMouseEnter={() => setPreview(it.image)}
                              onFocus={() => setPreview(it.image)}
                              className="block py-1 text-[0.95rem] leading-snug text-fg-muted transition-colors hover:text-fg"
                            >
                              {it.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                  <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-ink-2">
                    <AnimatePresence mode="popLayout">
                      <motion.div
                        key={preview ?? getGroup("yalopinakes")!.image}
                        initial={{ opacity: 0, scale: 1.06 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.6, ease }}
                        className="absolute inset-0"
                      >
                        <Image
                          src={preview ?? categories["koinoi-float-yalopinakes"].image!}
                          alt=""
                          fill
                          sizes="22rem"
                          className="object-cover"
                        />
                      </motion.div>
                    </AnimatePresence>
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent" />
                    <p className="t-label absolute bottom-4 left-4 right-4 text-fg">
                      {site.groups.reduce((n, g) => n + g.categories.reduce((m, c) => m + categories[c].products.length, 0), 0)} προϊόντα σε 14 κατηγορίες
                    </p>
                  </div>
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
            className="fixed inset-0 z-40 overflow-y-auto bg-ink pt-[var(--header-h)] lg:hidden"
            data-lenis-prevent
          >
            <nav aria-label="Κινητό μενού" className="shell pb-16 pt-6">
              <ul className="border-t border-line">
                {[
                  { label: "Αρχική", href: "/" },
                  { label: "Εταιρεία", href: "/etaireia" },
                  ...site.groups.map((g) => ({ label: g.title, href: `/${g.slug}` })),
                  { label: "Εγκαταστάσεις", href: "/egkatastaseis" },
                  { label: "Νέα", href: "/nea" },
                  { label: "Χρήσιμοι Σύνδεσμοι", href: "/xrisimoi-syndesmoi" },
                  { label: "Επικοινωνία", href: "/epikoinonia" },
                ].map((l, i) => (
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
                  {contact.phone}
                </a>
                <a href={`mailto:${contact.email}`} className="text-lg">
                  {contact.email}
                </a>
                <p>{contact.address}</p>
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
      className={`absolute inset-x-4 -bottom-0.5 h-px origin-left bg-edge transition-transform duration-500 ${
        active ? "scale-x-100" : "scale-x-0"
      }`}
      style={{ transitionTimingFunction: "var(--ease-out)" }}
    />
  );
}
