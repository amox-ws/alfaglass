#!/usr/bin/env node
// A zoomed crop of a harness screenshot, cut by Chrome. Coordinates are CSS px of the page (the y labels on the contact sheets).
//   node scripts/qa/crop.mjs <screenshot.png | run-label:file.png> <x> <y> <width> <height> [--scale 1.5] [--out crop.jpg]
// Example: node scripts/qa/crop.mjs home-w1:home-el-mobile.png 0 2400 390 700 --scale 2

import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { Browser } from "./lib/cdp.mjs";
import { cropShot, startFileServer } from "./lib/compose.mjs";

const args = process.argv.slice(2);
const flag = (name, def) => {
  const i = args.indexOf(name);
  if (i < 0) return def;
  const v = args[i + 1];
  args.splice(i, 2);
  return v;
};
const scale = Number(flag("--scale", "1"));
let out = flag("--out", null);
const dprFlag = flag("--dpr", null);
const [srcArg, x, y, w, h] = args;
if (!srcArg || [x, y, w, h].some((v) => v === undefined || Number.isNaN(Number(v)))) {
  console.error("usage: node scripts/qa/crop.mjs <screenshot.png | run-label:file.png> <x> <y> <width> <height> [--scale 1.5] [--out crop.jpg] [--dpr 2]");
  process.exit(2);
}

let src = srcArg;
if (!existsSync(src) && srcArg.includes(":")) {
  const [label, name] = srcArg.split(":");
  src = path.resolve("qa", "runs", label, "shots", name);
}
src = path.resolve(src);
if (!existsSync(src)) {
  console.error(`no such screenshot: ${src}`);
  process.exit(2);
}
// mobile and tablet screenshots are taken at device pixel ratio 2
const dpr = dprFlag ? Number(dprFlag) : /-(mobile|tablet)(\.|-)/.test(path.basename(src)) ? 2 : 1;
if (!out) {
  const dir = path.join(path.dirname(path.dirname(src)), "crops");
  mkdirSync(dir, { recursive: true });
  out = path.join(dir, `${path.basename(src, path.extname(src))}-${x}-${y}-${w}x${h}.jpg`);
}

const files = await startFileServer([path.dirname(src)]);
const browser = await Browser.launch({ label: "qa-crop" });
try {
  await cropShot({ browser, files, src, x: Number(x), y: Number(y), w: Number(w), h: Number(h), dpr, scale, outFile: path.resolve(out) });
  console.log(path.resolve(out));
} finally {
  files.stop();
  await browser.close();
}
