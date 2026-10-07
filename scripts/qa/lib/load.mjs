// One page load at one viewport: drive Chrome, collect console/network events, run the in-page analysis,
// take screenshots. Returns raw data; gates.mjs turns it into pass/fail.

import { writeFileSync } from "node:fs";
import path from "node:path";
import { sleep } from "./lifecycle.mjs";
import { collect, findScenes, freezeInfinite, hideText, setResting, settleHero, settlePage, walkPage } from "./inpage.mjs";
import { stitchVertical } from "./png.mjs";

export const VIEWPORTS = {
  mobile: { name: "mobile", width: 390, height: 844, dpr: 2, mobile: true, touch: true },
  tablet: { name: "tablet", width: 768, height: 1024, dpr: 2, mobile: true, touch: true },
  desktop: { name: "desktop", width: 1440, height: 900, dpr: 1, mobile: false, touch: false },
};
export const REDUCED = { ...VIEWPORTS.desktop, name: "desktop-rm", reducedMotion: true };

/**
 * Chrome draws a screenshot into one texture of at most 16384 device pixels: a taller capture wraps (at dpr 2 the header
 * and the hero show up again from about 8192 css px, and the bottom of the page is never seen). Pages taller than
 * this are shot in tiles and joined into one PNG, so everything downstream (contact sheets, diffs, pixel sampling) can
 * treat the page as one image at the viewport's own resolution.
 */
export const MAX_TILE_DEVICE_PX = 16000;

/** The whole page (css px: width × height) as one PNG; returns { png, tiles }. */
export async function shootFullPage(page, { width, height, dpr }) {
  const tile = Math.max(1000, Math.floor(MAX_TILE_DEVICE_PX / dpr));
  const shoot = (y, h) => page.screenshot({ format: "png", captureBeyondViewport: true, clip: { x: 0, y, width, height: h, scale: 1 } });
  if (height <= tile) return { png: await shoot(0, height), tiles: 1 };
  const parts = [];
  for (let y = 0; y < height; y += tile) parts.push(await shoot(y, Math.min(tile, height - y)));
  return { png: stitchVertical(parts), tiles: parts.length };
}

const argText = (args = []) =>
  args
    .map((a) => (a.value !== undefined ? (typeof a.value === "string" ? a.value : JSON.stringify(a.value)) : (a.description ?? a.type)))
    .join(" ")
    .slice(0, 400);

/**
 * opts: { baseUrl, page: {id,url,lang,expectStatus}, vp, shotsDir, screenshots: bool, timing: {...} }
 */
export async function runLoad(browser, opts) {
  const { baseUrl, page: def, vp } = opts;
  const t = { afterLoad: 1500, stepDelay: 70, settleMs: 1200, imageTimeout: 6000, ...(opts.timing || {}) };
  const started = Date.now();
  const origin = new URL(baseUrl).origin;
  const url = new URL(def.url, baseUrl).href;
  const expect = def.expectStatus ?? 200;
  const page = await browser.newPage();
  const errors = [];
  const reqs = new Map();
  const netFailed = new Map();
  const logs = [];
  let docStatus = null;
  const result = { pageId: def.id, group: def.group, lang: def.lang, viewport: vp.name, url: def.url, expectStatus: expect };

  try {
    await Promise.all([page.send("Page.enable"), page.send("Runtime.enable"), page.send("Network.enable"), page.send("Log.enable")]);
    page.on("Runtime.consoleAPICalled", (p) => {
      if (p.type === "error") errors.push({ kind: "console", text: argText(p.args), url: p.stackTrace?.callFrames?.[0]?.url || "" });
    });
    page.on("Runtime.exceptionThrown", (p) => {
      const d = p.exceptionDetails;
      errors.push({ kind: "exception", text: (d.exception?.description || d.text || "").split("\n")[0].slice(0, 300), url: d.url || "" });
    });
    page.on("Log.entryAdded", (p) => {
      if (p.entry.level === "error") logs.push({ source: p.entry.source, text: String(p.entry.text).slice(0, 300), url: p.entry.url || "" });
    });
    page.on("Network.requestWillBeSent", (p) => reqs.set(p.requestId, { url: p.request.url, type: p.type, frameId: p.frameId }));
    page.on("Network.responseReceived", (p) => {
      const r = reqs.get(p.requestId) || { url: p.response.url, type: p.type };
      if (p.type === "Document" && new URL(p.response.url).origin === origin) docStatus = p.response.status;
      if (new URL(p.response.url).origin === origin && p.response.status >= 400) {
        netFailed.set(p.requestId, { kind: "http", status: p.response.status, url: p.response.url, type: r.type });
      }
    });
    page.on("Network.loadingFailed", (p) => {
      const r = reqs.get(p.requestId);
      if (!r || p.canceled || /ERR_ABORTED/.test(p.errorText || "")) return;
      if (new URL(r.url).origin !== origin) return;
      netFailed.set(p.requestId, { kind: "netfail", status: 0, url: r.url, type: r.type, text: p.errorText });
    });

    await page.send("Emulation.setDeviceMetricsOverride", { width: vp.width, height: vp.height, deviceScaleFactor: vp.dpr, mobile: vp.mobile });
    if (vp.touch) await page.send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 });
    if (vp.reducedMotion) await page.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });

    const loaded = page.waitFor("Page.loadEventFired", { timeout: 45000 });
    const nav = await page.send("Page.navigate", { url });
    if (nav.errorText) throw new Error(`navigation failed: ${nav.errorText}`);
    await loaded;
    await sleep(t.afterLoad);

    result.walk = await page.call(walkPage, { stepDelay: t.stepDelay });
    result.settle = await page.call(settlePage, { imageTimeout: t.imageTimeout, settleMs: t.settleMs });
    if (!vp.reducedMotion && !vp.touch) result.hero = await page.call(settleHero);

    // Make endless animations repeatable, then screenshots (fold first, then the whole page).
    await page.call(freezeInfinite);
    await sleep(100);
    if (opts.screenshots) {
      const base = path.join(opts.shotsDir, `${def.id}-${vp.name}`);
      const fold = await page.screenshot({ format: "png" });
      writeFileSync(`${base}-fold.png`, fold);
      const docH = await page.eval("document.documentElement.scrollHeight");
      const full = await shootFullPage(page, { width: vp.width, height: docH, dpr: vp.dpr });
      writeFileSync(`${base}.png`, full.png);
      result.shots = { fold: `${def.id}-${vp.name}-fold.png`, full: `${def.id}-${vp.name}.png`, width: vp.width, height: docH, dpr: vp.dpr, viewportHeight: vp.height, tiles: full.tiles, scenes: [] };
      // Pinned scroll scenes show a blank track in a full-page shot: shoot each one at 0, 33, 66 and 100% of its track.
      if (opts.scenes !== false && (vp.name === "mobile" || vp.name === "desktop")) {
        const scenes = await page.call(findScenes);
        for (const [k, sc] of scenes.entries()) {
          const frames = [];
          for (const pct of [0, 33, 66, 100]) {
            const y = Math.round(sc.trackTop + (pct / 100) * Math.max(0, sc.trackHeight - sc.stageHeight));
            await page.eval(`window.scrollTo(0, ${y})`);
            await sleep(750);
            const file = `${def.id}-${vp.name}-scene${k + 1}-${pct}.jpg`;
            writeFileSync(path.join(opts.shotsDir, file), await page.screenshot({ format: "jpeg", quality: 85 }));
            frames.push({ pct, file });
          }
          result.shots.scenes.push({ name: sc.name, frames });
        }
        if (scenes.length) {
          await page.eval("window.scrollTo(0, 0)");
          await sleep(t.settleMs + 300);
        }
      }
    }

    if (opts.analyze !== false) {
      const common = { lang: def.lang, touch: vp.touch, viewport: vp.name, maxItems: 40 };
      result.raw = await page.call(collect, { ...common, phase: "live", rm: !!vp.reducedMotion });
      if (!vp.reducedMotion) {
        // Contrast is judged on the final frames: with prefers-reduced-motion the site's base rules are exactly those
        // (scroll scenes fully open, words lit), whereas "animations off" would leave shutters closed. Switch live, no reload.
        await page.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
        await page.call(setResting, true);
        await sleep(250);
        result.contrast = (await page.call(collect, { ...common, phase: "resting" })).contrast;
        // Texts over photos, glass or the 3D scene: shoot the page without glyphs so their real background can be sampled.
        if (opts.screenshots && result.contrast.unknowns.some((u) => u.rects && u.rects.length)) {
          await page.call(hideText, true);
          await sleep(150);
          const docH2 = await page.eval("document.documentElement.scrollHeight");
          const bg = await shootFullPage(page, { width: vp.width, height: docH2, dpr: vp.dpr });
          const bgName = `${def.id}-${vp.name}.bg.png`;
          writeFileSync(path.join(opts.shotsDir, bgName), bg.png);
          result.sampleFile = bgName;
          await page.call(hideText, false);
        }
        await page.call(setResting, false);
      }
      result.dynamic = result.raw.dynamic;
    } else {
      // screenshots only (regression set): still need the regions that change between runs
      result.dynamic = await page.eval(`(() => { const dyn = []; const push = (el, why) => { const r = el.getBoundingClientRect(); if (r.width > 0 && r.height > 0) dyn.push({ x: Math.round(r.left + scrollX), y: Math.round(r.top + scrollY), w: Math.round(r.width), h: Math.round(r.height), why }); };
        for (const c of document.querySelectorAll('canvas, iframe, video, [data-qa-dynamic]')) push(c, c.tagName.toLowerCase());
        for (const a of document.getAnimations()) { try { const t = a.effect && a.effect.getComputedTiming(); if (t && t.iterations === Infinity && a.effect.target) push(a.effect.target, 'endless-animation'); } catch {} }
        return dyn; })()`);
    }
  } catch (err) {
    result.fatal = String(err.message || err);
  } finally {
    // Same-origin failures: merge network events and the matching console lines.
    const failedUrls = new Set();
    for (const f of netFailed.values()) {
      const isDoc = f.type === "Document" && f.url === url;
      if (isDoc && f.status === expect) continue; // the 404 page itself
      failedUrls.add(f.url);
      errors.push({ kind: f.kind, text: f.status ? `HTTP ${f.status}` : f.text, url: f.url, type: f.type });
    }
    for (const l of logs) {
      if (l.source === "network") {
        if (l.url && new URL(l.url, url).origin !== origin) continue;
        if (l.url === url && expect >= 400) continue;
        if (failedUrls.has(l.url)) continue;
      }
      errors.push({ kind: "log", text: l.text, url: l.url });
    }
    if (docStatus !== null && docStatus !== expect) errors.push({ kind: "status", text: `document status ${docStatus}, expected ${expect}`, url: def.url });
    result.docStatus = docStatus;
    result.errors = errors;
    result.crashed = !!page.crashed;
    result.ms = Date.now() - started;
    await page.close();
  }
  return result;
}
