// Writes src/content/doc-sizes.json: the size in bytes of every file in public/docs, so a download link can say how
// big the file is (see docBytes in src/lib/docs.ts). Run it when a document in public/docs changes:
//   node scripts/doc-sizes.mjs
import { readdirSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const dir = path.join(root, "public", "docs");
const sizes = {};

for (const file of readdirSync(dir).sort()) sizes[`/docs/${file}`] = statSync(path.join(dir, file)).size;

const lines = Object.entries(sizes).map(([href, bytes]) => ` ${JSON.stringify(href)}: ${bytes}`);
writeFileSync(path.join(root, "src", "content", "doc-sizes.json"), `{\n${lines.join(",\n")}\n}\n`);
console.log(`${Object.keys(sizes).length} documents`);
