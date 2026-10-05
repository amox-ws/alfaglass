"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { t } from "@/lib/i18n";

export default function NotFound() {
  const pathname = usePathname();
  const lang = pathname === "/en" || pathname?.startsWith("/en/") ? "en" : "el";
  const d = t(lang);
  const p = lang === "el" ? "" : "/en";
  const links =
    lang === "el"
      ? [
          { label: d.nav.home, href: "/" },
          { label: "Υαλοπίνακες", href: "/yalopinakes" },
          { label: "Πλαστικά Φύλλα", href: "/plastika-fylla" },
          { label: "Συναφή Προϊόντα", href: "/synafi-proionta" },
          { label: d.nav.contact, href: "/epikoinonia" },
        ]
      : [
          { label: d.nav.home, href: p },
          { label: "Glass", href: `${p}/glass` },
          { label: "Plastic Sheets", href: `${p}/plastic-sheets` },
          { label: "Related Products", href: `${p}/related-products` },
          { label: d.nav.contact, href: `${p}/contact` },
        ];
  return (
    <section data-theme="frost" className="flex min-h-[100svh] items-center bg-surface pt-[var(--header-h)]">
      <div className="shell">
        <p className="t-label text-accent">{d.notFound.eyebrow}</p>
        <h1 className="t-mega mt-6">{d.notFound.title}</h1>
        <p className="t-lead mt-8 max-w-[36rem] text-fg-muted">{d.notFound.text}</p>
        <ul className="mt-10 flex flex-wrap gap-3">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="inline-block rounded-full border border-line-strong px-5 py-2.5 font-semibold transition-colors hover:border-accent hover:text-accent"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
