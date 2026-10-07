# Redesign acceptance loop

Goal: every page of the ALFA GLASS site reads as a premium industrial brand (WOW, glass identity), serves a B2B factory audience, works perfectly from 390px to 1440px+, and never stutters.

**Greek first.** Phases 0–3 cover the Greek site only. English is not checked or changed until the Greek site is approved as final; then phase 4 brings the English pages in line with it. Work is done by Sonnet workers and accepted only when an Opus critic scores it **≥ 8.5/10 with no dimension below 7 and zero failed gates**.

Page specs live in [`SPEC.md`](SPEC.md). The design system is [`../../DESIGN.md`](../../DESIGN.md); the brief is [`../../PRODUCT.md`](../../PRODUCT.md).

## Roles

| Role | Model | Does |
|---|---|---|
| Orchestrator, chief critic | main session (Opus) | writes specs and briefs, runs the loops as workflows, signs off each phase |
| Worker | Sonnet | implements one page group, runs the QA harness, self-scores, hands off only when gates are green |
| Critic | Opus subagent | scores each hand-off from the evidence pack, blind to the worker's self-score |

## Phases

0. **Spec**: site-wide characteristics and one spec per page (`SPEC.md`). Calibration: the critic scores three current pages so the bar is visible.
1. **Foundation** (serial): type and spacing scale, grid, shared components (header, footer, buttons, section shells), QA harness. Must pass before pages start.
2. **Pages**: seven worker groups, one after another on this branch. (Parallel worktrees were dropped: concurrent builds and browsers distort the speed measurements, and page workers touch shared files.)
3. **Integration**: whole Greek site at three widths, regression against approved baselines, final sign-off, merge.
4. **English** (after the user approves the Greek site as final): English copy and pages brought in line with the approved Greek ones, then the English gates and a critic pass on the English pages.

The user chose autonomous mode: phases 0–3 run back to back without approvals; the orchestrator signs off each phase. The final merge into `main` and phase 4 wait for the user.

Speed gates use the median of three perf runs (`--perf-runs 3`); slow frames scattered across the whole page with no cluster are treated as machine noise, not as a page defect.

## Page groups (one worker each)

1. Home
2. Company + Facilities
3. Catalogue: glass group + category + plastics group + related group
4. Product
5. News list + article
6. Contact
7. Links + legal pages + 404

## The loop (per group)

1. Worker implements against `SPEC.md` and `DESIGN.md`.
2. Worker runs `npm run qa -- --group <name>` until every gate is green, then self-scores with the rubric below.
3. Only if self-score ≥ 8.5: the critic reviews the evidence pack and returns a scorecard.
4. Pass → baseline screenshots are stored, group is merged into the integration branch, regression gates re-run for all passed pages.
5. Fail → the same worker continues (keeps its context) and fixes exactly the scorecard's must-fix list. Max 4 critic rounds. If two rounds gain less than 0.5, the critic writes a new direction or splits the page.
6. Defects tagged `global` (affect every page) are not fixed per page: they are batched into a foundation patch, then every page is re-gated.

## The critic

Four lenses on every review:
- **Buyer** (glazier on a phone, architect at a desk): within 10 seconds, can I tell what you sell, find the product, read thickness and sizes, and call or ask for a quote? Is the phone one tap away from anywhere?
- **Art director**: WOW, glass identity (indigo/azure, condensed display type), composition, imagery, rhythm, one signature moment per page rather than effects everywhere.
- **Engineer**: speed, accessibility, responsive behaviour, resilience (long titles, English longer than Greek, missing images).
- **QA**: tries to break it (taps everything, resizes, reduced motion, slow network, keyboard, 200% zoom).

Rules:
1. Scores only from evidence (harness report + contact sheets), never from reading code alone.
2. Blind: does not see the worker's self-score before scoring.
3. Every deduction has an address: page, width, element, what, why, and the exact fix (e.g. "gap 24px → 32px", "title t-h1 → t-display from md").
4. Every point gained names the defect that was fixed. No free points.
5. Lists what is good and must not be touched.
6. Reports all blockers and majors in one round (no drip-feeding); minors may be batched.

### Gates (any failure caps the score at 5)

Build, lint or type errors · console errors · horizontal overflow, clipped or overlapping text at any width · broken links or images · mobile LCP > 2.5 s or more than 2 dropped frames (> 50 ms) in the full-page scroll test · text contrast below 4.5:1 (3:1 for large text), images without alt, invisible focus · a previously passed page regressed. Phase 4 adds: English page missing or untranslated.

### Rubric

| Dimension | Weight |
|---|---|
| Fit for a factory / B2B (credibility, scale, specs, path to call or quote) | 15% |
| WOW and art direction | 15% |
| Grid, alignment, spacing | 15% |
| Mobile | 15% |
| Typography (fonts, sizes, line length, Greek and English) | 10% |
| Speed and smoothness | 10% |
| Accessibility and resilience | 10% |
| Copy (few words, consistent terms; correct English in phase 4) | 5% |
| Code quality (tokens only, reuse, no dead code) | 5% |

Anchors: **10** would win an Awwwards Site of the Day in an industrial category and meets every budget · **8** premium, only nitpicks left · **6** a good template · **4** something is broken.

Pass: weighted score ≥ 8.5, no dimension below 7, no failed gate.

### Scorecard (JSON)

```json
{
  "page": "product",
  "round": 2,
  "gates": [{ "name": "overflow", "pass": true, "evidence": "report.json#..." }],
  "scores": { "fit": 8, "wow": 8, "grid": 9, "mobile": 8, "type": 9, "speed": 9, "a11y": 8, "copy": 9, "code": 8 },
  "weighted": 8.45,
  "verdict": "fail",
  "keep": ["spec table header", "gallery transitions"],
  "defects": [
    { "id": "P2-1", "severity": "major", "scope": "page", "where": "390px, .spec-table", "what": "first column scrolls away", "fix": "make the first column sticky (left: 0, bg-surface)", "evidence": "sheet-mobile.jpg" }
  ]
}
```

## Cost rules

1. Everything measurable is measured by the harness (zero tokens): gates, alignment, type scale, line length, tap targets, contrast, links, speed, missing translations. Workers never hand off a red report.
2. The critic sees two contact sheets per page (desktop, mobile), downscaled. From round 2 it sees only before/after crops of the changed areas, plus zoomed crops it explicitly asks for.
3. Workers self-score first; the Opus critic is called only for hand-offs that should pass (target: 1–2 critic calls per group).
4. Seven worker groups instead of thirteen pages; the same worker continues across rounds; each worker gets a context pack (files, components, tokens) so it does not explore the repo.
5. Scorecards are structured and terse; all serious defects in one round; the critic runs at medium effort per round and high effort only for final acceptance.
6. Regression is a pixel diff against approved baselines (zero tokens); the critic only looks where something changed.
7. Loops run as background workflows that return only scorecards to the orchestrator.

## QA harness

`scripts/qa/` (Node + the local Chrome over CDP, no extra dependencies). Builds once, starts `next start` on a free port, captures every page of a group at 390 / 768 / 1440 (Greek pages by default; `--lang en|all` from phase 4), runs the gates, writes `qa/runs/<label>/report.json`, `summary.md` and the contact sheets, and exits non-zero on any failed gate. See `scripts/qa/README.md`.
