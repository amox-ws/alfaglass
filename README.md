# ALFA GLASS website

Redesign of [alfaglass.gr](https://alfaglass.gr): Next.js 16 (App Router), Tailwind CSS 4, Motion, Lenis and React Three Fiber.

## Develop

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Structure

- `src/app`: routes. Catalogue pages are generated statically from `src/content/*.json` (`/[group]/[slug]/[product]`).
- `src/components/home`: home page sections, including the WebGL glass hero (`GlassScene.tsx`).
- `src/components/catalog`: catalogue views, product gallery and index lists.
- `src/content`: site, category and product data extracted from the legacy site.
- `public/media`: images from the legacy site (resized). `public/docs`: PDFs.
- `next.config.ts`: 308 redirects from every legacy URL to its new address.

## Content pipeline

```bash
python3 scripts/scrape-legacy.py .legacy
python3 scripts/build-content.py .legacy
```

Requires Python 3 with `beautifulsoup4` and `Pillow`.

See `PRODUCT.md` for the brief and `DESIGN.md` for the design system.
