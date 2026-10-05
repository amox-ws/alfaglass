# ALFA GLASS design system

## Concept
Daylight through glass. Light, calm surfaces like satin and float glass, with the ALFA GLASS indigo for type and the azure of the logo mark for accents. The hero is a real-time WebGL scene: float-glass panes (aqua-green attenuation, like the edge of real float glass) refract the indigo tagline behind them.

## Color (OKLCH, tokens in `src/app/globals.css`)
Every section sets `data-theme`; components only use contextual tokens (`bg-surface`, `bg-surface-2`, `text-fg`, `text-fg-muted`, `text-fg-dim`, `border-line`, `border-line-strong`, `text-accent`, `bg-accent`, `text-accent-fg`). Change a theme block and every section using it follows.

| Theme | Surface | Type | Used for |
|---|---|---|---|
| `frost` (default) | satin white, faint aqua | softened brand indigo | most sections, page heroes |
| `mist` | pale float-glass aqua | indigo | catalogue lists, alternating sections |
| `deep` | brand indigo #281a6a, softened | frost white, cyan accent | one contrast moment per page (history, vision), footer |
| `azure` | logo-mark cyan to blue | indigo | calls to action |

Fixed brand colors: `brand-indigo`, `brand-azure`, `brand-cyan`, `float`, `deep` (dark pills over imagery), `snow` (product photo backgrounds).

Home rhythm: frost hero, frost manifesto, mist catalogue, frost facilities, mist plastics, deep history, frost related and news, azure CTA, deep footer.

## Type
- Display: **Sofia Sans Extra Condensed** (700–800, uppercase; tall like panes in a rack). Year numerals at weight 200.
- Text: **Sofia Sans**.
- Both include full Greek. Uppercase Greek drops accents automatically because `<html lang="el">`.
- Scale classes: `.t-mega`, `.t-display`, `.t-h1`, `.t-h2`, `.t-h3`, `.t-lead`, `.t-label`.

## Motion
- Ease: `cubic-bezier(0.22, 1, 0.36, 1)` (expo-out). No bounce.
- Patterns: masked line reveals (`MaskedLines`), fade-rise (`Reveal`), scroll-linked word lighting (Manifesto), a pane that opens into the warehouse (Facilities), a pinned horizontal timeline (History), cursor-following previews (`IndexList`).
- Lenis smooth scroll; everything respects `prefers-reduced-motion` (the 3D hero falls back to HTML type).

## Signature details
- The "stamp": an etched manufacturer's mark (Alfa Glass · Est. 1999 · 13.000 m² · GR Aspropyrgos).
- Fluted-glass line pattern on azure surfaces.
- Header becomes frosted glass on scroll, and the warehouse photo frosts over like satin glass as you scroll (the two intentional uses of backdrop blur).

## Content pipeline
`scripts/scrape-legacy.py` caches the legacy site, `scripts/build-content.py` turns it into `src/content/*.json` and `public/media/*`. Legacy URLs 308-redirect to the new ones (`next.config.ts`).
