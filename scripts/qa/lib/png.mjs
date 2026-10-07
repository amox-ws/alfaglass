// Just enough PNG to join screenshots taken in tiles (8-bit RGB or RGBA, not interlaced: what Chrome writes).
// Node's zlib does the compression; no dependencies.

import zlib from "node:zlib";

const SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

function readChunks(buf) {
  if (buf.length < 8 || !buf.subarray(0, 8).equals(SIGNATURE)) throw new Error("not a PNG file");
  const chunks = [];
  for (let p = 8; p + 12 <= buf.length; ) {
    const len = buf.readUInt32BE(p);
    const type = buf.toString("latin1", p + 4, p + 8);
    chunks.push({ type, data: buf.subarray(p + 8, p + 8 + len) });
    p += 12 + len;
    if (type === "IEND") break;
  }
  return chunks;
}

/** Decodes a PNG into its rows of pixels (the filter bytes are removed). */
export function decodePng(buf) {
  const chunks = readChunks(buf);
  const head = chunks.find((c) => c.type === "IHDR");
  if (!head) throw new Error("PNG without a header");
  const width = head.data.readUInt32BE(0);
  const height = head.data.readUInt32BE(4);
  const depth = head.data[8];
  const color = head.data[9];
  const interlace = head.data[12];
  if (depth !== 8 || interlace !== 0 || (color !== 2 && color !== 6)) {
    throw new Error(`unsupported PNG (bit depth ${depth}, colour type ${color}, interlace ${interlace}): only 8-bit RGB and RGBA`);
  }
  const bpp = color === 6 ? 4 : 3;
  const stride = width * bpp;
  const raw = zlib.inflateSync(Buffer.concat(chunks.filter((c) => c.type === "IDAT").map((c) => c.data)));
  if (raw.length !== (stride + 1) * height) throw new Error(`PNG data has ${raw.length} bytes, expected ${(stride + 1) * height}`);
  const out = Buffer.alloc(stride * height);
  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)];
    const src = y * (stride + 1) + 1;
    const dst = y * stride;
    const up = y ? dst - stride : -1;
    switch (filter) {
      case 0:
        raw.copy(out, dst, src, src + stride);
        break;
      case 1:
        for (let i = 0; i < stride; i++) out[dst + i] = (raw[src + i] + (i >= bpp ? out[dst + i - bpp] : 0)) & 255;
        break;
      case 2:
        for (let i = 0; i < stride; i++) out[dst + i] = (raw[src + i] + (up >= 0 ? out[up + i] : 0)) & 255;
        break;
      case 3:
        for (let i = 0; i < stride; i++) {
          const left = i >= bpp ? out[dst + i - bpp] : 0;
          const above = up >= 0 ? out[up + i] : 0;
          out[dst + i] = (raw[src + i] + ((left + above) >> 1)) & 255;
        }
        break;
      case 4:
        for (let i = 0; i < stride; i++) {
          const a = i >= bpp ? out[dst + i - bpp] : 0;
          const b = up >= 0 ? out[up + i] : 0;
          const c = up >= 0 && i >= bpp ? out[up + i - bpp] : 0;
          const p = a + b - c;
          const pa = Math.abs(p - a);
          const pb = Math.abs(p - b);
          const pc = Math.abs(p - c);
          out[dst + i] = (raw[src + i] + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c)) & 255;
        }
        break;
      default:
        throw new Error(`PNG row ${y} has the unknown filter ${filter}`);
    }
  }
  return { width, height, color, bpp, data: out };
}

function crc32(buf) {
  if (typeof zlib.crc32 === "function") return zlib.crc32(buf) >>> 0;
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}

function chunk(type, data) {
  const out = Buffer.alloc(12 + data.length);
  out.writeUInt32BE(data.length, 0);
  out.write(type, 4, "latin1");
  data.copy(out, 8);
  out.writeUInt32BE(crc32(out.subarray(4, 8 + data.length)), 8 + data.length);
  return out;
}

/** Encodes decoded rows (see decodePng) as a PNG. */
export function encodePng({ width, height, color, data }) {
  const bpp = color === 6 ? 4 : 3;
  const stride = width * bpp;
  const raw = Buffer.alloc((stride + 1) * height); // every row with the filter byte 0 (none)
  for (let y = 0; y < height; y++) data.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  const head = Buffer.alloc(13);
  head.writeUInt32BE(width, 0);
  head.writeUInt32BE(height, 4);
  head[8] = 8;
  head[9] = color;
  return Buffer.concat([SIGNATURE, chunk("IHDR", head), chunk("IDAT", zlib.deflateSync(raw, { level: 3 })), chunk("IEND", Buffer.alloc(0))]);
}

/** Joins PNGs of the same width one below the other. */
export function stitchVertical(buffers) {
  if (buffers.length === 1) return buffers[0];
  const parts = buffers.map(decodePng);
  const { width, color } = parts[0];
  if (parts.some((p) => p.width !== width || p.color !== color)) throw new Error("tiles differ in width or colour type, cannot stitch");
  return encodePng({ width, color, height: parts.reduce((n, p) => n + p.height, 0), data: Buffer.concat(parts.map((p) => p.data)) });
}
