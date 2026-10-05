# ALFA GLASS design system

## Concept
Light through glass. Cinematic indigo-ink surfaces where light and refraction read best, frosted "paper" surfaces for reading, and a cobalt drench for calls to action. The hero is a real-time WebGL scene: float-glass panes (green attenuation at the edges, like real float glass) refract the tagline behind them.

## Color (OKLCH, tokens in `src/app/globals.css`)
| Token | Role |
|---|---|
| `--ink` / `--ink-2` / `--ink-3` | Brand indigo #281a6a pushed to near-black. Cinematic sections. |
| `--fg`, `--fg-muted`, `--fg-dim` | Text on ink. |
| `--paper`, `--paper-2` | Frosted glass. Catalogue and reading sections. |
| `--on-paper`, `--on-paper-muted` | Text on paper. |
| `--indigo` | Brand indigo, committed section (plastics). |
| `--cobalt` | Drenched CTA surfaces, link accent on paper. |
| `--edge` | Cyan light caught in a glass edge (from the logo mark). Accent on ink, ≤10%. |
| `--float` | Float-glass green; used in the 3D material only. |

Section rhythm on the home page: ink → ink → paper → ink → indigo → ink → paper → cobalt → ink.

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
- Fluted-glass line pattern on cobalt surfaces.
- Header becomes frosted glass on scroll (the one intentional use of backdrop blur).

## Content pipeline
`scripts/scrape-legacy.py` caches the legacy site, `scripts/build-content.py` turns it into `src/content/*.json` and `public/media/*`. Legacy URLs 308-redirect to the new ones (`next.config.ts`).
