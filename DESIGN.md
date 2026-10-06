# ALFA GLASS design system

## Concept
Daylight through ultra-clear (low-iron) glass. Clean, cool, untinted surfaces, with the ALFA GLASS indigo for type and the blue of the logo mark for accents. No green or aqua tints anywhere. The hero is a real-time WebGL scene: crystal-clear panes, lit like a white photo studio, refract the indigo tagline behind them.

## Performance rules
Every effect stays, but none may make the page stutter. Measured on a throttled mid-range phone profile against the first build: content visible at about 1.4 s instead of 4.7 s, and no dropped frames over a full-page scroll.
- The headline and lead are HTML, visible from the first paint (CSS entrance, no waiting for JavaScript).
- The WebGL hero loads only on desktops that can hold it (large screen, mouse, 4+ cores, 4+ GB, WebGL 2, no reduced motion, no data saver), after the page has loaded and the browser is idle. It renders at 1x pixels with one shared refraction buffer at half size, and only while in view. If it falls under 50 fps (80 on 120 Hz) for most of 2.5 s, it fades out and hands over to the CSS panes.
- Phones, tablets and everything else get CSS glass panes in the same layout: each pane holds a shifted, softened copy of the headline (refraction) and only transform and opacity ever move.
- Scroll scenes run on CSS scroll timelines and animate only transform and opacity, so the browser runs them off the main thread. No smooth-scroll library: native scrolling.
- Backdrop blur stays off anything that moves with the scroll (the facilities pane, the history caption).

## Color (OKLCH, tokens in `src/app/globals.css`)
Every section sets `data-theme`; components only use contextual tokens (`bg-surface`, `bg-surface-2`, `text-fg`, `text-fg-muted`, `text-fg-dim`, `border-line`, `border-line-strong`, `text-accent`, `bg-accent`, `text-accent-fg`). Change a theme block and every section using it follows.

| Theme | Surface | Type | Used for |
|---|---|---|---|
| `frost` (default) | clean cool white | softened brand indigo | most sections, page heroes |
| `mist` | pale cool blue-grey | indigo | catalogue lists, alternating sections |
| `deep` | brand indigo #281a6a, softened | frost white, cyan accent | one contrast moment per page (history, vision), footer |
| `azure` | soft sky blue from the logo mark | indigo | calls to action |

Fixed brand colors: `brand-indigo`, `brand-azure`, `brand-cyan`, `deep` (dark overlays), `snow` (product photo backgrounds).

Home rhythm: frost hero, frost manifesto, mist catalogue, frost facilities, mist plastics, deep history, frost related and news, azure CTA, deep footer.

## Type
- Display: **Sofia Sans Extra Condensed** (700–800, uppercase; tall like panes in a rack). Year numerals at weight 200.
- Text: **Sofia Sans**.
- Both include full Greek. Uppercase Greek drops accents automatically because `<html lang="el">`.
- Scale classes: `.t-mega`, `.t-display`, `.t-h1`, `.t-h2`, `.t-h3`, `.t-lead`, `.t-label`.

## Motion
- Ease: `cubic-bezier(0.22, 1, 0.36, 1)` (expo-out). No bounce.
- Patterns: masked line reveals (`MaskedLines`), fade-rise (`Reveal`), scroll-linked word lighting (Manifesto), a pane that opens into the warehouse (Facilities), a pinned horizontal timeline (History), cursor-following previews (`IndexList`).
- The three scroll scenes and the closing of the hero panes are CSS scroll timelines ("scroll scenes" in `globals.css`). Their base rules are the final frame: that is what browsers without scroll timelines and visitors with reduced motion see (the timeline becomes a swipeable strip).
- Everything respects `prefers-reduced-motion` (the hero then shows static CSS panes).

## Glass material
One CSS material in `globals.css` (`@layer components`), built to read as a real pane:
frosted body (backdrop blur + saturation), bright bevel on top and a faint depth line below,
a 1px rim that fades from bright white (top-left) to cool silver (bottom-right), like a polished ultra-clear edge, and a soft top sheen.

| Class | Use |
|---|---|
| `glass` | panels (CTA contact pane, enquiry band, preview frames) |
| `glass glass-thin` | chips and small buttons over imagery or 3D |
| `glass glass-thick` | header capsule, mega menu, mobile menu sheet |
| `glass glass-dark` | over dark photos or the deep theme |
| `glass-sheen` | adds a light sweep on hover (buttons only) |
| `etched` | lettering engraved into a surface (the stamp) |

Rules: only where something passes behind it; never glass on glass; bigger surface = thicker frost.
Falls back to near-solid for `prefers-reduced-transparency`, `prefers-contrast: more` and browsers without backdrop-filter.
Elements using `.glass` must be positioned (`relative`/`absolute`/`fixed`) for the rim.

Where it lives: header becomes a floating glass capsule on scroll; Products mega menu and the mobile menu are thick glass; hero secondary button, product-gallery controls, product-card badges and the catalogue hover preview are thin glass; contact panes in the CTA and enquiry band sit as glass over the fluted pattern; the history caption uses dark glass (tint only, it travels with the timeline); a clear pane with a travelling glare rises over the warehouse photo as you scroll (rim and glare, no blur).

## Signature details
- The "stamp": an etched manufacturer's mark (Alfa Glass · Est. 1999 · 13.000 m² · GR Aspropyrgos).
- Fluted-glass line pattern on azure surfaces.

## Content pipeline
`scripts/scrape-legacy.py` caches the legacy site, `scripts/build-content.py` turns it into `src/content/*.json` and `public/media/*`. Legacy URLs 308-redirect to the new ones (`next.config.ts`).
