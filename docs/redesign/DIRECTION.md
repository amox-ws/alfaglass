# Creative direction: ALFA GLASS

Status: v2 (written, reviewed by the strictest critic, revised once; the review is at the end).
Read with [`SPEC.md`](SPEC.md) (audience, B2B tasks, functional requirements, allowed facts), [`PLAN.md`](PLAN.md) (rubric, gates, loop) and [`../../DESIGN.md`](../../DESIGN.md) (performance rules). **Where this file and SPEC.md disagree on design, this file wins.** SPEC.md's functional requirements (header fixes, dialog menu, 404, SEO, contrast, tap targets, no upscaling, Greek content fixes) still apply. The System worker rewrites DESIGN.md to describe the system below when it is done.

Fixed: logo and wordmark (`Logo.tsx`, `public/brand/*`), facts only from the content, Greek site only (English copy untouched, English build compiles), DESIGN.md "Performance rules", every QA gate.

---

## 1. Concept

**One sentence.** ALFA GLASS is 13.000 m² of glass standing on edge, so the whole site is built from that one view: sheets in a rack, read edge-on, measured in millimetres, lit by daylight and seen at night.

**The narrative.** You arrive in daylight, in front of a wall of clear glass with the promise behind it (*Τα πάντα για το γυαλί*). The glass closes and you are inside the warehouse at night: 13.000 m², 1999, the trucks. Then you walk the racks: nine families of glass, each drawn as the edges of the sheets it is sold in, then plastics, then the tools around glass. The site ends at the loading bay: one huge phone number, an email that already knows what you want, the address at exit 4 of Attiki Odos.

Three ideas carry every page, and nothing else is decoration:

1. **The edge.** A sheet of glass seen from its edge is a thin bright line with depth. It is the brand's graphic atom: hairlines, the thickness gauge, the glint, the focus ring, the rack lines of the grid.
2. **Day and night.** Daylight (`frost`, `mist`) for everything a buyer reads, compares and taps; night (`night`) for the cinematic chapters that prove scale (warehouse, history, the closing call, the footer). Never more than three night chapters on a page; the closing call and the footer together count as one.
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
| [Cricursa](https://www.cricursa.com) | white editorial pages, credits and metadata set small and exact | |
| [SCHOTT](https://www.schott.com/en-gb) | navy and white as a serious material-science palette; hands and glass as the scale cue | stock-photo heroes |

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
```

Themes (sections set `data-theme`; components use only the contextual tokens `surface`, `surface-2`, `fg`, `fg-muted`, `fg-dim`, `line`, `line-strong`, `accent`, `accent-fg`):

| Theme | surface / surface-2 | fg / fg-muted / fg-dim | line / line-strong | accent / accent-fg | Use |
|---|---|---|---|---|---|
| `frost` (keep values) | 0.985 0.004 255 / 0.96 0.007 255 | as today | as today | 0.51 0.12 232 / snow | default; reading, catalogue, product |
| `mist` (keep values) | as today | as today | as today | as today | alternate daylight bands, spec plate, table header |
| `night` (new) | `oklch(0.17 0.045 280)` / `oklch(0.215 0.055 281)` | `oklch(0.97 0.006 255)` / `oklch(0.83 0.025 258)` / `oklch(0.72 0.03 262)` | `oklch(0.97 0.006 255 / 0.12)` / `/ 0.26` | `oklch(0.84 0.085 226)` / `oklch(0.17 0.045 280)` | cinematic chapters, closing call, footer, mobile menu |
| `deep` (keep values) | brand indigo | as today | as today | as today | one brand statement per page at most (company vision, 404) |
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

Focus: `:focus-visible` is a 2px solid `--accent` outline with 3px offset (cyan on night, azure on daylight): the edge of a sheet. Never removed, never only a colour change.

View transitions are a bonus, never a dependency: if `ViewTransition` is not exported by the React types in this Next version, use the `react/canary` types as the docs describe; if the morph costs more than one iteration, ship the route fade only. Wrap the page content once (System) as the docs' route-transition pattern shows; nothing else may depend on it.

Budget: at most one scroll-linked scene per screen height; at most one endless animation per page (the marquee); WebGL only in the home hero, gated exactly as today.

---

## 3. Global UX

### 3.1 Header (`Header.tsx`, System)

- Desktop (≥ 1024): logo · nav (Εταιρεία, Προϊόντα ▾, Εγκαταστάσεις, Νέα, Επικοινωνία) · phone pill (mono digits, `tel:`) · ΕΛ|EN. From 1280 a dark pill **"Ζητήστε προσφορά"** follows the phone (mailto `sales@alfaglass.gr`, subject "Ζητώ προσφορά"). Transparent over the first screen, a thick-glass capsule after 24px of scroll (keep). The phone pill never wraps at 1024.
- **Mega menu "the rack"** (Προϊόντα): one thick-glass panel, three columns: Υαλοπίνακες (9 families, each row: mono index `01`, name, mono count `5`), Πλαστικά φύλλα (11 materials), Συναφή (4 families). Each column header is a `t-h3` link to the group. A footer row in mono: "75 ΠΡΟΪΟΝΤΑ · 14 ΚΑΤΗΓΟΡΙΕΣ" (computed) and the phone. Rows ≥ 32px, `glint` on hover. Opens on click and on hover-intent (150ms), closes on Esc and outside click, focus stays in DOM order.
- Mobile (< 768): logo · 44px phone button · ΕΛ|EN · menu button (keep). 768–1023: phone number text replaces the button.
- **Mobile menu**: native modal `<dialog>` (keep behaviour), restyled on `night`: big `t-h2` links with mono indexes, Προϊόντα expands in place to the three groups (`<details>`), and a bottom block with two full-width buttons: phone (`tel:`) and email (`mailto:`). Active page marked.

### 3.2 Contact and quote paths (no forms, no backend)

There are three ways to act, available everywhere within one tap or one scroll:

1. **Call**: header phone (all widths), the closing call on every page, the product data sheet.
2. **Email with intent**: every enquiry link is a `mailto:` with a prefilled subject. Helper `enquiryHref({ subject, body? })` in `src/lib/contact.ts` (System). Subjects: product page "Ενδιαφέρον για: <τίτλος προϊόντος>", category "Ενδιαφέρον για: <κατηγορία>", header "Ζητώ προσφορά". The contact page offers three preset chips: "Υαλοπίνακες", "Πλαστικά φύλλα", "Συναφή προϊόντα" (subject "Ζητώ προσφορά: <group>").
3. **Visit**: address with "Έξοδος 4 Αττικής Οδού" and a directions link (Google Maps URL), on facilities, contact and the footer.

### 3.3 Closing call (`Cta`, System, replaces both variants)

Every page ends with the same night chapter, directly followed by the footer on the same night surface (one continuous ending, a hairline between them):

- 390: eyebrow `ΕΠΙΚΟΙΝΩΝΙΑ` (mono label) → title `t-h1` (home: "Καλέστε μας και θα έρθουμε κοντά σας."; product/category: "Ρωτήστε μας για διαστάσεις και απόθεμα.") → the fluted glass pane, full width, holding the phone number as the largest type on screen (`t-display` below md, display face, tabular figures, one `tel:` link) → mobile and email rows (`t-lead`, email underlined at rest) → address row. Each row ≥ 64px.
- 1440: row 1: title cols 1–7, mobile / email / address cols 9–12 (bottom-aligned). Row 2: the fluted glass pane across the whole shell (P4), the phone in `t-mega` on the left (10 digits of the condensed face at 224px ≈ 950px; it never wraps: `white-space: nowrap`, and from md to lg it uses `t-display` if the harness reports clipping), a 72px round call button on the right. Rack lines behind both rows.
- `subject` prop pre-fills the mailto. Home keeps the stamp cells as a mono line under the pane.

### 3.4 Footer (`Footer.tsx`, System)

Night, continues the closing call. Rows: brand line ("Τα πάντα για το γυαλί, από το 1999", `t-h2`) · three link columns (Εταιρεία, Προϊόντα, Έδρα with address and directions) · the giant outlined wordmark (keep) · legal row: copyright, legal links, credit "Σχεδιασμός & ανάπτυξη: AMOX", ESPA banner on a snow plate. Every link 44px on touch; address outside `nav`.

### 3.5 404 (`global-not-found.tsx` + `NotFoundPage`, lane 4)

Deep theme, rack lines. `t-giga` "404" with a static SVG crack (a few 1px `--edge` polylines radiating from one point, `aria-hidden`) laid over the digits; `h1` "Ραγισμένο τζάμι" (`t-display`); the text; then the three groups and contact as an index list (mono index, `t-h3` name, arrow). Status 404, full frame, Greek.

### 3.6 Page shells (System)

- `PageHero` keeps its contract (server-visible, no upscaling, compact variant) and gains two variants:
  - `variant="cinematic"`: full-bleed night-graded photo (`P6`), 88svh (min 34rem), title bottom-left on a bottom scrim (`linear-gradient(to top, var(--night) 0%, oklch(0.17 0.045 280 / 0.6) 45%, transparent 75%)`), lead and mono facts under it. Photo with `priority`, `sizes="100vw"`, settles with `img-settle`. Used by company.
  - `variant="index"`: no photo; title `t-display`, a mono facts line (e.g. "9 ΟΙΚΟΓΕΝΕΙΕΣ · 43 ΕΙΔΗ · 2–19 MM"), lead clipped to 100 characters, rack lines behind. Used by the catalogue groups and the news list.
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

---

## 4. Page blueprints

Format per page: job · sections in order (theme, layout at 390 / 1440, content source) · signature · motion · what must stay fast. "Content" names fields of `src/content/el/*.json` or dictionary keys in `src/lib/i18n.ts` (`d.*`).

### 4.1 Home (`/`, `HomeView`, lane Home)

Job: in one screen, "everything in glass, from our own stock, call us"; in three, "they are big and real"; then the range. Target height ≤ 12.000px at 1440 and ≤ 14.000px at 390.

Rhythm: frost hero · night warehouse · frost glass index · mist plastics · frost related · night history · frost brands pause · night closing + footer.

1. **Hero** (frost, keep the engine). 1440: WebGL headline and panes exactly as today; add rack lines behind (12 lines); the meta row becomes mono labels ("ΑΠΟ ΤΟ 1999" left, "ΑΣΠΡΟΠΥΡΓΟΣ · ΕΞΟΔΟΣ 4 ΑΤΤΙΚΗΣ ΟΔΟΥ" right); bottom row: lead (`d.home.leadStrong/leadRest`), "Δείτε τα προϊόντα" (dark pill) + "Καλέστε μας 210 5593900" (thin glass), and on the right a mono "crate label" line `ALFA GLASS · ΑΠΟ ΤΟ 1999 · 13.000 Τ.Μ. · ΑΣΠΡΟΠΥΡΓΟΣ` (the stamp cells, `d.stamp`) replacing the "Κύλιση" cue. 390: CSS panes as today, 4 rack lines, lead, both buttons full width, stacked. Content: `d.home.*`, `d.stamp`.
2. **Warehouse** (night, P6, pinned; reuse `Facilities.tsx` and its `--fac` scene). Starts with the night-graded warehouse photo (`imagery.warehouseNight`) small in the centre; as you scroll it opens to full bleed (existing motion), then `t-giga` "13.000" rises (`fade-rise` within the timeline, transform + opacity), with "τ.μ. ιδιόκτητων χώρων" (`t-h2`) and a mono facts row: "1999 · ΙΔΡΥΣΗ", "2021 · +4.000 Τ.Μ.", "ΙΔΙΟΚΤΗΤΑ ΦΟΡΤΗΓΑ"; last, the clear pane rises over the right third with `d.home.facilitiesText` and the link "Οι εγκαταστάσεις μας →". Grain overlay. 200svh at ≥ lg, 150svh below. 390: the numeral is 96px, facts stack in two lines, the pane holds the text and link, bottom scrim. **Signature of the home page.**
3. **Glass index** (frost, P1 + `EdgeIndex`). Header: `02 — ΚΑΤΑΛΟΓΟΣ`, title "ΥΑΛΟΠΙΝΑΚΕΣ", intro `d.home.glassIntro`, action "Όλοι οι υαλοπίνακες". Nine rows with family gauges where data allows (the gauges together read as a rack seen from its end). 390: rows with thumbnail, name, count, sm gauge (min–max). Content: `site.groups[0].categories`, `categories.json`, `thickness.json`.
4. **Plastics** (mist, P5 sticky split). Marquee of materials across the top (keep `d.home.plasticsMarquee`). 1440: sticky left (cols 1–5): eyebrow `ΑΠΟ ΤΟ 2014`, title "ΠΛΑΣΤΙΚΑ ΦΥΛΛΑ", `d.home.plasticsText`, link, and the canopy photo (`site.groups[1].image`, 2000×1209), ungraded (it shows the product), 4:3 crop allowed because the source is large. Right (cols 7–12): the 11 materials as `EdgeIndex` product rows (thumbnail plate 64px, name, sm gauge, arrow). 390: title, text, photo, then the list.
5. **Related** (frost, P1 + a 4-column "tool wall"). 1440: four columns, each a tall specimen plate (the family image, object-contain on snow), mono count, `t-h3` name, two-line summary, arrow; 768: 2×2; 390: `EdgeIndex` rows with thumbnails (no gauges). Content: `site.groups[2].categories`, `d.home.relatedText`.
6. **History** (night, keep the pinned horizontal timeline). Restyle: years in display 200, captions `t-body`, indexes mono, the engraving night-graded, progress bar uses `--edge-gradient`. Keep the swipe fallback and its hint.
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
5. **History** (frost, P5): sticky left: "ΑΠΟ ΤΗ ΔΡΑΠΕΤΣΩΝΑ ΣΤΟΝ ΑΣΠΡΟΠΥΡΓΟ" + the engraving in a specimen plate; right: five years (`site.history.timeline`) as rows, year in display 200 `t-h1`, text `t-body`, a 1px edge line on the left that `fill`s as you scroll.
6. **Operation** (frost, P3): warehouse day-graded (media 1–7) + `d.company.activityTitle` + logistics text; then the trucks panorama strip (P6, day-graded, own proportion).
7. **Financials** (mist): a ledger: rows with the year in display 700 `t-h2`, the title, "PDF" and the file size in mono, the whole row one link with ↓; `site.financials`.
8. Closing call.

Must stay fast: hero image is the LCP: `priority`, AVIF via next/image, `sizes="100vw"`, graded JPEG ≤ 250 KB; no client JS beyond `Reveal`.

### 4.3 Facilities (`/egkatastaseis`, `FacilitiesView`, lane Company + Facilities)

Job: show the scale of the premises and how goods leave.

1. **Hero** (frost, `PageHero` bare): breadcrumbs, `t-display` "ΕΓΚΑΤΑΣΤΑΣΕΙΣ", lead `d.facilities.lead`, `SpecPlate` with three cells: 13.000 τ.μ. συνολική επιφάνεια · +4.000 τ.μ. επέκταση 2021 · Έξοδος 4 Αττικής Οδού.
2. **Aerial** (P6, signature): the aerial panorama (`imagery.aerial` day grade, 1926×408) as a full-width strip with `drift` (scale 1.18 → 1, translateX 4% → 0, scroll-linked, transform only). At < md the strip is 220px tall at its natural ratio (≈ 1040px wide) inside a horizontal scroll container with scroll-snap off, a mono hint "ΣΥΡΕΤΕ →" and the drift disabled; the image is never upscaled.
3. **Storage** (frost, P1 then P3): `d.facilities.storage` / `storageTitle` (≤ 2 lines) with `site.facilities.html`; then the building façade (`imagery.building` day grade) media 1–7, text 9–12.
4. **Inside** (night, P6): the warehouse interior night-graded full bleed, 80svh, with a mono `figcaption` taken from `d.facilities.interiorAlt`; grain. No pin.
5. **Logistics** (frost): trucks panorama strip at its own proportion (P6) + `d.home.logisticsTitle/logisticsText`.
6. **Find us** (mist, P3): the `AttikiExit` schematic (media 1–7) and, beside it, the address as `t-h2`, `d.contact.addressNote`, directions link, phone.
7. Closing call.

Must stay fast: only one scroll-linked effect (drift); panoramas `loading="lazy"`.

### 4.4 Glass group (`/yalopinakes`, `GroupView`, lane Catalogue + Product)

Job: get the buyer to the right family in one screen.

1. **Hero** (`PageHero variant="index"`): crumbs, `t-display` "ΥΑΛΟΠΙΝΑΚΕΣ", mono facts "9 ΟΙΚΟΓΕΝΕΙΕΣ · 43 ΕΙΔΗ · 2–19 MM" (computed: families, products, min–max over `thickness.json`), lead (`site.groups[0].intro`, first 100 characters via `teaser`). No photo. At 1440 × 900 the first three rows of the index are above the fold; at 390 the first row starts within 1.1 screens.
2. **Edge index** (frost): nine families (`EdgeIndex`, gauges where allowed, cursor preview on pointer devices, thumbnails on touch).
3. **About** (frost, P2): label "ΣΧΕΤΙΚΑ", `site.groups[0].intro` full, the engraving (`site.groups[0].image`) in a specimen plate at its natural size.
4. Closing call (subject "Υαλοπίνακες").

Signature: the nine gauges seen together, the rack read from its end.

### 4.5 Category (`/yalopinakes/<category>`, `CategoryView`)

Job: pick the product; see the thicknesses of the family.

1. **Hero** (frost, compact, no photo): back link (390) / crumbs, title `t-display` (`t-h1` over 24 characters), mono facts "5 ΕΙΔΗ · ΠΑΧΗ 3–10 MM", lead ≤ 100 characters, and from md the family `EdgeGauge md` to the right of the title (cols 8–12), below it at 390.
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

Must stay fast: the gallery's first image is the LCP: `priority`, sized from `mediaSize`; other gallery images lazy; the sticky column is CSS only.

### 4.7 Plastics group (`/plastika-fylla`)

Same template as a category (it is one category): index hero with facts "11 ΥΛΙΚΑ · ΑΠΟ ΤΟ 2014", the marquee as a band under the hero (the only marquee on the page), products as `SpecimenCard` grid / rows with gauges, about (without the legacy bullet list duplicating the grid), closing call.

### 4.8 Related group (`/synafi-proionta`)

Index hero (facts "4 ΚΑΤΗΓΟΡΙΕΣ · 21 ΕΙΔΗ", lead `d.home.relatedText`), the four families as the tool wall from the home (§4.1.5) at full width, then `EdgeIndex` rows of all products grouped under four `t-h3` headings (no gauges), closing call. Product pages of this group use the data sheet without a gauge.

### 4.9 News list (`/nea`) and article (`/nea/<slug>`, `NewsView`, lane News + Contact + Links)

List: index hero "ΝΕΑ" (h1 matches the nav) with lead `d.news.lead`; then each article as an editorial row: mono date (`06.11.2024`), `t-h1` title as the link, excerpt (`excerpt`, word boundary), the image in a specimen plate (cols 9–12; at 390 under the text). One article today; the layout works for many.

Article: crumbs, mono date, `t-h1` title (max 3 lines at 1440), prose at `t-lead` in cols 1–8 (68ch), images as specimen plates in cols 9–12 (logos never upscaled), back link; next/previous only when more than one article exists; closing call.

### 4.10 Contact (`/epikoinonia`)

Job: reach a person now.

1. **Title** (frost, rack lines): crumbs, `t-mega` "ΜΙΛΗΣΤΕ ΜΑΖΙ ΜΑΣ" (signature, keep).
2. **Lines** (frost): rows, each ≥ 64px, label in mono: Τηλέφωνο (the number in `t-display`, the largest), Κινητό, Email, Διεύθυνση (+ note + directions). Then "Ζητήστε προσφορά για" + the three preset mailto chips (§3.2). 1440: rows cols 1–6, map cols 8–12 (keep the glass chip). 390: rows, chips, then the map, then the `AttikiExit` schematic.
3. Closing footer only (the closing call would repeat this page: on contact, `Cta` is omitted and the footer follows).

### 4.11 Useful links, legal

- Links: index hero; one row per brand: logo on a snow plate (natural size, never upscaled) in cols 1–3, its tools as rows with ↗ in cols 5–12 (`t-h3` labels in Greek, `https`), brand names from `src/lib/brands.ts`, not by index. Closing call.
- Legal: crumbs, `t-display`/`t-h1` title, prose in cols 1–8 left-aligned with the title, the legacy first paragraph that repeats the title removed, tables scroll in their container. Closing call.

### 4.12 404 — see §3.5.

---

## 5. Work split

Order: System (one worker, one critic check) → four lanes in parallel worktrees → merge → final fix + whole-site review. Lanes never edit System files; a lane that needs a shared change writes it down in its hand-off as a `global` item for the final fix.

**Dictionary rule.** New strings go into `src/lib/i18n.ts` under the lane's own namespace (`home`, `company`/`facilities`, `catalogue` (new)/`common`, `news`/`contactPage`/`links`/`notFound`), in `el` and with an English value in `en` so the build compiles (a literal English rendering is fine; phase 4 reviews it). Existing English strings are never changed.

### System (shared)

1. Tokens: `night` theme, `--edge*`, `--line-faint`, `--spacing-chapter`, `--ease-glint`; retire `azure` as a section theme; contrast table for `night` in DESIGN.md.
2. Type: JetBrains Mono in `fonts.ts` (`--font-mono`), the scale of §2.2 (`t-giga`, `t-data`, mono `t-label`), remove manifesto exception.
3. Utilities: `.rack-lines` component (`RackLines`), `.grain`, `.glint`, `edge-in`, `lift`, `drift`, `fill` keyframes and timelines, `route` and `morph` view-transition CSS (reduced motion: none).
4. Media: `scripts/grade-media.mjs`, graded files, `media-sizes.json`, `imagery.*Night/*Day`.
5. Data: `scripts/extract-thickness.mjs`, `src/content/thickness.json` (checked by eye), `productThickness`, `familyThickness`, `enquiryHref`.
6. Components: `Header` (rack mega menu, ≥ 1280 quote pill, night mobile menu), `Footer` (night, continuous with the call), `Cta` (closing call), `PageHero` (`cinematic`, `index`), `SectionHeader` (mono eyebrow), `SpecimenPlate`, `SpecPlate`, `EdgeGauge`, `EdgeIndex`, `SpecimenCard`, `SpecTable`, `Marquee`, `AttikiExit`, `ViewTransition` wrapper for specimen plates.
7. DESIGN.md rewritten for this system; the harness untouched; `npm run qa` green on every group (pages may look half-old; that is expected).

### Lane 1: Home

`HomeView`, `components/home/*`: hero restage (rack lines, mono rows, crate label), warehouse chapter (Facilities scene re-art-directed with the numeral and facts), glass index with gauges, plastics sticky split, related tool wall, history restyle, closing with the news strip. Delete `Manifesto`, `News` and `Related` components if no longer used. Home ≤ 12.000px at 1440.

### Lane 2: Company + Facilities

`CompanyView`, `FacilitiesView`: everything in §4.2 and §4.3 (cinematic hero, spec plates, vision with the statement, P5 history with `fill`, operation, ledger; facilities hero, aerial drift and mobile pan, inside, logistics, find us).

### Lane 3: Catalogue + Product

`catalog/views.tsx`, `ProductGallery`, `ProductGrid` (→ `SpecimenCard` grid): §4.4–4.8, including the morph pair and the sticky data sheet. Check every product page template in the harness at 390 for table overflow.

### Lane 4: News + Contact + Links/Legal + 404

`NewsView`, `ContactView`, `LinksView`, `LegalView`, `NotFoundPage`: §4.9–4.11 and §3.5, the preset mailto chips.

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
