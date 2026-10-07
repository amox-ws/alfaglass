# Creative direction: ALFA GLASS

Status: v3. v2 was written, reviewed by the strictest critic and revised once (§6). v3 adds the second pillar the client hired us for: the CNC cutting service and its machine, the estimator, Έργα (works) and the media system for the photos, drone video and machine films being shot. Its own critic pass is §7. Nothing in v2 is weakened; where v3 changes a v2 rule it says so and gives the reason.
Read with [`SPEC.md`](SPEC.md) (audience, B2B tasks, functional requirements, allowed facts), [`PLAN.md`](PLAN.md) (rubric, gates, loop) and [`../../DESIGN.md`](../../DESIGN.md) (performance rules). **Where this file and SPEC.md disagree on design, this file wins.** SPEC.md's functional requirements (header fixes, dialog menu, 404, SEO, contrast, tap targets, no upscaling, Greek content fixes) still apply. The System worker rewrites DESIGN.md to describe the system below when it is done.

Fixed: logo and wordmark (`Logo.tsx`, `public/brand/*`), facts only from the content, Greek site only (English copy untouched, English build compiles), DESIGN.md "Performance rules", every QA gate.

---

## 1. Concept

**One sentence.** ALFA GLASS is 13.000 m² of glass standing on edge, so the whole site is built from that one view: sheets in a rack, read edge-on, measured in millimetres, lit by daylight and seen at night.

**The narrative.** You arrive in daylight, in front of a wall of clear glass with the promise behind it (*Τα πάντα για το γυαλί*). The glass closes and you are inside the warehouse at night: 13.000 m², 1999, the trucks. Then you walk the racks: nine families of glass, each drawn as the edges of the sheets it is sold in, then plastics, then the tools around glass. Then the machine (v3): a 2,1 × 6,05 m bed drawn as a blueprint, where a whole sheet is cut in one set-up, and, once the photographs exist, the works made from these materials. The site ends at the loading bay: one huge phone number, an email that already knows what you want (or the cut list you just checked), the address at exit 4 of Attiki Odos.

**Two pillars (v3).** ALFA GLASS sells two things and the site treats them as equals: **Αποθήκη**, the wholesale of glass and plastic sheets from its own stock, and **Κατεργασία**, the CNC cutting and machining service. Both are in the header's first two places, both are on the home page, both have a row in the footer and a path on the contact page. The cutting service is presented in the same edge language as the glass: the edge becomes the cut, and the machine is drawn as a blueprint in the same 1px lines (§2.8.5), never shown in a photo it does not have.

Three ideas carry every page, and nothing else is decoration:

1. **The edge.** A sheet of glass seen from its edge is a thin bright line with depth. It is the brand's graphic atom: hairlines, the thickness gauge, the glint, the focus ring, the rack lines of the grid.
2. **Day and night.** Daylight (`frost`, `mist`) for everything a buyer reads, compares and taps; night (`night`) for the cinematic chapters that prove scale (warehouse, history, the closing call, the footer). Never more than three night chapters on a page; the closing call and the footer together count as one. (v3) The machine has a third light, the **blueprint**: `deep` (the wordmark indigo) with white and edge-cyan lines, the way a technical drawing is printed; one blueprint chapter per page at most, and it never counts as night.
3. **The spec voice.** Numbers are the brand's proof, so they get their own typeface: a monospace for thicknesses, counts, years, codes, dates and phone numbers in labels. Big claims are set in the condensed display face; measurements in mono; reading in the text face.

What we keep because it is genuinely excellent (from the contact sheets and the home scorecard): the WebGL glass headline with its CSS-pane fallback and its performance gating; the scroll scene that opens a pane into the warehouse (`Facilities`); the pinned horizontal history; the condensed display type; the glass material classes; the cursor previews of `IndexList`; the brands band; the header capsule, mobile phone button and dialog menu; `MaskedLines` / `Reveal`; the outlined wordmark closing the footer; every accessibility and SEO fix of the foundation.

What we drop or demote: the pale-everywhere rhythm (frost, mist, frost, mist: it reads as a template on the contact sheets); the light azure gradient CTA band (pastel, generic); the home manifesto with scroll-lit words (a known trope on generic copy; the statement moves to the company page as plain type); the home news section as a full section (one article does not deserve one); stock lifestyle photos as page heroes on catalogue pages (the lion and the greenhouse never sit in a first screen again); the full news card grid.

### References (what we take, what we leave)

| Site | Take | Leave |
|---|---|---|
| [Fluid Glass](https://www.awwwards.com/sites/fluid-glass) (structural glazing, Awwwards SOTD 30 Mar 2026) | dark, two-tone palette; mask-wipe reveals; a "showroom" moment | GSAP-driven intro and horizontal-only layout (too slow for a buyer on a phone) |
| [Ferro, Grupo Ferpinta](https://www.awwwards.com/sites/ferro-grupo-ferpinta) (steel distribution, SOTD) | a distributor shown through its infrastructure and logistics, horizontal scenes | video backgrounds, Three.js everywhere |
| [seele](https://seele.com) (façades) | one consistent photographic viewpoint across the site; confident short claims | project-led content we do not have |
| [muskita.com.cy](https://www.muskita.com.cy) (client's mood reference) | cinematic dark chapters, full-bleed imagery, split image/text, taxonomy by product family | rotating hero slides |
| [Glas Trösch](https://glastroesch.com/en) | catalogue organised by what the glass does; tools (calculators) next to products; heritage stated once | corporate density |
| [Vitro Glass](https://www.vitroglazings.com) (GlassFinder, sample kits) | glass described by measurable attributes; the physical "sample" as an interface metaphor (our specimen plates and thickness gauge) | filters we cannot fill with data |
| [Cricursa](https://www.cricursa.com) | white editorial pages, credits and metadata set small and exact; (v3) project pages built from location, material and credits: the model for the Έργα case study | |
| [SCHOTT](https://www.schott.com/en-gb) | navy and white as a serious material-science palette; hands and glass as the scale cue | stock-photo heroes |
| (v3) [SendCutSend](https://sendcutsend.com) (online cutting service) | the quote flow in the buyer's order: material, thickness, parts and quantities, drawing (DXF/PDF), with instant feedback per part | prices, accounts, uploads to a backend (we have none: v1 ends in an email) |

---

## 2. Design system

### 2.1 Typefaces (all via `next/font/google` in `src/lib/fonts.ts`, subsets `greek` + `latin`, `display: "swap"`)

| Role | Face | Weights | Why |
|---|---|---|---|
| Display | **Sofia Sans Extra Condensed** (keep) | 200 (year numerals), 700, 800 | Tall like sheets in a rack, superb Greek capitals; the WebGL headline already uses it (`public/fonts/sofia-xc-800.ttf`). Uppercase only. |
| Text | **Sofia Sans** (keep) | variable 400–700 | Same family as the display, humanist, excellent Greek lowercase. |
| Spec | **JetBrains Mono** (new) | variable, use 400 and 500 only | Engineered, tall x-height, full Greek; reads like a crate label or a spec sheet. CSS variable `--font-mono`, Tailwind `font-mono`. `preload: true` (the hero labels use it). |

Rules: display is always uppercase; mono is used for numbers, units, codes, dates, counts, indexes and uppercase labels, never for running text or headings; text face for everything else. `font-variant-numeric: tabular-nums` on every mono and on display numerals that change or align (years, phone).

### 2.2 Fluid type scale (exact; all in `globals.css`, `@layer components`)

Each size grows linearly from 390px to 1440px viewport width and is clamped at both ends: `clamp(min, intercept + slope·vw, max)`.

| Class | 390 → 1440 px | CSS `font-size` | Line height | Tracking | Face / use |
|---|---|---|---|---|---|
| `t-giga` (new) | 96 → 288 | `clamp(6rem, 1.543rem + 18.286vw, 18rem)` | 0.82 | -0.01em | display 800, digits only: "13.000" in the warehouse scene, "404" |
| `t-mega` | 68 → 224 | `clamp(4.25rem, 0.629rem + 14.857vw, 14rem)` | 0.86 | 0 | display 800: home hero title, contact title, the closing phone number from md |
| `t-display` | 52 → 128 | `clamp(3.25rem, 1.486rem + 7.238vw, 8rem)` | 0.9 | 0 | display 800: page titles (≤ 24 characters), chapter titles |
| `t-h1` | 40 → 88 | `clamp(2.5rem, 1.386rem + 4.571vw, 5.5rem)` | 0.94 | 0 | display 700: long page titles (> 24 characters), product titles |
| `t-h2` | 32 → 60 | `clamp(2rem, 1.35rem + 2.667vw, 3.75rem)` | 1.0 | 0.005em | display 700: section titles, index row titles from lg |
| `t-h3` | 24 → 34 | `clamp(1.5rem, 1.268rem + 0.952vw, 2.125rem)` | 1.08 | 0.01em | display 700: list rows, card titles, mega-menu groups |
| `t-lead` | 19 → 23 | `clamp(1.1875rem, 1.095rem + 0.381vw, 1.4375rem)` | 1.45 | 0 | text 400: leads, article prose |
| `t-body` | 17 → 18 | `clamp(1.0625rem, 1.039rem + 0.095vw, 1.125rem)` | 1.6 | 0 | text 400: running text (page default) |
| `t-small` | 16 → 15 | `16px`, `15px` from md | 1.5 | 0 | text: captions, menu items, small print |
| `t-data` (new) | 15 | `15px` | 1.4 | 0 | mono 400, tabular: table cells, gauge values, codes, dimensions |
| `t-label` | 12.5 | `12.5px` | 1.2 | 0.08em | **mono 500**, uppercase: eyebrows, indexes, breadcrumbs, chips, counts |

Rules (unchanged from DESIGN.md unless stated): nothing readable under 16px on a phone except `t-data` (15px, numbers) and uppercase `t-label`; running text ≤ 68ch; headings balanced and passed whole to `MaskedLines`; one `h1`; no `text-sm…text-4xl`, no `text-[…]`. The viewport-sized exceptions listed in DESIGN.md (`.wordmark`, plastics marquee) stay; the manifesto exception goes with the manifesto.

Greek capitals: `<html lang="el">` drops accents in uppercase. Masks keep 0.22em above and 0.12em below. `t-giga` is digits only (its 0.82 leading would cut Greek diacritics).

### 2.3 Colour tokens (OKLCH, `src/app/globals.css`)

Brand roots (unchanged): wordmark indigo `--brand-indigo: oklch(0.29 0.12 286)`, logo azure `--brand-azure: oklch(0.6 0.12 232)`, logo cyan `--brand-cyan: oklch(0.82 0.08 228)`, `--snow: oklch(0.985 0.004 255)`.

New fixed colours:

```css
--night: oklch(0.17 0.045 280);        /* indigo-black: the warehouse at night */
--edge: oklch(0.88 0.08 222);          /* the bright core of a glass edge */
--edge-deep: oklch(0.6 0.12 232);      /* the body of a glass edge (= brand-azure) */
--edge-gradient: linear-gradient(90deg, var(--edge-deep), var(--edge) 45%, var(--edge) 55%, var(--edge-deep));
/* v3: the only error colour, used by the estimator and form errors; always with an icon and words */
--signal: oklch(0.55 0.19 27);         /* #c9302d: 5.1:1 on frost surface, 4.7:1 on frost surface-2 */
--signal-night: oklch(0.75 0.14 30);   /* #fa8978: 6.9:1 on night surface-2 */
```

v3, blueprint lines: on `deep` (the brand indigo), and the same on a `night` card such as the home history's 2025 year, the machine drawing uses `--edge` for the cut path and the gantry, `oklch(0.97 0.006 255 / 0.55)` for the bed and the dimension lines, and `oklch(0.97 0.006 255 / 0.10)` for the vacuum-zone fills; on `frost`/`mist` (the estimator) it uses `--fg` lines and `--edge-deep` for the piece. A real blueprint is white lines on blue: that is why every machine chapter is `deep`, not `night`, and why it does not count towards the three night chapters.

Themes (sections set `data-theme`; components use only the contextual tokens `surface`, `surface-2`, `fg`, `fg-muted`, `fg-dim`, `line`, `line-strong`, `accent`, `accent-fg`):

| Theme | surface / surface-2 | fg / fg-muted / fg-dim | line / line-strong | accent / accent-fg | Use |
|---|---|---|---|---|---|
| `frost` (keep values) | 0.985 0.004 255 / 0.96 0.007 255 | as today | as today | 0.51 0.12 232 / snow | default; reading, catalogue, product |
| `mist` (keep values) | as today | as today | as today | as today | alternate daylight bands, spec plate, table header |
| `night` (new) | `oklch(0.17 0.045 280)` / `oklch(0.215 0.055 281)` | `oklch(0.97 0.006 255)` / `oklch(0.83 0.025 258)` / `oklch(0.72 0.03 262)` | `oklch(0.97 0.006 255 / 0.12)` / `/ 0.26` | `oklch(0.84 0.085 226)` / `oklch(0.17 0.045 280)` | cinematic chapters, closing call, footer, mobile menu |
| `deep` (keep values) | brand indigo | as today | as today | as today | one brand statement per page at most (company vision, 404); (v3) the blueprint chapters of the cutting service count as that statement (home machine, the service page's hero + bed scene as one chapter, the plastics cutting band), plus two small tiles that are not sections (the mega-menu cutting card, the company 2025 tile) |
| `azure` | **retired as a section theme.** The token values stay for small surfaces only (the fluted pane tint, chips). | | | | |

Contrast: every text token must reach 4.5:1 on both surfaces of its theme; the System worker measures `night` with the harness and records the table in DESIGN.md (expected: fg-dim ≈ 6:1 on surface-2). Text on photos sits on a scrim that the harness can verify from pixels.

Never: green or aqua tints, gradient text, opacity-dimmed text, coloured shadows, more than one accent per view.

### 2.4 Grid, spacing, rack lines

- Shell: `.shell` max 108rem, gutter `--gutter: clamp(1rem, 4vw, 3.5rem)` (16px at 390, 56px at 1440). Unchanged.
- Grid: 12 columns from `md`, `gap-8`. Patterns P1–P4 of DESIGN.md stay, plus two new ones:
  - **P5 Sticky split**: a sticky column (cols 1–5, `lg:sticky lg:top-[calc(var(--header-h)+2rem)]`) and a scrolling column (cols 7–12). Stacks below lg. Used by home plastics, company history, product data sheet.
  - **P6 Full bleed**: edge to edge, outside `.shell`, for night chapters and panoramas. Content inside still aligns to the shell.
- Spacing: the existing steps only (`mt-5`, `mt-6`, `mt-10`, `--block` 64/96, `section-y` 80–176). One new token: `--spacing-chapter: clamp(6rem, 14vw, 14rem)` (`py-chapter`) for night chapters.
- **Rack lines** (`.rack-lines`, new, System): the 12 column boundaries of the shell drawn as 1px vertical hairlines (`--line` at 50% of its alpha) behind a section, like the blue pilasters of the building and the uprights of a glass rack. Implementation: an `aria-hidden` absolutely positioned `.shell grid grid-cols-4 md:grid-cols-12 gap-8 h-full` with 4/12 empty spans, each `border-l border-line/50` (use a dedicated token `--line-faint`, not opacity utilities on text). Static, no animation. Used in: home hero, catalogue group heroes, the closing call, the 404. Nowhere else.

### 2.5 Surfaces and materials

- **Glass material** (`.glass`, `glass-thin`, `glass-thick`, `glass-dark`, `glass-sheen`): keep exactly. Rules stay: only where something passes behind it, never glass on glass, bigger = thicker frost, no backdrop blur on anything that moves with scroll.
- **Fluted glass** (`.fluted`): keep the pattern, now on a `night` surface lit by a soft azure radial (`radial-gradient(60% 80% at 70% 40%, oklch(0.6 0.12 232 / 0.35), transparent)`) for the closing call.
- **Specimen plate** (`SpecimenPlate`, new, System): how every product and category photo is shown. A `bg-snow` plate with a 1px `--line` border, the image `object-contain`, never larger than its source (`mediaSize`), aspect 4:3 by default (5:4 for portrait sources), and a mono caption row under it (`ΕΙΚ. 01/05` + caption if any). Corners 2px (a cut sheet, not a rounded card). No shadow; on hover (pointer devices) the plate's top edge gets the glint.
- **Spec plate** (`SpecPlate`, evolves `Stamp`, System): an etched nameplate on `mist`: hairline frame, four corner "rivets" (6px circles, `--line-strong`), cells separated by hairlines, a mono label above a display value. Used on company (facts) and facilities (numbers).
- **Grain** (`.grain`, System): a static 3% noise overlay (an inline SVG `feTurbulence` rendered once to a 128px data-URI PNG, tiled) on night chapters with photos. It hides JPEG blocks of the legacy photos. Static, `pointer-events: none`, `aria-hidden`.

### 2.6 Imagery: making legacy, partly low-res photos look premium

The photos are honest but old (2000px at best, product shots median 756px, some stock). Rules:

1. **Grade, offline, once.** `scripts/grade-media.mjs` (System; uses `sharp`, already installed) writes two graded copies of the facility photos into `public/media/` and then `node scripts/media-sizes.mjs` is re-run:
   - `<id>-night.jpg`: a duotone. Luminance (Rec. 709, with a gentle S-curve: lift 0.04, gamma 0.95) mapped through a 3-stop LUT: 0 → `#0d0b22` (night), 0.55 → `#3b4f8f` (indigo-azure), 1 → `#eef3fb` (frost). mozjpeg q82, same size as the source.
   - `<id>-day.jpg`: saturation × 0.82, white balance cooled (b channel −4%), blacks lifted toward `#1b1a3f` by 6%, q82.
   - Sources: `439a284966` (warehouse interior), `b2fdf78b2e` and `d32636d1bc` (building), `f85c9da8d8` (building, 2000×1500), `4b79e00574` (trucks panorama), `9a0710970e` (aerial panorama), `d43cadbad1` (office façade panorama), `c0c7dff009` and `1232fb0c7b` (engravings, night only). Add the graded paths to `imagery` in `src/lib/content.ts` (`imagery.warehouseNight`, …). No runtime CSS filters or blend modes on large photos.
2. **Night duotone** behind type (warehouse scene, company hero, closing chapters); **day grade** where the photo is the content (building P3, trucks strip, facilities). Never grade product photos: colour is information (tinted glass, coloured mirrors).
3. **Never upscale.** Full bleed only for sources ≥ 1900px wide, and at viewports wider than the source the photo is capped (`max-width` = source width) and centred on the night surface. Panoramas keep their proportion; on phones they become a horizontally pannable strip (see facilities) instead of a 80px-tall sliver.
4. **Product and category photos** always sit in a `SpecimenPlate` (object-contain on snow). Stock lifestyle photos never appear in a first screen; on catalogue pages they move into the "about" section beside the text.
5. Every content image has a meaningful Greek `alt`; graded variants use the same alt as their source.
6. (v3) **No fake photos.** The machine is shown only as the drawing (§2.8.5) until ALFA GLASS's own machine is photographed and filmed: no renders, no supplier or catalogue pictures (they would also reveal the maker), no stock CNC photos, no generated images. The same for Έργα: only real jobs, photographed for ALFA GLASS, with the client's permission when a client is named. Stock architectural images (`d43cadbad1`, the home slides `1196bc5078`, `972ba9d769`, `bb6674c7cb`) are illustrations of glass, never captioned or alt-texted as ALFA GLASS premises or work; `89ab25fcb9` has baked-in English text and is never used.

### 2.7 Motion language

Easings (tokens): `--ease-out: cubic-bezier(0.22, 1, 0.36, 1)` (expo-out, the default), `--ease-in-out: cubic-bezier(0.65, 0, 0.35, 1)`, `--ease-glint: cubic-bezier(0.45, 0, 0.2, 1)`. No bounce, no spring overshoot.

Only `transform` and `opacity` animate. Scroll-linked motion uses CSS scroll timelines (`view-timeline`, always with `view-timeline-inset: 0`); the base rule is the final frame (no-support browsers and reduced motion see it). Nothing above the fold waits for JavaScript.

| Name | What | Duration / timing | Trigger | Where |
|---|---|---|---|---|
| `rise` (exists `hero-rise`) | translateY 24px → 0, opacity 0 → 1 | 1100ms expo-out; stagger 80ms | CSS on first paint | everything above the fold |
| `mask` (exists `MaskedLines`) | each line translateY 105% → 0 inside its mask | 900ms expo-out; stagger 80ms per line | in view (`data-rv`) or first paint (`mask-eager`) | headings |
| `fade-rise` (exists `Reveal`) | translateY 16px → 0, opacity | 700ms expo-out | in view | blocks below the fold |
| `glint` (new) | a 40%-wide white-to-transparent band (`::after`, `mix-blend-mode` none, opacity 0.5) translateX(-120% → 220%) across an element, skewX(-18deg) | 1200ms `--ease-glint`, once | hover/focus on pointer devices; once when a glass pane enters view | glass panes, specimen plates, index rows, CTA pane |
| `edge-in` (new) | gauge bars scaleY 0 → 1 (`transform-origin: bottom`) | 600ms expo-out, stagger 30ms per bar | `animation-timeline: view()`, `animation-range: entry 10% cover 30%`; fallback: shown | `EdgeGauge` |
| `close` (exists `hero-pane-close`) | hero panes rotate to 0 and close into a wall | scroll-linked | hero view timeline | home hero |
| `open` (exists Facilities scene) | photo scale 0.42 → 1 inside a frame, then the pane rises | scroll-linked, 200svh (150svh below lg) | `--fac` view timeline | home warehouse chapter |
| `slide-row` (exists History) | pinned horizontal translateX | scroll-linked | `--hist` view timeline | home history |
| `drift` (new) | panorama scale 1.18 → 1 and translateX 4% → 0 | scroll-linked over `cover 0% → cover 60%` | `view()` | facilities aerial strip |
| `fill` (new) | a 1px vertical edge line scaleY 0 → 1 | scroll-linked over the list | `view()` on the list | company history list |
| `marquee` (exists) | translateX loop | 40s linear infinite; paused on hover and reduced motion | CSS | plastics |
| `lift` (new) | translateY 0 → -4px, plus the glint | 400ms expo-out | hover/focus (pointer) | index rows, cards |
| `morph` (new) | shared-element view transition: a specimen photo moves from a card to the product gallery | 380ms expo-out (`::view-transition-group(.morph)`) | Next navigation (React `<ViewTransition>`, read `node_modules/next/dist/docs/01-app/02-guides/view-transitions.md`) | category/product cards → product page |
| `route` (new) | root cross-fade, old page opacity 1 → 0 in 160ms, new 0 → 1 in 240ms | expo-out | every navigation | `::view-transition-old(root)` / `-new(root)`; `none` with reduced motion |
| `sweep` (v3) | the machine's gantry layer translateX(0) → translateX(calc(100% - var(--beam))) along the bed (translateY in the portrait drawing) | scroll-linked (service scene, home band); `intro`: 2400ms `--ease-in-out`, once | `view()` / the scene's timeline | `MachineBlueprint` |
| `wipe` (v3) | counter-translate reveal: a clip box (`overflow: hidden`) translateX(-100% → 0) while its child translateX(100% → 0) on the same timeline, so the content stays still and a window opens over it. Replaces `stroke-dashoffset` (a paint property) for every "line being drawn" | synced with `sweep`, linear | same timeline as `sweep` | cut path and dimension lines of the drawing |
| `zones` (v3) | the 8 vacuum-zone fills, opacity 0 → 1, one after another (each zone its own `animation-range`, 6% of the scene apart) | scroll-linked | scene timeline | service scene |
| `zoom-out` (v3) | the drawing appears 2.6× larger (1.8× below md) and settles to its real size, centred on the person standing at the bed. The layer is laid out at the **start** size (width 260% of the stage, 180% below md) and animated `scale(1) → scale(0.3846)` (0.5556 below md) with `transform-origin` on the person, so the raster is crisp at both ends (scaling a normal-size layer up would blur it). Labels live outside this layer | scroll-linked, first 20% of the scene | scene timeline | service scene |
| `film-in` (v3) | a video layer opacity 0 → 1 over its poster once `playing` fires (never before) | 300ms expo-out | media event | `MediaSlot`, the end of the service scene |
| `filter` (v3) | Έργα cards re-flow on a filter change with `document.startViewTransition` (shared names per card) | 300ms expo-out | click | Έργα list; instant without support or with reduced motion |

Focus: `:focus-visible` is a 2px solid `--accent` outline with 3px offset (cyan on night, azure on daylight): the edge of a sheet. Never removed, never only a colour change.

View transitions are a bonus, never a dependency: if `ViewTransition` is not exported by the React types in this Next version, use the `react/canary` types as the docs describe; if the morph costs more than one iteration, ship the route fade only. Wrap the page content once (System) as the docs' route-transition pattern shows; nothing else may depend on it.

Budget: at most one scroll-linked scene per screen height; at most one endless animation per page (the marquee); WebGL only in the home hero, gated exactly as today.

v3 additions to the budget: numbers never count up (no animated counters, anywhere: they are a SaaS cliché and they read wrong to screen readers); a muted video loop is media, not an animation, but at most one loop plays at a time in the viewport, every loop longer than 5 s has a visible pause button (WCAG 2.2.2), and loops never autoplay on phones or tablets (§2.8.2).

### 2.8 Media system (v3, System)

Photos of finished jobs, a drone film of the 13.000 m² site and films of the machine at work are being shot. Every slot below must look finished today with what exists (a graded photo or the machine drawing) and take the new material by changing **one line of data**, never a layout.

#### 2.8.1 The slot registry: `src/lib/media-slots.ts`

```ts
export type Still = { src: string; alt: string; focal?: string };          // focal = CSS object-position, e.g. "30% 55%"
export type Loop = {
  label: string;                                                            // what it shows, used by the pause button ("Η μηχανή κόβει ακρυλικό")
  poster: Still;                                                            // first frame, registered in media-sizes.json
  sources: { src: string; type: "video/webm" | "video/mp4"; media?: string }[];
};
export type Slot = { still?: Still; loop?: Loop };

export const slots = {
  warehouse:     { still: imagery.warehouseNight },  // home warehouse chapter, facilities "Inside"; later: an interior loop
  drone:         { still: imagery.aerialDay },       // DroneBand on facilities (and home once a loop exists); later: the drone film
  building:      { still: imagery.buildingDay },     // company hero; later: a drone orbit of the building
  machineStill:  {},                                 // service hero; later: a photo of ALFA GLASS's own machine
  machineFilm:   {},                                 // end of the service bed scene; later: the machine film
} satisfies Record<string, Slot>;
```

Image names follow §2.6.1, `imagery.<photo><Night|Day>`: where v2 writes `imagery.aerial` or `imagery.building` it means `imagery.aerialDay` and `imagery.buildingDay`. Works carry their own media in `src/content/works.ts` (§4.15); the registry is for the site's fixed slots only. An empty slot (`{}`) renders its designed fallback (the drawing), never an empty box or a "coming soon" label.

#### 2.8.2 `MediaSlot` (`src/components/kit/MediaSlot.tsx`)

Props: `{ slot: Slot; ratio: string; sizes: string; preload?: boolean; fit?: "cover" | "contain"; fallback?: ReactNode; caption?: string; className?: string }`.

- The box reserves its space with `aspect-ratio` (no layout shift). The still (or the loop's poster) is a `next/image` with `fill`, `sizes`, the slot's `focal` and, only for a first-screen hero, `preload` (Next 16 replaced `priority` with `preload`). The poster is what the browser paints first and what LCP measures; **a video is never the LCP element**.
- Server component for the still. The video part is a small client island, `MediaLoop`, rendered only when `slot.loop` exists, so pages without loops ship no media JavaScript.
- `MediaLoop` mounts a `<video muted playsInline loop preload="none" poster aria-hidden="true">` over the still with `opacity: 0` only when all hold: viewport ≥ 1024px with `(hover: hover) and (pointer: fine)`; `prefers-reduced-motion: no-preference`; `navigator.connection` absent or `effectiveType === "4g"` and no `saveData`; the page has finished loading and the browser is idle (`requestIdleCallback`, 2.5 s timeout); the slot is at least 25% in view (one shared `IntersectionObserver`). On `playing`: `film-in`. Below 10% in view: `pause()`. Everywhere else (phones, tablets, reduced motion, slow networks) the poster stays and a 44px `glass glass-thin` button "Αναπαραγωγή: {label}" plays it on demand.
- The pause/play button is always present while a loop is mounted (bottom-right, 16px inset, `aria-pressed`, label "Παύση: {label}" / "Αναπαραγωγή: {label}"). Only `transform` and `opacity` animate; no backdrop blur on a video.
- `data-qa-dynamic` on the video (the regression diff masks it); the still keeps the page testable.
- `fallback` renders when the slot is empty; for the machine slots it is the `MachineBlueprint`.

#### 2.8.3 `DroneBand` (`src/components/kit/DroneBand.tsx`)

The full-bleed aerial band (P6) that becomes the drone film. Props: `{ slot: Slot; caption: string }` (the caption is the mono coordinates line `38.0858° Β · 23.6183° Α · ΑΣΠΡΟΠΥΡΓΟΣ`, from the `GEO` constant in `src/lib/seo.ts`, formatted, not a new fact).

- With a still (today: the aerial panorama `9a0710970e`, 1926×408, day grade): exactly the v2 facilities aerial (`drift` from md; below md a 220px pannable strip at its natural ratio with the "ΣΥΡΕΤΕ →" hint). Never upscaled.
- With a loop: 21:9 from md, 4:5 below md (the poster's mobile crop; the drone team delivers both framings, §2.8.7); `drift` still applies to the container, the video plays inside it under the `MediaLoop` rules.

#### 2.8.4 `MediaGallery` + `Lightbox` (`src/components/kit/`)

- `MediaGallery` `{ items: { src: string; alt: string; caption?: string; loop?: Loop }[]; layout: "strip" | "plates" | "editorial"; startIndex?: number }`. `strip`: the product gallery (snap-scrolling specimen plates, arrows, mono counter, thumbnails); `plates`: small specimen plates in a row (category gallery); `editorial`: the Έργα case study rhythm, rows of 7+5, 5+7 and 4+4+4 columns at 1440, 6+6 at 768, one column at 390, each image in its own ratio inside its cell, never upscaled.
- Every item opens the `Lightbox`: a native modal `<dialog>` (`showModal()`: focus trap and an inert page come free) on `night`; a horizontal scroll-snap track of full images (`object-contain`, `max-width` = the source width), only the current one and its neighbours loaded; prev/next 44px buttons, ←/→ keys, Esc, a swipe on touch; a mono counter "03 / 12" and the caption; focus returns to the item that opened it. A loop item shows its poster and plays with native controls on demand. The open/close motion is opacity + scale 0.98 → 1 (240ms expo-out); none with reduced motion.

#### 2.8.5 `MachineBlueprint` (`src/components/kit/MachineBlueprint.tsx`)

The machine's drawing: the fallback of both machine slots and the visual language of the cutting service. A static, server-rendered component; the System builds the geometry and the layer hooks, the lanes choreograph it.

- **Geometry** (all in mm, the real working area): plan view (κάτοψη) of the bed 6050 × 2100 (the drawing's horizontal axis is the bed's length, the machine's Y axis of 6.050 mm; the machine's X axis of 2.100 mm runs vertically), `viewBox="-400 -400 6850 3300"` in landscape. Bed outline; 8 vacuum zones as equal strips along the length (756.25 mm each) and the T-slots as six dashed lines 300 mm apart; dimension lines with arrowheads outside the bed labelled `6.050 mm` and `2.100 mm`; the gantry as a separate layer: a 260 mm beam across the full width with the spindle carriage (400 × 400) and the **8 tool positions on the gantry** (8 circles Ø 90); a scale figure: **a person in plan** (shoulders an ellipse 520 × 260, head a circle Ø 200) at the near long edge (x ≈ 1000, y ≈ 2450), labelled "Άνθρωπος σε κάτοψη, για κλίμακα"; a demo cut path (no letters, no logos): a façade cassette 1500 × 900 with 100 mm corner notches and two dashed V-groove lines 50 mm inside, a sign panel 1800 × 700 with 60 mm corner radius, and a row of six Ø 300 discs. The drawing carries the mono word "ΣΧΗΜΑΤΙΚΟ": the zone and slot layout is schematic, the dimensions are the machine's.
- **Orientation** `landscape | portrait`: portrait swaps the axes (`viewBox="-400 -400 3300 6850"`, the gantry sweeps along y). Used below md in the service scene.
- **Layers** (absolutely stacked in one `aspect-ratio` box, each its own element so it can move on the compositor): `.bp-base` (static SVG: bed, zones `.bp-zone ×8`, slots, person), `.bp-dims` (dimension lines, inside a `wipe` pair), `.bp-path` (cut path, inside a `wipe` pair), `.bp-gantry` (the gantry SVG in a full-bed-width track for `sweep`), `.bp-labels` (HTML mono labels positioned in %, outside any scaled layer, so the text stays crisp and is checked by the harness). Strokes `vector-effect: non-scaling-stroke`, 1px (1.5px for the cut path).
- **Variants**: `full` (all layers and callout anchors; the service scene), `band` (bed, zones, gantry, path, dimensions, person; home and the plastics band), `mini` (bed and gantry only, ≤ 2 KB of markup: mega-menu card, timeline 2025, estimator).
- **`piece` prop** `{ w: number; h: number }` (mm, any variant; the estimator uses it on `mini`): draws one piece to scale from the origin corner in `--edge-deep` at 15% fill with a 1.5px stroke; rotated 90° when it only fits rotated; when it does not fit at all, the `viewBox` grows to contain it, the bed outline stays where it is and the part outside the bed is hatched in `--signal` (the overflow you can see, with the words beside it, §4.14).
- **Accessibility**: the box is `role="img"` with `aria-label` from `d.machine.drawingLabel`; every layer inside is `aria-hidden`. Labels are duplicated as real text in the spec plate (§4.13), so nothing is only in the drawing.
- **Motion hooks only**: the System ships the keyframes `sweep`, `wipe`, `zones`, `zoom-out` (motion CSS, base rule = final frame); lanes attach `animation-timeline` and ranges in their own CSS.

#### 2.8.6 Where each page uses media (today → when the new material arrives)

| Page, section | Component | Today | Swap to (data only) |
|---|---|---|---|
| Home hero | none | WebGL / CSS panes: the LCP is text, **no video above the fold on home, ever** | — |
| Home warehouse chapter (§4.1.2) | `MediaSlot slots.warehouse` inside the existing scene | night-graded warehouse photo | an interior loop (desktop only, poster first) |
| Home machine (§4.1.4b) | `MachineBlueprint band` | the drawing | stays the drawing; a "Δείτε τη μηχανή →" link to the service film appears when `slots.machineFilm.loop` exists |
| Home Έργα (§4.1.4c, flag) | `WorksTeaser` → `WorkCard` | hidden | the three latest works |
| Home, after the warehouse chapter | `DroneBand slots.drone` | **not rendered** (the warehouse chapter carries scale) | rendered, 60svh, once `slots.drone.loop` exists |
| Company hero (§4.2.1) | `PageHero cinematic` + `MediaSlot slots.building` | day-graded façade, `preload` | drone orbit loop (desktop only; the poster stays the LCP) |
| Company timeline 2025 (§4.2.5) | `MachineBlueprint mini` | the drawing | `slots.machineStill` photo in a specimen plate |
| Facilities aerial (§4.3.2) | `DroneBand slots.drone` | the aerial panorama with `drift` / pannable strip | the drone film, 21:9 / 4:5 |
| Facilities inside (§4.3.4) | `MediaSlot slots.warehouse` | night-graded interior | interior loop |
| Product gallery (§4.6) | `MediaGallery strip` + `Lightbox` | product photos on specimen plates | unchanged (more photos when shot) |
| Plastics CNC band (§4.7) | `MachineBlueprint band` | the drawing | unchanged |
| CNC service hero (§4.13.1) | `PageHero cinematic` + `MediaSlot slots.machineStill`, fallback the dimension line | the dimension line drawing | a night-graded photo of the real machine with the title on the scrim |
| CNC bed scene (§4.13.2) | `MachineBlueprint full` + `MediaSlot slots.machineFilm` | the drawing is the last frame | the drawing cross-fades into the film inside the bed frame (`film-in`) |
| Έργα list and case study (§4.15) | `WorkCard`, `PageHero cinematic` + `MediaSlot`, `MediaGallery editorial` | elegant empty state (§4.15.1) | real works, each with cover, gallery, optional film |
| News article (§4.9) | `MediaGallery plates` + `Lightbox` | article images on plates | unchanged |

#### 2.8.7 Specs for the material being shot (so it drops in without redesign)

- **Photos of finished jobs**: per job one hero (landscape 3:2, ≥ 3000px on the long side) usable with a bottom scrim for a title, 3–8 details including one close-up of an edge or a cut, one wide in-situ shot; daylight, a consistent slightly low viewpoint (the seele lesson); sRGB JPEG q90. Never graded into the duotone: the material's colour is information.
- **Drone film** (4K, 25 or 30 fps, no audio): a slow top-down pass over the roof (the 13.000 m²), an orbit of the building with the trucks, a truck leaving towards the exit 4 of Attiki Odos. Each shot 10–15 s, framed so that both a 21:9 and a 4:5 crop work.
- **Machine films and photos**: the gantry travelling the full 6 m, the spindle cutting acrylic in close-up, an automatic tool change, the vacuum holding a whole sheet, a V-groove and the panel folded by hand, finished letters lifted off the bed; one still of the whole machine from a corner (the service hero). Frame for a 2.88:1 crop (the bed) and for 16:9.
- **Encoding** (by us, into `public/video/`): H.264 MP4 (`-c:v libx264 -profile:v high -pix_fmt yuv420p -crf 26 -an -movflags +faststart`) at 1920×1080 (`media="(min-width: 1440px)"`) and 1280×720, plus an optional AV1 WebM listed first (`-c:v libsvtav1 -crf 38 -an`); loops 6–12 s with a seamless join; ≤ 4 MB at 1080p, ≤ 2 MB at 720p. Poster = a chosen frame exported as JPEG q85 at 1920px into `public/media/`, then `node scripts/media-sizes.mjs`. Silent loops carry no speech, so they need no captions; if a film ever has a voice, it gets a Greek `<track kind="captions">` and native controls instead of autoplay.

---

## 3. Global UX

### 3.1 Header (`Header.tsx`, System)

- Desktop (≥ 1024): logo · nav · phone pill (mono digits, `tel:`) · ΕΛ|EN. From 1280 a dark pill **"Ζητήστε προσφορά"** follows the phone (mailto `sales@alfaglass.gr`, subject "Ζητώ προσφορά"). Transparent over the first screen, a thick-glass capsule after 24px of scroll (keep). The phone pill never wraps at 1024.
- **Nav (v3)**: **Προϊόντα ▾ · CNC κοπή · Έργα · Εταιρεία ▾ · Επικοινωνία**, the two pillars first. "Έργα" shows only while `features.works` is on (§3.8). "Εταιρεία ▾" is a small thick-glass dropdown (not a mega menu): Η εταιρεία · Εγκαταστάσεις · Ιστορία (`/etaireia#istoria`) · Νέα · Οικονομικές καταστάσεις (`/etaireia#oikonomika`), rows ≥ 32px; it is marked active on company, facilities, news and articles. Why v3 changes the v2 list (Εταιρεία, Προϊόντα, Εγκαταστάσεις, Νέα, Επικοινωνία): the new pillar needs a top-level place, and at 1024 the space between the logo and the phone pill is about 560px, enough for five items (≈ 500px with gaps) but not for seven (≈ 700px). `aria-current` on the active item; the "Νέα" page title still matches its nav label.
- **Canonical Greek labels**: nav "CNC κοπή", page title "CNC κοπή & κατεργασία", footer and menus "CNC κοπή & κατεργασία", the estimator "Έλεγχος & αίτημα κοπής". Never "Υπηρεσίες" (there is one service, name it).
- **Mega menu "the rack"** (Προϊόντα): one thick-glass panel, three columns: Υαλοπίνακες (9 families, each row: mono index `01`, name, mono count `5`), Πλαστικά φύλλα (11 materials), Συναφή (4 families). Each column header is a `t-h3` link to the group. A footer row in mono: "75 ΠΡΟΪΟΝΤΑ · 14 ΚΑΤΗΓΟΡΙΕΣ" (computed) and the phone. Rows ≥ 32px, `glint` on hover. Opens on click and on hover-intent (150ms), closes on Esc and outside click, focus stays in DOM order. (v3) A fourth, narrower column on `deep`: the **cutting card**: mono label "ΚΑΤΕΡΓΑΣΙΑ", `t-h3` "CNC κοπή & κατεργασία", the `MachineBlueprint mini`, the mono line "ΦΥΛΛΑ ΕΩΣ 2,1 × 6,05 m", and two links: the service page and "Έλεγχος & αίτημα κοπής →" (`#aitima-kopis`). From 1024 to 1279 the card drops the drawing so the four columns fit.
- Mobile (< 768): logo · 44px phone button · ΕΛ|EN · menu button (keep). 768–1023: phone number text replaces the button.
- **Mobile menu**: native modal `<dialog>` (keep behaviour), restyled on `night`: big `t-h2` links with mono indexes, Προϊόντα expands in place to the three groups (`<details>`), and a bottom block with two full-width buttons: phone (`tel:`) and email (`mailto:`). Active page marked. (v3) Order: 01 Προϊόντα (details) · 02 CNC κοπή & κατεργασία · 03 Έργα (flag) · 04 Εταιρεία (details: Η εταιρεία, Εγκαταστάσεις, Νέα, Οικονομικές καταστάσεις) · 05 Επικοινωνία; under the two buttons a third, outlined one: "Έλεγχος & αίτημα κοπής" (to `#aitima-kopis`).

### 3.2 Contact and quote paths (no forms, no backend)

There are three ways to act (v3: four), available everywhere within one tap or one scroll:

1. **Call**: header phone (all widths), the closing call on every page, the product data sheet.
2. **Email with intent**: every enquiry link is a `mailto:` with a prefilled subject. Helper `enquiryHref({ subject, body? })` in `src/lib/contact.ts` (System). Subjects: product page "Ενδιαφέρον για: <τίτλος προϊόντος>", category "Ενδιαφέρον για: <κατηγορία>", header "Ζητώ προσφορά". The contact page offers three preset chips: "Υαλοπίνακες", "Πλαστικά φύλλα", "Συναφή προϊόντα" (subject "Ζητώ προσφορά: <group>").
3. **Visit**: address with "Έξοδος 4 Αττικής Οδού" and a directions link (Google Maps URL), on facilities, contact and the footer.
4. (v3) **Send the cut list**: the estimator on the service page (`/cnc-kopi-katergasia#aitima-kopis`, §4.14) checks the pieces and opens an email with the list already written. Reached from the header nav, the mega-menu cutting card, the mobile menu, the footer, the home machine section, the plastics group and the CNC-cuttable product pages, and a fourth chip on the contact page, "CNC κοπή", which links to the estimator instead of opening a mailto. `enquiryHref` gains an optional `body` (encoded with `encodeURIComponent`, Greek included).

### 3.3 Closing call (`Cta`, System, replaces both variants)

Every page ends with the same night chapter, directly followed by the footer on the same night surface (one continuous ending, a hairline between them):

- 390: eyebrow `ΕΠΙΚΟΙΝΩΝΙΑ` (mono label) → title `t-h1` (home: "Καλέστε μας και θα έρθουμε κοντά σας."; product/category: "Ρωτήστε μας για διαστάσεις και απόθεμα.") → the fluted glass pane, full width, holding the phone number as the largest type on screen (`t-display` below md, display face, tabular figures, one `tel:` link) → mobile and email rows (`t-lead`, email underlined at rest) → address row. Each row ≥ 64px.
- 1440: row 1: title cols 1–7, mobile / email / address cols 9–12 (bottom-aligned). Row 2: the fluted glass pane across the whole shell (P4), the phone in `t-mega` on the left (10 digits of the condensed face at 224px ≈ 950px; it never wraps: `white-space: nowrap`, and from md to lg it uses `t-display` if the harness reports clipping), a 72px round call button on the right. Rack lines behind both rows.
- `subject` prop pre-fills the mailto. Home keeps the stamp cells as a mono line under the pane.
- (v3) `variant="cnc"` (service page and Έργα): eyebrow `ΑΙΤΗΜΑ ΚΟΠΗΣ`, title "Στείλτε μας το σχέδιό σας.", subject "Αίτημα κοπής CNC", and above the mobile/email rows a link row "Έλεγχος & αίτημα κοπής →" to `#aitima-kopis` (on the service page itself it scrolls up to the estimator).

### 3.4 Footer (`Footer.tsx`, System)

Night, continues the closing call. Rows: brand line ("Τα πάντα για το γυαλί, από το 1999", `t-h2`) · three link columns (Εταιρεία, Προϊόντα, Έδρα with address and directions) · the giant outlined wordmark (keep) · legal row: copyright, legal links, credit "Σχεδιασμός & ανάπτυξη: AMOX", ESPA banner on a snow plate. Every link 44px on touch; address outside `nav`.

(v3) A fourth link column, **Κατεργασία**: CNC κοπή & κατεργασία · Έλεγχος & αίτημα κοπής · Έργα (flag). Order at 1440: Προϊόντα, Κατεργασία, Εταιρεία, Έδρα (the two pillars first, as in the header); 2 × 2 at 390.

### 3.5 404 (`global-not-found.tsx` + `NotFoundPage`, lane 4)

Deep theme, rack lines. `t-giga` "404" with a static SVG crack (a few 1px `--edge` polylines radiating from one point, `aria-hidden`) laid over the digits; `h1` "Ραγισμένο τζάμι" (`t-display`); the text; then the three groups and contact as an index list (mono index, `t-h3` name, arrow). Status 404, full frame, Greek.

### 3.6 Page shells (System)

- `PageHero` keeps its contract (server-visible, no upscaling, compact variant) and gains two variants:
  - `variant="cinematic"`: full-bleed night-graded photo (`P6`), 88svh (min 34rem), title bottom-left on a bottom scrim (`linear-gradient(to top, var(--night) 0%, oklch(0.17 0.045 280 / 0.6) 45%, transparent 75%)`), lead and mono facts under it. Photo with `priority`, `sizes="100vw"`, settles with `img-settle`. Used by company. (v3) The photo is passed as `media: Slot` and rendered by `MediaSlot` (still today, a loop later; the poster is the LCP, so use `preload`, which replaces `priority` in Next 16), with an optional `fallback` node for an empty slot (the CNC hero's dimension line) and an optional `theme` (`night` default, `deep` for the CNC hero). Used by company, the CNC service page and the Έργα case study.
  - `variant="index"`: no photo; title `t-display`, a mono facts line (e.g. "9 ΟΙΚΟΓΕΝΕΙΕΣ · 43 ΕΙΔΗ · 2–19 mm"), lead clipped to 100 characters, rack lines behind. Used by the catalogue groups and the news list.
- Breadcrumbs: mono `t-label`; on phones the single back link (keep).
- `SectionHeader`: eyebrow becomes `mono index + label` (`02 — ΥΑΛΟΠΙΝΑΚΕΣ`), title, intro/link (keep P1).

### 3.7 Shared catalogue primitives (System)

- **`EdgeGauge`** `{ values: number[]; size: "sm" | "md" | "lg"; label?: string }`: one bar per thickness, bar width = `max(2px, mm × k)` with k = 0.9 (sm), 1.6 (md), 3 (lg; 2 below md) px/mm, heights 20 / 40 / 120px (96px below md), gap 4 / 6 / 10px, filled with `--edge-gradient` and a 1px `--edge` core. Labels: `sm` and `md` show one `t-data` caption "2–19 mm" after the bars (never a label per bar: thin bars sit closer than two digits are wide, which fails the overlap gate); `lg` puts each value under its bar, each bar centred in a slot `min-width: 2.6ch` so neighbouring labels never touch (float glass, 10 values: ≈ 300px wide at 390, ≈ 420px at 1440). `role="img"` with `aria-label` "Πάχη: 2, 3, 4… mm", bars and captions `aria-hidden`. `edge-in` motion inside `@supports (animation-timeline: view())`; the base rule is the full bar. If `values.length === 0` it renders nothing.
- **Thickness data**: `scripts/extract-thickness.mjs` (System) writes `src/content/thickness.json` (`{ "<product slug>": [2, 3, 4] }`) from the Greek products with this strict rule, then the worker checks the output by eye and commits it:
  - only groups `yalopinakes` and `plastika-fylla`; skip category `yalopinakes-asfaleias` and product `aksesouar-plastikon` (values there are compositions or part sizes);
  - values come only from (a) a table column whose header contains "Πάχ" and whose cell lines match `^0?\d{1,2}([.,]\d)?\s?mm$`, or (b) `<li>` items matching that pattern in the list right after a paragraph containing "πάχ";
  - deduplicate, sort, keep 1–30.
  - Family gauge = union of its products' values, shown only when at least half of its products have values (today: float, decorative, mirrors, reflective, coated; not energy, safety, fire). Helpers `productThickness(slug)` and `familyThickness(category)` in `src/lib/content.ts`.
- **`EdgeIndex`** (evolves `IndexList`): a row per family or product: mono index · name (`t-h3`, `t-h2` from lg) · summary (lg only, 2 lines) · `EdgeGauge md` (from md; `sm` on phones) · mono count "5 ΕΙΔΗ" · round arrow. Rows separated by `line` hairlines, 96px tall from lg; hover: `lift` + `glint` + the cursor preview (keep: pointer devices only, never downloads on touch); touch: 72px thumbnail in a specimen plate (keep). The whole row is one link.
- **`SpecimenCard`**: `SpecimenPlate` (thumb) · mono index · `t-h3` title · `EdgeGauge sm` · arrow. The plate is wrapped in `<ViewTransition name={"spec-" + slug} share="morph" default="none">`.
- **`SpecTable`**: the product tables rebuilt: container scrolls horizontally at < lg with a sticky first column (`bg-surface`) and a fade on the scrolling edge; header row on `mist` with mono `t-label`; cells `t-data` (mono, tabular), thickness cells as small chips; hairlines only; row hover tint `surface-2`. Never page overflow.
- **`Marquee`**, **`AttikiExit`** (a static SVG schematic: the motorway as a thick indigo line labelled "ΑΤΤΙΚΗ ΟΔΟΣ", an exit sign "4", a short slip road to a pin labelled "ALFA GLASS · ΘΕΣΗ ΚΥΡΙΛΛΟΣ"; responsive via `viewBox`, `role="img"` with an `aria-label`, mono labels).

### 3.8 Routes, flag, data and shared copy for the second pillar (v3, System)

**Routes** (`src/lib/routes.ts`): three new kinds, with their pages dispatched in `src/app/[lang]/[[...path]]/page.tsx` (metadata, canonical, alternates, `og:image` = the building until `slots.machineStill` exists):

| Kind | Greek | English (provisional, phase 4 reviews it) |
|---|---|---|
| `{ kind: "service" }` | `/cnc-kopi-katergasia` | `/en/cnc-cutting` |
| `{ kind: "works" }` | `/erga` | `/en/projects` |
| `{ kind: "work"; slug: string }` | `/erga/<slug>` | `/en/projects/<slug>` |

`allRoutes` lists `service` and `works` always and one `work` per entry of `works`; `switchMap` covers them. The sitemap gains an `indexable(route)` check: `works` and `work` are left out while `features.works` is off, and those pages carry `robots: { index: false }`. The service page gets `Service` JSON-LD (`serviceType` "CNC κοπή και κατεργασία", `provider` = the existing `Organization`, nothing else) next to its `BreadcrumbList`.

**Flag** (`src/lib/features.ts`): `export const features = { works: works.length >= 3 || process.env.NEXT_PUBLIC_WORKS_FIXTURE === "1" }`. The variable must carry the `NEXT_PUBLIC_` prefix: Next inlines it at build time in server and client code alike, so the header (a client component) and the server agree; a plain `WORKS_FIXTURE` would be `undefined` in the browser and break hydration. While it is off: no "Έργα" in the header, mobile menu or footer, no Έργα section on home or links to it from the service page, no `/erga*` in the sitemap; `/erga` itself still answers 200 with the empty state (§4.15.1), so the harness and the client can see it. Three works is the threshold because a filterable gallery of one looks abandoned.

**Machine data** (`src/lib/machine.ts`, language-free numbers and keys; Greek words live in `d.machine`):

```ts
export const BED = { x: 2100, y: 6050, z: 300 };                    // mm, the working area
export const fitsBed = (w: number, h: number) =>
  w <= BED.x && h <= BED.y ? "fits" : h <= BED.x && w <= BED.y ? "rotated" : "out";
export const MATERIALS = ["acrylic", "polycarbonate", "industrial", "pvcFoam", "pet", "foamBoard", "acm",
  "carbon", "aluminium", "bronze", "copper", "wood", "other"] as const;
export const STOCKED: Partial<Record<(typeof MATERIALS)[number], string[]>> = {  // product slugs ALFA GLASS stocks
  acrylic: ["akrylika-fylla-xt-extruded", "akrylika-fylla-chyta-cast"],
  polycarbonate: ["polykarvonika-masif-fylla", "polykarvonika-kypselota-fylla"],
  pvcFoam: ["pvc-afrodes-foam"],
  pet: ["pet-g"],
  acm: ["bond-panel-alouminiou-epigrafopoiias", "bond-panel-alouminiou-ktirion"],
};
export const OPERATIONS = ["cut", "route", "engrave", "pocket", "drill", "vgroove", "letters"] as const;
export const APPLICATIONS = ["signage", "displays", "shopfit", "facade", "interior", "glazing"] as const; // "glazing": Έργα only
```

Glass is not a machine material and never appears in `MATERIALS`: nothing on the site may suggest that the router cuts glass. "Πολυστερίνες", "Πάνελ πολυουρεθάνης" and "Αξεσουάρ πλαστικών" are not mapped (they are not in the machine's list).

**Timeline** (`src/lib/content.ts`): `historyTimeline(lang)` returns `site.history.timeline` plus `{ year: "2025", text: d.machine.timeline2025 }`. The content JSON is generated by `scripts/build-content.py`, so the 2025 entry lives in the dictionary, not in `site.json`. Both the home history and the company history read this helper.

**Works data** (`src/content/works.ts`): the type and an empty array, with the `Loop` type of §2.8.1.

```ts
export type Work = {
  slug: string; title: string; year: number;
  materials: ("glass" | (typeof MATERIALS)[number])[]; applications: (typeof APPLICATIONS)[number][];
  operations?: (typeof OPERATIONS)[number][]; products?: string[]; thickness?: number[];
  place?: string; client?: string;              // only with the client's written permission
  summary: string; body?: string;                // Greek, plain text / simple HTML
  cover: { src: string; alt: string; focal?: string }; coverLoop?: Loop;
  gallery: { src: string; alt: string; caption?: string }[]; film?: Loop;
};
export const works: Work[] = [];
```

**QA fixture** (lane 4): `src/content/works.fixture.ts` holds six clearly fake works built from existing photos ("Δοκιμαστικό έργο 1…6"), used only when `NEXT_PUBLIC_WORKS_FIXTURE=1` at build time, and every page rendered from it shows a full-width `--signal` banner "ΔΟΚΙΜΑΣΤΙΚΑ ΔΕΔΟΜΕΝΑ, ΟΧΙ ΠΡΑΓΜΑΤΙΚΑ ΕΡΓΑ". It is never imported otherwise, so a production build cannot show it.

**QA pages** (`scripts/qa/pages.json`, entries only): group `service` with `service-el` `/cnc-kopi-katergasia` (and `service-en` `/en/cnc-cutting`), group `works` with `works-el` `/erga` (and `works-en` `/en/projects`). Work detail pages exist only with the fixture and are checked with `--pages` (§5).

**Shared copy** (exact Greek; System writes it into a new `machine` namespace of `src/lib/i18n.ts`, English values provisional):

| Key | Greek |
|---|---|
| `nav.service` / `nav.serviceLong` / `nav.works` / `nav.estimator` | "CNC κοπή" / "CNC κοπή & κατεργασία" / "Έργα" / "Έλεγχος & αίτημα κοπής" |
| `machine.eyebrow` | "Κατεργασία · από το 2025" |
| `machine.title` | "CNC κοπή & κατεργασία" |
| `machine.promise` | "Ολόκληρα φύλλα έως 2,1 × 6,05 m σε ένα στήσιμο." |
| `machine.accuracy` | "Ακρίβεια μηχανής ±0,05 mm." |
| `machine.lead` | "Κοπή σε σχήμα, φρεζάρισμα, χάραξη, εκβάθυνση, διάτρηση και V-grooving σε πλαστικά φύλλα, σύνθετα πάνελ αλουμινίου, μέταλλα και ξύλο." |
| `machine.facts` | "±0,05 mm ακρίβεια μηχανής" · "9 kW · 24.000 rpm" · "8 εργαλεία, αυτόματη αλλαγή" |
| `machine.materialsLine` | "Ακρυλικό · Πολυκαρβονικό · PVC foam · PET · Etalbond · Αλουμίνιο · Ξύλο" |
| `machine.timeline2025` | "Η ALFA GLASS αποκτά CNC router με πεδίο εργασίας 2,1 × 6,05 m και ξεκινά την υπηρεσία κοπής και κατεργασίας φύλλων." |
| `machine.drawingLabel` | "Σχηματική κάτοψη του τραπεζιού εργασίας 2.100 × 6.050 mm, με τις 8 ζώνες κενού, τη γέφυρα με τις 8 θέσεις εργαλείων και έναν άνθρωπο για κλίμακα." |
| `machine.scale` / `machine.schematic` | "Άνθρωπος σε κάτοψη, για κλίμακα" / "Σχηματικό" |
| `machine.makerNote` | "Τα τεχνικά στοιχεία είναι του κατασκευαστή της μηχανής." |
| `machine.materials` | acrylic "Ακρυλικό (πλεξιγκλάς)" · polycarbonate "Πολυκαρβονικό" · industrial "Βιομηχανικά πλαστικά" · pvcFoam "PVC αφρώδες (foam)" · pet "PET / PET-G" · foamBoard "Αφρώδεις πλάκες (foam board)" · acm "Σύνθετα πάνελ αλουμινίου (Etalbond, Bond)" · carbon "Ανθρακονήματα (carbon)" · aluminium "Αλουμίνιο" · bronze "Μπρούντζος" · copper "Χαλκός" · wood "Ξύλο, κάθε τύπου" · other "Άλλο υλικό" |
| `machine.operations` | cut "Κοπή σε σχήμα": "Οποιοδήποτε περίγραμμα, από το σχέδιό σας." · route "Φρεζάρισμα": "Ανοίγματα, εγκοπές και προφίλ." · engrave "Χάραξη": "Γράμματα, λογότυπα και σημάνσεις στην επιφάνεια." · pocket "Εκβάθυνση": "Εσοχές σε ελεγχόμενο βάθος." · drill "Διάτρηση": "Τρύπες σε ακριβείς θέσεις." · vgroove "V-grooving": "Αυλάκια V σε σύνθετα πάνελ αλουμινίου, για να διπλωθούν σε κασέτες." · letters "Γράμματα & πινακίδες": "Κομμένα γράμματα, πινακίδες και επιγραφές." |
| `machine.applications` | signage "Γράμματα & επιγραφές" · displays "Displays & σταντ" · shopfit "Εξοπλισμός καταστημάτων" · facade "Κασέτες προσόψεων" · interior "Έπιπλα & εσωτερικοί χώροι" · glazing "Υαλώσεις" |
| `machine.spec` | see §4.13.6 |
| `media.play` / `media.pause` | "Αναπαραγωγή: {label}" / "Παύση: {label}" |

Numbers are written the Greek way everywhere (decimal comma, thousands dot: "2,1 × 6,05 m", "2.100 × 6.050 mm", "24.000 rpm"), with a no-break space before the unit and around "×" (helper `formatMm` in `src/lib/machine.ts`, `Intl.NumberFormat("el-GR")`). Inside uppercase mono labels a unit keeps its SI case: wrap it in `<span class="unit">` (`text-transform: none`), so a label reads "2–19 mm", "22,20 m²", "9 kW", never "MM" or "M²" (M is mega); v3 corrects v2's facts lines to this. Brand names that are never written: the machine's maker and its component makers. The price is never written.

---

## 4. Page blueprints

Format per page: job · sections in order (theme, layout at 390 / 1440, content source) · signature · motion · what must stay fast. "Content" names fields of `src/content/el/*.json` or dictionary keys in `src/lib/i18n.ts` (`d.*`).

### 4.1 Home (`/`, `HomeView`, lane Home)

Job: in one screen, "everything in glass, from our own stock, call us"; in three, "they are big and real"; then the range; (v3) then "and they cut it for you". Target height ≤ 12.000px at 1440 and ≤ 14.000px at 390 in v2; **v3 raises it to ≤ 13.000px and ≤ 15.000px** for the machine section and the sixth year of the history (the harness ceiling is 16.000px). If a page goes over, the related tool wall loses its summaries first.

Rhythm: frost hero · night warehouse · frost glass index · mist plastics · **deep machine (v3)** · (frost Έργα, v3, flag) · frost related · night history · frost brands pause · night closing + footer. The machine is `deep`, a blueprint (§2.3), so the page keeps its three night chapters.

1. **Hero** (frost, keep the engine). 1440: WebGL headline and panes exactly as today; add rack lines behind (12 lines); the meta row becomes mono labels ("ΑΠΟ ΤΟ 1999" left, "ΑΣΠΡΟΠΥΡΓΟΣ · ΕΞΟΔΟΣ 4 ΑΤΤΙΚΗΣ ΟΔΟΥ" right); bottom row: lead (`d.home.leadStrong/leadRest`), "Δείτε τα προϊόντα" (dark pill) + "Καλέστε μας 210 5593900" (thin glass), and on the right a mono "crate label" line `ALFA GLASS · ΑΠΟ ΤΟ 1999 · 13.000 Τ.Μ. · ΑΣΠΡΟΠΥΡΓΟΣ` (the stamp cells, `d.stamp`) replacing the "Κύλιση" cue. 390: CSS panes as today, 4 rack lines, lead, both buttons full width, stacked. Content: `d.home.*`, `d.stamp`.
   (v3) Under the buttons, one mono link line for the second pillar: "ΝΕΟ · CNC ΚΟΠΗ ΦΥΛΛΩΝ ΕΩΣ 2,1 × 6,05 m →" to the service page (44px tall, `t-label`, the arrow in `--accent`). At 390 it may only stay if the title, the lead and both buttons are still inside the first screen (the harness fold shot decides); otherwise it moves under the crate label at ≥ md only. Not a banner, not a badge: one line.
2. **Warehouse** (night, P6, pinned; reuse `Facilities.tsx` and its `--fac` scene). Starts with the night-graded warehouse photo (`imagery.warehouseNight`) small in the centre; as you scroll it opens to full bleed (existing motion), then `t-giga` "13.000" rises (`fade-rise` within the timeline, transform + opacity), with "τ.μ. ιδιόκτητων χώρων" (`t-h2`) and a mono facts row: "1999 · ΙΔΡΥΣΗ", "2021 · +4.000 Τ.Μ.", "ΙΔΙΟΚΤΗΤΑ ΦΟΡΤΗΓΑ"; last, the clear pane rises over the right third with `d.home.facilitiesText` and the link "Οι εγκαταστάσεις μας →". Grain overlay. 200svh at ≥ lg, 150svh below. 390: the numeral is 96px, facts stack in two lines, the pane holds the text and link, bottom scrim. **Signature of the home page.**
3. **Glass index** (frost, P1 + `EdgeIndex`). Header: `02 — ΚΑΤΑΛΟΓΟΣ`, title "ΥΑΛΟΠΙΝΑΚΕΣ", intro `d.home.glassIntro`, action "Όλοι οι υαλοπίνακες". Nine rows with family gauges where data allows (the gauges together read as a rack seen from its end). 390: rows with thumbnail, name, count, sm gauge (min–max). Content: `site.groups[0].categories`, `categories.json`, `thickness.json`.
4. **Plastics** (mist, P5 sticky split). Marquee of materials across the top (keep `d.home.plasticsMarquee`). 1440: sticky left (cols 1–5): eyebrow `ΑΠΟ ΤΟ 2014`, title "ΠΛΑΣΤΙΚΑ ΦΥΛΛΑ", `d.home.plasticsText`, link, and the canopy photo (`site.groups[1].image`, 2000×1209), ungraded (it shows the product), 4:3 crop allowed because the source is large. Right (cols 7–12): the 11 materials as `EdgeIndex` product rows (thumbnail plate 64px, name, sm gauge, arrow). 390: title, text, photo, then the list.
4b. **Machine** (v3, `deep`, the blueprint chapter; `components/home/Machine.tsx`, lane Home). Job: tell a buyer in one screen that ALFA GLASS now cuts, how big, and where to ask.
   - 1440: header row (P1): mono eyebrow `d.machine.eyebrow` (it rhymes with "ΑΠΟ ΤΟ 2014" of plastics and "ΑΠΟ ΤΟ 2018" of related), title `t-display` `d.machine.title`, and in cols 9–12 the promise (`d.machine.promise` + `d.machine.accuracy`, `t-lead`). Then `MachineBlueprint band` across the whole shell (P4, landscape, ≈ 1328 × 640px with its margins), with the person and both dimensions. Under it a three-part row: `d.machine.lead` (cols 1–5, `t-body`), the three facts (`d.machine.facts`, mono, one per line, cols 6–8), and the actions (cols 9–12): "Η υπηρεσία CNC" (snow button on deep) and "Έλεγχος & αίτημα κοπής →" (text link, to `#aitima-kopis`). Last line, full width, mono: `d.machine.materialsLine`.
   - 390: eyebrow, title, promise, the drawing as a landscape strip (358px wide; the person and the dimension labels stay legible because the labels are HTML, not scaled SVG text), lead, facts as a list, both actions full width.
   - Motion: `sweep` + `wipe` (gantry crosses the bed once, the cut path appears behind it) scroll-linked over `view()` `entry 20%` → `cover 55%`; zones and person static; base rule = finished drawing.
   - Media: the drawing is the visual, permanently. When `slots.machineFilm.loop` exists, a mono link "ΔΕΙΤΕ ΤΗ ΜΗΧΑΝΗ ΝΑ ΚΟΒΕΙ →" to the service page's scene appears after the actions; the home page never plays the film itself.
   - Must stay fast: inline SVG (≤ 8 KB), no image request, no client JS.
4c. **Έργα** (v3, frost, only while `features.works` is on; `WorksTeaser`, built by lane 4, placed by lane Home). P1 header (mono `ΕΡΓΑ`, title "ΕΡΓΑ", action "Όλα τα έργα →"), then the three latest works: one `WorkCard size="lg"` (cols 1–7) and two `size="md"` stacked (cols 9–12); at 390 three cards in one column. No filters on home. When the flag is off the section does not exist (no empty state on home).
5. **Related** (frost, P1 + a 4-column "tool wall"). 1440: four columns, each a tall specimen plate (the family image, object-contain on snow), mono count, `t-h3` name, two-line summary, arrow; 768: 2×2; 390: `EdgeIndex` rows with thumbnails (no gauges). Content: `site.groups[2].categories`, `d.home.relatedText`.
6. **History** (night, keep the pinned horizontal timeline). Restyle: years in display 200, captions `t-body`, indexes mono, the engraving night-graded, progress bar uses `--edge-gradient`. Keep the swipe fallback and its hint. (v3) Six years: the data comes from `historyTimeline(lang)` (§3.8), whose last card is **2025**, the machine: `d.machine.timeline2025` and the `MachineBlueprint mini` in edge lines on the night card, linking to the service page. The track length follows the number of cards (the travel is computed in CSS from the card widths), so nothing else changes; check the 0/33/66/100% frames.
7. **Brands** (frost, keep as is: a pause).
8. **Closing** (night): first a one-line news strip inside the chapter's top: mono date "06.11.2024", the article title as a `t-h3` link, arrow (`site.news[0]`); a hairline; then the closing call (§3.3) with the stamp line; then the footer.

Dropped from home: manifesto (moves to company), the news section, the logistics P3 (its trucks photo moves to company/facilities only).

Must stay fast: hero rules unchanged (headline and lead HTML from first paint, WebGL after idle on capable desktops only); the warehouse photo is `loading="lazy"` with `sizes="100vw"` (it is below the fold), graded file ≤ 220 KB at 2000px; one marquee; no new client components except where state is needed (the index cursor preview already is one).

### 4.2 Company (`/etaireia`, `CompanyView`, lane Company + Facilities)

Job: credibility: who, since when, how big, financial transparency.

1. **Hero** (`PageHero variant="cinematic"`): `imagery.buildingDay` from `f85c9da8d8` (2000×1500, the façade with the logo; object-position 30% 55% so the logo stays in frame at 390). Day grade, not the duotone: the blue frame of the building is part of the identity (PRODUCT.md); the night scrim covers only the bottom where the title sits. Breadcrumbs, `t-display` "Η ΕΤΑΙΡΕΙΑ", lead `d.company.lead`, mono facts "ΑΠΟ ΤΟ 1999 · ΑΣΠΡΟΠΥΡΓΟΣ · ΕΞΟΔΟΣ 4 ΑΤΤΙΚΗΣ ΟΔΟΥ". At 390 the photo is 70svh with the title on the scrim.
2. **Spec plate** (mist, signature, `SpecPlate`): Ίδρυση 1999 · Εγκαταστάσεις 13.000 τ.μ. · Οικογένειες υαλοπινάκων 9 · Κωδικοί προϊόντων 75 (computed). 1440: four cells in one row, display numerals `t-h1`, mono labels; 390: 2×2.
3. **Story** (frost, P2): label "ΠΟΙΟΙ ΕΙΜΑΣΤΕ" (cols 1–4), `site.company.html` + `site.activity.html` (cols 6–12, `Prose`), founders named as in the content.
4. **Vision** (deep): `d.company.visionTitle` as `t-display` across cols 1–10, then the former home statement (`d.home.statement`) as `t-lead` in cols 6–12. Static (no scroll-lit words).
5. **History** (frost, P5, `id="istoria"`): sticky left: "ΑΠΟ ΤΗ ΔΡΑΠΕΤΣΩΝΑ ΣΤΟΝ ΑΣΠΡΟΠΥΡΓΟ" + the engraving in a specimen plate; right: five years (`site.history.timeline`) as rows, year in display 200 `t-h1`, text `t-body`, a 1px edge line on the left that `fill`s as you scroll. (v3) **Six years**: read `historyTimeline(lang)`; the last row is **2025** with `d.machine.timeline2025`, a `MachineBlueprint mini` on a small `deep` tile beside the text (from md; under it at 390), and the link "CNC κοπή & κατεργασία →". When `slots.machineStill` gets a photo, the tile shows it in a specimen plate instead. The edge line ends on this row: the company's story now ends at the machine.
6. **Operation** (frost, P3): warehouse day-graded (media 1–7) + `d.company.activityTitle` + logistics text; then the trucks panorama strip (P6, day-graded, own proportion). (v3) After the logistics text, one link row: mono label `ΚΑΤΕΡΓΑΣΙΑ`, "CNC κοπή φύλλων έως 2,1 × 6,05 m →".
7. **Financials** (mist, `id="oikonomika"`, the anchor of the Εταιρεία dropdown): a ledger: rows with the year in display 700 `t-h2`, the title, "PDF" and the file size in mono, the whole row one link with ↓; `site.financials`.
8. Closing call.

Must stay fast: hero image is the LCP: `priority`, AVIF via next/image, `sizes="100vw"`, graded JPEG ≤ 250 KB; no client JS beyond `Reveal`.

### 4.3 Facilities (`/egkatastaseis`, `FacilitiesView`, lane Company + Facilities)

Job: show the scale of the premises and how goods leave.

1. **Hero** (frost, `PageHero` bare): breadcrumbs, `t-display` "ΕΓΚΑΤΑΣΤΑΣΕΙΣ", lead `d.facilities.lead`, `SpecPlate` with three cells: 13.000 τ.μ. συνολική επιφάνεια · +4.000 τ.μ. επέκταση 2021 · Έξοδος 4 Αττικής Οδού.
2. **Aerial** (P6, signature): the aerial panorama (`imagery.aerial` day grade, 1926×408) as a full-width strip with `drift` (scale 1.18 → 1, translateX 4% → 0, scroll-linked, transform only). At < md the strip is 220px tall at its natural ratio (≈ 1040px wide) inside a horizontal scroll container with scroll-snap off, a mono hint "ΣΥΡΕΤΕ →" and the drift disabled; the image is never upscaled. (v3) Built as `DroneBand slots.drone` (§2.8.3) with the coordinates caption, so the drone film replaces the panorama by data alone: 21:9 from md with the same `drift`, 4:5 poster plus play button below md.
3. **Storage** (frost, P1 then P3): `d.facilities.storage` / `storageTitle` (≤ 2 lines) with `site.facilities.html`; then the building façade (`imagery.building` day grade) media 1–7, text 9–12.
4. **Inside** (night, P6): the warehouse interior night-graded full bleed, 80svh, with a mono `figcaption` taken from `d.facilities.interiorAlt`; grain. No pin. (v3) Rendered by `MediaSlot slots.warehouse`, ready for an interior loop.
5. **Logistics** (frost): trucks panorama strip at its own proportion (P6) + `d.home.logisticsTitle/logisticsText`.
6. **Find us** (mist, P3): the `AttikiExit` schematic (media 1–7) and, beside it, the address as `t-h2`, `d.contact.addressNote`, directions link, phone.
7. Closing call.

Must stay fast: only one scroll-linked effect (drift); panoramas `loading="lazy"`.

### 4.4 Glass group (`/yalopinakes`, `GroupView`, lane Catalogue + Product)

Job: get the buyer to the right family in one screen.

1. **Hero** (`PageHero variant="index"`): crumbs, `t-display` "ΥΑΛΟΠΙΝΑΚΕΣ", mono facts "9 ΟΙΚΟΓΕΝΕΙΕΣ · 43 ΕΙΔΗ · 2–19 mm" (computed: families, products, min–max over `thickness.json`), lead (`site.groups[0].intro`, first 100 characters via `teaser`). No photo. At 1440 × 900 the first three rows of the index are above the fold; at 390 the first row starts within 1.1 screens.
2. **Edge index** (frost): nine families (`EdgeIndex`, gauges where allowed, cursor preview on pointer devices, thumbnails on touch).
3. **About** (frost, P2): label "ΣΧΕΤΙΚΑ", `site.groups[0].intro` full, the engraving (`site.groups[0].image`) in a specimen plate at its natural size.
4. Closing call (subject "Υαλοπίνακες").

Signature: the nine gauges seen together, the rack read from its end.

### 4.5 Category (`/yalopinakes/<category>`, `CategoryView`)

Job: pick the product; see the thicknesses of the family.

1. **Hero** (frost, compact, no photo): back link (390) / crumbs, title `t-display` (`t-h1` over 24 characters), mono facts "5 ΕΙΔΗ · ΠΑΧΗ 3–10 mm", lead ≤ 100 characters, and from md the family `EdgeGauge md` to the right of the title (cols 8–12), below it at 390.
2. **Products** (frost, P4): `SpecimenCard` grid: 3 columns at 1440, 2 at 768, and at 390 one column of `EdgeIndex` product rows (thumbnail 72px, name, sm gauge, arrow) so five products fit in about one screen.
3. **About** (mist, P3): `category.summary`/`intro` as prose (cols 1–6) and the category photo (`category.image`) in a specimen plate (cols 8–12), plus `category.gallery` as small plates. This is where stock photos live.
4. **Other families** (frost): compact `EdgeIndex` of the siblings (no summaries), header action "Όλες οι κατηγορίες →" visible at every width.
5. Closing call (subject = category title).

### 4.6 Product (`/yalopinakes/<category>/<product>`, `ProductView`) — the data sheet

Job: specs and sizes at a glance, then ask about stock.

1. **Data sheet** (frost, P5). 1440: left cols 1–7: `ProductGallery` restyled as specimen plates (snap-scroll, arrows, mono counter "01 / 05", thumbnails below; the first plate is the morph target `spec-<slug>`); right cols 8–12, sticky: mono family label, `h1` `t-h1`, summary (`productCopy`, ≤ 4 lines), `EdgeGauge lg` labelled "ΔΙΑΘΕΣΙΜΑ ΠΑΧΗ" (only with data), a mono line "ΚΩΔΙΚΟΙ ΣΤΟΝ ΠΙΝΑΚΑ: 14" when a spec table has a code column (count of rows), then two actions: "Ζητήστε προσφορά" (dark, mailto with subject) and the phone (glass). 390: back link, title, gallery full width, summary, gauge (lg scaled to fit: k = 2px/mm, horizontal scroll never needed for ≤ 10 values at 19mm max: 10 bars ≈ 300px), both actions full width.
2. **Section chips** (sticky under the header at < lg; a sticky anchor column inside the right column at ≥ lg after the actions): Περιγραφή · Προδιαγραφές · Εφαρμογές (only those that exist).
3. **Description** (frost, P2): `product.body` without repeating the summary.
4. **Specifications**: `SpecTable` for every table tab; non-table tab HTML as `Prose`. **Signature: the engineered table.**
5. **Applications**: pills.
6. **Related** (mist): up to three `SpecimenCard`s, "Επόμενο →" link visible on mobile.
7. Closing call (subject = product title).

(v3) Two additions to the data sheet: (a) the gallery is `MediaGallery layout="strip"` and every plate opens the `Lightbox`; (b) on the products listed in `STOCKED` (§3.8: the acrylic, polycarbonate, PVC foam, PET-G and Bond panel pages, never a glass page), a third line under the two actions: mono label `ΚΑΤΕΡΓΑΣΙΑ` and the link "Κοπή σε CNC, φύλλα έως 2,1 × 6,05 m →" to `/cnc-kopi-katergasia?material=<key>#aitima-kopis`, which preselects the material in the estimator.

Must stay fast: the gallery's first image is the LCP: `priority` (in Next 16: `preload`), sized from `mediaSize`; other gallery images lazy; the sticky column is CSS only; the lightbox code loads on the first tap (`next/dynamic`), not with the page.

### 4.7 Plastics group (`/plastika-fylla`)

Same template as a category (it is one category): index hero with facts "11 ΥΛΙΚΑ · ΑΠΟ ΤΟ 2014", the marquee as a band under the hero (the only marquee on the page), products as `SpecimenCard` grid / rows with gauges, about (without the legacy bullet list duplicating the grid), closing call.

(v3) Between the products and the about section, the **cutting band** (`deep`, compact, no pin): mono `d.machine.eyebrow`, `t-h2` "Τα κόβουμε κιόλας" ("we cut them too": these are the sheets the machine was bought for), `d.machine.promise`, the `MachineBlueprint band` (static, no motion: one machine choreography per page and this is not its page), and the actions "CNC κοπή & κατεργασία" and "Έλεγχος & αίτημα κοπής →". 390: text, then the drawing strip, then the actions full width.

### 4.8 Related group (`/synafi-proionta`)

Index hero (facts "4 ΚΑΤΗΓΟΡΙΕΣ · 21 ΕΙΔΗ", lead `d.home.relatedText`), the four families as the tool wall from the home (§4.1.5) at full width, then `EdgeIndex` rows of all products grouped under four `t-h3` headings (no gauges), closing call. Product pages of this group use the data sheet without a gauge.

### 4.9 News list (`/nea`) and article (`/nea/<slug>`, `NewsView`, lane News + Contact + Links)

List: index hero "ΝΕΑ" (h1 matches the nav) with lead `d.news.lead`; then each article as an editorial row: mono date (`06.11.2024`), `t-h1` title as the link, excerpt (`excerpt`, word boundary), the image in a specimen plate (cols 9–12; at 390 under the text). One article today; the layout works for many.

Article: crumbs, mono date, `t-h1` title (max 3 lines at 1440), prose at `t-lead` in cols 1–8 (68ch), images as specimen plates in cols 9–12 (logos never upscaled), back link; next/previous only when more than one article exists; closing call.

### 4.10 Contact (`/epikoinonia`)

Job: reach a person now.

1. **Title** (frost, rack lines): crumbs, `t-mega` "ΜΙΛΗΣΤΕ ΜΑΖΙ ΜΑΣ" (signature, keep).
2. **Lines** (frost): rows, each ≥ 64px, label in mono: Τηλέφωνο (the number in `t-display`, the largest), Κινητό, Email, Διεύθυνση (+ note + directions). Then "Ζητήστε προσφορά για" + the three preset mailto chips (§3.2), and (v3) a fourth chip, "CNC κοπή", that links to the estimator (`/cnc-kopi-katergasia#aitima-kopis`) with a mono hint "ΕΛΕΓΧΟΣ ΔΙΑΣΤΑΣΕΩΝ ΚΑΙ ΑΙΤΗΜΑ". 1440: rows cols 1–6, map cols 8–12 (keep the glass chip). 390: rows, chips, then the map, then the `AttikiExit` schematic.
3. Closing footer only (the closing call would repeat this page: on contact, `Cta` is omitted and the footer follows).

### 4.11 Useful links, legal

- Links: index hero; one row per brand: logo on a snow plate (natural size, never upscaled) in cols 1–3, its tools as rows with ↗ in cols 5–12 (`t-h3` labels in Greek, `https`), brand names from `src/lib/brands.ts`, not by index. Closing call.
- Legal: crumbs, `t-display`/`t-h1` title, prose in cols 1–8 left-aligned with the title, the legacy first paragraph that repeats the title removed, tables scroll in their container. Closing call.

### 4.12 404 — see §3.5.

### 4.13 CNC κοπή & κατεργασία (`/cnc-kopi-katergasia`, `ServiceView`, v3, lane Catalogue + Product)

Job: in ten seconds a sign maker, a shop fitter or exhibition builder, an architect or façade contractor, a furniture maker or a glazier knows what can be cut, how big, how precise, from which materials, and how to send a job; within one scroll the request is on its way. The machine is the proof, so its scale is the signature.

Rhythm: one `deep` blueprint chapter (hero + bed scene, continuous) · frost capabilities · mist materials · frost who it's for · mist the machine · frost how ordering works · mist estimator · night closing + footer. Target ≤ 11.000px at 1440 and ≤ 14.000px at 390. No photo of the machine is used until ALFA GLASS's own machine is shot (§2.6.6); the brand of the machine and its price never appear.

1. **Hero: the promise** (`deep`, `PageHero variant="cinematic" theme="deep" media={slots.machineStill}` with the dimension line as fallback). 1440: crumbs; mono eyebrow `d.machine.eyebrow`; `h1` `t-display` "CNC ΚΟΠΗ & ΚΑΤΕΡΓΑΣΙΑ"; the promise as `t-lead` (`d.machine.promise` + " " + `d.machine.accuracy`); actions: "Έλεγχος & αίτημα κοπής" (snow button, to `#aitima-kopis`) and "Καλέστε 210 5593900" (`glass glass-dark`). Under them, across the whole shell, **the dimension line**: an arrowed 1px `--edge` line from the left gutter to the right gutter with `6.050` in `t-giga` (digits) sitting on it and "mm" in mono: the length of the bed, at the width of the screen. This line is the top edge of the bed the next section draws. 390: same order, `t-giga` 96px, the line full width, both actions full width. When `slots.machineStill` has a photo, it becomes the full-bleed background (night-graded, bottom scrim) and the dimension line stays on top. Must stay fast: the `h1` and the promise are the LCP and are HTML from the first paint; the line is inline SVG; with a photo, the photo uses `preload`.
2. **The bed** (signature; `deep`, pinned stage 100svh in a 240svh track at ≥ md, 160svh below; `components/service/BedScene.tsx`). The machine's scale, told by scroll, transform and opacity only, on one view timeline (`view-timeline-inset: 0`):
   - 0–20% `zoom-out`: you start next to the person, at human size; the bed grows away from you until all of it fits. The caption "Άνθρωπος σε κάτοψη, για κλίμακα" is visible from the first frame.
   - 20–45% `zones` + `wipe` of the dimensions: the 8 vacuum zones light up one by one, the `6.050 mm` and `2.100 mm` dimension lines draw in; mono label "ΟΛΟΚΛΗΡΟ ΦΥΛΛΟ 2.100 × 6.050 mm, ΣΕ ΕΝΑ ΣΤΗΣΙΜΟ".
   - 45–80% `sweep` + `wipe` of the cut path: the gantry crosses the bed and the cassette, the sign panel and the discs appear behind the spindle.
   - 80–100% (≥ md): five callouts fade in at fixed anchors of the drawing (`t-label` mono label + `t-body` value, hairline leader to the anchor): "Τραπέζι κενού · 8 ζώνες, 3 × 7,5 kW" (zones) · "Γέφυρα · αυτόματη αλλαγή 8 εργαλείων" (gantry) · "Άτρακτος · 9 kW, 24.000 rpm" (carriage) · "Ακρίβεια μηχανής · ±0,05 mm" (path) · "Μηχανή · περίπου 2,9 × 6,9 m, 4 τόνοι" (bed edge). The mono word "ΣΧΗΜΑΤΙΚΟ" sits in a corner throughout.
   - **The film slot**: when `slots.machineFilm.loop` exists, in 80–100% the bed area cross-fades (`film-in`, opacity only) into the film, cropped to the bed's frame (`object-fit: cover` in the 2.88:1 bed rectangle), with the dimension lines and callouts staying on top: the drawing turns into the real machine. Below md, with reduced motion, or where loops do not autoplay (§2.8.2), the film is not inside the scene: it follows it as a `MediaSlot` (21:9 from md, 16:9 below) with its poster and the play button.
   - 390: `orientation="portrait"` (the bed stands vertically, ≈ 240 × 700px in the stage, the gantry sweeps downwards), no callouts in the stage (they are in the spec plate of §4.13.6, further down), the dimension labels stay. Zoom 1.8 → 1.
   - Reduced motion and browsers without scroll timelines: the base rule is the final frame (whole drawing, callouts visible from md) and the track collapses to the stage height (no empty scroll).
   - Accessibility: the drawing's `aria-label` is `d.machine.drawingLabel`; the callouts are real text, repeated in the spec plate.
   - Harness: the stage is `position: sticky; top: 0` and ≥ 70% of the viewport, so the 0/33/66/100% frames are shot automatically; the worker checks all four at 390 and 1440.
3. **What we do** (frost, P1 + two-column rows). Header: mono `ΤΙ ΚΑΝΟΥΜΕ`, title "ΚΟΒΟΥΜΕ, ΦΡΕΖΑΡΟΥΜΕ, ΧΑΡΑΖΟΥΜΕ", intro `d.machine.lead`. Seven rows from `d.machine.operations` (cut, route, engrave, pocket, drill, vgroove, letters), each: a 64 × 40 cross-section pictogram drawn in the blueprint's 1px lines (an outline being cut; a slot; a hatch of engraving; a stepped pocket; holes; a V notch with the panel folded at 90°; a letter's outline cut from a sheet), the name `t-h3`, the one-line text `t-body`. 1440: two columns of rows (cols 1–6, 7–12), 96px rows with hairlines; 390: one column, 80px rows. Pictograms are `aria-hidden`; no icon-card grid.
4. **Materials** (mist, P4 table). Header: mono `ΥΛΙΚΑ`, title "ΑΠΟ ΤΟ ΠΛΕΞΙΓΚΛΑΣ ΩΣ ΤΟ ΞΥΛΟ". One row per `MATERIALS` key except `other`: material name (`t-h3`), "Από την αποθήκη μας" with links to the stocked product pages of `STOCKED` (e.g. "Ακρυλικά φύλλα XT · Ακρυλικά φύλλα χυτά"), and for those the thickness range from `thickness.json` with an `EdgeGauge sm`. Materials not in `STOCKED` show only their name: the page never says or implies that they are in stock. 1440: three columns (material cols 1–4, stock links cols 5–9, gauge cols 10–12); 390: each row stacks name, links, gauge. Footnote (mono): "Η μηχανή CNC δεν κόβει γυαλί· για υαλοπίνακες, δείτε τους υαλοπίνακες." with the link, because a glass buyer will ask (it says nothing about other glass services, which the content does not cover).
5. **Who it's for** (frost, P5 sticky split). Sticky left: mono `ΓΙΑ ΠΟΙΟΝ`, title "ΓΙΑ ΤΟΝ ΕΠΑΓΓΕΛΜΑΤΙΑ", the brand promise from the legacy site "Είμαστε δίπλα στον επαγγελματία για να καλύψουμε κάθε του ανάγκη." Right: five rows, each `t-h3` audience + `t-body` what it gets + application chips (`d.machine.applications`):
   - Επιγραφοποιοί: "Γράμματα, πινακίδες και επιγραφές από ακρυλικό, PVC foam και σύνθετα πάνελ." (signage)
   - Καταστήματα & εκθέσεις: "Displays, σταντ και εξοπλισμός καταστημάτων από ακρυλικό, PET και ξύλο." (displays, shopfit)
   - Αρχιτέκτονες & προσόψεις: "Κασέτες προσόψεων από Etalbond και σύνθετα πάνελ, με V-grooving για τη στράντζα." (facade)
   - Έπιπλο & εσωτερικός χώρος: "Κοπή και φρεζάρισμα σε ξύλο και σύνθετα υλικά." (interior)
   - Γυαλί & αλουμίνιο: "Κομμάτια σε ακρυλικό, πολυκαρβονικό και αλουμίνιο, στις διαστάσεις του έργου σας." (no chip)
   While `features.works` is on, each row ends with a mono link "ΕΡΓΑ →" to `/erga?app=<key>`; while it is off, nothing (no dead ends).
6. **The machine** (mist, P2; signature's footnote, the "spec plate"). Left (cols 1–4): mono `Η ΜΗΧΑΝΗ`, title "CNC ROUTER 2.100 × 6.050", the `MachineBlueprint mini`. Right (cols 6–12): `SpecPlate` as a two-column definition list (mono `t-label` term, `t-data` value, hairlines, the four rivets), exactly these rows (`machine.spec` in the dictionary):

   | Term | Value |
   |---|---|
   | Πεδίο εργασίας | X 2.100 × Y 6.050 × Z 300 mm |
   | Ακρίβεια μηχανής | ±0,05 mm |
   | Άτρακτος | 9 kW · 24.000 rpm · ISO30 · αερόψυκτη |
   | Αλλαγή εργαλείων | αυτόματη, 8 θέσεις στη γέφυρα |
   | Μέτρηση εργαλείων | αυτόματος αισθητήρας μήκους |
   | Τραπέζι κενού | ακετάλη, 8 ζώνες, με κανάλια T |
   | Αντλίες κενού | 3 × 7,5 kW |
   | Κίνηση | servo κινητήρες · κρεμαγιέρα στους X/Y · σφαιροκοχλίας στον Z |
   | Ταχύτητες | μετακίνηση έως 40 m/min · κοπή έως 25 m/min |
   | Έλεγχος | βιομηχανικός υπολογιστής με χειριστήριο |
   | Αναρρόφηση σκόνης | 5,5 kW |
   | Πλαίσιο | ηλεκτροσυγκολλητό, με ανακούφιση τάσεων |
   | Διαστάσεις μηχανής | περίπου 2,9 × 6,9 m · περίπου 4 τόνοι |
   | Σήμανση | CE |

   Under the plate, mono: `d.machine.makerNote`. 390: title, drawing, then the list in one column. No component brands, no maker, no price.
7. **How ordering works** (frost). Mono `ΠΩΣ ΔΟΥΛΕΥΟΥΜΕ`, title "ΑΠΟ ΤΟ ΣΧΕΔΙΟ ΣΤΟ ΚΟΜΜΑΤΙ". Four steps on one edge line (horizontal at ≥ lg, cols 3 each; vertical with the line on the left at 390), mono index, `t-h3` name, `t-body` text:
   - 01 Υλικό και πάχος: "Διαλέξτε από τα φύλλα της αποθήκης μας ή ρωτήστε μας για άλλο υλικό."
   - 02 Σχέδιο: "Στείλτε το σχέδιο σε DXF ή PDF, με διαστάσεις και ποσότητες."
   - 03 Έλεγχος και προσφορά: "Ελέγχουμε το σχέδιο και σας στέλνουμε προσφορά."
   - 04 Κοπή: "Η μηχανή κόβει, φρεζάρει και χαράζει σύμφωνα με το σχέδιο."
   No delivery times, no turnaround promises.
8. **Estimator** (mist, `id="aitima-kopis"`): §4.14.
9. Closing call (`variant="cnc"`).

Must stay fast: no client JavaScript above the fold; the scene is CSS on one timeline; the drawings are inline SVG; the estimator is the page's only client component and is below the fold; the film (when it exists) follows the §2.8.2 rules. The page takes `BreadcrumbList` + `Service` JSON-LD (§3.8).

### 4.14 Estimator v1: "Έλεγχος & αίτημα κοπής" (`components/service/CncEstimator.tsx`, v3, lane Catalogue + Product)

A client component inside a real `<form>`; no backend, no prices, no storage, no network request. It checks geometry and writes the email; ALFA GLASS does the rest.

- **Header**: mono `ΑΙΤΗΜΑ ΚΟΠΗΣ`, title "ΕΛΕΓΧΟΣ & ΑΙΤΗΜΑ ΚΟΠΗΣ" (`t-h1`), lead: "Διαλέξτε υλικό και πάχος, γράψτε τα κομμάτια και δείτε αμέσως αν χωράνε στο πεδίο της μηχανής. Χωρίς τιμές: τη λίστα τη στέλνετε με email ή μας τη λέτε στο τηλέφωνο."
- **1 · Υλικό** (`fieldset` + `legend`): a native `<select>` with two `optgroup`s, "Από την αποθήκη μας" (the `STOCKED` keys) and "Άλλα υλικά" (the rest, `other` last as "Άλλο υλικό (γράψτε το στη σημείωση)"). Preselected from `?material=<key>`, read in an effect from `window.location.search` (not `useSearchParams`, which would need a Suspense boundary on this static page in Next 16).
- **2 · Πάχος (mm)**: for a stocked material, radio chips from the union of its products' `thickness.json` values (e.g. acrylic "2 · 3 · 4 · 5 · 6 · 8 · 10") plus "Άλλο", which reveals a number input; for any other material, the number input only (decimal comma or point accepted, > 0). Preselected from `?t=<mm>` when it matches.
- **3 · Κομμάτια**: rows of Πλάτος (mm) × Μήκος (mm) × Τεμάχια. Integers, width and length > 0, quantity ≥ 1; up to 20 rows; "Προσθήκη κομματιού" adds a row and focuses its first input; each row has "Αφαίρεση" (44px icon button, `aria-label` "Αφαίρεση κομματιού 3"). Each row shows its status live, in words with an icon, never colour alone:
  - `fitsBed(w, h) === "fits"`: ✓ "Χωράει"
  - `"rotated"`: ✓ "Χωράει με περιστροφή"
  - `"out"`: ! "Εκτός πεδίου 2.100 × 6.050 mm" in `--signal`, plus "Καλέστε μας να το δούμε μαζί."
  - empty or invalid: "Γράψτε διάσταση σε mm" (only after the field was touched).
  Changes are announced in one polite `aria-live` region ("Κομμάτι 2: εκτός πεδίου").
- **4 · Σημείωση** (optional): a textarea (operations wanted, edges, finish, other material), max 500 characters with a mono counter.
- **Live summary** (beside the rows at ≥ lg: cols 8–12, sticky, a solid `surface-2` panel, not glass; under the rows at 390): the `MachineBlueprint mini` with the `piece` of the row being edited (or the largest piece) drawn to scale, rotated when needed, overflow hatched when out; then mono totals "ΣΥΝΟΛΟ: 11 ΤΕΜΑΧΙΑ · 22,20 m²" (area = Σ w × h × qty / 10⁶, two decimals, Greek format; rows out of the field are counted and listed, never dropped); then a line under it: "Ο έλεγχος αφορά μόνο το πεδίο εργασίας της μηχανής· τη δυνατότητα κοπής την επιβεβαιώνουμε εμείς."
- **Send**:
  - Primary button "Αποστολή με email": `enquiryHref({ subject, body })` to `sales@alfaglass.gr`, subject "Αίτημα κοπής CNC: <υλικό> <πάχος> mm, <n> τεμ.", body:

    ```
    Αίτημα κοπής CNC
    Υλικό: Ακρυλικό (πλεξιγκλάς), 5 mm
    Κομμάτια:
    1. 600 × 1.200 mm × 10 τεμ. (χωράει)
    2. 2.500 × 6.000 mm × 1 τεμ. (εκτός πεδίου 2.100 × 6.050 mm)
    Σύνολο: 11 τεμάχια, 22,20 m²
    Σημείωση: …
    Επισυνάψτε σε αυτό το email το σχέδιο (DXF ή PDF).
    ```

    Under the button, visible: "Στο email που θα ανοίξει, επισυνάψτε το σχέδιό σας (DXF ή PDF)." There is no file input: a mailto link cannot carry a file, and a field that silently drops it would lie.
  - "Αντιγραφή λίστας" (Clipboard API) with the confirmation "Η λίστα αντιγράφηκε" in the live region, and the address `sales@alfaglass.gr` written out: for people whose computer opens no mail program. When the encoded mailto would exceed 1.800 characters, the email button is replaced by this copy button and the note "Η λίστα είναι μεγάλη για email: αντιγράψτε την και επικολλήστε την στο μήνυμά σας."
  - Secondary: "Ή καλέστε 210 5593900" (`tel:`).
  - The buttons stay disabled (with the reason in words beside them) until there is a material and at least one valid piece.
- **Controls**: every control ≥ 44px tall (inputs 48px), font size 16px in every input (mono, so iOS does not zoom), `inputmode="numeric"` for dimensions and quantity, `inputmode="decimal"` for thickness, visible labels (no placeholder-only fields), errors linked with `aria-describedby`, logical tab order, Enter in the last quantity field adds a row. At 390 each piece is a small card: the three inputs on one line (Πλάτος, Μήκος, Τεμ.: three equal columns of ≈ 105px), status under them, remove at the top right; nothing scrolls sideways. At 1440 the rows are a table-like grid: # · Πλάτος · Μήκος · Τεμάχια · Κατάσταση · remove.
- **Without JavaScript**: the server HTML shows the header, a short text and the plain links (email with the subject only, phone), so the section is never empty.
- **What it never does**: prices, delivery dates, nesting or sheet-count promises, file uploads, storing anything, sending anything itself.

### 4.15 Έργα (`/erga`, `/erga/<slug>`, `WorksView` / `WorkView`, v3, lane News + Contact + Links)

Job: proof that the materials and the machine make real things, findable by material and by application. Nothing here is invented: until real jobs are photographed, the page is an empty state and everything else hides (§3.8 flag).

#### 4.15.1 Empty state (today: `features.works` off)

`/erga` answers 200, `noindex`, linked from nowhere. Index hero: `h1` "ΕΡΓΑ", lead "Ετοιμάζουμε την παρουσίαση των έργων μας με υαλοπίνακες, πλαστικά φύλλα και CNC κατεργασία. Μέχρι τότε, δείτε τι κόβει η μηχανή μας ή καλέστε μας." Then the **frame wall**: the exact grid the works will fill (7+5, then 4+4+4), drawn as empty specimen frames in 1px dashed `--line-strong` with a mono application label in each corner (ΓΡΑΜΜΑΤΑ & ΕΠΙΓΡΑΦΕΣ, ΚΑΣΕΤΕΣ ΠΡΟΣΟΨΕΩΝ, DISPLAYS & ΣΤΑΝΤ, ΕΞΟΠΛΙΣΜΟΣ ΚΑΤΑΣΤΗΜΑΤΩΝ, ΕΠΙΠΛΑ & ΕΣΩΤΕΡΙΚΟΙ ΧΩΡΟΙ): a drawing of the shelves before the stock arrives, `aria-hidden`. Then two actions: "CNC κοπή & κατεργασία" and "Δείτε τα προϊόντα". Closing call `variant="cnc"`. No filters, no fake cards.

#### 4.15.2 List (flag on)

1. Index hero: `h1` "ΕΡΓΑ", lead "Έργα με υλικά και κατεργασία της ALFA GLASS.", mono facts "<n> ΕΡΓΑ · <m> ΥΛΙΚΑ" (computed).
2. **Filters**: two groups, "Υλικό" (glass + the `MATERIALS` that occur in the data) and "Εφαρμογή" (the `APPLICATIONS` that occur), each with "Όλα" first and a mono count per option; options with zero works are not shown. From md: radio chips (≥ 44px) in two rows; at 390: two native `<select>`s side by side. State in the URL (`?material=&app=`, read in an effect, written with `history.replaceState`), so the service page can link to `/erga?app=facade`. All cards are in the server HTML; filtering toggles the `hidden` attribute inside `filter` (§2.7). Empty result: "Κανένα έργο με αυτά τα φίλτρα." + "Καθαρισμός φίλτρων". A polite live region says "<n> έργα".
3. **Grid** (`editorial` rhythm): rows of 7+5, 5+7 and 4+4+4 at 1440, 6+6 at 768, one column at 390.
4. Closing call `variant="cnc"`.

**`WorkCard`** `{ work; size: "lg" | "md" | "sm"; headingLevel }`: the cover in a frame of its own ratio (3:2 for `lg`/`md`, 4:5 allowed for portrait covers in `sm`), `object-cover` only when the source is at least the slot's size, otherwise `object-contain` on snow; under it the title (`t-h3`), a mono meta line "ΑΚΡΥΛΙΚΟ 10 mm · ΓΡΑΜΜΑΤΑ & ΕΠΙΓΡΑΦΕΣ · 2026", optional place. The whole card is one link; `lift` + `glint` on hover; stills only (no video in cards).

#### 4.15.3 Case study (`/erga/<slug>`)

1. `PageHero variant="cinematic"` with `media={{ still: work.cover, loop: work.coverLoop }}` (poster `preload`; the loop only on desktop, §2.8.2): crumbs, `h1` (`t-display`, `t-h1` over 24 characters), mono meta line, `work.summary` as the lead.
2. **Spec plate** (`SpecPlate`, mist): Υλικό (with links to the products in `work.products`), Πάχος (`EdgeGauge md` when `work.thickness`), Κατεργασία (`work.operations`, linked to the service page), Εφαρμογή, Τόπος (if given), Έτος, Πελάτης (only if given, i.e. permitted).
3. **Story** (P2): `work.body` as `Prose size="lead"`.
4. **Gallery**: `MediaGallery layout="editorial"` with the `Lightbox`.
5. **Film** (only when `work.film`): `MediaSlot` 16:9 / 21:9 with the pause button.
6. **The materials of this job** (mist): up to three `SpecimenCard`s of `work.products`.
7. Previous / next work (mono labels, `t-h3` titles) and "Όλα τα έργα →".
8. Closing call `variant="cnc"` (subject "Σχετικά με το έργο: <τίτλος>").

Must stay fast: the cover poster is the LCP (`preload`, `sizes="100vw"`); gallery images lazy; the lightbox code loads on first open; filters are a small client island over server-rendered cards.

---

## 5. Work split

Order: System (one worker, one critic check) → four lanes in parallel worktrees → merge → final fix + whole-site review. Lanes never edit System files; a lane that needs a shared change writes it down in its hand-off as a `global` item for the final fix.

(v3) The System's list grew (media kit, machine drawing, routes and stubs). If it cannot be finished in one round, split it into two workers that run **in parallel** on disjoint files and are merged A then B before the single critic check: **System A** = items 1–3 and 6–7 below plus the routes, flag, dictionary namespaces and stubs of item 9; **System B** = items 4–5, 8 and 10 (graded media, thickness data, media kit, machine drawing and data). B codes against the token and class names fixed in this document, so it does not wait for A.

**Dictionary rule.** New strings go into `src/lib/i18n.ts` under the lane's own namespace (`home`, `company`/`facilities`, `catalogue` (new)/`common`, `news`/`contactPage`/`links`/`notFound`), in `el` and with an English value in `en` so the build compiles (a literal English rendering is fine; phase 4 reviews it). Existing English strings are never changed. (v3) New namespaces: System owns `machine` and `media` (and the new `nav` keys), lane Catalogue + Product owns `service` and `estimator`, lane News + Contact + Links owns `works`. The Greek in this document is final copy: use it verbatim; a lane that needs different words asks in its hand-off.

**File ownership (v3).** Four worktrees merge cleanly only if no two of them edit the same file. The System creates every shared file below (empty where a lane fills it), so a lane only ever touches its own rows:

| Owner | Files |
|---|---|
| System | `src/app/globals.css` and the files it imports; `src/app/[lang]/[[...path]]/page.tsx`, the QA-only `src/app/[lang]/kit/page.tsx`, `sitemap.ts`, `robots.ts`; `public/video/` (README and the kit test clip); `src/lib/{fonts,routes,content,contact,features,machine,media-slots,seo}.ts`; `src/lib/i18n.ts` namespaces `nav`, `common`, `machine`, `media`, `a11y`; `src/components/{Header,Footer,Cta,page,ui,reveal,SiteShell}.tsx`; `src/components/kit/**`; the stubs `src/components/works/{WorkCard,WorksTeaser}.tsx` (final props, `return null` bodies); `src/content/{thickness.json,works.ts}`; `scripts/{grade-media,extract-thickness}.mjs`; `scripts/qa/pages.json` (entries only); `DESIGN.md` |
| Lane 1 Home | `src/views/HomeView.tsx`, `src/components/home/**`, `src/app/styles/home.css`, i18n `home` |
| Lane 2 Company + Facilities | `src/views/{CompanyView,FacilitiesView}.tsx`, `src/components/company/**`, `src/app/styles/company.css`, i18n `company`, `facilities` |
| Lane 3 Catalogue + Product + Service | `src/components/catalog/**`, `src/views/ServiceView.tsx`, `src/components/service/**`, `src/app/styles/{catalogue,service}.css`, i18n `catalogue`, `service`, `estimator` |
| Lane 4 News + Contact + Links + Έργα | `src/views/{NewsView,ContactView,LinksView,LegalView,WorksView,WorkView}.tsx`, `src/components/NotFoundPage.tsx`, `src/components/works/**` (replaces the stubs), `src/content/works.fixture.ts`, `src/app/styles/misc.css`, i18n `news`, `contactPage`, `links`, `notFound`, `works` |

The System adds the five lane stylesheets as empty files imported by `globals.css` in a fixed order, inside the same cascade layer as the components, so a lane never edits `globals.css`. Each worktree runs the harness on its own port (`--port 3101` … `3104`).

### System (shared)

1. Tokens: `night` theme, `--edge*`, `--line-faint`, `--spacing-chapter`, `--ease-glint`; retire `azure` as a section theme; contrast table for `night` in DESIGN.md.
2. Type: JetBrains Mono in `fonts.ts` (`--font-mono`), the scale of §2.2 (`t-giga`, `t-data`, mono `t-label`), remove manifesto exception.
3. Utilities: `.rack-lines` component (`RackLines`), `.grain`, `.glint`, `edge-in`, `lift`, `drift`, `fill` keyframes and timelines, `route` and `morph` view-transition CSS (reduced motion: none).
4. Media: `scripts/grade-media.mjs`, graded files, `media-sizes.json`, `imagery.*Night/*Day`.
5. Data: `scripts/extract-thickness.mjs`, `src/content/thickness.json` (checked by eye), `productThickness`, `familyThickness`, `enquiryHref`.
6. Components: `Header` (rack mega menu, ≥ 1280 quote pill, night mobile menu), `Footer` (night, continuous with the call), `Cta` (closing call), `PageHero` (`cinematic`, `index`), `SectionHeader` (mono eyebrow), `SpecimenPlate`, `SpecPlate`, `EdgeGauge`, `EdgeIndex`, `SpecimenCard`, `SpecTable`, `Marquee`, `AttikiExit`, `ViewTransition` wrapper for specimen plates.
7. DESIGN.md rewritten for this system; the harness untouched; `npm run qa` green on every group (pages may look half-old; that is expected).
8. (v3) **Media kit** (§2.8): `media-slots.ts` with the slots of §2.8.1; `MediaSlot` + the `MediaLoop` island; `DroneBand`; `MediaGallery` (`strip`, `plates`, `editorial`) + `Lightbox`; the `film-in` and lightbox motion; the `media` dictionary namespace; `public/video/` with a `README.md` holding the encoding commands of §2.8.7.
9. (v3) **The second pillar's plumbing** (§3.8): route kinds `service`, `works`, `work` with their Greek and English slugs, page dispatch and metadata, `Service` JSON-LD, the sitemap's `indexable` check; `features.ts`; `historyTimeline`; the header nav (§3.1: Προϊόντα ▾ · CNC κοπή · Έργα · Εταιρεία ▾ · Επικοινωνία, the cutting card in the mega menu, the mobile menu order and third button), the footer's Κατεργασία column, `Cta variant="cnc"`, `PageHero cinematic` taking a `Slot`, the `--signal` tokens; the `nav` and `machine` copy of §3.8; placeholder `ServiceView`, `WorksView` and `WorkView` (a `PageHero` and the closing call) and the `WorkCard`/`WorksTeaser` stubs, so the lanes start from pages that build; `pages.json` groups `service` and `works`.
10. (v3) **Machine drawing and data**: `src/lib/machine.ts` (`BED`, `fitsBed`, `MATERIALS`, `STOCKED`, `OPERATIONS`, `APPLICATIONS`, `formatMm`) and `MachineBlueprint` (§2.8.5: geometry, both orientations, the three variants, the `piece` prop, the layer classes, the `sweep`/`wipe`/`zones`/`zoom-out` keyframes with the final frame as the base rule). No choreography: that belongs to the lanes.
11. (v3) Evidence for the critic, since no page uses the new kit yet: a QA-only page `src/app/[lang]/kit/page.tsx` showing every kit component in its states (gauges, plates, `MediaSlot` with a still, with an empty slot and its fallback, and with a loop: a 4 s, 720p, silent test clip made with ffmpeg (installed at `/opt/homebrew/bin/ffmpeg`) from the warehouse photo with a slow zoom (`-loop 1 -i <photo> -vf "zoompan=z='min(zoom+0.0008,1.08)':d=100:s=1280x720" -t 4 -an`, then the H.264 settings of §2.8.7), stored as `public/video/kit/test-720.mp4` (≤ 400 KB) and deleted when the first real film lands; `DroneBand`; `MediaGallery` + an open-able `Lightbox`; `MachineBlueprint` in every variant, both orientations, with a fitting, a rotated and an out-of-field `piece`). It calls `notFound()` unless `process.env.KIT === "1"`, is never linked and never in the sitemap. Run: `KIT=1 npm run qa -- --pages /kit --label system-kit`.

### Lane 1: Home

`HomeView`, `components/home/*`: hero restage (rack lines, mono rows, crate label), warehouse chapter (Facilities scene re-art-directed with the numeral and facts), glass index with gauges, plastics sticky split, related tool wall, history restyle, closing with the news strip. Delete `Manifesto`, `News` and `Related` components if no longer used. Home ≤ 12.000px at 1440.

(v3) Also: the hero's CNC line (§4.1.1); **the machine section** (§4.1.4b, `components/home/Machine.tsx`, with its `sweep` + `wipe` choreography on `MachineBlueprint band`); the sixth year of the history (§4.1.6, from `historyTimeline`); `<WorksTeaser works={…} />` placed after the machine behind `features.works` (the component is lane 4's; with the flag off it renders nothing, so it only has to be placed); `DroneBand` after the warehouse chapter only when `slots.drone.loop` exists (today: not rendered). The v3 height budget applies: ≤ 13.000px at 1440, ≤ 15.000px at 390. Run: `npm run qa -- --group home --port 3101`.

### Lane 2: Company + Facilities

`CompanyView`, `FacilitiesView`: everything in §4.2 and §4.3 (cinematic hero, spec plates, vision with the statement, P5 history with `fill`, operation, ledger; facilities hero, aerial drift and mobile pan, inside, logistics, find us).

(v3) Also: the company hero through `PageHero cinematic` with `slots.building`; **the 2025 row of the history** with the `MachineBlueprint mini` tile and the link to the service page (§4.2.5); the cutting link row in Operation (§4.2.6); the anchors `#istoria` and `#oikonomika` used by the Εταιρεία dropdown; on facilities, the aerial as `DroneBand slots.drone` and "Inside" as `MediaSlot slots.warehouse` (§4.3.2, §4.3.4). Run: `npm run qa -- --group company-facilities --port 3102`.

### Lane 3: Catalogue + Product + CNC service

`catalog/views.tsx`, `ProductGallery`, `ProductGrid` (→ `SpecimenCard` grid): §4.4–4.8, including the morph pair and the sticky data sheet. Check every product page template in the harness at 390 for table overflow.

(v3) Also, and first in priority because it is the reason the client hired us: **the CNC service page** (§4.13) with its signature bed scene (`components/service/BedScene.tsx`: the choreography of `zoom-out`, `zones`, `sweep`, `wipe`, the callouts and the film slot, landscape at ≥ md and portrait below), the operation pictograms, the materials table, who it's for, the machine's spec plate, the ordering steps; **the estimator v1** (§4.14, `components/service/CncEstimator.tsx`); the product gallery on `MediaGallery strip` + `Lightbox` and the CNC link on the `STOCKED` products (§4.6); the cutting band on the plastics group (§4.7). Priority inside the lane if two rounds are not enough: service page + estimator → product data sheet → category and groups. Run: `npm run qa -- --group catalogue,product,service --port 3103`; check the bed scene's four frames at 390 and 1440, and the estimator at 390 with 20 rows, a 6000 × 2000 piece (rotated), a 2500 × 6100 piece (out) and an empty field.

### Lane 4: News + Contact + Links/Legal + 404 + Έργα

`NewsView`, `ContactView`, `LinksView`, `LegalView`, `NotFoundPage`: §4.9–4.11 and §3.5, the preset mailto chips.

(v3) Also: **Έργα** (§4.15): the empty state with the frame wall (what ships today), the list with filters, `WorkCard`, the case study, `WorksTeaser` for the home (replacing the System stubs, same props), and the QA fixture `works.fixture.ts` with its banner; the article images on `MediaGallery plates` + `Lightbox`; the contact page's fourth chip "CNC κοπή" (§4.10). Run: `npm run qa -- --group news,contact,links-legal,works --port 3104`, then the fixture run that shows the real layout: `NEXT_PUBLIC_WORKS_FIXTURE=1 npm run qa -- --pages /erga,/erga/dokimastiko-ergo-1 --port 3104 --label works-fixture` (a fresh build: the env var is read at build time). Never commit a build or a screenshot of the fixture as the page's baseline.

Each lane: `npm run qa -- --group <its groups>` green, regression of other groups unchanged except where System components are used, self-score ≥ 8.5 before hand-off.

---

## 6. Critic review of v1 and what changed (v2)

I reviewed v1 as the strictest critic through the five lenses. Findings and the revision made:

| # | Lens | Finding in v1 | Revision in v2 |
|---|---|---|---|
| 1 | Factory fit | v1 drew a "rack" of nine vertical panes with family names set vertically: beautiful on a poster, slow for a glazier (vertical Greek of 44 characters is unreadable, and 148px panes would upscale the 626px category images). | Replaced by `EdgeIndex`: horizontal rows a buyer can scan, with the thickness gauge as the visual. The rack idea survives as data (nine gauges seen together), not as an obstacle. |
| 2 | Honesty | v1 showed a gauge for every family from a loose `\d+mm` regex. Checked against the content: the loose regex picked up compositions (0,38 mm interlayers, 45/51 mm bullet-proof builds) and hardware sizes. | Strict extraction rule (§3.7), safety family and plastics accessories excluded, family gauge only when half its products have data, file checked by eye. |
| 3 | WOW | v1 kept the light azure gradient CTA "because the critic liked it": it is the most template-like block on every contact sheet. | Retired as a section theme; the closing call is a night chapter with the phone as the biggest type on the page, continuous with the footer. |
| 4 | Mobile | v1 had the aerial panorama full-width on phones: 390px wide is an 83px sliver. | Pannable 220px strip at natural ratio with a swipe hint; drift only from md. |
| 5 | Mobile | v1 used a 2-column specimen grid at 390: 175px cards with Greek titles in `t-h3` wrap to 4 lines. | One-column `EdgeIndex` product rows at 390; cards from 768. |
| 6 | Speed | v1 graded photos with CSS `filter` + `mix-blend-mode` at runtime: repaint cost on big layers and a blend on a scroll-animated element. | Offline grading script with `sharp`; zero runtime filters. |
| 7 | Speed | v1 proposed a third font without a budget. | JetBrains Mono variable, Greek + Latin subsets only, two weights used; mono never used for running text, so a swap is harmless. |
| 8 | Speed / scope | v1 rebuilt the hero around a refracted warehouse photo inside WebGL. Unknown cost, high risk in one or two Sonnet rounds, and it would break the measured LCP. | Hero engine untouched; only its frame changes (rack lines, mono rows, crate label). The "wow" move goes into the warehouse chapter right after it, reusing the existing, measured scene. |
| 9 | Accessibility | v1's glint was triggered on scroll for every row (motion overload) and the giant numeral overlapped its label (overlap gate). | Glint on hover/focus only (plus once per glass pane entering view); numeral and label stacked, never overlapping; `aria-label`s on gauges and the schematic; route transitions off with reduced motion. |
| 10 | Grid | v1 gave sticky columns to four sections on one page. | P5 sticky split defined once and limited to home plastics, company history and the product data sheet. |
| 11 | Process | v1 let lanes edit `i18n.ts` freely: four worktrees would conflict and could touch English copy. | Dictionary rule: own namespace, English value only for new keys, existing English untouched. |
| 12a | Identity | v1 night-graded the building façade for the company hero: the duotone kills the blue frame that PRODUCT.md lists as identity. | Company hero uses the day grade with a bottom scrim only. |
| 12b | Feasibility | v1 put the closing phone number in `t-mega` inside a 6-column pane: 10 condensed digits at 224px are ≈ 950px, the pane is ≈ 650px. | The pane spans the whole shell in its own row; `nowrap`; `t-display` below md. |
| 12c | Gates | v1 labelled every gauge bar at every size: at k = 1.6 the 2 mm and 3 mm bars are 9px apart, the digits overlap (overlap gate). | Per-bar labels only in `lg`, in slots ≥ 2.6ch; `sm`/`md` show a min–max caption. |
| 12d | Copy | v1's warehouse facts included "9.000 τ.μ. το 2000" next to "13.000 τ.μ.": true but confusing for a buyer. | Facts limited to 1999, +4.000 τ.μ. 2021, own trucks. |

Open risks for the critic to watch: `night` contrast on photo scrims (measure, do not assume); the home history and warehouse scenes on tablets (page height); the morph only plays for prefetched product pages (acceptable: it is a bonus, never a dependency).

---

## 7. Critic review of the v3 additions and what changed

I reviewed the v3 draft (CNC service, estimator, Έργα, media) as the strictest critic, through the same lenses plus honesty, and revised it once. Everything below is already applied in the sections above.

| # | Lens | Finding in the v3 draft | Revision |
|---|---|---|---|
| 1 | Honesty | The estimator had a file input "attach your drawing". A mailto link cannot carry a file, so the drawing would vanish without a word. | No file input. The email body and the line under the button tell the buyer to attach the DXF/PDF in the email; "Αντιγραφή λίστας" plus the written-out address covers computers that open no mail program (§4.14). |
| 2 | Honesty | The drawing showed the 8 vacuum zones and the T-slots as if exact, and "±0,05 mm" read like a promise about finished parts. | The drawing carries "ΣΧΗΜΑΤΙΚΟ" (only the dimensions are the machine's); "Ακρίβεια μηχανής" everywhere plus the maker's-data note; the fit check says it only covers the working area. |
| 3 | Honesty | "A standard sheet for scale": the content has no sheet sizes for the materials the router cuts. The only size in the data (3210 × 2250) is glass, which the router does not cut, so drawing it on the bed would suggest that it does. | The scale figure is a person in plan, the architects' convention; glass is kept out of `MATERIALS` and the materials table says plainly that the machine does not cut glass. |
| 4 | Factory fit | Seven top-level nav items do not fit at 1024 (≈ 700px for ≈ 560px), and an "Υπηρεσίες" label would hide the one thing the client wants promoted. | Προϊόντα ▾ · CNC κοπή · Έργα · Εταιρεία ▾ · Επικοινωνία; the service named, never "Υπηρεσίες"; Εγκαταστάσεις, Νέα and the reports grouped under Εταιρεία (§3.1). |
| 5 | WOW / rhythm | Putting the machine on `night` would give the home page four night chapters and blur the warehouse and the machine into one mood. | The machine is a blueprint on `deep` (white and cyan lines on the wordmark's indigo), a third light that does not count as night (§1, §2.3). |
| 6 | WOW / anti-references | The `t-giga` "6.050" on the service hero could read as a SaaS hero metric. | It is drawn as a dimension line from gutter to gutter, the top edge of the bed the next section draws. It is part of the drawing, not a stat, and numbers never count up (§2.7). |
| 7 | Mobile | A landscape bed at 390 is 358 × 124px, which loses the scale message, and five callouts in a 390 stage would overlap (overlap gate). | The service scene uses the portrait drawing below md (≈ 240 × 700px); callouts appear only from md, and on phones the same facts are in the spec plate further down (§4.13.2). |
| 8 | Speed | Animating `stroke-dashoffset` repaints every frame, and zooming a normal-size layer up blurs it. | `wipe` (counter-translate reveal), and a `zoom-out` laid out at the start size and scaled down; both compositor-only (§2.7). |
| 9 | Speed | Muted loops autoplaying on phones would cost data and dropped frames in exactly the profile the perf gate measures (mobile scroll at 4× CPU). | Loops autoplay only at ≥ 1024 with a fine pointer, 4g, no Save-Data, after load and idle, ≥ 25% in view; everywhere else a poster and a play button. A video is never the LCP element (§2.8.2). |
| 10 | Accessibility | Loops had no pause control, the estimator's status was colour-only in the draft, and 15px mono inputs make iOS zoom in. | A pause button on every loop over 5 s (WCAG 2.2.2), a poster with play under reduced motion; status in words + icon + live region; inputs at 16px, ≥ 44px controls, real labels (§4.14). |
| 11 | Engineering | The fixture flag read `process.env.WORKS_FIXTURE` in code the client header imports: `undefined` in the browser, so hydration breaks. | `NEXT_PUBLIC_WORKS_FIXTURE`, inlined at build time on both sides (§3.8). |
| 12 | Honesty / WOW | A filterable Έργα gallery with one or two jobs looks abandoned, and placeholder cards would be invented projects. | The flag turns on at three real works; until then `/erga` is an honest, `noindex`, unlinked empty state with the frame wall, home shows nothing, and QA uses a fixture that announces itself on every page (§4.15). |
| 13 | Process | Home, company and the service page all need the drawing, and home needs the works teaser, while the lanes run in parallel. Four lanes appending to `globals.css` would also conflict on every merge. | The System builds the static drawing, the machine data and the works stubs (final props); the lanes only choreograph and fill. The file-ownership table and the pre-created lane stylesheets keep the merges clean (§5). |
| 14 | Type | Uppercase labels turned units into "MM" and "M²" (M is mega), in v2's facts lines as well. | Units keep their SI case inside uppercase labels (`.unit`), and v2's strings are corrected (§3.8). |
| 15 | Scope | The home page grows by a section and a sixth year beyond v2's 12.000px budget. | The budget is raised to 13.000 / 15.000px, under the harness ceiling, with a stated cut order (§4.1). |

Open risks for the critic to watch in v3: the bed scene at 768 (the landscape drawing is only ≈ 706px wide there with five callouts, and the harness shoots scene frames only at 390 and 1440, so the worker adds a `crop.mjs` of the tablet shot); the `deep` blueprint lines' contrast as non-text graphics (≥ 3:1, measure it); the estimator's mailto in Outlook desktop (the 1.800-character switch to "copy" must fire before the client truncates); lane 3 is the heaviest lane, so the service page and the estimator come first in it.
