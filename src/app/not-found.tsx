import Link from "next/link";
import { site } from "@/lib/content";

export default function NotFound() {
  return (
    <section data-theme="frost" className="flex min-h-[100svh] items-center bg-surface pt-[var(--header-h)]">
      <div className="shell">
        <p className="t-label text-accent">Σφάλμα 404</p>
        <h1 className="t-mega mt-6">Ραγισμένο τζάμι</h1>
        <p className="t-lead mt-8 max-w-[36rem] text-fg-muted">
          Η σελίδα που αναζητάτε δεν υπάρχει ή έχει μετακινηθεί. Ίσως βρείτε αυτό που ψάχνετε εδώ:
        </p>
        <ul className="mt-10 flex flex-wrap gap-3">
          {[{ label: "Αρχική", href: "/" }, ...site.groups.map((g) => ({ label: g.title, href: `/${g.slug}` })), { label: "Επικοινωνία", href: "/epikoinonia" }].map(
            (l) => (
              <li key={l.href}>
                <Link href={l.href} className="inline-block rounded-full border border-line-strong px-5 py-2.5 font-semibold transition-colors hover:border-accent hover:text-accent">
                  {l.label}
                </Link>
              </li>
            )
          )}
        </ul>
      </div>
    </section>
  );
}
