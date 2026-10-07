#!/usr/bin/env node
// Self-test of the harness: a fixture page with intentional design (must stay silent) and seeded defects (must be found),
// plus unit checks of the layout, perf statistics, sampling and pixel diff. Needs only Chrome, not the site.
//   node scripts/qa/selftest.mjs

import { mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import http from "node:http";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Browser } from "./lib/cdp.mjs";
import { applyContrastSamples, evaluateLoad, evaluatePerf } from "./lib/gates.mjs";
import { diffShots, planSheets, startFileServer, writeSheets } from "./lib/compose.mjs";
import { findScenes } from "./lib/inpage.mjs";
import { REDUCED, VIEWPORTS, runLoad } from "./lib/load.mjs";
import { slowFramePattern, summarizeRuns } from "./lib/perf.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const results = [];
const check = (name, ok, detail = "") => {
  results.push({ name, ok });
  console.log(`${ok ? "  ok  " : " FAIL "} ${name}${ok ? "" : detail ? `\n         ${detail}` : ""}`);
};
const same = (a, b) => JSON.stringify([...a].sort()) === JSON.stringify([...b].sort());

// A tiny static server for the fixture.
const SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="40" height="40" fill="#003366"/></svg>';
const server = http.createServer((req, res) => {
  const u = new URL(req.url, "http://localhost");
  if (u.pathname === "/fixture.html") {
    res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    res.end(readFileSync(path.join(HERE, "selftest", "fixture.html")));
  } else if (u.pathname === "/ok.svg") {
    res.writeHead(200, { "content-type": "image/svg+xml" });
    res.end(SVG);
  } else res.writeHead(404).end("not found");
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const base = `http://localhost:${server.address().port}`;
const tmp = mkdtempSync(path.join(tmpdir(), "qa-selftest-"));
const browser = await Browser.launch({ label: "qa-selftest" });

const load = async (url, vp, lang = "en") => {
  const res = await runLoad(browser, { baseUrl: base, page: { id: "fixture", url, lang, group: "selftest" }, vp, shotsDir: tmp, screenshots: false, timing: { afterLoad: 300, settleMs: 300, stepDelay: 40 } });
  res.gates = evaluateLoad(res);
  return res;
};
const gate = (res, id) => res.gates.find((g) => g.gate === id);
const sels = (g, filter = () => true) => (g ? g.items.filter(filter).map((i) => i.sel) : []);

try {
  console.log("fixture, desktop 1440 (English page)");
  const desktop = await load("/fixture.html", VIEWPORTS.desktop);
  check("page loaded", !desktop.fatal && desktop.docStatus === 200, desktop.fatal);
  const g1 = gate(desktop, "consoleErrors");
  const kinds = g1.items.map((i) => i.value);
  check("console: console.error, uncaught exception and the 404 image are reported", g1.status === "fail" && kinds.some((v) => /qa-selftest console error/.test(v)) && kinds.some((v) => /qa-selftest exception/.test(v)) && kinds.some((v) => /404/.test(v)), JSON.stringify(kinds));
  check("overflowX: only the wide element", same(sels(gate(desktop, "overflowX"), (i) => i.sel !== "html"), ["div#bad-overflow"]), JSON.stringify(gate(desktop, "overflowX").items.map((i) => i.element)));
  check("clippedText: self-clipping box and text cut by its container, nothing else", same(sels(gate(desktop, "clippedText")), ["div#bad-clip-self", "p#bad-clip-anc"]), JSON.stringify(gate(desktop, "clippedText").items.map((i) => i.element + " " + i.value)));
  const ov = gate(desktop, "overlappingText");
  check("overlappingText: exactly the A/B pair", ov.items.length === 1 && /bad-overlap-a/.test(ov.items[0].element) && /bad-overlap-b/.test(ov.items[0].element), JSON.stringify(ov.items.map((i) => i.element)));
  const im = gate(desktop, "brokenImages");
  check("brokenImages: broken image and missing alt, decorative alt=\"\" is fine", same(sels(im), ["img#bad-broken", "img#bad-noalt"]), JSON.stringify(im.items.map((i) => i.element + " " + i.value)));
  const ct = gate(desktop, "contrast");
  check("contrast: only the light grey paragraph fails (large text at 3:1, glass, canvas and hairline underline do not)", same(sels(ct), ["p#bad-contrast"]), JSON.stringify(ct.items.map((i) => i.element + " " + i.value)));
  const unk = desktop.contrast.unknowns.map((u) => u.sel);
  check("contrast: glass and canvas texts are 'unknown', not failed", unk.some((s) => /ok-canvas/.test(s)) && desktop.contrast.unknowns.some((u) => /glass/.test(u.reason)), JSON.stringify(desktop.contrast.unknowns.map((u) => u.sel + ":" + u.reason)));
  const un = gate(desktop, "untranslated");
  check("untranslated: four Greek elements fail, lang=\"el\" span and <address> are excluded", un.status === "fail" && same(sels(un).filter((s) => /greek/.test(s)), ["p#greek-1", "p#greek-2", "p#greek-3", "p#greek-4"]) && !sels(un).some((s) => /ok-/.test(s)), JSON.stringify(un.items.map((i) => i.element)));
  const hd = gate(desktop, "headings");
  check("headings: one h1 passes, the skipped level is a warning", hd.status === "warn" && hd.items.length === 1 && /bad-skip/.test(hd.items[0].element), JSON.stringify({ s: hd.status, i: hd.items.map((i) => i.element) }));
  check("dynamic regions: canvas and endless animations are reported for the diff masks", desktop.dynamic.some((d) => d.why === "canvas") && desktop.dynamic.some((d) => d.why === "endless-animation"), JSON.stringify(desktop.dynamic));
  check("controls stay silent: nothing with an ok- id is reported by any gate", !desktop.gates.some((g) => g.items.some((i) => /#ok-/.test(i.sel + i.element))), JSON.stringify(desktop.gates.flatMap((g) => g.items.filter((i) => /#ok-/.test(i.sel + i.element)).map((i) => g.gate + ": " + i.element))));
  check("measurements are present", desktop.raw.typeScale.sizes.length > 3 && desktop.raw.alignment && desktop.raw.spacing && desktop.raw.lineLength);

  console.log("fixture, desktop, two Greek elements and a second h1");
  const variant = await load("/fixture.html?greek=2&h1", VIEWPORTS.desktop);
  check("untranslated: two Greek elements only warn", gate(variant, "untranslated").status === "warn");
  check("headings: two visible h1 fail", gate(variant, "headings").status === "fail" && /2 visible h1/.test(gate(variant, "headings").items[0].value), JSON.stringify(gate(variant, "headings").items));

  const bare = await load("/fixture.html?nolandmarks&greek=0", VIEWPORTS.desktop, "el");
  const bareHeadings = gate(bare, "headings");
  check("headings: a page without header and footer, and with <html lang=\"en\"> on a Greek page, fails", bareHeadings.status === "fail" && bareHeadings.items.some((i) => /no <header>, <footer> landmark/.test(i.value)) && bareHeadings.items.some((i) => /lang="en"/.test(i.value)), JSON.stringify(bareHeadings.items.map((i) => i.value)));
  check("headings: the normal fixture has its landmarks and the right language", !hd.items.some((i) => /landmark|lang=|no links/.test(i.value)));

  console.log("fixture, mobile 390 (touch)");
  const mobile = await load("/fixture.html", VIEWPORTS.mobile, "en");
  const tap = gate(mobile, "tapTargets");
  check("tapTargets: 18px target fails, 32px target warns, inline link in text and sr-only skip link are exempt", same(sels(tap, (i) => !i.warn), ["a#bad-tap"]) && sels(tap, (i) => i.warn).includes("a#warn-tap") && !sels(tap).some((s) => /ok-running|sr-only/.test(s)), JSON.stringify(tap.items.map((i) => i.element + " " + i.value)));
  check("mobile: controls stay silent too", !mobile.gates.some((g) => g.items.some((i) => /#ok-/.test(i.sel + i.element))));
  check("mobile: clipped text is the same two defects", same(sels(gate(mobile, "clippedText")), ["div#bad-clip-self", "p#bad-clip-anc"]), JSON.stringify(gate(mobile, "clippedText").items.map((i) => i.element)));

  console.log("fixture, desktop with prefers-reduced-motion");
  const rm = await load("/fixture.html", REDUCED, "en");
  const rg = gate(rm, "reducedMotion");
  check("reducedMotion: the heading that disappears is reported", rg.status === "fail" && rg.items.some((i) => i.sub === "heading" && /bad-rm/.test(i.element)), JSON.stringify(rg.items.map((i) => i.element + " " + i.value)));
  check("reducedMotion: gates 2–4 are re-checked in this load", rg.items.some((i) => i.sub === "overflowX") && rg.items.some((i) => i.sub === "clippedText") && rg.items.some((i) => i.sub === "overlappingText"));
  check("reducedMotion: controls stay silent", !rg.items.some((i) => /#ok-/.test(i.element)));

  console.log("layout of the contact sheets");
  const tiles = [
    { id: "a", label: "a", w: 1440, vh: 900, docH: 16000, dpr: 1, foldUrl: "f", fullUrl: "u", foldPx: { width: 1440, height: 900 }, fullPx: { width: 1440, height: 16000 } },
    { id: "b", label: "b", w: 1440, vh: 900, docH: 900, dpr: 1, foldUrl: "f", fullUrl: "u", foldPx: { width: 1440, height: 900 }, fullPx: { width: 1440, height: 900 } },
    ...Array.from({ length: 8 }, (_, i) => ({ id: "c" + i, label: "c", w: 1440, vh: 900, docH: 6000 + i * 500, dpr: 1, foldUrl: "f", fullUrl: "u", foldPx: { width: 1440, height: 900 }, fullPx: { width: 1440, height: 6000 + i * 500 } })),
  ];
  for (const kind of ["desktop", "mobile"]) {
    const m = kind === "mobile";
    const sheets = planSheets(tiles.map((t) => (m ? { ...t, w: 390, vh: 844, dpr: 2, docH: t.docH * 0.9, foldPx: { width: 780, height: 1688 }, fullPx: { width: 780, height: Math.round(t.docH * 0.9 * 2) } } : t)), kind);
    const within = sheets.every((s) => s.height <= 2000 && s.images.every((o) => o.dx >= 0 && o.dx + o.dw <= 1600 + 0.5 && o.dy + o.dh <= s.height));
    check(`planSheets ${kind}: ${tiles.length} pages -> ${sheets.length} sheets, all within 1600×2000`, within, JSON.stringify(sheets.map((s) => [s.height, s.scale])));
  }

  const withScenes = tiles.map((t, i) => (i < 2 ? { ...t, scenes: [{ name: "a-track", frames: [0, 33, 66, 100].map((pct) => ({ pct, url: "f", px: { width: 1440, height: 900 } })) }, { name: "b-track", frames: [0, 33, 66, 100].map((pct) => ({ pct, url: "f", px: { width: 1440, height: 900 } })) }] } : t));
  const scened = planSheets(withScenes, "desktop");
  check("planSheets with scene frames stays within 1600×2000 and places every frame", scened.every((s) => s.height <= 2000 && s.images.every((o) => o.dx + o.dw <= 1600.5 && o.dy + o.dh <= s.height + 0.5)) && scened.flatMap((s) => s.texts).filter((x) => /track \d+%/.test(x.text)).length === 16, JSON.stringify(scened.map((s) => [s.height, s.images.length])));

  console.log("pinned scenes");
  {
    const pg = await browser.newPage();
    await pg.send("Page.enable");
    await pg.send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
    const nv = pg.waitFor("Page.loadEventFired");
    await pg.send("Page.navigate", { url: `${base}/fixture.html?quiet` });
    await nv;
    const scenes = await pg.call(findScenes);
    check("a sticky stage inside a taller track is found as a scene (the header and sticky nav are not)", scenes.length === 1 && scenes[0].trackHeight === 1400 && scenes[0].stageHeight === 900, JSON.stringify(scenes));
    await pg.close();
  }

  console.log("perf statistics");
  const mkRun = (ys, docH = 15000) => ({ lcp: 2000, tbt: 100, fcp: 900, lcpEl: "h1", docH, viewportH: 823, scroll: { over50: ys.length, max: 90, slowFrames: ys.map((y) => ({ t: 1, ms: 60, y, section: "§1" })) } });
  const clustered = slowFramePattern([mkRun([5000, 5100, 5200, 5300]), mkRun([5050, 5150, 9000])]);
  check("slow frames in one stretch are 'clustered'", clustered.kind === "clustered" && clustered.cluster.fromY >= 5000 && clustered.cluster.toY <= 5300, JSON.stringify(clustered));
  const noisy = slowFramePattern([mkRun([200, 3000, 6000, 9000, 12000]), mkRun([1500, 4500, 7500, 10500, 13500])]);
  check("slow frames spread over the whole page are 'noisy'", noisy.kind === "noisy", JSON.stringify(noisy));
  const repeatable = slowFramePattern([mkRun([300, 3000, 6000, 9000, 12000]), mkRun([320, 2980, 6050, 9020, 12010]), mkRun([280, 3040, 5990, 8960, 12040])]);
  check("slow frames spread out but at the same scroll positions in every run are 'repeatable', not noise", repeatable.kind === "repeatable", JSON.stringify(repeatable));
  check("no slow frames", slowFramePattern([mkRun([])]).kind === "none");
  const noisyRuns = [mkRun([200, 3000, 6000, 9000, 12000]), mkRun([1500, 4500, 7500, 10500, 13500]), mkRun([])];
  const noisySummary = summarizeRuns("p", noisyRuns);
  const noisyGate = evaluatePerf(noisySummary);
  check("perf gate: a median above 2 slow frames that is noisy is only a warning", noisySummary.median.over50 === 5 && noisySummary.pattern.kind === "noisy" && noisyGate.status === "warn" && noisyGate.stats.noisy === true, JSON.stringify([noisySummary.median, noisySummary.pattern.kind, noisyGate.status]));
  const clusteredSummary = summarizeRuns("p", [mkRun([5000, 5050, 5100, 5150]), mkRun([5010, 5060, 5110]), mkRun([5020, 5070, 5120, 5170])]);
  check("perf gate: slow frames clustered in one stretch fail, and name the stretch", evaluatePerf(clusteredSummary).status === "fail" && /clustered at scrollY 50/.test(evaluatePerf(clusteredSummary).items[0].value), JSON.stringify(evaluatePerf(clusteredSummary).items));
  const slowLcp = evaluatePerf(summarizeRuns("p", [{ ...mkRun([]), lcp: 3000 }, { ...mkRun([]), lcp: 3100 }, { ...mkRun([]), lcp: 1900 }]));
  check("perf gate uses the median: one fast run out of three does not rescue a slow page, one slow run does not condemn a fast one", slowLcp.status === "fail" && evaluatePerf(summarizeRuns("p", [{ ...mkRun([]), lcp: 4000 }, { ...mkRun([]), lcp: 2100 }, { ...mkRun([]), lcp: 2200 }])).status === "pass");
  const sum = summarizeRuns("p", [{ ...mkRun([]), lcp: 2000, tbt: 100 }, { ...mkRun([]), lcp: 4000, tbt: 300 }, { ...mkRun([]), lcp: 2200, tbt: 120 }]);
  check("median of three runs, range kept", sum.median.lcp === 2200 && sum.median.tbt === 120 && sum.range.lcp[0] === 2000 && sum.range.lcp[1] === 4000, JSON.stringify(sum.median));
  const sum2 = summarizeRuns("p", [mkRun([]), { ...mkRun([]), lcp: 3000 }]);
  check("median of two runs is their mean", sum2.median.lcp === 2500);

  console.log("contrast sampling verdicts");
  const c = { total: 3, pass: 0, fail: 0, warn: 0, unknown: 3, fails: [], warns: [], unknowns: [{ sel: "a", rects: [[0, 0, 1, 1]], sampleFg: {} }, { sel: "b", rects: [[0, 0, 1, 1]], sampleFg: {} }, { sel: "c", rects: [[0, 0, 1, 1]], sampleFg: {} }] };
  applyContrastSamples(c, [{ key: 0, n: 100, p5: 1.5, p50: 2, failFrac: 0.6 }, { key: 1, n: 100, p5: 3, p50: 6, failFrac: 0.3 }, { key: 2, n: 100, p5: 5, p50: 7, failFrac: 0.05 }]);
  check("more than half of the pixels too close = fail, 10–50% = warning, else pass", c.fail === 1 && c.warn === 1 && c.pass === 1 && c.unknown === 0);

  console.log("pixel diff, sheets");
  const files = await startFileServer([tmp]);
  const page = await browser.newPage();
  await page.send("Page.enable");
  await page.send("Emulation.setDeviceMetricsOverride", { width: 800, height: 600, deviceScaleFactor: 1, mobile: false });
  const nav = page.waitFor("Page.loadEventFired");
  await page.send("Page.navigate", { url: `${base}/fixture.html?quiet&h1` });
  await nav;
  await new Promise((r) => setTimeout(r, 800));
  await page.eval("document.querySelectorAll('[style*=animation]').forEach(e => e.style.animation = 'none')");
  const shot = async (name) => {
    const file = path.join(tmp, name);
    writeFileSync(file, await page.screenshot({ format: "png", captureBeyondViewport: true, clip: { x: 0, y: 0, width: 800, height: await page.eval("document.documentElement.scrollHeight"), scale: 1 } }));
    return file;
  };
  const before = await shot("before.png");
  const before2 = await shot("before2.png");
  await page.eval("(() => { const d = document.createElement('div'); d.id = 'qa-box'; d.style.cssText = 'position:absolute;left:100px;top:300px;width:200px;height:120px;background:#d00'; document.body.appendChild(d); })()");
  const after = await shot("after.png");
  const diffs = await diffShots({
    browser,
    files,
    outDir: path.join(tmp, "diffs"),
    items: [
      { id: "same", oldFile: before, newFile: before2, dpr: 1, masks: [] },
      { id: "changed", oldFile: before, newFile: after, dpr: 1, masks: [] },
      { id: "masked", oldFile: before, newFile: after, dpr: 1, masks: [{ x: 100, y: 300, w: 200, h: 120 }] },
    ],
  });
  const by = Object.fromEntries(diffs.map((d) => [d.id, d]));
  // text on a backdrop-filter panel is rasterised slightly differently from one shot to the next (a few hundred pixels at most)
  check("diff: two shots of the same page differ by less than 0.1% of the pixels", by.same.pct < 0.1, JSON.stringify(by.same));
  check("diff: a 200×120 box is found, with a boxed diff image and before|after crops", by.changed.changedPixels >= 24000 * 0.95 && by.changed.regions >= 1 && statSync(path.join(tmp, "diffs", by.changed.diffImage)).size > 1000 && by.changed.crops.length >= 1, JSON.stringify(by.changed));
  const b0 = by.changed.boxes[0];
  check("diff: the box lies where the red square was", b0 && b0.x <= 100 && b0.y <= 300 && b0.x + b0.w >= 300 && b0.y + b0.h >= 420, JSON.stringify(b0));
  check("diff: masked regions (3D scene, map) are ignored", by.masked.changedPixels === 0, JSON.stringify(by.masked));
  const written = await writeSheets({ browser, files, outDir: tmp, group: "selftest", kind: "desktop", tiles: [{ id: "fixture", label: "fixture", w: 800, vh: 600, docH: await page.eval("document.documentElement.scrollHeight"), dpr: 1, foldFile: before, fullFile: before }] });
  check("sheets: a JPEG is written and stays within 1600×2000", written.length === 1 && written[0].height <= 2000 && statSync(path.join(tmp, written[0].file)).size > 2000, JSON.stringify(written));
  await page.close();
  files.stop();
} finally {
  await browser.close();
  server.close();
  rmSync(tmp, { recursive: true, force: true });
}

const failed = results.filter((r) => !r.ok);
console.log(`\nselftest: ${results.length - failed.length}/${results.length} passed`);
process.exit(failed.length ? 1 : 0);
