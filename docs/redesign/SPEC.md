# Site spec (Greek site, phases 1–3)

Read with [`PLAN.md`](PLAN.md) (process, rubric, gates), [`../../DESIGN.md`](../../DESIGN.md) (identity, tokens, glass, performance rules) and [`../../PRODUCT.md`](../../PRODUCT.md) (brief). English pages are out of scope until phase 4: do not edit English copy or `src/content/en`, but keep the English build compiling.

## North star

ALFA GLASS imports and wholesales flat glass and plastic sheets from its own 13.000 m² warehouse in Aspropyrgos, since 1999. Visitors: glaziers, processors, aluminium fabricators and sign makers (often on a phone, in a hurry); architects and contractors (desktop, want specs); suppliers and partners (judge scale). Every page answers within its first screen: what this is, why trust it, what to do next (call, ask for a quote, find the product). It must feel like a premium industrial brand, not a template: daylight through ultra-clear glass, one signature moment per page, everything else quiet.

Facts allowed in copy: founded 1999 (Drapetsona, moved to Aspropyrgos 2000), 13.000 m² owned premises, 4.000 m² extension 2021, own trucks, counts taken from the content data (families, categories, products), the brands and standards already in the content. Never invent claims (no "100 years", no "unique in Greece", no awards).

## Site-wide requirements (all pages)

### Layout
- **Shell**: `.shell` (max 108rem, gutter `--gutter`). Mobile: one column, side gutter ≥ 16px.
- **Grid**: 12 columns from `md` with `gap-8` (2rem) unless a pattern below says otherwise. Only these patterns:
  - **P1 Section header**: eyebrow + title in cols 1–7, intro (or link) in cols 9–12, bottom-aligned (`md:items-end`).
  - **P2 Story**: label/eyebrow in cols 1–4, running text in cols 6–12 (max 68ch).
  - **P3 Media + text**: media cols 1–7, text cols 9–12, vertically centred; may be mirrored (text 1–4, media 6–12).
  - **P4 Full width**: lists, tables, galleries across cols 1–12.
  Between 768 and 1023px any column that would hold running text narrower than ~45ch stacks instead (use `lg:` for P2/P3 splits when needed).
- **Vertical rhythm**: every section uses `.section-y`. Inside a section: eyebrow → title `mt-5`, title → body `mt-6`, body → actions `mt-10`, block → block `mt-16 md:mt-24`. No ad-hoc paddings (`pt-[9vw]`, `md:pt-16` hacks).
- **Page hero** (`PageHero`): top padding header + 3rem (md + 5rem); title `t-display`, max 18ch; lead `t-lead` max 2 lines on desktop; on catalogue pages the hero must leave the first list item visible above the fold at 1440×900 (hero image max 40svh there).
- **Section header**: one shared component (`SectionHeader`) for eyebrow index + title + optional intro/link, used everywhere instead of the four current variants.

### Typography
- Only the scale classes: `t-mega` (home hero, contact title, 404), `t-display` (page titles, big section titles), `t-h1`, `t-h2`, `t-h3`, `t-lead`, body, `t-label`. Add two text tokens if needed, `t-body` (17px) and `t-small` (14px), and remove the ~20 ad-hoc `text-sm…text-4xl` / `text-[…]` uses and `!` overrides (exceptions must be listed in DESIGN.md with a reason).
- One H1 per page. Page titles use `t-display`; product titles `t-h1` (long names). Pseudo-headings written as `<p>` become real headings of the right level.
- Body ≥ 16px on mobile; running text max 68ch; labels ≥ 12px; uppercase only for display type and labels.
- Excerpts end at a word boundary with "…", never mid-word.

### Colour and contrast
- Raise `--fg-dim` (and small `text-accent`) so every text reaches 4.5:1 on frost, mist and surface-2; azure-section text uses solid tokens instead of `text-fg/75`–`/85`.

### Motion
- Keep every effect that exists (see DESIGN.md "Motion" and "Performance rules").
- `MotionConfig reducedMotion="user"` at the root so Motion-driven effects also respect reduced motion.
- Nothing above the fold waits for JavaScript: `PageHero` title, lead and image are visible in the server HTML (CSS entrance like the home hero, not `Reveal` with `opacity: 0`).
- New effects only on compositor properties (transform, opacity) and, when scroll-linked, on CSS scroll timelines.

### Header
- Fix: on Greek pages the active nav item and the ΕΛ/EN switch must work (today `usePathname()` sees the rewritten `/el/...` path, so nothing is active and the switch always goes to `/en`).
- Mobile (< 768): logo, a 44×44 phone button (tap to call), language switch, menu. The phone is never more than one tap away.
- Phone pill must not wrap at 1024px.
- Mobile menu: a real dialog (focus trap, `aria-modal`, Esc, focus returns to the button), active item marked.
- Mega menu items at least 32px tall.

### Footer
- Greek attribution ("Σχεδιασμός & ανάπτυξη: AMOX" instead of "Powered by AMOX").
- Address and contact outside the `nav` landmark.
- Every link at least 44px tall on touch.

### Calls to action
- One CTA system: the home `Cta` and the catalogue `EnquiryBand` become one component with variants (same type scale, one fluted-glass background, phone, mobile, email; the email visibly a link at rest).
- Product and category pages: "ask about sizes and stock" with phone and a `mailto:` that pre-fills the product name.

### Images
- No upscaling: if the source is narrower than the slot at 1440 × dpr 1, use an aspect ratio that fits the source, `object-contain` on `bg-snow`, or a smaller slot.
- Panoramas (aerial 1926×408, trucks 1936×673) are shown as panoramas (wide strips), not cropped into 16:9.
- Meaningful `alt` for content images; `alt=""` only for decoration.

### 404
- The designed `not-found` page must render for every unknown URL with header and footer, in Greek. Use the global not-found described in `node_modules/next/dist/docs` (read `not-found.md` and the `globalNotFound` option first, per AGENTS.md). Labels and links come from i18n/routes, not hard-coded.

### Content fixes (Greek only)
- Mixed Latin/Greek letters in Greek words (e.g. "Yαλοπίνακες", 14 items): fix in `src/content/el`.
- Product pages: if section 01 "Περιγραφή" starts with the hero summary, do not show the summary twice.
- Stamp in Greek on Greek pages ("ALFA GLASS · ΑΠΟ ΤΟ 1999 · 13.000 Τ.Μ. · ΑΣΠΡΟΠΥΡΓΟΣ").
- Useful-links labels in Greek on the Greek page.

### SEO basics (invisible but required)
- `og:image` for every page (its hero image, else the building photo).
- JSON-LD: `Organization` + `LocalBusiness` (address, phone, geo) on home and contact; `BreadcrumbList` on catalogue pages.

### Not in scope now
- Google Maps consent: the embed loads directly by the client's earlier decision (commit a763e7c). Do not change.
- The cutting-service pillar, machine page and estimator (waiting for the machine's specs).
- English (phase 4).

## Pages

Each page lists: job, sections in order (with pattern), its signature moment, and page-specific acceptance points. Everything in "Site-wide requirements" applies on top.

### 1. Home (`/`)
Job: in one screen, "everything in glass, from our own stock, call us"; then prove scale and range.
1. Hero (keep): WebGL panes on capable desktops, CSS panes elsewhere; meta row; lead; "Δείτε τα προϊόντα" + call button.
2. Manifesto (keep word lighting): the company link becomes a visible link (underline at rest, ≥ 44px target).
3. Glass index (P1 + IndexList, keep cursor previews on desktop; on touch show a small thumbnail per row).
4. Facilities scene (keep) + logistics (P3).
5. Plastics (keep marquee) with the 11 materials.
6. History (keep horizontal timeline; in the swipe fallback show a visible "swipe" hint).
7. Related products bento: no stretched banner image; the fourth card uses an image slot that fits its source.
8. **New: brands band** (quiet): logos of the brands from the useful-links page, greyscale, in one row (wraps to two on mobile), linking to the useful-links page.
9. News (one card, excerpt at word boundary).
10. CTA (unified component).
Signature moments: hero glass, facilities pane, horizontal history (home is the showcase).

### 2. Company (`/etaireia`)
Job: credibility (who, since when, how big, financial transparency).
1. PageHero with the building photo (fits source, meaningful alt).
2. Story (P2 at lg; stacked below lg).
3. **Facts plate** (signature): an etched "spec plate" in the stamp's style with four cells taken from data: Ίδρυση 1999 · Εγκαταστάσεις 13.000 τ.μ. · Οικογένειες υαλοπινάκων 9 · Κωδικοί προϊόντων 75 (computed from content). Not a SaaS metric strip: hairlines, etched type, no icons.
4. Vision (deep theme, one big statement).
5. History (vertical year list, consistent with the home timeline's type).
6. Operation (P3, warehouse + trucks; no photo repeated twice on this page).
7. Financial statements: rows with year, "PDF", file size; working links (no `#` fallback).
8. CTA.

### 3. Facilities (`/egkatastaseis`)
Job: show the scale of the premises and how goods leave the warehouse.
1. PageHero (warehouse photo).
2. Storage: title ≤ 2 lines, text beside it (P1); no `md:pt-16` hack.
3. Photo set: building (P3 media) + **aerial panorama as a full-width strip with a scroll-timeline zoom-out** (signature, transform only) + trucks panorama strip.
4. Find us: address as a heading, directions link, the phone; aligned with the grid.
5. CTA.

### 4. Catalogue: glass group (`/yalopinakes`), category (`/yalopinakes/<category>`), plastics (`/plastika-fylla`), related (`/synafi-proionta`)
Job: get the buyer to the right product fast.
- Group page: shorter hero (lead ≤ 2 lines, image ≤ 40svh) so the first families show at 1440×900; the list (IndexList) comes right after the hero, the "about" essay after the list. Touch: thumbnail + count visible per row. Signature: cursor preview on desktop.
- Category page: hero image without upscaling; product grid right after the hero; then the about text; then sibling categories (the "all categories" link visible on mobile too). Cards: 4:3 `object-contain` on `bg-snow` for non-4:3 sources.
- Plastics group: no duplicated MetaList (one "Υλικά 11" fact); the legacy bullet lists in the about text are removed where they duplicate the grid.
- Related group: a real lead (from `home.relatedText`), a fitting hero image, summaries clamped on mobile.

### 5. Product (`/yalopinakes/<category>/<product>`)
Job: specs and sizes at a glance, then ask about stock.
1. Hero: breadcrumbs, category label, title (`t-h1`). Below 1024px the gallery comes right after the title, then summary and actions.
2. Gallery: swipe on touch (scroll snap), arrows visible on touch, counter and caption chips; image alt from caption or "<title>, εικόνα n".
3. Section nav: sticky anchor nav on desktop (keep); on mobile a horizontal chip row (Περιγραφή · Προδιαγραφές · Εφαρμογές) under the hero.
4. Sections: description (no repeat of the summary), specifications, applications (pills).
5. Spec tables: readable at 390px: horizontal scroll inside the table container with a sticky first column, a fade on the scrolling edge, and no page overflow. This is the product page's signature: a precise, engineered table (tabular numbers, hairlines, glass header row).
6. Related products (≤ 3), "next" link visible on mobile.
7. CTA with the product name in the enquiry.

### 6. News list (`/nea`) and article (`/nea/<slug>`)
- List: H1 "Νέα" (matches the nav), card with photo, date, title, excerpt at word boundary.
- Article: title max 3 lines at 1440 (`t-h1` if longer than ~40 characters); prose at `t-lead`-equivalent size via a real modifier (not the no-op class); logos and small images never upscaled (`object-contain`, max width = source); back link and, when more than one article exists, next/previous.

### 7. Contact (`/epikoinonia`)
Job: reach a person now.
- Keep the big `t-mega` title (signature) and the four contact rows (phone, mobile, email, address) with ≥ 4.5:1 labels; the phone row is the first and largest; the map keeps its glass chip.
- On mobile: phone and email rows first, map after; each row at least 64px tall.

### 8. Useful links (`/xrisimoi-syndesmoi`), legal pages, 404
- Links: Greek labels, `https` links, logo tiles that never upscale, brand data not hard-coded by index.
- Legal: prose left-aligned with the H1 (no centred column under a left title), the legacy first paragraph that repeats the title removed, tables scroll inside their container on mobile.
- 404: see site-wide requirements.

## Foundation scope (phase 1, one worker)

All site-wide requirements above that live in shared files: tokens and contrast, text tokens and scale cleanup in shared components, `SectionHeader`, `PageHero` (server-visible, image fit, heights), unified CTA, header fixes (active state, language switch, mobile phone button, dialog menu), footer fixes, `MotionConfig`, word-boundary excerpt helper, 404, Greek content fixes, SEO basics. Page-specific changes are left to the page groups.
