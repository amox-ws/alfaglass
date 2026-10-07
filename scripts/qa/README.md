# QA harness

Gates, measurements, screenshots and regression diffs for the redesign loop (`docs/redesign/PLAN.md`). Node plus the local Chrome driven over the DevTools protocol: no npm dependencies, no Python. It builds the site, starts `next start` as a child process, loads every page at three widths, and kills the server and Chrome when it ends (also on errors and Ctrl-C).

```bash
npm run qa -- --group home                          # gates + contact sheets for one group (Greek pages)
npm run qa -- --group home --label home-w1 --perf --perf-runs 3
npm run qa -- --label home-w1-regress --skip-build --baseline compare --expect-change home
npm run qa -- --group home --skip-build --baseline save     # store the approved screenshots
npm run qa                                           # every group, Greek pages
node scripts/qa/crop.mjs home-w1:home-el-mobile.png 0 2400 390 700 --scale 2   # zoomed crop of a screenshot
node scripts/qa/selftest.mjs                         # proves the gates fire on seeded defects and stay quiet on intentional design
```

| option | meaning |
|---|---|
| `--group a[,b]` / `--pages x,y` | groups from `pages.json` (home, company-facilities, catalogue, product, news, contact, links-legal), or page ids / URL paths |
| `--lang el\|en\|all` | default `el`. English pages stay in `pages.json` and run with `en`/`all`; the `untranslated` gate only runs then (otherwise "skipped (English phase)") |
| `--label` | output folder `qa/runs/<label>/` (default timestamp) |
| `--port` | port of the `next start` child (default 3100); use another per worktree. Paths are relative to the repo root you run it from |
| `--skip-build` | reuse `.next` (otherwise `next build` runs first and replaces `.next`). Warns in the summary when `src/` or `public/` is newer than the build |
| `--perf`, `--perf-runs N` | mobile profile, a fresh Chrome per run, **median of N runs** is gated; every run is kept in `report.json` |
| `--baseline save` | copies screenshots to `qa/baseline/<group>/` (only the selected group(s); all groups without `--group`) |
| `--baseline compare` | pixel diff against `qa/baseline`. With `--group/--pages`: gates for those pages, the group is reported only, every other baselined group is re-shot and may not change. Without them: a whole-site **regression run** (screenshots only, no content gates; add `--gates` to run them) |
| `--expect-change a,b` | groups that may change: diffed and reported, never failing. A group without a saved baseline is skipped and listed as "no baseline" |
| `--jobs N` | pages loaded in parallel (default 4) |

Exit code 1 if any gate fails (or the build fails), 2 for harness errors, 0 otherwise.

## Pages and viewports

`pages.json` lists one representative URL per template per language (derived from `src/lib/routes.ts` and checked against `/sitemap.xml`; the 404 pages carry `expectStatus: 404`). Each page loads at mobile 390×844 @2 (touch), tablet 768×1024 @2 (touch), desktop 1440×900, and once more at desktop with `prefers-reduced-motion: reduce`. Before checking, the page loads, waits 1.5 s, scrolls to the bottom in half-screen steps and back (scroll reveals play, lazy images load).

## Gates (any failure = exit 1; each item names page, viewport, element and the measured value)

1. **consoleErrors**: `console.error`, uncaught exceptions, failed same-origin requests (the 404 page's own document status is exempt).
2. **overflowX**: `scrollWidth > clientWidth + 1`, and any element that sticks out past the viewport without an overflow container (the site's `body { overflow-x: clip }` would otherwise hide it by cutting it off).
3. **clippedText**: elements with their own text that scroll past a hidden/clipped box, and text partly cut off by an `overflow: hidden` ancestor. Exempt: `truncate`, `line-clamp-*`, ellipsis, `.sr-only`, `aria-hidden`, scroll containers, tracks that move (scroll or endless animation).
4. **overlappingText**: glyph boxes of two text blocks intersecting by more than 4 px² (ink extents, clipped to what is visible). Ignored: `aria-hidden`, `.sr-only`, `[data-qa-allow-overlap]`, ancestors/descendants.
5. **brokenImages**: loaded with `naturalWidth` 0, or no `alt` attribute (`alt=""` is fine). Lazy images are forced to load first.
6. **contrast**: computed colour against the backdrop found by walking the ancestors (translucent layers blended; gradients checked against all their stops), measured on the **final frame** (reduced-motion render, where the site's base rules are the end of every scroll scene). Where CSS cannot say (photos, glass, the 3D scene) the harness shoots the page with the glyphs hidden and measures the real pixels behind each text line: more than half of them too close in tone fails, 10–50 % warns. 4.5:1, or 3:1 for text ≥ 24 px or ≥ 18.66 px bold.
7. **tapTargets** (touch viewports): visible `a/button/[role=button]/input/select/summary` under 24×24 fails, under 44×44 warns; inline links inside running text are exempt.
8. **untranslated** (English pages): Greek letters > 5 % of a text's letters; fails when more than 3 elements contain Greek words longer than 3 letters. `lang="el"`, `<address>`, `[hreflang]` are skipped.
9. **headings**: exactly one visible `h1` (an `h1` replaced by the 3D hero counts); skipped levels warn. Also fails a page that is not the site's own: no `header`, `main` or `footer` landmark (the framework's default 404), `<html lang>` that does not match the page's language, or no links at all.
10. **reducedMotion**: in the reduced-motion load every heading must have opacity ≥ 0.99 and lie inside the viewport when scrolled to, and gates 2–4 must pass there too.
11. **perf** (`--perf`): LCP ≤ 2500 ms, TBT ≤ 200 ms, at most 2 frames > 50 ms during a full-page touch scroll at 2000 px/s; 412×823 @1.75, 4× CPU, 150 ms RTT, 1.6 Mbps, cache off. Gated on the median of `--perf-runs`; every slow frame's `scrollY` is recorded. Slow frames in one stretch are "clustered" (a real problem, the section is named); spread over more than half the page with no cluster and not repeating at the same positions they are "noisy" (a warning, treated as machine noise).
12. **regression** (`--baseline compare`): more than 0.5 % of the pixels of a screenshot changed in a group that is not expected to change. Regions that legitimately differ between runs (canvas, iframes, endless animations, `[data-qa-dynamic]`) are masked, and a screenshot that exceeds the limit is shot and compared once more (the second attempt decides) to rule out noise from a busy machine.

## Measurements for the critic (in `report.json` and `summary.md`, not gates)

Type scale per viewport (distinct computed sizes with counts; body text under 16 px on mobile, labels under 11 px flagged), line length of running text over 2 lines (flagged < 25 or > 85 characters), alignment near misses (edges 1–6 px from a more frequent left/right edge, with the elements), and spacing values (gaps between sections' content, heading to following text).

## Outputs: `qa/runs/<label>/`

`summary.md` (page × gate table, only the failing items deduplicated across pages and viewports, warnings, measurements; about 100 lines), `report.json` (everything), `<group>-desktop.jpg` and `<group>-mobile.jpg` (contact sheets, JPEG q75, at most 1600×2000; per page the above-the-fold view, the full page in columns labelled with their `y`, and frames of pinned scroll scenes at 0/33/66/100 %; a group with many pages continues in `-2.jpg`), `shots/` (full-resolution `<page>-<viewport>.png`, `-fold.png`, scene frames), `diffs/` (compare runs: the new screenshot with changed regions boxed, plus before | after crops). `qa/runs` and `qa/baseline` are git-ignored; delete old runs when you no longer need them.

## Notes

- Everything the harness starts is registered for cleanup. A temp Chrome profile is used and removed.
- The hero's 3D scene runs when the browser allows it (like for visitors); both modes (3D and CSS panes) are handled.
- To silence an intentional text overlap add `data-qa-allow-overlap`; to mask an element that changes between runs add `data-qa-dynamic`.
- `selftest.mjs` serves `selftest/fixture.html` (decorative aria-hidden panes, a sliding track, a marquee, sr-only text, truncated text, a scroll container, glass, a canvas, a pinned scene) next to seeded defects, and checks that exactly the defects are reported. Run it after changing the harness.
