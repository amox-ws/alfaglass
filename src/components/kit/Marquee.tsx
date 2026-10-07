/**
 * A loop of names (the plastics materials) across the page: the one endless animation a page may have. Decorative and `aria-hidden`
 * (the materials are listed for real nearby), 40s linear, paused on hover and with reduced motion. The type is viewport-sized on
 * purpose, outside the scale (DESIGN.md: exceptions).
 */
export function Marquee({ items, className = "" }: { items: string[]; className?: string }) {
  return (
    <div aria-hidden className={`marquee ${className}`}>
      {[0, 1].map((copy) => (
        <div key={copy} className="marquee-track">
          {items.map((item) => (
            <span key={item} className="marquee-item">
              <span className="marquee-text">{item}</span>
              <span className="marquee-dot" />
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}
