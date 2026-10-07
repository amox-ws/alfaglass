# ALFA GLASS website

Redesign of [alfaglass.gr](https://alfaglass.gr): Next.js 16 (App Router), Tailwind CSS 4 and React Three Fiber (the home hero's glass, on capable desktops only).

## Develop

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Languages

Greek is the default and lives at the root (`/etaireia`, `/yalopinakes/...`); English lives under `/en` with English slugs (`/en/company`, `/en/glass/...`).

- Every page is rendered by one catch-all route, `src/app/[lang]/[[...path]]/page.tsx`, which resolves the URL through the route table in `src/lib/routes.ts` and picks a view from `src/views` or `src/components/catalog/views.tsx`.
- `src/proxy.ts` rewrites unprefixed (Greek) URLs to `/el/...` internally and redirects `/el/...` to the unprefixed form.
- UI copy lives in `src/lib/i18n.ts` (one dictionary per language). Content lives in `src/content/el` and `src/content/en`, linked by the legacy page and product ids.
- The header language switch (ΕΛ / EN) links to the same page in the other language; pages also emit `hreflang` alternates and the sitemap lists both languages.

## Structure

- `src/app/[lang]`: root layout (sets `<html lang>`) and the catch-all page. All pages are statically generated. `src/app/global-not-found.tsx` is the designed 404 (Next's `globalNotFound` option), in the language the proxy names.
- `src/components`: the shared frame and building blocks: `SiteShell` (header, main, footer), `Header`, `Footer`, `PageHero`, `SectionHeader`, `Cta` (the closing call), `Reveal` / `MaskedLines` (`reveal.tsx`). Rules and tokens are in `DESIGN.md`.
- `src/components/kit`: the design system's parts: `EdgeGauge`, `EdgeIndex`, `SpecimenPlate`, `SpecTable`, `SpecPlate`, the media kit (`MediaSlot`, `DroneBand`, `MediaGallery` with its `Lightbox`) and `MachineBlueprint`, the CNC machine drawn to scale.
- `src/app/styles`: the stylesheets `globals.css` imports (type, glass, motion, kit) and one per lane (home, company, catalogue, service, misc). The home scroll scenes (Facilities, History) run on CSS scroll timelines in `styles/home.css`; see `DESIGN.md`, "Motion".
- `src/views`: page views (home, company, facilities, news, contact, links, legal, the CNC service, Έργα).
- `src/components/home`: home page sections, including the WebGL glass hero (`GlassScene.tsx`, desktop only) and its CSS glass panes (`Hero.tsx`).
- `src/components/catalog`: catalogue views, product gallery and index lists.
- `src/lib/media-slots.ts`: the places for photographs and films (a still today, a film when it exists: one line of data). `public/video`: the films, with their encoding commands.
- `public/media`: images from the legacy site (resized). `public/docs`: PDFs.
- `next.config.ts`: 308 redirects from every legacy URL (Greek and English) to its new address.

## Content pipeline

```bash
python3 scripts/scrape-legacy.py .legacy
python3 scripts/build-content.py .legacy          # Greek -> src/content/el (then move the JSON there)
python3 scripts/build-content-en.py .legacy/en    # English -> src/content/en, mirrors the Greek ids
```

Requires Python 3 with `beautifulsoup4` and `Pillow`. After `public/media` changes, run `node scripts/media-sizes.mjs` to refresh `src/content/media-sizes.json` (natural image sizes, used so no photo is shown larger than its file). `node scripts/grade-media.mjs` writes the graded copies of the facility photos (`*-night.jpg`, `*-day.jpg`) and the film grain; `node scripts/extract-thickness.mjs` writes `src/content/thickness.json`, the thicknesses of each product, by a strict rule.

## QA

`npm run qa` is the harness (`scripts/qa/README.md`). The QA-only kit page (`/kit`) answers 404 unless the site is built with `KIT=1`: `KIT=1 npm run qa -- --pages /kit`.

See `PRODUCT.md` for the brief and `DESIGN.md` for the design system.
