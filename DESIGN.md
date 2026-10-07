# ALFA GLASS design system

The system the pages are built from. The creative direction (why, and what each page does with it) is [`docs/redesign/DIRECTION.md`](docs/redesign/DIRECTION.md); the brief is [`PRODUCT.md`](PRODUCT.md). Where the two disagree on design, DIRECTION.md wins.

## Concept

ALFA GLASS is 13.000 m² of glass standing on edge, so the whole site is built from that one view: sheets in a rack, read edge-on, measured in millimetres, lit by daylight and seen at night. Three ideas carry every page and nothing else is decoration:

1. **The edge.** A sheet of glass seen from its edge is a thin bright line with depth. It is the brand's graphic atom: hairlines, the thickness gauge, the glint, the focus ring, the rack lines of the grid, the cut path of the machine drawing.
2. **Day, night and blueprint.** Daylight (`frost`, `mist`) for everything a buyer reads, compares and taps. Night (`night`) for the cinematic chapters that prove scale: the warehouse, the history, the closing call and the footer (at most three night chapters on a page; the closing call and the footer count as one). The machine has a third light, the blueprint (`deep`, white and edge-cyan lines): one blueprint chapter per page, never counted as night.
3. **The spec voice.** Numbers are the brand's proof, so they have their own typeface: a monospace for thicknesses, counts, years, codes, dates and phone numbers in labels. Big claims are set in the condensed display face, reading in the text face.

Two pillars, treated as equals: **Αποθήκη** (wholesale of glass and plastic sheets from its own stock) and **Κατεργασία** (the CNC cutting service and its 2,1 × 6,05 m machine, drawn as a blueprint, never shown in a photograph it does not have).

## Performance rules
Every effect stays, but none may make the page stutter. Measured on a throttled mid-range phone profile against the first build: content visible at about 1.4 s instead of 4.7 s, and no dropped frames over a full-page scroll.
- The headline and lead are HTML, visible from the first paint (CSS entrance, no waiting for JavaScript). **Nothing above the fold waits for JavaScript.**
- The WebGL hero loads only on desktops that can hold it (large screen, mouse, 4+ cores, 4+ GB, WebGL 2, no reduced motion, no data saver), after the page has loaded and the browser is idle. It renders at 1x pixels with one shared refraction buffer at half size, and only while in view. If it falls under 50 fps (80 on 120 Hz) for most of 2.5 s, it fades out and hands over to the CSS panes. WebGL lives only in the home hero.
- Phones, tablets and everything else get CSS glass panes in the same layout: each pane holds a copy of the headline that lies exactly on the real one, and only transform and opacity ever move.
- Scroll scenes run on CSS scroll timelines and animate only transform and opacity, so the browser runs them off the main thread. No smooth-scroll library: native scrolling. A scroll scene's base rule is its final frame (what browsers without scroll timelines, reduced motion and print see).
- Backdrop blur stays off anything that moves with the scroll (the facilities pane, the history caption) and off a video (the play button over a film is glass without the blur).
- A video is never the LCP element: its poster paints first. Loops autoplay only at ≥ 1024px with a mouse, on a good connection, with motion allowed, after load and idle, and pause below 10% in view; everywhere else a button plays them. Numbers never count up. At most one endless animation per page (the marquee).
- Media JavaScript ships only where there is media: `MediaLoop` (the video island) only when a slot has a loop, the lightbox only on the first tap (`next/dynamic`), no size table in any client bundle.

## Colour (OKLCH, tokens in `src/app/globals.css`)
Every section sets `data-theme`; components only use contextual tokens (`bg-surface`, `bg-surface-2`, `text-fg`, `text-fg-muted`, `text-fg-dim`, `border-line`, `border-line-strong`, `border-line-faint`, `text-accent`, `bg-accent`, `text-accent-fg`, `text-signal`). Change a theme block and every section using it follows.

Brand roots: wordmark indigo `--brand-indigo`, logo azure `--brand-azure`, logo cyan `--brand-cyan`, `--snow`. The edge: `--night` (indigo-black), `--edge` (the bright core of a glass edge, `oklch(0.88 0.08 222)`), `--edge-deep` (its body, = azure) and `--edge-gradient` (deep, bright core, deep: the gradient of a gauge bar). `--mist` is the mist surface as a fixed colour (the header row of a table on a frost page). `--tint-azure` and `--tint-azure-2` are the values of the retired azure section theme, for small surfaces only (chips).

| Theme | Surface | Type | Used for |
|---|---|---|---|
| `frost` (default) | clean cool white | softened brand indigo | reading, catalogue, product |
| `mist` | pale cool blue-grey | indigo | alternate daylight bands, the spec plate, the table header |
| `night` | indigo-black `0.17 0.045 280` | frost white, cyan accent | cinematic chapters, the closing call, the footer, the mobile menu |
| `deep` | brand indigo | frost white, cyan accent | one statement per page (vision, 404) and the blueprint chapters of the cutting service (home machine, the service page's hero + bed scene as one chapter, the plastics cutting band), plus two small tiles that are not sections (the mega-menu cutting card, the company 2025 tile) |

`azure` is retired as a section theme.

**Contrast.** Every text token reaches 4.5:1 on both surfaces of its theme. Measured (surface / surface-2):

| Theme | `fg` | `fg-muted` | `fg-dim` | `accent` | `text-signal` |
|---|---|---|---|---|---|
| `frost` | 13.8 / 12.8 | 7.2 / 6.7 | 5.3 / 4.9 | 5.3 / 4.9 | 5.8 / 5.4 |
| `mist` | 12.6 / 11.5 | 7.1 / 6.5 | 5.5 / 5.0 | 5.4 / 4.9 | 5.3 / 4.8 |
| `night` | 17.6 / 16.2 | 11.4 / 10.5 | 7.7 / 7.1 | 12.0 / 11.0 | 8.2 / 7.5 |
| `deep` | 14.2 / 11.9 | 9.1 / 7.6 | 6.2 / 5.2 | 9.2 / 7.7 | 6.3 / 5.3 |

So `fg-dim` is for quiet labels, never for body text, and nothing uses opacity to dim text. The kit page shows every token on every surface, so the harness checks them all. Non-text graphics need 3:1: the blueprint's lines on `deep` (white at 55%) are 5.1:1 and its cut path (`--edge`) 10.6:1; a gauge bar (`--edge-deep`) is 3.7:1 on frost and 3.4:1 on mist.

**`--signal`** is the one error colour (the estimator, form errors), always with an icon and words, never colour alone. It is `oklch(0.52 0.19 27)` by day and `--signal-night` (`oklch(0.75 0.14 30)`) on night and deep; the contextual token `text-signal` picks the right one. (DIRECTION.md says `0.55`; at 0.55 it is 4.25:1 on mist surface-2, the estimator's panel, so it is a little darker.)

**On photos** text sits on a scrim that the harness verifies from pixels (the cinematic hero has one at the top for the transparent header, one at the bottom for the title). Over a dark first section the header wears the night tokens until its glass capsule arrives: a page hero with `data-hero="dark"` as the first child of `main` does it (`body:has(...)` in globals.css; it also swaps the logo and turns the light glass chips into dark ones). Such a section must carry a gradient layer under the header, as the cinematic hero's scrim is (the surface itself fading out: over a flat hero it changes nothing you can see): the header is fixed, not inside the section, so without it the harness reads its text as lying on the frost body and fails contrast; with it the harness samples the real pixels. The 404 needs the same.

Never: green or aqua tints, gradient text, opacity-dimmed text, coloured shadows, more than one accent per view. Colour mixes use `color-mix(in oklab, …)`: Chrome serialises the tokens as `lab()`, and mixing two near-neutral colours in `oklch` loses their hue (the spec plate turned pink).

## Type
Three voices, all via `next/font/google` in `src/lib/fonts.ts` (subsets `greek` and `latin`, `display: swap`):

- **Display**: Sofia Sans Extra Condensed (800 for claims, 700 for titles, 200 for year numerals), uppercase only. Tall like panes in a rack, superb Greek capitals.
- **Text**: Sofia Sans, variable. Humanist, excellent Greek lowercase. Everything that is read.
- **Spec**: **JetBrains Mono**, variable, only 400 and 500 used (`--font-mono`, `font-mono`). For numbers, units, codes, dates, counts, indexes and uppercase labels; never running text or headings. `font-variant-numeric: tabular-nums` on every mono and on display numerals that align (years, phone).

The scale is in `src/app/styles/type.css` (components layer, so `font-semibold` or `text-fg-muted` still compose). Each size grows linearly from 390px to 1440px of viewport and is clamped at both ends.

| Class | 390 → 1440 | Leading | Face and use |
|---|---|---|---|
| `t-giga` | 96 → 288 px | 0.82 | display 800, **digits only**: "13.000", "6.050", "404" |
| `t-mega` | 68 → 224 | 0.86 | display 800: home hero title, contact title, the closing phone number from lg |
| `t-display` | 52 → 128 | 0.9 | display 800: page titles (≤ 24 characters), chapter titles |
| `t-h1` | 40 → 88 | 0.94 | display 700: long page titles, product titles |
| `t-h2` | 32 → 60 | 1.0 | display 700: section titles, index row titles from lg |
| `t-h3` | 24 → 34 | 1.08 | display 700: list rows, card titles, mega-menu groups |
| `t-lead` | 19 → 23 | 1.45 | text: leads, article prose |
| `t-body` | 17 → 18 | 1.6 | text: running text (the page default) |
| `t-small` | 16 / 15 from md | 1.5 | text: captions, menu items, small print |
| `t-data` | 15 | 1.4 | mono, tabular: table cells, gauge values, codes, dimensions |
| `t-label` | 12.5 | 1.2 | mono 500, uppercase, tracked 0.08em: eyebrows, indexes, breadcrumbs, chips, counts |

Helpers for the closing call and tight cells: `t-lg-h1`, `t-lg-h2`, `t-lg-display`, `t-lg-mega` (the next size up from lg) and `t-xl-h1` (from xl). Tailwind cannot put a breakpoint in front of these (`lg:t-h2` does nothing); the media query is inside the class.

Rules: nothing readable under 16px on a phone except `t-data` (15px, digits) and uppercase `t-label`; running text ≤ 68ch; headings balanced and passed whole to `MaskedLines`; one `h1` per page; no `text-sm…text-4xl`, no `text-[…]`, no `!` overrides. **Units keep their SI case inside uppercase labels**: wrap them in `<span class="unit">` (or pass the text through `Units`), so a label reads "2–19 mm", "22,20 m²", "9 kW", never "MM" or "M²" (M is mega). Numbers are Greek everywhere (decimal comma, thousands dot: "2,1 × 6,05 m", "2.100 × 6.050 mm") with a no-break space before the unit and around "×" (`formatMm` in `src/lib/machine.ts`).

Greek capitals: `<html lang="el">` drops the accents of capitals but keeps the dialytika ("ΠΡΟΪΟΝΤΑ"). Masks keep 0.22em above and 0.12em below each line.

Exceptions (decorative or viewport-sized, outside the scale on purpose): `.wordmark`, the outlined "Alfaglass" closing the footer (`aria-hidden`); the plastics marquee (`.marquee-text`); the home history numerals (`font-display` at weight 200 with a viewport-sized clamp, lane Home). The manifesto exception is gone with the manifesto (its statement moved to the company page as plain type).

## Layout
- **Shell**: `.shell`, max 108rem, gutter `--gutter: clamp(1rem, 4vw, 3.5rem)` (16px at 390, 56px at 1440). Below `md` one column.
- **Grid**: 12 columns from `md` with `gap-8`, and only these patterns:

| Pattern | Columns | Use |
|---|---|---|
| P1 Section header | eyebrow + title 1–7, intro or link 9–12, bottom-aligned | `SectionHeader` |
| P2 Story | label 1–4, running text 6–12 (max 68ch) | company story, "about" essays |
| P3 Media + text | media 1–7, text 9–12, centred (may mirror) | logistics, operation |
| P4 Full width | 1–12 | lists, tables, galleries |
| P5 Sticky split | sticky column 1–5 (`lg:sticky lg:top-[calc(var(--header-h)+2rem)]`), scrolling column 7–12; stacks below lg | home plastics, company history, product data sheet |
| P6 Full bleed | edge to edge, outside `.shell`; content inside still aligns to the shell | night chapters, panoramas |

A column of running text narrower than about 45 characters does not exist: between 768 and 1023px P1, P2, P3 and P5 split at `lg:`, not `md:`.
- **Spacing**: Tailwind's 4px steps, of which the layout uses only `gap-8` (grid gutter), `mt-5` (eyebrow → title), `mt-6` (title → body), `mt-10` (body → actions), `mt-16` / `md:mt-24` (block → block, variable `--block`), `section-y` (80–176px, `py-section`) around every section and `py-chapter` (`--spacing-chapter`, 96–224px) around a night chapter.
- **Rack lines** (`RackLines`): the twelve column boundaries of the shell as 1px hairlines (`--line-faint`) behind a section, like the pilasters of the building and the uprights of a glass rack (four on a phone). Static, `aria-hidden`. Used in: the home hero, the index hero (catalogue groups, news list), the closing call, the 404. Nowhere else.

## Surfaces and materials
- **Glass** (`.glass`, `glass-thin`, `glass-thick`, `glass-dark`, `glass-sheen`, in `styles/glass.css`): one CSS material built to read as a real pane: frosted body (backdrop blur and saturation), a bright bevel on top and a faint depth line below, a 1px rim fading from bright white to cool silver, a soft sheen. Only where something passes behind it, never glass on glass, bigger surface = thicker frost; elements using it must be positioned. Falls back to near-solid for `prefers-reduced-transparency`, `prefers-contrast: more` and browsers without backdrop-filter. Where it lives: the header capsule (thick glass, once you scroll), the menus (thick), small buttons and chips over imagery (thin), the closing call's pane (dark), the hero panes and the facilities pane (moving, so tint and rim only).
- **Fluted glass** (`.fluted`): ribs and a soft azure radial on a night surface. The closing call's pane (`.cta-pane`) is this over dark glass.
- **Specimen plate** (`SpecimenPlate`): how every product and category photo is shown. A `bg-snow` plate with a 1px hairline, the photo `object-contain` (its colour is information: never graded, never cropped), never larger than its source (`mediaSize`), 4:3 (5:4 for a portrait source), corners 2px, no shadow, a mono caption row under it ("ΕΙΚ. 01/05"). On hover (pointer devices) its top edge catches the light.
- **Spec plate** (`SpecPlate`): an etched nameplate: hairline frame, four 6px corner rivets, cells (or rows) separated by hairlines, a mono label above a display value. The company facts, the facilities numbers, the machine's data sheet, a case study's facts.
- **Grain** (`.grain`): a static 3% noise over a night chapter with photos; it hides the JPEG blocks of the legacy photos. A 128px tile (`public/media/grain.png`, drawn once by `scripts/grade-media.mjs` from `feTurbulence`) on a pseudo-element: no DOM, no a11y node.
- **Etched** (`.etched`) lettering, the stamp's.

## Imagery
The photos are honest but old (2000px at best, product shots median 756px, some stock). Rules:
1. **Grade offline, once** (`scripts/grade-media.mjs`, `sharp`): `<id>-night.jpg` is a duotone (Rec. 709 luminance with a gentle S-curve, lift 0.04, gamma 0.95, through `#0d0b22` → `#3b4f8f` at 0.55 → `#eef3fb`); `<id>-day.jpg` has saturation × 0.82, a cooled white balance and blacks lifted 6% toward `#1b1a3f`. No runtime CSS filters or blend modes on large photos. The sources: the warehouse interior (`439a284966`), the façade under a stormy sky (`f85c9da8d8`, the same file as `b2fdf78b2e`, so graded once) and under a clear sky (`d32636d1bc`), the trucks panorama (`4b79e00574`), the aerial panorama (`9a0710970e`), a stock office façade (`d43cadbad1`); the two engravings (`c0c7dff009`, `1232fb0c7b`) night only, with their highlights held down so the paper does not glare in a night chapter. The paths are in `imagery` (`src/lib/content.ts`): `warehouseNight`, `warehouseDay`, `buildingDay`, `buildingNight`, `facadeDay`, `facadeNight`, `trucksDay/Night`, `aerialDay/Night`, `officeDay/Night`, `engravingNight`, `engravingStripNight`. The plain names (`warehouse`, `building`, …) are the legacy files.
2. **Night duotone** behind type (the warehouse scene, closing chapters); **day grade** where the photo is the content (the building, the trucks strip, facilities). **Never grade product photos.**
3. **Never upscale.** Full bleed only for sources ≥ 1900px wide; at viewports wider than the source the photo is capped (`max-width` = source width) and centred on the night surface. Panoramas keep their proportion; on phones they become a pannable strip.
4. Product and category photos always sit in a `SpecimenPlate`. Stock lifestyle photos never appear in a first screen.
5. Every content image has a meaningful Greek `alt`; a graded variant uses the alt of its source.
6. **No fake photos.** The machine is shown only as the drawing until ALFA GLASS's own machine is photographed and filmed: no renders, no supplier pictures, no stock CNC photos. The same for Έργα: only real jobs, with the client's permission when a client is named. Stock architectural images are illustrations of glass, never captioned or alt-texted as ALFA GLASS premises; `89ab25fcb9` has baked-in English text and is never used.

## Motion
Easings (tokens): `--ease-out: cubic-bezier(0.22, 1, 0.36, 1)` (expo-out, the default), `--ease-in-out: cubic-bezier(0.65, 0, 0.35, 1)`, `--ease-glint: cubic-bezier(0.45, 0, 0.2, 1)`. No bounce, no spring overshoot. Only `transform` and `opacity` animate. Scroll-linked motion uses CSS scroll timelines (`view-timeline`, always with `view-timeline-inset: 0`: the default inset is the page's `scroll-padding-top`, which would start a pinned scene already partly played); the base rule is the final frame. Everything respects `prefers-reduced-motion`; `MotionConfig reducedMotion="user"` at the root covers Motion's.

| Name | What | Where it is in the code |
|---|---|---|
| `rise` | translateY 24px → 0 and opacity, 1100ms expo-out, stagger 80ms | `.hero-rise`, `.hero-fade` (globals.css): everything above the fold, CSS on first paint |
| `mask` | each heading line from 105% to 0 inside its mask, 900ms, stagger 80ms | `MaskedLines` |
| `fade-rise` | translateY 16px → 0 and opacity, 700ms | `Reveal` (`[data-rv]`) |
| `glint` | a 40%-wide band of light crosses an element once, skewed, 1200ms `--ease-glint` | `.glint` (hover and focus, pointer devices), `.glint-enter` (as a pane scrolls in), `.glint-edge` (a specimen plate's top edge) |
| `lift` | translateY 0 → -4px | `.lift` (pointer devices) |
| `edge-in` | gauge bars grow from the base, 600ms expo-out, 30ms apart | a transition armed by `Reveal`'s observer: a gauge on screen at load never waits, and a full-page screenshot, reduced motion and print show it finished |
| `drift` | a panorama settles: scale 1.18 → 1 and translateX 4% → 0 over `cover 0% → 60%` | `.drift` (scroll timeline) |
| `fill` | a 1px edge line fills down a list | `@keyframes fill`, `.fill` (the company history) |
| `marquee` | translateX loop, 40s linear, paused on hover | `Marquee` |
| `sweep`, `wipe-clip` / `wipe-content`, `zones`, `zoom-out` | the machine drawing: the gantry crosses the bed; a window opens over the cut path and the dimensions (counter-translating clip box and content, which replaces `stroke-dashoffset`, a paint property); the vacuum zones light one by one; the drawing settles from 2.6× (1.8× below md) to its size, laid out at the start size so the raster is crisp at both ends | keyframes in `motion.css`; the base rule (kit.css) is the finished drawing; the lanes attach `animation-timeline` and ranges |
| `film-in` | a video fades in over its poster once `playing` fires, 300ms | `MediaLoop` |
| `route`, `morph` | the old page fades out in 160ms and the new one in 240ms; a product photo with the same `spec-<slug>` name on a card and on the product page morphs in 380ms | `<ViewTransition>` once around every page (`app/[lang]/[[...path]]/page.tsx`), `Morph` around a specimen plate; CSS in `motion.css`; off with reduced motion |
| `lightbox` | opacity and scale 0.98 → 1, 240ms | `dialog.lightbox` |
| `filter` | the Έργα cards re-flow on a filter change with `document.startViewTransition` (a shared name per card), 300ms expo-out; instant without support or with reduced motion | the lane sets `data-vt="filter"` on `<html>` for the length of the transition; the CSS is in `motion.css` |

View transitions are a bonus, never a dependency: `ViewTransition` ships with the React canary that the App Router uses, and without it, or without browser support, pages simply render. The header carries no `view-transition-name`: a named element is a backdrop root, and its glass would stop seeing the page behind it.

Focus: `:focus-visible` is a 2px solid `--accent` outline with 3px offset (azure by day, cyan at night): the edge of a sheet. Never removed, never only a colour change.

## Components
Shared shells are in `src/components`, the kit in `src/components/kit`. Server components unless marked client.

**Shells**
- `Header` (client): the transparent header over the first screen, a thick-glass capsule after 24px of scroll. Desktop nav: **Προϊόντα ▾ · CNC κοπή · Έργα (only while `features.works`) · Εταιρεία ▾ · Επικοινωνία**; a phone pill (mono digits, never wraps), from 1280 a dark "Ζητήστε προσφορά" pill (mailto), ΕΛ|EN. "Προϊόντα" opens the rack: one thick-glass panel with a column per group (a mono index, the name, a mono count; `t-h3` header links), a mono line "75 ΠΡΟΪΟΝΤΑ · 14 ΚΑΤΗΓΟΡΙΕΣ" with the phone, and a fourth column, the cutting card, on `deep` (a `MachineBlueprint mini`, "ΦΥΛΛΑ ΕΩΣ 2,1 × 6,05 m", two links; the drawing drops out from 1024 to 1279). "Εταιρεία" is a small dropdown (Η εταιρεία, Εγκαταστάσεις, Ιστορία, Νέα, Οικονομικές καταστάσεις). Panels open on click and on hover-intent (150ms), close on Esc and on a press outside, focus stays in DOM order. Below lg a native modal `<dialog>` on night: big links with mono indexes, Προϊόντα and Εταιρεία expand in place, then the phone, the email and "Έλεγχος & αίτημα κοπής". The active item is marked (`aria-current`) and the ΕΛ/EN switch goes to the same page in the other language. All of it is computed in `SiteShell` and passed down, so the catalogue never ships to the browser.
- `Footer`: night, continuing the closing call (a hairline between): the brand line, four columns (Προϊόντα, Κατεργασία, Εταιρεία, Έδρα; 2 × 2 on a phone), the outlined wordmark, the legal row (copyright, legal links, the credit, the ESPA banner on a snow plate). Every link a 44px target; the address is outside the `nav`.
- `Cta` (the closing call): `<Cta lang variant? subject? />`. A night chapter over the rack lines: eyebrow, title (`t-h1`), then the phone number as the largest type on the screen, on a pane of fluted glass with a round call button (`t-display` below lg, `t-mega` from lg, never wraps), then mobile, email (which already knows what you want) and address, each row at least 64px. `variant="default"` ("Καλέστε μας και θα έρθουμε κοντά σας."; with `subject` the title asks about sizes and stock and the email's subject carries the name), `"home"` (adds the stamp cells as a mono line), `"cnc"` (the service page and Έργα: "Στείλτε μας το σχέδιό σας.", the subject "Αίτημα κοπής CNC" or the `subject` given in full, and a row to the estimator). `feature` and `band` are the old names for `home` and `default`. Omit it on the contact page.
- `PageHero`: `variant="default"` (the foundation's hero, with `compact` for the catalogue), `"index"` (no photo: title, a mono `facts` line, the lead clipped to 100 characters, rack lines; catalogue groups and the news list) and `"cinematic"` (a full-bleed photo through `media: Slot`, 88svh and 70svh on a phone, the crumbs at the top and the title bottom-left on a scrim, lead and mono `facts` under it; `theme="deep"` for the CNC hero; `fallback` is what an empty slot shows; `children` are the actions; it sets `data-hero="dark"` so the header turns light on it). Everything is in the server HTML and enters with CSS animations; the photo is the LCP (`preload`, never upscaled).
- `Breadcrumbs`, `SectionHeader` (a mono eyebrow `02 — ΥΑΛΟΠΙΝΑΚΕΣ`, a title, intro and link; P1), `Eyebrow`, `ArrowLink`, `Prose`, `MetaList`, `Reveal` (with `attrs`), `MaskedLines`, `.text-link` (a link that is visibly a link and a 44px target). `Stamp` stays until the home manifesto is deleted.

**Catalogue primitives (kit)**
- `EdgeGauge` `{ values, size: "sm" | "md" | "lg", label?, lang }`: one bar per thickness, as wide as the sheet is thick (0.9, 1.6 or 3 px per mm; 2 below md for `lg`), in the glass-edge gradient. `sm` and `md` show one caption ("2–19 mm") after the bars; `lg` puts each value under its bar in a slot of at least 2.6ch. `role="img"` with the thicknesses in words. Renders nothing without values.
- `EdgeIndex` `{ lang, rows: { href, title, summary?, image, count?, values? }[], thumbnails?, titleSize?: "h2" | "h3", headingLevel? }` (client): a row per family or product: mono index, name (`t-h3`, `t-h2` from lg), a two-line summary (from xl), the gauge, a mono count, a round arrow; every row has the same columns, so gauges and counts line up. The cursor preview follows a mouse and never downloads on touch; touch devices get a 72px thumbnail. Hover lifts the row and a glint crosses it. `IndexList` is the foundation's version, until the lanes replace it.
- `SpecimenPlate`, `SpecimenCard` `{ lang, href, title, image, slug?, index?, values? }` (the plate carries the view-transition name `spec-<slug>`), `Morph`.
- `SpecTable` `{ table, label }` with `splitSpecHtml(html)` and `thicknessOf(line)` in `src/lib/spec-table.ts`: the legacy product tables (41, with rowspans, colspans and paragraphs in cells) read into data and rebuilt: mono and tabular, hairlines only, a mist header row, thicknesses as chips, a row tint on hover, a sticky first column and a fade on the edge that has more to show below lg. Scrolls inside its own container, never the page.
- `SpecPlate` `{ items: { label, value, unit? }[], layout: "cells" | "list", columns }`.
- `Marquee`, `AttikiExit` (the motorway, exit 4 and the pin as a schematic: a static SVG with the words as HTML), `RackLines`, `Units`.

**Media (kit)**
- The registry `src/lib/media-slots.ts`: `slots.warehouse`, `drone`, `building`, `machineStill`, `machineFilm`, each a `Slot = { still?: Still, loop?: Loop }` (`Still = { src, alt, focal? }`, `Loop = { label, poster, sources }`). Every slot looks finished today with what exists and takes the new material by changing one line of data. An empty slot (`{}`) renders its designed fallback, never an empty box and never a "coming soon" label. The alt text of a still is Greek; a page in another language passes its own to `MediaSlot`.
- `MediaSlot` `{ slot, ratio, ratioMd?, sizes, preload?, fit?, fallback?, caption?, alt?, drift?, fill? }`: reserves its space with `aspect-ratio`, paints the still (or the poster) with `next/image` (`preload` only for a first-screen hero), and only when the slot has a loop renders the client island `MediaLoop`, which follows the rules in "Performance rules" and always has a 44px play/pause button (label "Παύση: …" / "Αναπαραγωγή: …", `aria-pressed`). `data-qa-dynamic` on the video.
- `DroneBand` `{ slot, caption, theme? }`: the full-bleed aerial band. With a still (today the aerial panorama, day grade) it settles into its frame from md (`drift`) and is a 220px pannable strip at its natural ratio on a phone, with a hint; with a loop it is 21:9 from md and 4:5 below. `theme` is `night` by default; use a daylight one where the page already has three night chapters (the home page).
- `MediaGallery` `{ items, layout: "strip" | "plates" | "editorial", morph?, preloadFirst?, label }` and the `Lightbox`: `strip` is the product gallery (snap-scrolling specimen plates, arrows, a mono counter, thumbnails), `plates` small plates in a row, `editorial` the rhythm of a case study (7 + 5, 5 + 7, 4 + 4 + 4 at 1440; 6 + 6 at 768; one column on a phone; each image in its own ratio, never upscaled). Every item opens a native modal `<dialog>` on night (focus trap, Esc, a click on the backdrop; a scroll-snap track of full images, only the current one and its neighbours loaded; ← → keys; a swipe; a mono counter; focus returns to the item). `LightboxFrame` shows its inside in a box (the kit page).
- `MachineBlueprint` `{ variant: "full" | "band" | "mini", orientation, tone, piece?, gantryAt?, id? }`: the machine as a plan view in millimetres: the 6.050 × 2.100 bed with its 8 vacuum zones and T-slots, the gantry (a 260 mm beam, the spindle carriage, 8 tool positions), a person in plan for scale, dimension lines with arrowheads, a demo cut path (a façade cassette with V-grooves, a sign panel, six discs; no letters, no logos), and the word "ΣΧΗΜΑΤΙΚΟ" (the zones and slots are schematic, the dimensions are the machine's). `full` has every layer and the callout anchors (`BLUEPRINT_ANCHORS`: zones, gantry, carriage, path, bed); `band` everything but the anchors; `mini` the bed and the gantry in about 2 KB (the menu card, the 2025 tile, the estimator). `piece` draws one piece to scale from the origin corner, turned when it only fits turned, and when it does not fit the box grows, the bed stays and what sticks out is hatched in `--signal`. `role="img"` with `d.machine.drawingLabel`; the labels are HTML (crisp at every size, checked by the harness). Layers are separate elements (`.bp-base`, `.bp-dims` and `.bp-path` (each a clip box `.bp-wipe` around `.bp-wipe-in`), `.bp-gantry` (inside the clipping track `.bp-gantry-box`), `.bp-zone`, `.bp-labels`) so they move on the compositor. The choreography belongs to the lanes: add `bp-zoomable` for the 2.6× zoom (`--z0`), set `--bp-rest` for where the gantry rests, attach `sweep` to `.bp-gantry`, `wipe-clip` / `wipe-content` to `.bp-wipe` / `.bp-wipe-in`, `zones` to `.bp-zone` (`--i`), `zoom-out` to `.bp-zoom`; the scene's stage must clip (`overflow: hidden`), the drawing is larger than its box at the start. Portrait (below md in the service scene) swaps the axes. The drawing is a size container (`container: bp / inline-size`, so its words can stack when it is narrow): give it a parent with a width, never put it in a shrink-to-fit box.

## Data and helpers
- `src/lib/machine.ts`: `BED` (`{ x: 2100, y: 6050, z: 300 }`), `fitsBed(w, h)` (`"fits" | "rotated" | "out"`), `MATERIALS` (13, glass is never one: nothing may suggest that the router cuts glass), `STOCKED` (the product slugs ALFA GLASS stocks per material), `OPERATIONS`, `APPLICATIONS`, `materialOfProduct(slug)`, and the Greek number helpers `formatMm`, `formatNumber`, `formatArea`. The words are in `d.machine` (`src/lib/i18n.ts`). The machine's maker, its component makers and its price are never written.
- `src/content/thickness.json` and `scripts/extract-thickness.mjs`: the thicknesses of each glass and plastic product, by a strict rule (only `yalopinakes` and `plastika-fylla`; not the safety family nor the plastics accessories; a "Πάχ" column, a matrix header or a list after a paragraph about thickness; a column or list is trusted only when every line in it is a thickness, so "04mm, 06mm & 44.1" drops the whole column; deduplicated, sorted, 1 to 30 values). `productThickness(slug)`, `familyThickness(category)` (the union of its products' values, shown only when at least half of them have values: today float, decorative, mirrors, reflective, plastics) and `thicknessRange` are in `src/lib/content.ts`. 26 of 54 products have values; a gauge is missing where the content does not say, never invented.
- `enquiryHref({ subject, body? })` in `src/lib/contact.ts`: a `mailto:` with a prefilled subject and body, Greek percent-encoded.
- `historyTimeline(lang)`: the content's timeline plus 2025, the machine (it lives in the dictionary, not in `site.json`).
- `src/lib/features.ts`: `features.works` is on at three real works (or with `NEXT_PUBLIC_WORKS_FIXTURE=1` in a QA build; the variable must keep its `NEXT_PUBLIC_` prefix, so server and client agree). `src/content/works.ts` holds the `Work` type and the (empty) list. While the flag is off there is no "Έργα" in the header, menu or footer, no section on home, no link from the service page, no `/erga*` in the sitemap, and `robots: noindex` on those pages; `/erga` still answers 200 with its empty state.
- Routes (`src/lib/routes.ts`): `service` (`/cnc-kopi-katergasia`, `/en/cnc-cutting`), `works` (`/erga`, `/en/projects`), `work` (`/erga/<slug>`); the English slugs are provisional. `indexable(route)` keeps Έργα out of the sitemap. The service page carries `Service` JSON-LD (`serviceType` "CNC κοπή και κατεργασία", the existing organization as provider, nothing else) and a `BreadcrumbList`.
- `geoCaption(lang)` in `src/lib/seo.ts`: the coordinates as a mono caption ("38.0858° Β · 23.6183° Α · ΑΣΠΡΟΠΥΡΓΟΣ") for the drone band.

## CSS architecture
`src/app/globals.css` holds the tokens and themes, `@theme`, the base rules, layout (`.shell`, `.section-y`), the legacy-prose styles, the entrances (`hero-rise`, `[data-rv]`, `mask-*`) and the reduced-motion rule. Everything else is imported into the **components layer** in this order, so a lane stylesheet wins a tie with a System rule and Tailwind utilities still win over both:

`styles/type.css` (the scale) · `styles/glass.css` (glass, fluted, etched) · `styles/motion.css` (keyframes, glint, lift, drift, fill, view transitions) · `styles/kit.css` (every kit component, the shells and the machine drawing) · then the lanes' own, created empty by the System: `styles/home.css` (which holds the home scroll scenes, moved out of globals.css so the Home lane owns them), `company.css`, `catalogue.css`, `service.css`, `misc.css`.

## Content pipeline
`scripts/scrape-legacy.py` caches the legacy site, `scripts/build-content.py` turns it into `src/content/*.json` and `public/media/*`; then `node scripts/media-sizes.mjs` writes `src/content/media-sizes.json` (the natural size of every image), `node scripts/grade-media.mjs` writes the graded photos and the grain, `node scripts/extract-thickness.mjs` writes `src/content/thickness.json`. Films go into `public/video/` (encoding commands and framing in its README). Legacy URLs 308-redirect to the new ones (`next.config.ts`).

## QA
`npm run qa` is the harness (`scripts/qa/README.md`). The System adds no gate and weakens none; it adds pages: the groups `service` and `works` in `scripts/qa/pages.json`. The kit page shows every component in its states and is the evidence while no page uses the whole kit: it answers 404 unless the site was built with `KIT=1`, is never linked and never in the sitemap.

```bash
KIT=1 npm run qa -- --pages /kit --label system-kit     # the kit page, at three widths
npm run qa -- --label system-1 --port 3100 --jobs 3      # every group
```

The kit page holds a 4 s, 720p, silent test clip made from the warehouse photograph (`public/video/kit/test-720.mp4`, with its poster `public/media/kit-test-poster.jpg`): delete both when the first real film lands.

## Rules for the lanes
- Dictionary: new strings go under the lane's own namespace in `src/lib/i18n.ts` (`home`; `company`, `facilities`; `catalogue`, `service`, `estimator`; `news`, `contactPage`, `links`, `notFound`, `works`; each created empty by the System), in `el` and with a literal English value in `en`, so the build compiles. Existing English strings are never changed.
- A lane never edits `globals.css` or a System file; a shared change it needs is a `global` item in its hand-off.
- Tokens only (surface, fg, line, accent, edge), only the type scale, only the spacing steps; animate transform and opacity; the base rule of a scene is its final frame; nothing above the fold waits for JavaScript.
