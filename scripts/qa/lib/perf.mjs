// --perf: mobile profile close to Lighthouse (412x823 @1.75, 4x CPU, 150 ms RTT, 1.6 Mbps, cache off).
// LCP and TBT after load, then a synthesized touch scroll of the whole page at 2000 px/s while every frame is timed.
// One fresh Chrome per run, run one after the other so measurements do not compete for the CPU.
// With --perf-runs N every page is measured N times and the gate uses the MEDIAN, because this machine is noisy.
// When the machine was busy or a page's runs are far apart, that page is measured again with 5 runs (see noiseReasons)
// and the gate uses the median of those; a limit that is still missed by a median whose best run is within it, on a
// machine that stays noisy, is reported as "noisy" (a warning), not as a failure of the page.

import os from "node:os";
import { Browser } from "./cdp.mjs";
import { sleep } from "./lifecycle.mjs";

export const PERF_LIMITS = { lcp: 2500, tbt: 200, slowFrames: 2, slowFrameMs: 50 };
/** A page whose measurements cannot be trusted is measured again with this many runs. */
export const PERF_RERUN_RUNS = 5;
const VIEWPORT_H = 823;

const LONGTASKS = "window.__lt=[];try{new PerformanceObserver(l=>{for(const e of l.getEntries())window.__lt.push([e.startTime,e.duration])}).observe({type:'longtask'})}catch(e){}";

async function measureOnce(baseUrl, def, { settle = 6000 } = {}) {
  const load0 = os.loadavg()[0];
  const browser = await Browser.launch({ label: "qa-perf" });
  try {
    const page = await browser.newPage();
    await page.send("Page.enable");
    await page.send("Runtime.enable");
    await page.send("Network.enable");
    await page.send("Network.setCacheDisabled", { cacheDisabled: true });
    await page.send("Network.emulateNetworkConditions", { offline: false, latency: 150, downloadThroughput: (1638.4 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 });
    await page.send("Emulation.setCPUThrottlingRate", { rate: 4 });
    await page.send("Emulation.setDeviceMetricsOverride", { width: 412, height: VIEWPORT_H, deviceScaleFactor: 1.75, mobile: true });
    await page.send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 });
    await page.send("Page.addScriptToEvaluateOnNewDocument", { source: LONGTASKS });
    const loaded = page.waitFor("Page.loadEventFired", { timeout: 90000 });
    const nav = await page.send("Page.navigate", { url: new URL(def.url, baseUrl).href });
    if (nav.errorText) throw new Error(`navigation failed: ${nav.errorText}`);
    await loaded;
    await sleep(settle); // let deferred work settle

    const load = await page.eval(`(async () => {
      const lcp = await new Promise((r) => { new PerformanceObserver((l) => { const e = l.getEntries(); r(e[e.length - 1]); }).observe({ type: 'largest-contentful-paint', buffered: true }); setTimeout(() => r(null), 1000); });
      const fcp = (performance.getEntriesByName('first-contentful-paint')[0] || {}).startTime || 0;
      const tbt = window.__lt.filter(([s]) => s >= fcp).reduce((t, [, d]) => t + Math.max(0, d - 50), 0);
      const el = lcp && lcp.element ? lcp.element.tagName.toLowerCase() + (lcp.element.className && typeof lcp.element.className === 'string' ? '.' + lcp.element.className.split(' ')[0] : '') : null;
      return { fcp: Math.round(fcp), lcp: lcp ? Math.round(lcp.startTime) : null, lcpEl: el, tbt: Math.round(tbt), longTasks: window.__lt.length };
    })()`);

    const docH = await page.eval("document.documentElement.scrollHeight");
    let scroll = { frames: 0, over50: 0, over33: 0, p95: 0, max: 0, seconds: 0, reachedBottom: true, slowFrames: [] };
    if (docH > VIEWPORT_H + 8) {
      await page.eval(`(() => { window.__f = []; window.__fy = []; window.__stop = false; window.__t0 = performance.now(); let last = window.__t0;
        const tick = (t) => { window.__f.push(t - last); window.__fy.push([Math.round(t - window.__t0), t - last, scrollY]); last = t; if (!window.__stop) requestAnimationFrame(tick); };
        requestAnimationFrame(tick); })()`);
      await page.send(
        "Input.synthesizeScrollGesture",
        { x: 206, y: 600, yDistance: -(docH - VIEWPORT_H), xDistance: 0, speed: 2000, gestureSourceType: "touch", preventFling: true },
        180000
      );
      await sleep(600);
      scroll = await page.eval(`(() => { window.__stop = true; const t1 = performance.now();
        const f = window.__f.slice(1); const s = [...f].sort((a, b) => a - b);
        // which top-level section sits in the middle of the screen at each scroll position
        const main = document.getElementById('main');
        const secs = main ? Array.from(main.children).map((el, i) => { const r = el.getBoundingClientRect(); return { top: r.top + scrollY, bottom: r.bottom + scrollY, label: '§' + (i + 1) + (el.getAttribute('aria-labelledby') || el.id ? ' ' + (el.getAttribute('aria-labelledby') || el.id) : (el.getAttribute('data-theme') ? ' ' + el.getAttribute('data-theme') : '')) }; }) : [];
        const at = (y) => { const c = y + innerHeight / 2; const hit = secs.find((s) => c >= s.top && c < s.bottom); return hit ? hit.label : (c >= (secs.length ? secs[secs.length - 1].bottom : 0) ? 'footer' : '?'); };
        return { seconds: +((t1 - window.__t0) / 1000).toFixed(1), frames: f.length,
          p95: Math.round(s[Math.floor(s.length * 0.95)] || 0), max: Math.round(s[s.length - 1] || 0),
          over33: f.filter((x) => x > 33.4).length, over50: f.filter((x) => x > 50).length,
          reachedBottom: Math.round(scrollY + innerHeight) >= document.documentElement.scrollHeight - 4,
          slowFrames: window.__fy.slice(1).filter(([, d]) => d > 50).slice(0, 300).map(([t, d, y]) => ({ t, ms: Math.round(d), y: Math.round(y), section: at(y) })) };
      })()`);
    }
    // the 1-minute load average at the start and at the end of the run: the higher one counts
    return { ...load, docH, viewportH: VIEWPORT_H, scroll, load1: Math.round(Math.max(load0, os.loadavg()[0]) * 10) / 10 };
  } finally {
    await browser.close();
  }
}

const median = (values) => {
  const a = values.filter((v) => v != null && Number.isFinite(v)).sort((x, y) => x - y);
  if (!a.length) return null;
  const m = a.length >> 1;
  return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2;
};
const range = (values) => {
  const a = values.filter((v) => v != null && Number.isFinite(v));
  return a.length ? [Math.min(...a), Math.max(...a)] : null;
};

/**
 * Where the slow frames of all runs lie. Clustered (a real problem in one stretch of the page) when at least half of
 * them fall inside one window of 12% of the scrolled distance. Noisy (machine noise) when they spread over more than
 * half of the page with no such cluster and do not recur at the same scroll positions in several runs; slow frames that
 * show up at the same places run after run are a repeatable problem even when they are spread out.
 */
export function slowFramePattern(runs) {
  const frames = [];
  const usable = runs.filter((r) => !r.error && r.scroll);
  usable.forEach((r, run) => {
    const span = Math.max(1, r.docH - r.viewportH);
    for (const f of r.scroll.slowFrames || []) frames.push({ ...f, run, u: Math.min(1, f.y / span), span });
  });
  if (!frames.length) return { kind: "none", total: 0 };
  frames.sort((a, b) => a.u - b.u);
  const W = 0.12;
  let best = { count: 0, from: 0, to: 0 };
  for (let i = 0, j = 0; i < frames.length; i++) {
    while (frames[i].u - frames[j].u > W) j++;
    const count = i - j + 1;
    if (count > best.count) best = { count, from: j, to: i };
  }
  const spread = frames[frames.length - 1].u - frames[0].u;
  const clustered = frames.length >= 2 && best.count >= Math.ceil(frames.length * 0.5);
  // the same scroll position (within 250 px) slow in another run too?
  let recurring = 0;
  for (const f of frames) if (frames.some((g) => g.run !== f.run && Math.abs(g.u * g.span - f.u * f.span) <= 250)) recurring++;
  const recurs = usable.length >= 2 && recurring / frames.length >= 0.5;
  const noisy = !clustered && !recurs && spread > 0.5 && frames.length >= 3;
  const pct = (u) => Math.round(u * 100);
  const kind = clustered ? "clustered" : recurs && spread > 0.5 ? "repeatable" : noisy ? "noisy" : "scattered";
  const out = { kind, total: frames.length, spread: Math.round(spread * 100) / 100, recurring: Math.round((recurring / frames.length) * 100) };
  if (clustered) {
    const hit = frames.slice(best.from, best.to + 1);
    const sections = [...new Set(hit.map((f) => f.section))];
    out.cluster = { fromY: hit[0].y, toY: hit[hit.length - 1].y, fromPct: pct(hit[0].u), toPct: pct(hit[hit.length - 1].u), share: Math.round((best.count / frames.length) * 100), sections };
  } else {
    out.fromPct = pct(frames[0].u);
    out.toPct = pct(frames[frames.length - 1].u);
  }
  return out;
}

export function describePattern(p) {
  if (!p || p.kind === "none") return "no slow frames";
  if (p.kind === "clustered") return `clustered at scrollY ${p.cluster.fromY}–${p.cluster.toY} (${p.cluster.fromPct}–${p.cluster.toPct}% of the page, ${p.cluster.sections.join(", ")}; ${p.cluster.share}% of the slow frames)`;
  if (p.kind === "noisy") return `noisy: ${p.total} slow frames scattered over ${p.fromPct}–${p.toPct}% of the page, no cluster, not repeated at the same places`;
  if (p.kind === "repeatable") return `${p.total} slow frames spread over ${p.fromPct}–${p.toPct}% of the page, ${p.recurring}% of them at the same scroll positions in several runs (repeatable, not noise)`;
  return `${p.total} slow frames, ${p.fromPct}–${p.toPct}% of the page`;
}

/**
 * Why the runs of one page cannot be trusted as they are (an empty list when they can):
 * the machine was busy (1-minute load average above half of its cores), or the slowest run of TBT or LCP took more than
 * twice as long as the fastest (one outlier decides a median of three).
 */
export function noiseReasons(runs, cpus = os.cpus().length) {
  const ok = runs.filter((r) => !r.error);
  const reasons = [];
  const load = Math.max(0, ...ok.map((r) => r.load1 ?? 0));
  if (load > cpus / 2) reasons.push(`load average ${load} on ${cpus} cores (more than half of them busy)`);
  for (const [name, key, floor] of [["TBT", "tbt", 25], ["LCP", "lcp", 200]]) {
    const v = ok.map((r) => r[key]).filter((x) => x != null && Number.isFinite(x));
    if (v.length < 2) continue;
    const lo = Math.min(...v);
    const hi = Math.max(...v);
    if (hi > 2 * Math.max(lo, floor)) reasons.push(`${name} ${lo}–${hi} ms: the slowest run took more than twice as long as the fastest`);
  }
  return reasons;
}

/** Medians and ranges over the runs of one page. */
export function summarizeRuns(pageId, runs, cpus) {
  const ok = runs.filter((r) => !r.error);
  const pick = (fn) => ok.map(fn);
  const median$ = {
    lcp: ok.filter((r) => r.lcp != null).length * 2 > ok.length ? median(pick((r) => r.lcp)) : null,
    fcp: median(pick((r) => r.fcp)),
    tbt: median(pick((r) => r.tbt)),
    over50: median(pick((r) => r.scroll.over50)),
    maxFrame: median(pick((r) => r.scroll.max)),
  };
  return {
    pageId,
    runCount: runs.length,
    okRuns: ok.length,
    median: ok.length ? median$ : null,
    range: ok.length ? { lcp: range(pick((r) => r.lcp)), tbt: range(pick((r) => r.tbt)), over50: range(pick((r) => r.scroll.over50)), maxFrame: range(pick((r) => r.scroll.max)) } : null,
    lcpEl: (ok.find((r) => r.lcpEl) || {}).lcpEl || null,
    loadAverage: ok.length ? [Math.min(...ok.map((r) => r.load1)), Math.max(...ok.map((r) => r.load1))] : null,
    pattern: slowFramePattern(ok),
    noise: noiseReasons(ok, cpus),
    errors: runs.filter((r) => r.error).map((r) => r.error),
    runs,
  };
}

/**
 * Runs the pages one at a time, `runs` times each. A page whose runs cannot be trusted (see noiseReasons) is measured
 * again with PERF_RERUN_RUNS runs, and its result is the median of those; the first runs stay in `rerun.first`.
 * onResult(summary) is called after each page. `measure` and `cpus` exist for the self-test.
 */
export async function runPerf(baseUrl, pages, { runs = 1, onRun, onRerun, onResult, measure = measureOnce, cpus } = {}) {
  const results = [];
  const series = async (def, n) => {
    const list = [];
    for (let i = 0; i < n; i++) {
      let res;
      try {
        res = await measure(baseUrl, def);
      } catch (err) {
        res = { error: String(err.message || err) };
      }
      list.push(res);
      if (onRun) onRun(def.id, i + 1, n, res);
    }
    return list;
  };
  for (const def of pages) {
    const first = await series(def, runs);
    let summary = summarizeRuns(def.id, first, cpus);
    if (summary.noise.length && runs < PERF_RERUN_RUNS) {
      if (onRerun) onRerun(def.id, summary.noise);
      const again = await series(def, PERF_RERUN_RUNS);
      const second = summarizeRuns(def.id, again, cpus);
      second.rerun = { reasons: summary.noise, firstRunCount: first.length, first: { median: summary.median, range: summary.range, runs: first } };
      summary = second;
    }
    results.push(summary);
    if (onResult) onResult(summary);
  }
  return results;
}
