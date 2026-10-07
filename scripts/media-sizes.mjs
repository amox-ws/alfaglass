// Writes src/content/media-sizes.json: the natural size of every image in public/media, so pages can choose a
// layout that never shows a photo larger than its source (see PageHero and mediaSize in src/lib/media.ts).
// Run it after build-content.py has changed public/media:  node scripts/media-sizes.mjs
import { readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const dir = path.join(root, "public", "media");
const sizes = {};

for (const file of readdirSync(dir).sort()) {
  if (!/\.(jpe?g|png|webp|avif)$/i.test(file)) continue;
  const { width, height } = await sharp(path.join(dir, file)).metadata();
  if (width && height) sizes[`/media/${file}`] = [width, height];
}

const lines = Object.entries(sizes).map(([src, size]) => ` ${JSON.stringify(src)}: ${JSON.stringify(size)}`);
writeFileSync(path.join(root, "src", "content", "media-sizes.json"), `{\n${lines.join(",\n")}\n}\n`);
console.log(`${Object.keys(sizes).length} images`);
