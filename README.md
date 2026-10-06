# ALFA GLASS website

Redesign of [alfaglass.gr](https://alfaglass.gr): Next.js 16 (App Router), Tailwind CSS 4, Motion and React Three Fiber.

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

- `src/app/[lang]`: root layout (sets `<html lang>`) and the catch-all page. All pages are statically generated.
- `src/views`: page views (home, company, facilities, news, contact, links, legal).
- `src/components/home`: home page sections, including the WebGL glass hero (`GlassScene.tsx`, desktop only) and its CSS glass panes (`Hero.tsx`). The scroll scenes (Manifesto, Facilities, History) run on CSS scroll timelines in `src/app/globals.css`; see `DESIGN.md`, "Motion".
- `src/components/catalog`: catalogue views, product gallery and index lists.
- `public/media`: images from the legacy site (resized). `public/docs`: PDFs.
- `next.config.ts`: 308 redirects from every legacy URL (Greek and English) to its new address.

## Content pipeline

```bash
python3 scripts/scrape-legacy.py .legacy
python3 scripts/build-content.py .legacy          # Greek -> src/content/el (then move the JSON there)
python3 scripts/build-content-en.py .legacy/en    # English -> src/content/en, mirrors the Greek ids
```

Requires Python 3 with `beautifulsoup4` and `Pillow`.

See `PRODUCT.md` for the brief and `DESIGN.md` for the design system.
