// Aggregation and summary.md. The summary is kept short on purpose: a pass/fail table, then only failing items
// (deduplicated across pages and viewports) and the measurements the critic reads.

import { GATES } from "./gates.mjs";
import { describePattern } from "./perf.mjs";

const VP_SHORT = { mobile: "m", tablet: "t", desktop: "d", "desktop-rm": "r" };
const RANK = { fail: 4, warn: 3, pass: 2, info: 1, skip: 0 };
const worst = (a, b) => (RANK[a] >= RANK[b] ? a : b);
const trunc = (s, n) => (s.length > n ? s.slice(0, n - 1) + "…" : s);
const REGRESSION_LIMIT_PCT = 0.5;

/** page × gate matrix: Map(pageId -> Map(gateId -> { status, fail: [vp], warn: [vp], pass: [vp], stats })) */
export function buildMatrix(loads, perfResults, regression) {
  const m = new Map();
  const cell = (page, gate) => {
    if (!m.has(page)) m.set(page, new Map());
    const row = m.get(page);
    if (!row.has(gate)) row.set(gate, { status: "skip", fail: [], warn: [], pass: [], stats: {} });
    return row.get(gate);
  };
  for (const l of loads) {
    for (const g of l.gates || []) {
      const c = cell(l.pageId, g.gate);
      c.status = worst(c.status, g.status);
      if (g.status === "fail") c.fail.push(l.viewport);
      else if (g.status === "warn") c.warn.push(l.viewport);
      else if (g.status === "pass") c.pass.push(l.viewport);
      c.stats[l.viewport] = g.stats;
    }
  }
  for (const p of perfResults || []) {
    const c = cell(p.pageId, "perf");
    c.status = p.gate.status;
    if (p.gate.status === "fail") c.fail.push("mobile");
    else if (p.gate.status === "warn") c.warn.push("mobile");
    else c.pass.push("mobile");
    c.stats.mobile = p.gate.stats;
  }
  for (const r of regression || []) {
    if (!r.counts) continue;
    const c = cell(r.pageId, "regression");
    c.status = worst(c.status, r.status === "fail" ? "fail" : "pass");
    if (r.status === "fail") c.fail.push(r.viewport);
    else c.pass.push(r.viewport);
  }
  return m;
}

export function cellText(c) {
  if (!c) return "-";
  if (c.status === "skip") return "skip";
  const vps = (list) => list.map((v) => VP_SHORT[v] || v).join(",");
  if (c.status === "fail") return `**FAIL** ${vps(c.fail)}`;
  if (c.status === "warn") return `warn ${vps(c.warn)}`;
  return "ok";
}

/** All items of one gate, deduplicated across pages and viewports. */
export function dedupe(loads, perfResults, gateId, wantWarn = false) {
  const map = new Map();
  const add = (pageId, viewport, g) => {
    if (g.gate !== gateId) return;
    for (const it of g.items) {
      const isWarn = !!it.warn;
      if (isWarn !== wantWarn) continue;
      // measured sizes of clipping, overlap and overflow differ between viewports: they must not split one defect into several lines
      const value = ["clippedText", "overlappingText", "overflowX"].includes(gateId) ? it.value.replace(/\d+(\.\d+)?/g, "#") : it.value;
      const key = [it.sel, it.text, value, it.region === "main" ? "main" : it.region].join("|");
      let e = map.get(key);
      if (!e) map.set(key, (e = { item: it, pages: new Map(), count: 0 }));
      e.count++;
      if (!e.pages.has(pageId)) e.pages.set(pageId, new Set());
      e.pages.get(pageId).add(viewport);
    }
  };
  for (const l of loads) for (const g of l.gates || []) add(l.pageId, l.viewport, g);
  for (const p of perfResults || []) add(p.pageId, "mobile", p.gate);
  return Array.from(map.values()).sort((a, b) => b.pages.size - a.pages.size || b.count - a.count);
}

function where(e) {
  const pages = Array.from(e.pages.entries());
  const vpUnion = new Set();
  for (const [, v] of pages) for (const x of v) vpUnion.add(x);
  const vp = ["mobile", "tablet", "desktop", "desktop-rm"].filter((x) => vpUnion.has(x)).map((x) => VP_SHORT[x]).join(",");
  if (pages.length <= 3) return `${pages.map(([p]) => p).join(", ")} [${vp}]`;
  return `${pages.length} pages (${pages.slice(0, 3).map(([p]) => p).join(", ")}, …) [${vp}]`;
}

const rangeText = (m, r) => (m == null ? "n/a" : r ? `${Math.round(m * 10) / 10} (${r[0]}–${r[1]})` : `${m}`);

function regressionSection(L, ctx) {
  const { regression, noBaseline, expectChange } = ctx;
  const entries = regression.filter((r) => r.status !== "no-baseline");
  L(`## Pixel diff against baseline (limit ${REGRESSION_LIMIT_PCT}% of the pixels of a screenshot)`);
  if (expectChange.length) L(`Expected to change (diffed and reported, never failing): ${expectChange.join(", ")}.`);
  const pageIds = [...new Set(entries.map((r) => r.pageId))];
  if (pageIds.length) {
    L("| group | page | mobile | tablet | desktop | result |");
    L("|---|---|---|---|---|---|");
    for (const id of pageIds) {
      const rows = entries.filter((r) => r.pageId === id);
      const by = (vp) => {
        const r = rows.find((x) => x.viewport === vp);
        return r ? (r.status === "fail" ? `**${r.pct}%**` : `${r.pct}%`) : "-";
      };
      const failed = rows.some((r) => r.status === "fail");
      const exempt = rows.every((r) => r.status === "expected");
      const changed = rows.some((r) => r.pct > 0);
      L(`| ${rows[0].group} | ${id} | ${by("mobile")} | ${by("tablet")} | ${by("desktop")} | ${failed ? "**FAIL**" : exempt ? (changed ? "changed (expected)" : "unchanged (expected)") : "ok"} |`);
    }
  }
  for (const g of [...new Set(noBaseline.map((p) => p.group))]) L(`- ${g}: no baseline (comparison skipped; save one with --baseline save --group ${g})`);
  const failing = entries.filter((r) => r.status === "fail");
  if (failing.length) {
    L("Changed beyond the limit (-diff.jpg is the new screenshot with the changed regions boxed, -rN.jpg are before | after crops):");
    for (const r of failing.slice(0, 8)) L(`- ${r.pageId} ${r.viewport}: ${r.pct}% of pixels changed in ${r.regions} region${r.regions === 1 ? "" : "s"}: diffs/${r.diffImage}${r.crops && r.crops.length ? ` (+ ${r.crops.join(", ")})` : ""}`);
    if (failing.length > 8) L(`- … ${failing.length - 8} more in report.json`);
  }
  if (!pageIds.length && !noBaseline.length) L("- nothing to compare");
  L();
}

function buildSummaryOnce(ctx) {
  const { label, git, options, pages, loads, perfResults, regression, sheets, durationSec, build, englishIncluded, scopeNote, mode } = ctx;
  const matrix = buildMatrix(loads, perfResults, regression);
  const lines = [];
  const L = (s = "") => lines.push(s);

  const failing = [];
  for (const [pageId, row] of matrix) for (const [gate, c] of row) if (c.status === "fail") failing.push({ pageId, gate, vps: c.fail });
  const regressionOnly = mode === "regression";
  const regressionFails = regression.filter((r) => r.status === "fail");
  for (const r of regressionFails) if (!failing.some((f) => f.pageId === r.pageId && f.gate === "regression")) failing.push({ pageId: r.pageId, gate: "regression", vps: [r.viewport] });
  const result = failing.length === 0 ? "PASS" : "FAIL";

  L(`# QA summary: ${label}${regressionOnly ? " (regression run)" : ""}`);
  L(`${git.branch}${git.commit ? ` @ ${git.commit}` : ""}${git.dirty ? " (uncommitted changes)" : ""} · ${ctx.startedAt} · ${durationSec}s · ${scopeNote}`);
  if (regressionOnly) L(`Screenshots of ${ctx.capturedPages.length} pages at mobile 390 / tablet 768 / desktop 1440${build.ran ? ` · build ${build.seconds}s` : " · build skipped"} · port ${options.port}`);
  else L(`Pages ${pages.length} · loads ${loads.length} (mobile 390 / tablet 768 / desktop 1440 + desktop reduced-motion)${build.ran ? ` · build ${build.seconds}s` : " · build skipped"} · port ${options.port}`);
  for (const n of ctx.notes || []) L(`Note: ${n}`);
  L(`**RESULT: ${result}**${failing.length ? ` (${failing.length} failing ${regressionOnly ? "pages" : "page×gate cells"})` : ""}`);
  L();

  if (regressionOnly) {
    L("Content gates (console, overflow, clipped and overlapping text, images, contrast, tap targets, headings, reduced motion, perf): not run in a regression run; use `npm run qa -- --group <name>`.");
    L();
    regressionSection(L, ctx);
    L("## Files");
    L("- diffs/<page>-<viewport>.diff.jpg and -rN.jpg for every changed screenshot; shots/ has the new screenshots; report.json has the numbers");
    return { text: lines.join("\n") + "\n", result, failing, lineCount: lines.length };
  }

  // table
  const gateIds = GATES.map((g) => g.id).filter((g) => (g === "perf" ? options.perf : g !== "regression"));
  L("## Gates");
  L(`| page | ${gateIds.map((g) => GATES.find((x) => x.id === g).short).join(" | ")} |`);
  L(`|${"---|".repeat(gateIds.length + 1)}`);
  for (const p of pages) {
    const row = matrix.get(p.id);
    const cells = gateIds.map((g) => {
      if (g === "untranslated" && !englishIncluded) return "skip";
      const c = row && row.get(g);
      if (g === "untranslated" && p.lang !== "en") return "-";
      if (g === "reducedMotion" && !c) return "-";
      let t = cellText(c);
      if (g === "contrast" && c && c.status !== "skip") {
        const unk = Object.values(c.stats || {}).reduce((n, s) => Math.max(n, (s && s.unknown) || 0), 0);
        if (unk) t += ` ?${unk}`;
      }
      if (g === "perf" && c && c.stats.mobile && c.stats.mobile.reran) t += " (reran)";
      if (g === "perf" && c && c.stats.mobile && c.stats.mobile.noisy) t += " (noisy)";
      return t;
    });
    L(`| ${p.id} | ${cells.join(" | ")} |`);
  }
  L("Viewports: m mobile 390, t tablet 768, d desktop 1440, r desktop reduced-motion. `?n` = n texts whose contrast could not be determined (glass, canvas). `warn` = only warnings (tap targets 24–44 px, skipped heading levels, partly low contrast over photos).");
  if (!englishIncluded) L("i18n (untranslated): skipped (English phase).");
  L();

  // failing items
  const cap = ctx.itemCap || 8;
  const sections = [];
  for (const g of GATES) {
    if (g.id === "regression") continue;
    const items = dedupe(loads, perfResults, g.id, false);
    const failingItems = items.filter((e) => [...e.pages.keys()].some((p) => matrix.get(p) && matrix.get(p).get(g.id) && matrix.get(p).get(g.id).status === "fail"));
    if (!failingItems.length) continue;
    const out = [`### ${g.id}`];
    for (const e of failingItems.slice(0, cap)) out.push(`- ${trunc(e.item.element, 120)}: ${trunc(e.item.value, 190)} · ${where(e)}`);
    if (failingItems.length > cap) out.push(`- … ${failingItems.length - cap} more (see report.json)`);
    sections.push(out);
  }
  L("## Failing items");
  if (!sections.length) L("None.");
  for (const s of sections) for (const x of s) L(x);
  L();

  // warnings, counts only
  const warnLines = [];
  for (const gateId of ["tapTargets", "headings", "brokenImages", "contrast", "perf"]) {
    const items = dedupe(loads, perfResults, gateId, true);
    if (items.length) warnLines.push(`${gateId}: ${items.length} warning${items.length > 1 ? "s" : ""}, e.g. ${trunc(items[0].item.element, 70)}: ${trunc(items[0].item.value, 80)}`);
  }
  if (warnLines.length) {
    L("## Warnings");
    for (const w of warnLines) L(`- ${w}`);
    L();
  }

  // critic measurements
  L("## Measurements for the critic");
  const byVp = { mobile: {}, tablet: {}, desktop: {} };
  const smallBody = new Map();
  const tiny = new Map();
  const lineFlags = [];
  const near = [];
  const secGaps = { mobile: {}, tablet: {}, desktop: {} };
  const headGaps = { mobile: {}, tablet: {}, desktop: {} };
  const mergeCounts = (target, source) => {
    for (const [k, v] of Object.entries(source || {})) target[k] = (target[k] || 0) + v;
  };
  for (const l of loads) {
    const raw = l.raw;
    if (!raw || !byVp[l.viewport]) continue;
    for (const s of raw.typeScale.sizes) mergeCounts(byVp[l.viewport], { [s.px]: s.elements });
    for (const s of raw.typeScale.smallBody) {
      const k = `${s.sel}|${s.size}`;
      if (!smallBody.has(k)) smallBody.set(k, { ...s, pages: new Set() });
      smallBody.get(k).pages.add(l.pageId);
    }
    for (const s of raw.typeScale.tinyLabels) {
      const k = `${s.sel}|${s.size}|${s.text}`;
      if (!tiny.has(k)) tiny.set(k, { ...s, pages: new Set(), vps: new Set() });
      tiny.get(k).pages.add(l.pageId);
      tiny.get(k).vps.add(VP_SHORT[l.viewport]);
    }
    for (const f of raw.lineLength.flagged) lineFlags.push({ ...f, page: l.pageId, vp: l.viewport });
    for (const n of raw.alignment.nearMisses) near.push({ ...n, page: l.pageId, vp: l.viewport });
    mergeCounts(secGaps[l.viewport], raw.spacing.sectionGapValues);
    mergeCounts(headGaps[l.viewport], raw.spacing.headingGapValues);
  }
  L("**Type scale** (computed px × text elements, all pages)");
  for (const [vp, sizes] of Object.entries(byVp)) {
    const entries = Object.entries(sizes).map(([px, n]) => [Number(px), n]).sort((a, b) => a[0] - b[0]);
    if (entries.length) L(`- ${vp}: ${entries.length} sizes: ${entries.map(([px, n]) => `${px}×${n}`).join(" ")}`);
  }
  const sb = Array.from(smallBody.values());
  if (sb.length) L(`- body text (p, li) under 16px on mobile: ${sb.slice(0, 5).map((s) => `${s.sel} "${trunc(s.text, 18)}" ${s.size}px (${s.pages.size} page${s.pages.size > 1 ? "s" : ""})`).join("; ")}${sb.length > 5 ? `; +${sb.length - 5} more` : ""}`);
  const tl = Array.from(tiny.values());
  if (tl.length) L(`- labels under 11px: ${tl.slice(0, 5).map((s) => `${s.sel} "${trunc(s.text, 22)}" ${s.size}px [${[...s.vps].join(",")}]`).join("; ")}${tl.length > 5 ? `; +${tl.length - 5} more` : ""}`);
  L("**Line length** (paragraphs over 2 lines, characters per line; flagged < 25 or > 85)");
  if (!lineFlags.length) L("- none flagged");
  else {
    const seenLine = new Set();
    const uniq = lineFlags.filter((f) => !seenLine.has(`${f.page}|${f.sel}|${f.text}`) && seenLine.add(`${f.page}|${f.sel}|${f.text}`));
    for (const f of uniq.slice(0, 5)) L(`- ${f.page} ${VP_SHORT[f.vp]}: ${f.sel} "${trunc(f.text, 30)}" ${f.cpl} cpl (${f.lines} lines, ${f.width}px wide, ${f.size}px type)`);
    if (uniq.length > 5) L(`- … ${uniq.length - 5} more`);
  }
  L("**Alignment near misses** (edge 1–6 px from a more frequent edge)");
  near.sort((a, b) => b.dominantCount - a.dominantCount || a.distance - b.distance);
  const seenNear = new Set();
  let shown = 0;
  for (const n of near) {
    const sig = `${n.side}|${n.els[0].sel}|${n.els[0].text}|${n.distance}`;
    if (seenNear.has(sig)) continue;
    seenNear.add(sig);
    if (shown++ >= 8) continue;
    L(`- ${n.page} ${VP_SHORT[n.vp] || n.vp} ${n.side} edge ${n.edge}px (×${n.count}) vs ${n.dominantEdge}px (×${n.dominantCount}), ${n.distance}px off: ${n.els.slice(0, 2).map((e) => `${e.sel} "${trunc(e.text, 22)}" @${e.where}`).join(" | ")}`);
  }
  if (!near.length) L("- none");
  else if (seenNear.size > 8) L(`- … ${seenNear.size - 8} more distinct near misses (report.json: pages[].loads[].measurements.alignment)`);
  L("**Spacing** (px × occurrences)");
  const histLine = (h) =>
    Object.entries(h)
      .map(([v, n]) => [Number(v), n])
      .sort((a, b) => b[1] - a[1])
      .slice(0, 9)
      .sort((a, b) => a[0] - b[0])
      .map(([v, n]) => `${v}×${n}`)
      .join(" ");
  for (const vp of ["mobile", "tablet", "desktop"]) {
    if (Object.keys(secGaps[vp]).length) L(`- ${vp} gap between sections' content: ${histLine(secGaps[vp])}`);
    if (Object.keys(headGaps[vp]).length) L(`- ${vp} heading → next text: ${histLine(headGaps[vp])}`);
  }
  L();

  if (perfResults && perfResults.length) {
    const n = options.perfRuns || perfResults[0].runCount;
    L(`## Performance (mobile profile, 4x CPU, slow network; ${n} run${n > 1 ? "s" : ""} per page, 5 when the first runs were noisy; the gate uses the median, min–max in brackets)`);
    L("| page | LCP ms | TBT ms | frames > 50 ms | worst frame ms | where the slow frames are |");
    L("|---|---|---|---|---|---|");
    for (const p of perfResults) {
      if (!p.median) {
        L(`| ${p.pageId} | error | | | | ${trunc(p.errors.join("; "), 80)} |`);
        continue;
      }
      L(`| ${p.pageId} | ${rangeText(p.median.lcp, p.range.lcp)} | ${rangeText(p.median.tbt, p.range.tbt)} | ${rangeText(p.median.over50, p.range.over50)} | ${rangeText(p.median.maxFrame, p.range.maxFrame)} | ${trunc(describePattern(p.pattern), 120)} |`);
    }
    for (const p of perfResults) {
      if (!p.rerun) continue;
      const f = p.rerun.first;
      L(`- ${p.pageId}: the first ${p.rerun.firstRunCount} runs could not be trusted (${p.rerun.reasons.join("; ")}${f.median ? `; median LCP ${rangeText(f.median.lcp, f.range.lcp)}, TBT ${rangeText(f.median.tbt, f.range.tbt)}` : ""}); measured again with ${p.runCount} runs, and the table shows those`);
    }
    const noisyPages = perfResults.filter((p) => p.gate && p.gate.stats && p.gate.stats.noisy);
    if (noisyPages.length) L(`- noisy (a warning, not a failure): ${noisyPages.map((p) => p.pageId).join(", ")}: the machine was too busy to say whether the page is slow; see the perf items in report.json and repeat on an idle machine`);
    const loads1 = perfResults.filter((p) => p.loadAverage).flatMap((p) => p.loadAverage);
    if (loads1.length) {
      const cpus = ctx.cpus || 1;
      const hi = Math.max(...loads1);
      L(`Machine load (1-minute average) during the runs: ${Math.min(...loads1)}–${hi} on ${cpus} cores${hi > cpus * 0.7 ? ": busy, so LCP, TBT and frame times are inflated; repeat when the machine is idle before trusting a failure" : ""}.`);
    }
    L();
  }

  if (regression && regression.length) regressionSection(L, ctx);

  L("## Files");
  const sheetList = Object.entries(sheets || {}).flatMap(([, v]) => v).map((s) => s.file);
  L(`- contact sheets: ${sheetList.join(", ") || "none"}`);
  L("- shots/<page>-<viewport>.png (full page) and -fold.png; report.json has every measurement and every perf run");
  return { text: lines.join("\n") + "\n", result, failing, lineCount: lines.length };
}

/** summary.md stays under about 150 lines: the number of items listed per gate shrinks until it fits. */
export function buildSummary(ctx, maxLines = 150) {
  let out;
  for (const cap of [8, 5, 3, 2, 1]) {
    out = buildSummaryOnce({ ...ctx, itemCap: cap });
    if (out.lineCount <= maxLines) break;
  }
  return out;
}
