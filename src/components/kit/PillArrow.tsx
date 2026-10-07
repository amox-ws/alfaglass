/** The round arrow that ends a primary action (`btn-pill btn-pill-dark`, kit.css). No imports: it is safe in any bundle. */
export function PillArrow() {
  return (
    <span aria-hidden className="btn-pill-icon">
      <svg width="16" height="16" viewBox="0 0 16 16">
        <path d="M1 8h13M9 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" fill="none" />
      </svg>
    </span>
  );
}
