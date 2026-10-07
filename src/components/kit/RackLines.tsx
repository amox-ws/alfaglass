/**
 * The twelve column boundaries of the shell drawn as 1px vertical hairlines behind a section, like the pilasters of the building and
 * the uprights of a glass rack (4 lines on phones). Static, decorative, `aria-hidden`.
 * Used in the home hero, the catalogue group heroes, the closing call and the 404: nowhere else.
 * The parent must be positioned; the lines sit behind its content (give the content `relative`).
 */
export function RackLines({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden className={`rack-lines pointer-events-none absolute inset-0 ${className}`}>
      <div className="shell grid h-full grid-cols-4 gap-8 md:grid-cols-12">
        {Array.from({ length: 12 }, (_, i) => (
          <span key={i} className={i < 4 ? "" : "hidden md:block"} />
        ))}
      </div>
    </div>
  );
}
