// Turns the raw data of one page load into gate results. Every failing item names the element and a measured value.

import { PERF_LIMITS, describePattern } from "./perf.mjs";

export const GATES = [
  { id: "consoleErrors", short: "console" },
  { id: "overflowX", short: "overflow-x" },
  { id: "clippedText", short: "clipped" },
  { id: "overlappingText", short: "overlap" },
  { id: "brokenImages", short: "images" },
  { id: "contrast", short: "contrast" },
  { id: "tapTargets", short: "tap" },
  { id: "untranslated", short: "i18n" },
  { id: "headings", short: "headings" },
  { id: "reducedMotion", short: "reduced" },
  { id: "perf", short: "perf" },
  { id: "regression", short: "regress" },
];

const label = (o) => `${o.sel}${o.text ? ` "${o.text}"` : ""}${o.where ? ` @${o.where}` : ""}`;
const regionKind = (where = "") => (where.startsWith("main") ? "main" : where || "body");

function item(o, value, extra = {}) {
  return { element: label(o), sel: o.sel, text: o.text || "", where: o.where || "", region: regionKind(o.where), value, ...extra };
}

function res(gate, status, items = [], stats = {}) {
  return { gate, status, items, stats };
}

/** Collapses items that differ only in their text (e.g. eleven list indexes with the same colours). */
function groupItems(items, keyOf) {
  const map = new Map();
  for (const it of items) {
    const k = keyOf(it);
    const g = map.get(k);
    if (!g) map.set(k, { ...it, count: 1, samples: [it.text] });
    else {
      g.count++;
      if (g.samples.length < 6) g.samples.push(it.text);
    }
  }
  return Array.from(map.values()).map((g) => {
    if (g.count > 1) {
      g.element = `${g.sel} ×${g.count} (${g.samples.map((s) => `"${s}"`).join(", ")}${g.count > g.samples.length ? ", …" : ""}) @${g.where}`;
    }
    return g;
  });
}

function overflowItems(raw) {
  const o = raw.overflowX;
  const items = [];
  if (o.over > 1) items.push({ element: "html", sel: "html", text: "", where: "document", region: "document", value: `scrollWidth ${o.scrollWidth} > clientWidth ${o.clientWidth} (+${o.over}px)` });
  for (const c of o.culprits) {
    items.push(item(c, `extends ${c.over}px past the viewport (right edge ${c.right}px, ${c.w}px wide; clipped by body overflow-x, so the content is cut off)`));
  }
  return items;
}

function clippedItems(raw) {
  return raw.clipped.map((c) => item(c, c.value, { kind: c.kind }));
}

function overlapItems(raw) {
  return raw.overlaps.map((p) => ({
    element: `${label(p.a)}  ×  ${label(p.b)}`,
    sel: `${p.a.sel} × ${p.b.sel}`,
    text: `${p.a.text} × ${p.b.text}`,
    where: p.a.where,
    region: regionKind(p.a.where),
    value: `${p.area} px² overlap (A at ${p.ra.join(",")}, B at ${p.rb.join(",")})`,
  }));
}

/** Evaluates one load. `load` comes from load.mjs; returns [{gate,status,items,stats}]. */
export function evaluateLoad(load) {
  const out = [];
  const raw = load.raw;

  // 1. console errors, uncaught exceptions, failed same-origin requests (also: the load itself failing)
  {
    const items = (load.errors || []).map((e) => ({
      element: e.url ? e.url.replace(/^https?:\/\/[^/]+/, "") : e.kind,
      sel: e.kind,
      text: "",
      where: "",
      region: "document",
      value: `${e.kind}: ${e.text}`,
    }));
    if (load.fatal) items.unshift({ element: "page load", sel: "load", text: "", where: "", region: "document", value: load.fatal });
    out.push(res("consoleErrors", items.length ? "fail" : "pass", items, { requests: (load.errors || []).length }));
  }
  if (load.fatal || !raw) return out;

  const rm = load.viewport === "desktop-rm";

  if (rm) {
    // 10. reduced motion: headings visible when scrolled to, and gates 2–4 still pass
    const items = [];
    for (const h of raw.rmHeadings || []) {
      const problems = [];
      if (h.opacity < 0.99) problems.push(`opacity ${h.opacity}`);
      if (!h.inside) problems.push(`outside the viewport when scrolled to (rect ${h.rect.join(",")})`);
      if (!h.reachable) problems.push("covered by another element");
      if (problems.length) items.push(item(h, `h${h.level}: ${problems.join(", ")}`, { sub: "heading" }));
    }
    for (const it of overflowItems(raw)) items.push({ ...it, value: `[overflowX] ${it.value}`, sub: "overflowX" });
    for (const it of clippedItems(raw)) items.push({ ...it, value: `[clippedText] ${it.value}`, sub: "clippedText" });
    for (const it of overlapItems(raw)) items.push({ ...it, value: `[overlappingText] ${it.value}`, sub: "overlappingText" });
    out.push(res("reducedMotion", items.length ? "fail" : "pass", items, { headings: (raw.rmHeadings || []).length }));
    return out;
  }

  // 2. horizontal overflow
  {
    const items = overflowItems(raw);
    out.push(res("overflowX", items.length ? "fail" : "pass", items, { scrollWidth: raw.overflowX.scrollWidth, clientWidth: raw.overflowX.clientWidth }));
  }
  // 3. clipped text
  {
    const items = clippedItems(raw);
    out.push(res("clippedText", items.length ? "fail" : "pass", items));
  }
  // 4. overlapping text
  {
    const items = overlapItems(raw);
    out.push(res("overlappingText", items.length ? "fail" : "pass", items));
  }
  // 5. images
  {
    const items = [
      ...raw.images.broken.map((i) => item(i, `broken image (naturalWidth 0): ${i.src}`)),
      ...raw.images.noAlt.map((i) => item(i, `no alt attribute: ${i.src}`)),
    ];
    const warns = raw.images.pending.map((i) => item(i, `image never finished loading: ${i.src}`));
    out.push(res("brokenImages", items.length ? "fail" : warns.length ? "warn" : "pass", [...items, ...warns], { images: raw.images.total }));
  }
  // 6. contrast (measured in the resting state, see inpage.mjs; texts over photos/glass/canvas are sampled from pixels)
  {
    const c = load.contrast;
    if (c) {
      const text = (f) =>
        f.sampled
          ? `${f.sampled.p5}:1 at the 5th percentile of the pixels behind the text (median ${f.sampled.p50}:1, ${Math.round(f.sampled.failFrac * 100)}% of the pixels below ${f.need}:1; text ${f.fg} over ${f.reason}), ${f.size}px${f.weight >= 700 ? " bold" : ""}`
          : `${f.ratio}:1 (needs ${f.need}:1) ${f.fg} on ${f.bg}, ${f.size}px${f.weight >= 700 ? " bold" : ""}`;
      const fails = groupItems(
        c.fails.map((f) => item(f, text(f), { ratio: f.ratio, need: f.need, sampled: !!f.sampled })),
        (it) => `${it.sel}|${it.value}|${it.where}`
      );
      const warns = groupItems(
        (c.warns || []).map((f) => item(f, `${text(f)} [some of the background is too close in tone]`, { warn: true })),
        (it) => `${it.sel}|${it.value}|${it.where}`
      );
      out.push(res("contrast", fails.length ? "fail" : warns.length ? "warn" : "pass", [...fails, ...warns], { checked: c.total, pass: c.pass, fail: c.fail, warn: c.warn || 0, unknown: c.unknown, minRatio: c.minRatio, unknowns: c.unknowns.map((u) => ({ sel: u.sel, text: u.text, where: u.where, reason: u.reason })) }));
    } else out.push(res("contrast", "skip"));
  }
  // 7. tap targets (touch viewports)
  if (raw.tap) {
    const fails = raw.tap.fails.map((t) => item(t, `${t.value} (minimum 24×24)`));
    const warns = raw.tap.warns.map((t) => item(t, `${t.value} (recommended 44×44)`, { warn: true }));
    out.push(res("tapTargets", fails.length ? "fail" : warns.length ? "warn" : "pass", [...fails, ...warns], { checked: raw.tap.checked, fails: raw.tap.failCount, warns: raw.tap.warnCount }));
  }
  // 8. untranslated (English pages)
  if (raw.greek) {
    const items = raw.greek.elements.map((g) => item(g, `Greek ${Math.round(g.greekShare * 100)}% of letters${g.words.length ? `, words: ${g.words.join(" ")}` : ""}${g.decorative ? " (decorative)" : ""}`, { words: g.longWords }));
    const failed = raw.greek.wordElements > 3;
    out.push(res("untranslated", failed ? "fail" : items.length ? "warn" : "pass", items, { elementsWithGreekWords: raw.greek.wordElements, elements: raw.greek.count }));
  }
  // 9. headings
  {
    const h = raw.headings;
    const items = [];
    if (h.h1Visible !== 1) items.push({ element: "h1", sel: "h1", text: h.h1.map((x) => x.text).join(" | "), where: "", region: "main", value: `${h.h1Visible} visible h1 (${h.h1Total} in the document), expected exactly 1` });
    // the page must be a page of this site: landmarks, the right language, a way out (the framework's default 404 is none of these)
    const st = raw.structure;
    if (st) {
      const missing = ["header", "main", "footer"].filter((k) => !st[k]);
      if (missing.length) items.push({ element: "document", sel: "landmarks", text: "", where: "", region: "document", value: `no <${missing.join(">, <")}> landmark: not the site's own page (framework default page?)` });
      if (load.lang && !st.htmlLang.toLowerCase().startsWith(load.lang)) items.push({ element: "html", sel: "html", text: "", where: "", region: "document", value: st.htmlLang ? `<html lang="${st.htmlLang}"> on a ${load.lang === "el" ? "Greek" : "English"} page` : `<html> has no lang attribute (expected "${load.lang}")` });
      if (st.links === 0) items.push({ element: "document", sel: "links", text: "", where: "", region: "document", value: "the page has no links at all (dead end)" });
    }
    const skips = h.skips.map((s) => ({ element: `${s.sel} "${s.text}" @${s.where}`, sel: s.sel, text: s.text, where: s.where, region: regionKind(s.where), value: `heading level jumps h${s.from} → h${s.to}`, warn: true }));
    out.push(res("headings", items.length ? "fail" : skips.length ? "warn" : "pass", [...items, ...skips], { h1: h.h1Visible, headings: h.count }));
  }
  return out;
}

/**
 * Resolves "unknown" contrast results with the pixels measured behind each text (see compose-page.html).
 * More than half of the sampled pixels too close in tone: fail. 10–50%: warning. Otherwise pass.
 */
export function applyContrastSamples(contrast, samples) {
  const round = (v, n = 2) => Math.round(v * 10 ** n) / 10 ** n;
  const kept = [];
  contrast.warns = contrast.warns || [];
  contrast.warn = contrast.warn || 0;
  contrast.unknowns.forEach((u, i) => {
    const s = samples.find((x) => x.key === i);
    const rest = { ...u };
    delete rest.rects;
    delete rest.sampleFg;
    if (!s || !s.n) {
      kept.push(rest);
      return;
    }
    const done = { ...rest, sampled: { n: s.n, p5: round(s.p5), p50: round(s.p50), failFrac: round(s.failFrac, 3) } };
    contrast.unknown--;
    if (s.failFrac > 0.5) {
      contrast.fail++;
      contrast.fails.push(done);
    } else if (s.failFrac > 0.1) {
      contrast.warn++;
      contrast.warns.push(done);
    } else contrast.pass++;
  });
  contrast.unknowns = kept;
  return contrast;
}

/**
 * Gate 11 on the median of the runs of one page (see perf.mjs). Slow frames that are scattered over the whole page with
 * no cluster and do not repeat at the same positions are machine noise: they are reported ("noisy") but do not fail the gate.
 */
export function evaluatePerf(summary) {
  const L = PERF_LIMITS;
  const fmt = (m, r, unit = "") => (m == null ? "n/a" : `${Math.round(m * 10) / 10}${unit} (runs ${r ? `${r[0]}–${r[1]}` : "n/a"})`);
  if (!summary.median) {
    return res("perf", "fail", [{ element: "page load", sel: "perf", text: "", where: "", region: "document", value: `every perf run failed: ${summary.errors.join("; ")}` }]);
  }
  const m = summary.median;
  const r = summary.range;
  const items = [];
  const noisy = !!summary.pattern && summary.pattern.kind === "noisy";
  if (m.lcp == null) items.push({ element: "LCP", sel: "lcp", text: "", where: "", region: "document", value: "no largest-contentful-paint entry in most runs" });
  else if (m.lcp > L.lcp) items.push({ element: `LCP element ${summary.lcpEl || "?"}`, sel: "lcp", text: "", where: "", region: "document", value: `median LCP ${fmt(m.lcp, r.lcp, " ms")} > ${L.lcp} ms` });
  if (m.tbt > L.tbt) items.push({ element: "main thread", sel: "tbt", text: "", where: "", region: "document", value: `median TBT ${fmt(m.tbt, r.tbt, " ms")} > ${L.tbt} ms` });
  if (m.over50 > L.slowFrames) {
    items.push({
      element: "scroll",
      sel: "scroll",
      text: "",
      where: "",
      region: "document",
      warn: noisy,
      value: `median ${fmt(m.over50, r.over50)} frames > ${L.slowFrameMs} ms during the full-page touch scroll, worst frame ${fmt(m.maxFrame, r.maxFrame, " ms")}; ${describePattern(summary.pattern)}${noisy ? " [treated as machine noise]" : ""}`,
    });
  }
  const failing = items.filter((i) => !i.warn);
  return res("perf", failing.length ? "fail" : items.length ? "warn" : "pass", items, {
    lcp: m.lcp,
    tbt: m.tbt,
    over50: m.over50,
    maxFrame: m.maxFrame,
    fcp: m.fcp,
    runs: summary.okRuns,
    noisy,
  });
}
