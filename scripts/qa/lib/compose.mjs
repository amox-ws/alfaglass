// Contact sheets, pixel diffs and crops. The pixels are handled by Chrome (canvas); this side plans the layout,
// serves the screenshots to the compose page over a loopback HTTP server, and writes the results.

import { createReadStream, readFileSync, statSync, writeFileSync, openSync, readSync, closeSync, mkdirSync } from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { onCleanup } from "./lifecycle.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const MIME = { ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".html": "text/html; charset=utf-8" };

/** Loopback server for the compose page and the image files it may read (only under `roots`). */
export async function startFileServer(roots) {
  const allowed = roots.map((r) => path.resolve(r) + path.sep);
  const server = http.createServer((req, res) => {
    try {
      const u = new URL(req.url, "http://localhost");
      if (u.pathname === "/compose.html") {
        res.writeHead(200, { "content-type": MIME[".html"], "cache-control": "no-store" });
        res.end(readFileSync(path.join(HERE, "compose-page.html")));
        return;
      }
      if (u.pathname === "/file") {
        const p = path.resolve(u.searchParams.get("p") || "");
        if (!allowed.some((a) => p.startsWith(a))) {
          res.writeHead(403).end("forbidden");
          return;
        }
        const st = statSync(p);
        res.writeHead(200, {
          "content-type": MIME[path.extname(p).toLowerCase()] || "application/octet-stream",
          "content-length": st.size,
          "access-control-allow-origin": "*",
          "cache-control": "no-store",
        });
        createReadStream(p).pipe(res);
        return;
      }
      res.writeHead(404).end("not found");
    } catch (err) {
      res.writeHead(404).end(String(err.message || err));
    }
  });
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const port = server.address().port;
  const unregister = onCleanup(() => server.close());
  return {
    url: `http://127.0.0.1:${port}`,
    fileUrl: (p) => `http://127.0.0.1:${port}/file?p=${encodeURIComponent(path.resolve(p))}`,
    stop: () => {
      unregister();
      server.closeAllConnections?.();
      server.close();
    },
  };
}

/** Width and height of a PNG without decoding it. */
export function pngSize(file) {
  const fd = openSync(file, "r");
  try {
    const b = Buffer.alloc(24);
    readSync(fd, b, 0, 24, 0);
    return { width: b.readUInt32BE(16), height: b.readUInt32BE(20) };
  } finally {
    closeSync(fd);
  }
}

/* ------------------------------------------------------------------ contact sheets */

const SHEET = { width: 1600, maxHeight: 2000, margin: 10, gap: 8, label: 32, bandGap: 12 };

/**
 * tiles: [{ id, label, w, vh, docH, dpr, foldFile, fullFile }]  (css px)
 * Splits the pages over as few sheets as keep the type at a useful size, then picks the largest scale that fits 1600x2000.
 * Each page is a band: its above-the-fold view followed by the whole page cut into columns.
 */
export function planSheets(tiles, kind) {
  const { width: SW, maxHeight: SH, margin: M, gap: G, label: LABEL, bandGap: BGAP } = SHEET;
  const nominal = kind === "mobile" ? 0.4 : 0.2;
  const maxScale = kind === "mobile" ? 0.75 : 0.5;
  const SCENE_LABEL = 13;
  const band = (t, s) => {
    const colW = t.w * s;
    const C = Math.floor((SW - 2 * M + G) / (colW + G));
    if (C < 2) return null;
    const k = Math.min(C - 1, Math.max(1, Math.ceil(t.docH / t.vh)));
    const hs = Math.ceil(t.docH / k);
    // pinned scenes are shown as extra frames below the page, packed into rows
    const frames = (t.scenes || []).reduce((n, sc) => n + sc.frames.length, 0);
    const sceneRows = frames ? Math.ceil(frames / C) : 0;
    const sceneH = sceneRows ? G + sceneRows * (SCENE_LABEL + t.vh * s + G) : 0;
    return { colW, C, k, hs, sceneRows, content: Math.max(t.vh, hs) * s, h: LABEL + Math.max(t.vh, hs) * s + sceneH };
  };
  const heightOf = (list, s) => {
    let total = 2 * M;
    for (let i = 0; i < list.length; i++) {
      const b = band(list[i], s);
      if (!b) return Infinity;
      total += b.h + (i ? BGAP : 0);
    }
    return total;
  };

  const groups = [];
  let cur = [];
  for (const t of tiles) {
    if (cur.length && heightOf([...cur, t], nominal) > SH) {
      groups.push(cur);
      cur = [];
    }
    cur.push(t);
  }
  if (cur.length) groups.push(cur);

  return groups.map((list) => {
    let s;
    if (heightOf(list, maxScale) <= SH) s = maxScale;
    else {
      let lo = 0.06;
      let hi = maxScale;
      for (let i = 0; i < 30; i++) {
        const mid = (lo + hi) / 2;
        if (heightOf(list, mid) <= SH) lo = mid;
        else hi = mid;
      }
      s = lo;
    }
    const images = [];
    const texts = [];
    let y = M;
    list.forEach((t, idx) => {
      if (idx) y += BGAP;
      const b = band(t, s);
      texts.push({ text: t.label, x: M, y: y + 12, font: "bold 12px Menlo, monospace", color: "#1b1b2f" });
      const top = y + LABEL;
      // fold
      images.push({ src: t.foldUrl, sx: 0, sy: 0, sw: t.foldPx.width, sh: t.foldPx.height, dx: M, dy: top, dw: b.colW, dh: (t.foldPx.height / t.dpr) * s, stroke: "rgba(0,127,174,0.9)" });
      texts.push({ text: "fold", x: M + 2, y: y + 26, font: "11px Menlo, monospace", color: "#007fae" });
      // the whole page in columns
      for (let i = 0; i < b.k; i++) {
        const cssY = i * b.hs;
        const cssH = Math.min(b.hs, t.docH - cssY);
        if (cssH <= 0) break;
        const dx = M + (b.colW + G) * (1 + i);
        images.push({ src: t.fullUrl, sx: 0, sy: Math.round(cssY * t.dpr), sw: t.fullPx.width, sh: Math.min(t.fullPx.height - Math.round(cssY * t.dpr), Math.round(cssH * t.dpr)), dx, dy: top, dw: b.colW, dh: cssH * s });
        texts.push({ text: `y ${cssY}`, x: dx + 2, y: y + 26, font: "11px Menlo, monospace", color: "#555" });
      }
      // scene frames
      if (b.sceneRows) {
        let col = 0;
        let row = 0;
        const rowH = SCENE_LABEL + (t.vh * s) + G;
        const base = top + Math.max(t.vh, b.hs) * s + G;
        for (const sc of t.scenes) {
          for (const f of sc.frames) {
            if (col >= b.C) {
              col = 0;
              row++;
            }
            const dx = M + (b.colW + G) * col;
            const dy = base + row * rowH + SCENE_LABEL;
            images.push({ src: f.url, sx: 0, sy: 0, sw: f.px.width, sh: f.px.height, dx, dy, dw: b.colW, dh: (f.px.height / t.dpr) * s, stroke: "rgba(40,26,106,0.45)" });
            texts.push({ text: `${sc.name} ${f.pct}%`, x: dx + 2, y: dy - 3, font: "10px Menlo, monospace", color: "#555" });
            col++;
          }
        }
      }
      y += b.h;
    });
    return { scale: s, height: Math.ceil(y + M), images, texts };
  });
}

/** Builds the contact sheets for one kind ("desktop" | "mobile"); returns the written file names. */
export async function writeSheets({ browser, files, tiles, kind, group, outDir, quality = 0.75 }) {
  if (!tiles.length) return [];
  const planned = planSheets(
    tiles.map((t) => ({
      ...t,
      foldUrl: files.fileUrl(t.foldFile),
      fullUrl: files.fileUrl(t.fullFile),
      foldPx: pngSize(t.foldFile),
      fullPx: pngSize(t.fullFile),
      scenes: (t.scenes || []).map((sc) => ({ name: sc.name, frames: sc.frames.map((f) => ({ pct: f.pct, url: files.fileUrl(f.file), px: { width: Math.round(t.w * t.dpr), height: Math.round(t.vh * t.dpr) } })) })),
    })),
    kind
  );
  const page = await browser.newPage();
  const written = [];
  try {
    await page.send("Page.enable");
    const loaded = page.waitFor("Page.loadEventFired");
    await page.send("Page.navigate", { url: `${files.url}/compose.html` });
    await loaded;
    for (let i = 0; i < planned.length; i++) {
      const sheet = planned[i];
      const dataUrl = await page.eval(
        `QA.drawSheet(${JSON.stringify({ width: SHEET.width, height: sheet.height, bg: "#e6e9ef", quality, images: sheet.images, texts: sheet.texts })})`,
        { timeout: 120000 }
      );
      const name = `${group}-${kind}${i ? `-${i + 1}` : ""}.jpg`;
      writeFileSync(path.join(outDir, name), Buffer.from(dataUrl.split(",")[1], "base64"));
      written.push({ file: name, scale: Math.round(sheet.scale * 100) / 100, height: sheet.height });
    }
  } finally {
    await page.close();
  }
  return written;
}

/* ------------------------------------------------------------------ pixel diffs */

/**
 * Compares new screenshots with their baselines. items: [{ id, newFile, oldFile, dpr, masks }]
 * Writes <id>.diff.jpg (the new screenshot with changed regions boxed) and <id>-rN.jpg (before | after crops).
 */
export async function diffShots({ browser, files, items, outDir }) {
  const results = [];
  if (!items.length) return results;
  mkdirSync(outDir, { recursive: true });
  const page = await browser.newPage();
  try {
    await page.send("Page.enable");
    const loaded = page.waitFor("Page.loadEventFired");
    await page.send("Page.navigate", { url: `${files.url}/compose.html` });
    await loaded;
    for (const it of items) {
      const r = await page.eval(
        `QA.diffImages(${JSON.stringify({ oldUrl: files.fileUrl(it.oldFile), newUrl: files.fileUrl(it.newFile), dpr: it.dpr, masks: it.masks || [], images: true, maxWidth: 1600, maxCrops: 4 })})`,
        { timeout: 180000 }
      );
      const entry = { id: it.id, width: r.width, height: r.height, changedPixels: r.changed, maskedPixels: r.masked, pct: Math.round(r.pct * 1000) / 1000, regions: r.regions, boxes: r.boxes.map((b) => ({ x: Math.round(b.x / it.dpr), y: Math.round(b.y / it.dpr), w: Math.round(b.w / it.dpr), h: Math.round(b.h / it.dpr), pixels: b.pixels })) };
      if (r.diffImage) {
        entry.diffImage = `${it.id}.diff.jpg`;
        writeFileSync(path.join(outDir, entry.diffImage), Buffer.from(r.diffImage.split(",")[1], "base64"));
        entry.crops = [];
        (r.crops || []).forEach((c, i) => {
          const name = `${it.id}-r${i + 1}.jpg`;
          writeFileSync(path.join(outDir, name), Buffer.from(c.dataUrl.split(",")[1], "base64"));
          entry.crops.push(name);
        });
      }
      results.push(entry);
    }
  } finally {
    await page.close();
  }
  return results;
}

/** One crop of a screenshot, written to outFile (jpg or png). Coordinates in css px. */
export async function cropShot({ browser, files, src, x, y, w, h, dpr, scale = 1, outFile }) {
  const page = await browser.newPage();
  try {
    await page.send("Page.enable");
    const loaded = page.waitFor("Page.loadEventFired");
    await page.send("Page.navigate", { url: `${files.url}/compose.html` });
    await loaded;
    const type = outFile.endsWith(".png") ? "image/png" : "image/jpeg";
    const dataUrl = await page.eval(`QA.cropImage(${JSON.stringify({ src: files.fileUrl(src), x, y, w, h, dpr, scale, type })})`, { timeout: 60000 });
    writeFileSync(outFile, Buffer.from(dataUrl.split(",")[1], "base64"));
  } finally {
    await page.close();
  }
}

/**
 * Samples the pixels behind texts whose contrast cannot be derived from CSS (photos, glass, the 3D scene).
 * jobs: [{ id, file, dpr, items: [{ key, rects, fg, need }] }] -> Map(id -> [{ key, n, p5, p50, failFrac }])
 */
export async function sampleContrastBatch({ browser, files, jobs }) {
  const results = new Map();
  if (!jobs.length) return results;
  const page = await browser.newPage();
  try {
    await page.send("Page.enable");
    const loaded = page.waitFor("Page.loadEventFired");
    await page.send("Page.navigate", { url: `${files.url}/compose.html` });
    await loaded;
    for (const job of jobs) {
      const r = await page.eval(`QA.sampleContrast(${JSON.stringify({ src: files.fileUrl(job.file), dpr: job.dpr, items: job.items })})`, { timeout: 120000 });
      results.set(job.id, r);
    }
  } finally {
    await page.close();
  }
  return results;
}
