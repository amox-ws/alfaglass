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

**Contrast.** Every text token reaches 4.5:1 on every surface of its theme (the worst case counts: `surface-2`, the pale glow of the page hero, the darkest end of the azure gradients). Measured:

| Theme (backgrounds checked) | `fg-muted` | `fg-dim` | `accent` |
|---|---|---|---|
| `frost` (surface, surface-2, page-hero glow) | 7.2 / 6.7 / 6.5 | 5.3 / 4.9 / 4.8 | 5.3 / 4.9 / 4.8 |
| `mist` (surface, surface-2) | 7.1 / 6.5 | 5.5 / 5.0 | 5.4 / 4.9 |
| `deep` (surface, surface-2) | 9.1 / 7.6 | 6.2 / 5.2 | 9.2 / 7.7 |
| `azure` (surface, surface-2, darkest gradient end) | 6.6 / 5.2 / 5.0 | 6.3 / 4.9 / 4.8 | 8.8 / 6.9 / 6.7 |

So `fg-dim` is for quiet labels, never for body text, and nothing uses opacity to dim text (`text-fg/80` and friends are gone: use `text-fg-muted`). Text on photos or glass gets a scrim or a thick-enough tint that the harness can verify from pixels.

Home rhythm: frost hero, frost manifesto, mist catalogue, frost facilities, mist plastics, deep history, frost related and news, azure CTA, deep footer.

## Type
- Display: **Sofia Sans Extra Condensed** (700–800, uppercase; tall like panes in a rack). Year numerals at weight 200.
- Text: **Sofia Sans**.
- Both include full Greek. Uppercase Greek drops accents automatically because `<html lang="el">`.

The whole scale, in `globals.css` (components layer, so `font-semibold` or `text-fg-muted` still compose with it):

| Class | Size (390 / 768 / 1440) | Use |
|---|---|---|
| `t-mega` | 68 / 119 / 223 px | home hero title, contact title, 404 |
| `t-display` | 52 / 64 / 121 | page titles, big section titles, the home call to action |
| `t-h1` | 44 / 46 / 86 | product titles, secondary section titles, big phone number in the feature call to action |
| `t-h2` | 36 / 36 / 63 | section and card titles, the band call to action |
| `t-h3` | 26 / 26 / 33 | list rows, mega-menu group titles |
| `t-lead` | 19 / 19 / 22 | lead paragraphs, key values |
| `t-body` | 17 | running text (the page default; the class is for elements that do not inherit it) |
| `t-small` | 16 / 14 from md | captions, table cells, menu items, small print |
| `t-label` | 12.5, uppercase, tracked | eyebrows, indexes, breadcrumbs, chips |

Rules: nothing readable under 16px on a phone except uppercase labels (≥ 12px); running text at most 68ch; no `text-sm`…`text-4xl`, no `text-[…]`, no `!` overrides; uppercase only for display type and labels; one `h1` per page; pseudo-headings are real headings.

Exceptions (decorative or display-scale, outside the scale on purpose):
- `.wordmark`, the outlined "Alfaglass" closing the footer (`aria-hidden`, sized by the viewport).
- The home manifesto statement, the home history numerals and the plastics marquee (`font-display` with a viewport-sized `clamp`): signature typography of the home page.

## Layout

**Shell.** `.shell`: max 108rem, side gutter `--gutter` (16px on phones, up to 56px). One column below `md`.

**Grid.** 12 columns from `md`, `gap-8`, and only these patterns:

| Pattern | Columns | Component / use |
|---|---|---|
| P1 Section header | eyebrow + title 1–7, intro or link 9–12, bottom-aligned | `SectionHeader` |
| P2 Story | label 1–4, running text 6–12 (max 68ch) | company story, "about" essays |
| P3 Media + text | media 1–7, text 9–12, centred (may mirror) | logistics, operation |
| P4 Full width | 1–12 | lists, tables, galleries |

A column of running text narrower than about 45 characters does not exist: between 768 and 1023px the split stacks, so P1, P2 and P3 split at `lg:`, not `md:` (a quarter of 768px is 214px, about 22 characters).

**Spacing.** Tailwind's 4px steps, of which the layout uses only these:

| Step | Where |
|---|---|
| `gap-8` (32px) | grid gutter; `gap-6` when a P1 header stacks |
| `mt-5` (20px) | eyebrow → title |
| `mt-6` (24px) | title → body |
| `mt-10` (40px) | body → actions |
| `mt-16` / `md:mt-24` (64 / 96px) | block → block inside a section |
| `section-y` (80–176px, token `--spacing-section`, utilities `py-section`, `pt-section`) | around every section; no `pt-[9vw]` hacks |

**Components that carry the rhythm** (use them, do not rebuild them):
- `PageHero`: breadcrumbs (each crumb a 44px target), title (`t-display`, at most 18ch wide; a title longer than 24 characters is set in `t-h1`, at most 30ch), lead, meta, photo. Everything is in the server HTML and enters with CSS animations. The photo is never larger than its source (`mediaSize`, from `scripts/media-sizes.mjs`): a photo at least 1328px wide runs full width as a strip (21:8, a panorama keeps its own proportion), a narrower one sits beside the title from `lg` at most as wide as its file. `compact` (catalogue pages) always uses the side layout, caps the photo at 40svh and keeps the space below the hero short, so the first list items stay above the fold.
- `SectionHeader`: eyebrow index + title (+ intro, + link), P1, stacks below `lg`.
- `Cta`: the one call to action on fluted glass. `feature` closes the home page, `band` closes every other page; `subject` (a product or category name) turns the title into "ask about sizes and stock" and pre-fills the mail subject. Phone first, then mobile and email (underlined at rest).
- `Stamp`: the etched mark, in the language of the page.
- `Breadcrumbs`, `MetaList`, `Prose` (`size="lead"` for article text), `Eyebrow`, `ArrowLink`, `.text-link` (a link that is visibly a link and a 44px target).

**Header.** Floating glass capsule on scroll. Below 768px: logo, a 44px phone button, language switch, menu button. From 768px the phone number replaces the button (it never wraps, also at 1024px). The active section is marked (`aria-current`) and the ΕΛ/EN switch goes to the same page in the other language (on Greek pages the router reports the internal `/el/…` path; `publicPath` removes it). The mega menu (items at least 32px tall) follows its button in the DOM and closes on Esc. The mobile menu is a native modal `<dialog>` with its own top bar: focus trap, Esc, inert page behind it, focus returns to the menu button.

**Footer.** Links and contact on the deep theme; every link a 44px target; address and contact outside the `nav` landmark; the credit reads "Σχεδιασμός & ανάπτυξη: AMOX".

**Images.** No photo is shown larger than its source at 1440px × dpr 1: pick the layout from `mediaSize`, use `object-contain` on `bg-snow`, or a smaller slot. Panoramas are wide strips, never cropped to 16:9. Content images have a meaningful `alt`; `alt=""` is for decoration only.

**404.** Any address that is not a page ends in `src/app/global-not-found.tsx` (Next's `globalNotFound` option, needed because the root layout sits under the `[lang]` segment): the designed page inside the full site frame (header, footer), with status 404. It is rendered per request in the language of the section the address belongs to: the proxy names it in the `x-site-lang` request header, and Greek is the fallback. Labels and links come from the dictionary and the routes (`NotFoundPage`).

**SEO.** Every page has `og:image` (its own image, else the building) and a canonical with language alternates. `Organization` + `LocalBusiness` JSON-LD on home and contact, `BreadcrumbList` on catalogue pages (`src/lib/seo.ts`). Excerpts end at a word boundary with "…" (`excerpt`).

## Motion
- Ease: `cubic-bezier(0.22, 1, 0.36, 1)` (expo-out). No bounce.
- Patterns: masked line reveals (`MaskedLines`), fade-rise (`Reveal`), scroll-linked word lighting (Manifesto), a pane that opens into the warehouse (Facilities), a pinned horizontal timeline (History), cursor-following previews (`IndexList`).
- The three scroll scenes and the closing of the hero panes are CSS scroll timelines ("scroll scenes" in `globals.css`). Their base rules are the final frame: that is what browsers without scroll timelines and visitors with reduced motion see (the timeline becomes a swipeable strip).
- Everything respects `prefers-reduced-motion` (the hero then shows static CSS panes). `MotionConfig reducedMotion="user"` at the root covers everything Motion animates (menus, gallery, hover previews).
- **Nothing above the fold waits for JavaScript.** Page headings, leads and photos enter with CSS animations from the first paint (`hero-rise`, `hero-fade`, `mask-eager`, `img-settle`). `Reveal` and `MaskedLines` leave whatever is on screen at hydration alone and hide-then-reveal only what is below the fold (`data-rv`, a CSS transition on opacity and translate, one shared IntersectionObserver); without JavaScript, with reduced motion and in print everything simply shows.
- `MaskedLines` masks reach 0.22em above and 0.12em below each line (padding cancelled by negative margin), so the dots of Ϊ and descenders are never cut off.

## Glass material
One CSS material in `globals.css` (`@layer components`), built to read as a real pane:
frosted body (backdrop blur + saturation), bright bevel on top and a faint depth line below,
a 1px rim that fades from bright white (top-left) to cool silver (bottom-right), like a polished ultra-clear edge, and a soft top sheen.

| Class | Use |
|---|---|
| `glass` | panels (CTA contact pane, enquiry band, preview frames) |
| `glass glass-thin` | chips and small buttons over imagery or 3D (tint 55%: text on it stays at 4.5:1 over photos) |
| `glass glass-thick` | header capsule, mega menu, mobile menu sheet |
| `glass glass-dark` | over dark photos or the deep theme |
| `glass-sheen` | adds a light sweep on hover (buttons only) |
| `etched` | lettering engraved into a surface (the stamp) |

Rules: only where something passes behind it; never glass on glass; bigger surface = thicker frost.
Falls back to near-solid for `prefers-reduced-transparency`, `prefers-contrast: more` and browsers without backdrop-filter.
Elements using `.glass` must be positioned (`relative`/`absolute`/`fixed`) for the rim.

Where it lives: header becomes a floating glass capsule on scroll; Products mega menu and the mobile menu are thick glass; hero secondary button, product-gallery controls, product-card badges and the catalogue hover preview are thin glass; contact panes in the CTA and enquiry band sit as glass over the fluted pattern; the history caption uses dark glass (tint only, it travels with the timeline); a clear pane with a travelling glare rises over the warehouse photo as you scroll (rim and glare, no blur).

## Signature details
- The "stamp": an etched manufacturer's mark, in the language of the page (ALFA GLASS · ΑΠΟ ΤΟ 1999 · 13.000 Τ.Μ. · ΑΣΠΡΟΠΥΡΓΟΣ). `Stamp` in `ui.tsx`; its cells come from the dictionary.
- Fluted-glass line pattern on azure surfaces.

## Content pipeline
`scripts/scrape-legacy.py` caches the legacy site, `scripts/build-content.py` turns it into `src/content/*.json` and `public/media/*`; `node scripts/media-sizes.mjs` then writes `src/content/media-sizes.json` (the natural size of every image). Legacy URLs 308-redirect to the new ones (`next.config.ts`).
