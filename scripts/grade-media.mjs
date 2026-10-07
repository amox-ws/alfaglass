// Grades the legacy facility photos offline, once, so that no page ever needs a CSS filter or a blend mode on a large photo
// (a repaint on a scroll-animated layer). Writes into public/media/:
//   <id>-night.jpg  a duotone: Rec. 709 luminance with a gentle S-curve (lift 0.04, gamma 0.95), mapped through the LUT
//                   0 -> #0d0b22 (night), 0.55 -> #3b4f8f (indigo-azure), 1 -> #eef3fb (frost). Behind type, in night chapters.
//   <id>-day.jpg    saturation x 0.82, white balance cooled (red x 0.985, blue x 1.03), blacks lifted 6 % toward #1b1a3f.
//                   Where the photo is the content (building, trucks, facilities).
// Product photos are never graded: their colour is information (tinted glass, coloured mirrors).
// The two engravings are night only, and their highlights are held down (the paper would glare in a night chapter).
// b2fdf78b2e is byte-identical to f85c9da8d8 (the two names come from the legacy library), so it is graded once.
// It also draws the film grain, public/media/grain.png: an feTurbulence tile of 128px, rendered once (the `.grain` overlay is
// this tile at 3% opacity, so it needs no filter at runtime).
// Then run:  node scripts/media-sizes.mjs   (registers the new files in src/content/media-sizes.json)
//   node scripts/grade-media.mjs
import { statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "public", "media");

const SOURCES = [
  { id: "439a284966", label: "warehouse interior", grades: ["night", "day"], quality: { night: 70, day: 78 } },
  { id: "f85c9da8d8", label: "building, stormy sky (also b2fdf78b2e)", grades: ["night", "day"], quality: { night: 76, day: 76 } },
  { id: "d32636d1bc", label: "building, clear sky", grades: ["night", "day"], quality: { night: 80, day: 80 } },
  { id: "4b79e00574", label: "trucks panorama", grades: ["night", "day"], quality: { night: 82, day: 82 } },
  { id: "9a0710970e", label: "aerial panorama", grades: ["night", "day"], quality: { night: 82, day: 82 } },
  { id: "d43cadbad1", label: "office facade panorama (stock)", grades: ["night", "day"], quality: { night: 82, day: 82 } },
  { id: "c0c7dff009", label: "engraving", grades: ["night"], quality: { night: 82 }, hold: 0.74 },
  { id: "1232fb0c7b", label: "engraving strip", grades: ["night"], quality: { night: 82 }, hold: 0.74 },
];

const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const STOPS = [
  { at: 0, rgb: hex("#0d0b22") },
  { at: 0.55, rgb: hex("#3b4f8f") },
  { at: 1, rgb: hex("#eef3fb") },
];
const LIFT = 0.04;
const GAMMA = 0.95;

/** 256-entry table: luminance 0..255 -> [r, g, b] of the duotone. */
const lut = Array.from({ length: 256 }, (_, i) => {
  const y = i / 255;
  const lifted = Math.pow(LIFT + (1 - LIFT) * y, GAMMA);
  const smooth = lifted * lifted * (3 - 2 * lifted);
  const t = lifted + 0.35 * (smooth - lifted); // a gentle S: a third of the way to smoothstep
  const hi = STOPS.findIndex((s) => s.at >= t);
  const a = STOPS[Math.max(0, hi - 1)];
  const b = STOPS[Math.max(1, hi)];
  const f = Math.min(1, Math.max(0, (t - a.at) / (b.at - a.at)));
  return a.rgb.map((c, k) => Math.round(c + (b.rgb[k] - c) * f));
});

async function night(src, out, quality, hold = 1) {
  const { data, info } = await sharp(src).rotate().removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const px = new Uint8Array(info.width * info.height * 3);
  for (let i = 0, j = 0; i < data.length; i += 3, j += 3) {
    const y = (0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]) * hold;
    const c = lut[Math.max(0, Math.min(255, Math.round(y)))];
    px[j] = c[0];
    px[j + 1] = c[1];
    px[j + 2] = c[2];
  }
  await sharp(px, { raw: { width: info.width, height: info.height, channels: 3 } }).jpeg({ quality, mozjpeg: true }).toFile(out);
}

const COOL = [0.985, 1, 1.03];
const BLACK = hex("#1b1a3f");
async function day(src, out, quality) {
  const keep = 0.94; // blacks lifted 6 % toward #1b1a3f
  await sharp(src)
    .rotate()
    .removeAlpha()
    .modulate({ saturation: 0.82 })
    .linear(
      COOL.map((w) => w * keep),
      BLACK.map((c) => c * (1 - keep)),
    )
    .jpeg({ quality, mozjpeg: true })
    .toFile(out);
}

for (const s of SOURCES) {
  const src = path.join(dir, `${s.id}.jpg`);
  const meta = await sharp(src).metadata();
  const size = (f) => `${Math.round(statSync(f).size / 1024)} KB`;
  for (const grade of s.grades) {
    const out = path.join(dir, `${s.id}-${grade}.jpg`);
    if (grade === "night") await night(src, out, s.quality.night, s.hold ?? 1);
    else await day(src, out, s.quality.day);
    console.log(`${s.id}-${grade}.jpg  ${meta.width}x${meta.height}  ${size(out)} (source ${size(src)})  ${s.label}`);
  }
}

// The grain: fractal noise turned into an opaque grey tile that repeats without a seam
const grain = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128"><filter id="n" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" seed="7" stitchTiles="stitch"/><feColorMatrix values="0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0 0 0 0 1"/></filter><rect width="128" height="128" filter="url(#n)"/></svg>`;
const grainFile = path.join(dir, "grain.png");
// centred on mid-grey with a wide spread, so that 3% of it neither lightens nor darkens a night surface
const { data: noise, info: noiseInfo } = await sharp(Buffer.from(grain)).greyscale().raw().toBuffer({ resolveWithObject: true });
const mean = noise.reduce((a, v) => a + v, 0) / noise.length;
const spread = Math.sqrt(noise.reduce((a, v) => a + (v - mean) ** 2, 0) / noise.length) || 1;
const centred = Uint8Array.from(noise, (v) => Math.max(0, Math.min(255, Math.round(128 + ((v - mean) * 52) / spread))));
await sharp(centred, { raw: { width: noiseInfo.width, height: noiseInfo.height, channels: 1 } })
  .png({ compressionLevel: 9, palette: true, colors: 64 })
  .toFile(grainFile);
console.log(`grain.png  128x128  ${Math.round(statSync(grainFile).size / 1024)} KB`);
