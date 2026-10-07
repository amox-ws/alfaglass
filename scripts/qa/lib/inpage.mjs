// Code that runs INSIDE the page. Every exported function is serialised with Function.prototype.toString()
// and evaluated in Chrome, so each one must be self-contained: no imports, no references to module scope.

/* ------------------------------------------------------------------ page preparation */

/** Scroll the page in 50% viewport steps to the bottom, then back to the top, so scroll-triggered reveals have played. */
export async function walkPage(opts) {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const frame = () => new Promise((r) => requestAnimationFrame(() => r()));
  const scroller = document.scrollingElement || document.documentElement;
  const step = Math.max(160, Math.round(innerHeight * 0.5));
  const t0 = performance.now();
  let y = 0;
  let steps = 0;
  for (;;) {
    const maxY = Math.max(0, scroller.scrollHeight - innerHeight);
    window.scrollTo(0, Math.min(y, maxY));
    await frame();
    await frame();
    await sleep(opts.stepDelay);
    steps++;
    if (y >= maxY || steps > 800) break;
    y += step;
  }
  await sleep(250);
  window.scrollTo(0, 0);
  await frame();
  return { steps, ms: Math.round(performance.now() - t0), docH: scroller.scrollHeight };
}

/** Force every lazy image to load, wait for images and fonts, then let transitions finish. */
export async function settlePage(opts) {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const imgs = Array.from(document.images);
  for (const img of imgs) if (!img.complete && img.loading === "lazy") img.loading = "eager";
  const pending = imgs.filter((i) => !i.complete && i.getAttribute("src"));
  await Promise.race([
    Promise.all(
      pending.map(
        (i) =>
          new Promise((r) => {
            i.addEventListener("load", r, { once: true });
            i.addEventListener("error", r, { once: true });
          })
      )
    ),
    sleep(opts.imageTimeout),
  ]);
  try {
    await document.fonts.ready;
  } catch {
    /* ignore */
  }
  // decoded bitmaps, so a screenshot never catches an image half way (that would look like a change in a diff)
  await Promise.race([Promise.all(imgs.map((i) => (i.complete && i.decode ? i.decode().catch(() => {}) : null))), sleep(4000)]);
  await sleep(opts.settleMs);
  return { images: imgs.length, stillPending: imgs.filter((i) => !i.complete && i.getAttribute("src")).length };
}

/** Desktop home: wait until the hero is in its final mode (3D scene took over, or the CSS panes). */
export async function settleHero() {
  const hero = document.querySelector(".hero");
  if (!hero) return null;
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const t0 = performance.now();
  while (hero.dataset.glass === "auto" && performance.now() - t0 < 4000) await sleep(100);
  let steady = 0;
  while (hero.dataset.glass === "3d" && performance.now() - t0 < 12000) {
    const h1 = hero.querySelector("h1");
    const hidden = h1 && parseFloat(getComputedStyle(h1).opacity) === 0;
    steady = hidden ? steady + 150 : 0;
    // The scene needs a few quiet seconds: if it cannot hold its frame rate it hands over to the CSS panes.
    if (steady >= 3500) break;
    await sleep(150);
  }
  await sleep(1800);
  const h1 = hero.querySelector("h1");
  return { mode: hero.dataset.glass, canvas: !!hero.querySelector("canvas"), h1Opacity: h1 ? parseFloat(getComputedStyle(h1).opacity) : null, ms: Math.round(performance.now() - t0) };
}

/**
 * Pinned scroll scenes: a sticky stage about as tall as the viewport inside a much taller track. A full-page screenshot
 * shows only the first frame of such a scene and a blank track, so the harness also shoots the scene at a few points.
 */
export function findScenes() {
  const vh = innerHeight;
  const scenes = [];
  for (const el of document.querySelectorAll("*")) {
    const s = getComputedStyle(el);
    if (s.position !== "sticky" || !(parseFloat(s.top) <= 1)) continue;
    const r = el.getBoundingClientRect();
    const track = el.parentElement;
    if (!track || r.height < vh * 0.7) continue;
    const tr = track.getBoundingClientRect();
    if (tr.height < r.height * 1.3) continue;
    const name = (typeof track.className === "string" && track.className.split(/\s+/)[0]) || track.tagName.toLowerCase();
    scenes.push({ name, trackTop: Math.round(tr.top + scrollY), trackHeight: Math.round(tr.height), stageHeight: Math.round(r.height) });
  }
  return scenes.slice(0, 4);
}

/** Stop endless animations (marquee, pings) at their first frame so screenshots are repeatable. */
export function freezeInfinite() {
  let n = 0;
  for (const a of document.getAnimations()) {
    try {
      const t = a.effect && a.effect.getComputedTiming();
      if (t && t.iterations === Infinity) {
        a.pause();
        a.currentTime = 0;
        n++;
      }
    } catch {
      /* ignore */
    }
  }
  return n;
}

/** The resting state of the page: every CSS animation and transition at its final frame. */
export function setResting(on) {
  const id = "qa-resting-style";
  const existing = document.getElementById(id);
  if (!on) {
    if (existing) existing.remove();
    return false;
  }
  if (!existing) {
    const st = document.createElement("style");
    st.id = id;
    st.textContent = "*,*::before,*::after{animation:none !important;transition:none !important}";
    document.head.appendChild(st);
  }
  // force a style flush
  void document.documentElement.offsetHeight;
  return true;
}

/** Makes every glyph transparent so a screenshot shows only what is behind the text (contrast sampling). */
export function hideText(on) {
  const id = "qa-hide-text-style";
  const existing = document.getElementById(id);
  if (!on) {
    if (existing) existing.remove();
    return false;
  }
  if (!existing) {
    const st = document.createElement("style");
    st.id = id;
    st.textContent =
      "*,*::before,*::after{color:transparent !important;-webkit-text-fill-color:transparent !important;text-shadow:none !important;-webkit-text-stroke:0 !important;text-decoration-color:transparent !important;caret-color:transparent !important}";
    document.head.appendChild(st);
  }
  void document.documentElement.offsetHeight;
  return true;
}

/* ------------------------------------------------------------------ the analysis */

/**
 * Measures the page at scroll 0. opts: { phase: "live" | "resting", lang, touch, viewport, rm, maxItems }
 * "live": every gate except contrast, plus the critic measurements.
 * "resting": contrast only, run while prefers-reduced-motion is emulated (the site's base rules are its final frames).
 */
export async function collect(opts) {
  const doc = document;
  const root = doc.documentElement;
  const body = doc.body;
  const VW = root.clientWidth;
  const VH = window.innerHeight;
  const MAX = opts.maxItems || 40;
  const t0 = performance.now();
  const out = { phase: opts.phase };

  /* ---------- utilities ---------- */
  const r1 = (n) => Math.round(n * 10) / 10;
  const r2 = (n) => Math.round(n * 100) / 100;
  const clip = (s, n) => {
    s = String(s == null ? "" : s).replace(/\s+/g, " ").trim();
    return s.length > n ? s.slice(0, n - 1) + "…" : s;
  };
  const csMap = new WeakMap();
  const cs = (el) => {
    let s = csMap.get(el);
    if (!s) {
      s = getComputedStyle(el);
      csMap.set(el, s);
    }
    return s;
  };
  const NEG = -1e9;
  const POS = 1e9;
  const FULL = { l: NEG, t: NEG, r: POS, b: POS };
  const isect = (a, b) => ({ l: Math.max(a.l, b.l), t: Math.max(a.t, b.t), r: Math.min(a.r, b.r), b: Math.min(a.b, b.b) });
  const areaOf = (r) => Math.max(0, r.r - r.l) * Math.max(0, r.b - r.t);
  const toBox = (d) => ({ l: d.left, t: d.top, r: d.right, b: d.bottom });
  const boxOf = (el) => toBox(el.getBoundingClientRect());

  const mainEl = doc.getElementById("main");
  const mainKids = mainEl ? Array.from(mainEl.children) : [];
  const topSection = (el) => {
    if (!mainEl) return null;
    let n = el;
    while (n && n.parentElement !== mainEl) n = n.parentElement;
    return n || null;
  };
  const whereOf = (el) => {
    if (el.closest("header")) return "header";
    if (el.closest("footer")) return "footer";
    const top = topSection(el);
    return top ? "main§" + (mainKids.indexOf(top) + 1) : "body";
  };
  const KEEP = /^(t-|hero|fac-|hist|manifesto|shell|prose-glass|glass|section-y|link-underline|etched|font-display|tabular|sr-only|truncate|line-clamp)/;
  const selOf = (el) => {
    let s = el.tagName.toLowerCase();
    if (el.id) return s + "#" + el.id;
    const classes = Array.from(el.classList || []);
    const keep = classes.filter((c) => KEEP.test(c));
    if (keep.length) return s + "." + keep.slice(0, 2).join(".");
    const plain = classes.filter((c) => /^[a-z][a-z0-9-]*$/.test(c) && c !== "group");
    if (plain.length) s += "." + plain.slice(0, 2).join(".");
    return s;
  };
  const textOf = (el) => {
    if (el.tagName === "IMG") return clip(el.getAttribute("alt") || el.getAttribute("src") || "", 48);
    return clip(el.textContent, 48);
  };
  const describe = (el) => ({ sel: selOf(el), text: textOf(el), where: whereOf(el) });

  /* ---------- state: opacity, a11y flags ---------- */
  const opMap = new WeakMap();
  const opacityOf = (el) => {
    if (opMap.has(el)) return opMap.get(el);
    const own = parseFloat(cs(el).opacity);
    const v = (Number.isNaN(own) ? 1 : own) * (el.parentElement ? opacityOf(el.parentElement) : 1);
    opMap.set(el, v);
    return v;
  };
  const ahMap = new WeakMap();
  const ariaHidden = (el) => {
    if (ahMap.has(el)) return ahMap.get(el);
    const v = el.getAttribute("aria-hidden") === "true" || (el.parentElement ? ariaHidden(el.parentElement) : false);
    ahMap.set(el, v);
    return v;
  };
  const srMap = new WeakMap();
  const srOnly = (el) => {
    if (srMap.has(el)) return srMap.get(el);
    let v = el.classList.contains("sr-only");
    if (!v) {
      const s = cs(el);
      v = s.position === "absolute" && s.overflow !== "visible" && el.clientWidth <= 1 && el.clientHeight <= 1;
    }
    if (!v && el.parentElement) v = srOnly(el.parentElement);
    srMap.set(el, v);
    return v;
  };
  const excluded = (el) => ariaHidden(el) || srOnly(el);
  const allowOverlap = (el) => !!el.closest("[data-qa-allow-overlap]");

  /* ---------- clipping: which part of an element can actually be seen ---------- */
  const establishesFixedCB = (s) =>
    (s.transform && s.transform !== "none") ||
    (s.perspective && s.perspective !== "none") ||
    (s.filter && s.filter !== "none") ||
    (s.backdropFilter && s.backdropFilter !== "none") ||
    /layout|paint|strict|content/.test(s.contain || "") ||
    /transform|perspective|filter/.test(s.willChange || "") ||
    (s.containerType && /size/.test(s.containerType));
  const cbMap = new WeakMap();
  const cbOf = (el) => {
    if (cbMap.has(el)) return cbMap.get(el);
    const pos = cs(el).position;
    let res = null;
    if (pos === "fixed") {
      for (let p = el.parentElement; p; p = p.parentElement) {
        const s = cs(p);
        if (s.display !== "contents" && establishesFixedCB(s)) {
          res = p;
          break;
        }
      }
    } else if (pos === "absolute") {
      for (let p = el.parentElement; p; p = p.parentElement) {
        const s = cs(p);
        if (s.display !== "contents" && (s.position !== "static" || establishesFixedCB(s))) {
          res = p;
          break;
        }
      }
    } else {
      let p = el.parentElement;
      while (p && cs(p).display === "contents") p = p.parentElement;
      res = p;
    }
    cbMap.set(el, res);
    return res;
  };
  const ownClipMap = new WeakMap();
  const ownClip = (x) => {
    if (ownClipMap.has(x)) return ownClipMap.get(x);
    const s = cs(x);
    let c = null;
    if (s.display !== "contents") {
      const ox = s.overflowX !== "visible";
      const oy = s.overflowY !== "visible";
      const paint = /paint|strict|content/.test(s.contain || "");
      if (ox || oy || paint) {
        const r = x.getBoundingClientRect();
        const bl = parseFloat(s.borderLeftWidth) || 0;
        const br = parseFloat(s.borderRightWidth) || 0;
        const bt = parseFloat(s.borderTopWidth) || 0;
        const bb = parseFloat(s.borderBottomWidth) || 0;
        c = {
          l: ox || paint ? r.left + bl : NEG,
          r: ox || paint ? r.right - br : POS,
          t: oy || paint ? r.top + bt : NEG,
          b: oy || paint ? r.bottom - bb : POS,
        };
      }
    }
    ownClipMap.set(x, c);
    return c;
  };
  const chainMaps = [new WeakMap(), new WeakMap()];
  // Clip that x (its own overflow and its containing-block ancestors) imposes on whatever is inside x.
  const chainClip = (x, ignoreRoot) => {
    const map = chainMaps[ignoreRoot ? 1 : 0];
    if (map.has(x)) return map.get(x);
    let c = FULL;
    const own = ignoreRoot && (x === body || x === root) ? null : ownClip(x);
    if (own) c = isect(c, own);
    const up = cbOf(x);
    if (up) c = isect(c, chainClip(up, ignoreRoot));
    map.set(x, c);
    return c;
  };
  // Clip that applies to the border box of el itself.
  const clipOf = (el, ignoreRoot) => {
    const up = cbOf(el);
    return up ? chainClip(up, ignoreRoot) : FULL;
  };
  const visibleBox = (el) => isect(boxOf(el), clipOf(el));
  const isRendered = (el) => el.getClientRects().length > 0;
  const isVisible = (el) => {
    if (!isRendered(el)) return false;
    const s = cs(el);
    if (s.visibility !== "visible") return false;
    if (opacityOf(el) <= 0.01) return false;
    return areaOf(visibleBox(el)) >= 1;
  };

  /* ---------- text inventory ---------- */
  const textRecs = [];
  {
    const tw = doc.createTreeWalker(body, NodeFilter.SHOW_TEXT);
    for (let n = tw.nextNode(); n; n = tw.nextNode()) {
      if (!/\S/.test(n.nodeValue)) continue;
      const el = n.parentElement;
      if (!el) continue;
      const tag = el.tagName;
      if (tag === "SCRIPT" || tag === "STYLE" || tag === "NOSCRIPT" || tag === "TEMPLATE" || el.closest("svg")) continue;
      textRecs.push({ node: n, el, text: n.nodeValue });
    }
  }
  const range = doc.createRange();
  const mctx = doc.createElement("canvas").getContext("2d");
  const metricCache = new Map();
  const isGreekDoc = (doc.documentElement.lang || "").startsWith("el");
  const inkMetrics = (rec) => {
    const s = cs(rec.el);
    let t = rec.text.replace(/\s+/g, " ").trim();
    if (s.textTransform === "uppercase") {
      t = t.toUpperCase();
      if (isGreekDoc) t = t.normalize("NFD").replace(/́/g, "").normalize("NFC");
    } else if (s.textTransform === "lowercase") t = t.toLowerCase();
    const font = `${s.fontStyle} ${s.fontWeight} ${s.fontSize} ${s.fontFamily}`;
    const key = font + "|" + t;
    if (metricCache.has(key)) return metricCache.get(key);
    let res = null;
    try {
      mctx.font = font;
      const m = mctx.measureText(t);
      if (Number.isFinite(m.fontBoundingBoxAscent) && Number.isFinite(m.actualBoundingBoxAscent)) {
        res = { fa: m.fontBoundingBoxAscent, fd: m.fontBoundingBoxDescent, aa: m.actualBoundingBoxAscent, ad: m.actualBoundingBoxDescent, size: parseFloat(s.fontSize) };
      }
    } catch {
      res = null;
    }
    metricCache.set(key, res);
    return res;
  };
  // One entry per line of a text node: the ink box (glyph extents rather than the font's full line box).
  const inkOf = (rec) => {
    if (rec.ink) return rec.ink;
    range.selectNodeContents(rec.node);
    const raw = Array.from(range.getClientRects()).filter((r) => r.width >= 0.5 && r.height >= 0.5);
    const m = inkMetrics(rec);
    rec.ink = raw.map((r) => {
      let t = r.top;
      let b = r.bottom;
      if (m) {
        const base = r.top + m.fa;
        t = Math.max(base - m.aa, r.top - 0.1 * m.size);
        b = Math.min(base + m.ad, r.bottom + 0.1 * m.size);
        if (b - t < 1) {
          t = r.top;
          b = r.bottom;
        }
      }
      return { l: r.left, r: r.right, t, b };
    });
    return rec.ink;
  };
  const textElements = new Map(); // element -> its text records
  for (const rec of textRecs) {
    let list = textElements.get(rec.el);
    if (!list) textElements.set(rec.el, (list = []));
    list.push(rec);
  }
  const exemptClamp = (el, s) => {
    const classes = Array.from(el.classList || []);
    if (classes.some((c) => /(^|:)(truncate|text-ellipsis|line-clamp-)/.test(c))) return true;
    if (s.textOverflow === "ellipsis") return true;
    const lc = s.getPropertyValue("-webkit-line-clamp");
    return !!lc && lc !== "none";
  };

  /* ================================================================== resting phase: contrast only */
  if (opts.phase === "resting") {
    const cvs = doc.createElement("canvas");
    cvs.width = cvs.height = 1;
    const cx = cvs.getContext("2d", { willReadFrequently: true });
    const colorCache = new Map();
    const parseColor = (str) => {
      if (!str) return null;
      if (colorCache.has(str)) return colorCache.get(str);
      let res = null;
      cx.fillStyle = "#010203";
      cx.fillStyle = str;
      const ok = cx.fillStyle !== "#010203" || /^#010203$/i.test(str);
      if (ok) {
        cx.clearRect(0, 0, 1, 1);
        cx.fillStyle = "#000";
        cx.fillRect(0, 0, 1, 1);
        cx.fillStyle = str;
        cx.fillRect(0, 0, 1, 1);
        const b = cx.getImageData(0, 0, 1, 1).data;
        cx.clearRect(0, 0, 1, 1);
        cx.fillStyle = "#fff";
        cx.fillRect(0, 0, 1, 1);
        cx.fillStyle = str;
        cx.fillRect(0, 0, 1, 1);
        const w = cx.getImageData(0, 0, 1, 1).data;
        const a = Math.min(1, Math.max(0, 1 - (w[0] - b[0] + (w[1] - b[1]) + (w[2] - b[2])) / (3 * 255)));
        res = a < 0.004 ? { r: 0, g: 0, b: 0, a: 0 } : { r: Math.min(255, b[0] / a), g: Math.min(255, b[1] / a), b: Math.min(255, b[2] / a), a };
      }
      colorCache.set(str, res);
      return res;
    };
    const lin = (v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    };
    const lum = (c) => 0.2126 * lin(c.r) + 0.7152 * lin(c.g) + 0.0722 * lin(c.b);
    const ratioOf = (a, b) => {
      const la = lum(a);
      const lb = lum(b);
      return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
    };
    const over = (top, bottom) => ({
      r: top.r * top.a + bottom.r * (1 - top.a),
      g: top.g * top.a + bottom.g * (1 - top.a),
      b: top.b * top.a + bottom.b * (1 - top.a),
      a: 1,
    });
    const hex = (c) => "#" + [c.r, c.g, c.b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");
    const TOKEN = /(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\((?:[^()]|\([^()]*\))*\)|#[0-9a-fA-F]{3,8}\b|\btransparent\b/g;
    const gradientColors = (img) => (img.match(TOKEN) || []).map(parseColor).filter(Boolean);
    const splitTop = (str) => {
      const parts = [];
      let depth = 0;
      let cur = "";
      for (const ch of str) {
        if (ch === "(") depth++;
        else if (ch === ")") depth--;
        if (ch === "," && depth === 0) {
          parts.push(cur.trim());
          cur = "";
        } else cur += ch;
      }
      if (cur.trim()) parts.push(cur.trim());
      return parts;
    };
    // The painted background layers of an element, minus hairlines (link underlines, rules) that cannot sit behind text.
    const paintLayers = (s) => {
      const img = s.backgroundImage;
      if (!img || img === "none") return [];
      const sizes = splitTop(s.backgroundSize || "auto");
      return splitTop(img)
        .map((layer, i) => ({ layer, size: sizes[i % sizes.length] || "auto" }))
        .filter(({ size }) => !size.split(/\s+/).some((d) => /^0(\.0+)?(%|px)?$/.test(d) || (/px$/.test(d) && parseFloat(d) <= 2)))
        .map(({ layer }) => (/url\(/.test(layer) ? { kind: "photo", img: layer } : { kind: "gradient", img: layer, stops: gradientColors(layer) }));
    };

    // Everything that paints behind or over text without being its ancestor: photos, video, canvas, gradient overlays.
    const layerEls = [];
    for (const el of doc.querySelectorAll("*")) {
      const tag = el.tagName;
      const s = cs(el);
      const found = [];
      if (tag === "IMG" || tag === "VIDEO" || tag === "CANVAS" || tag === "PICTURE" || tag === "IFRAME") found.push({ kind: "media" });
      for (const l of paintLayers(s)) found.push(l.kind === "photo" ? { kind: "media" } : { kind: "gradient", stops: l.stops });
      if (!found.length) continue;
      if (!isRendered(el) || s.visibility !== "visible" || opacityOf(el) <= 0.01) continue;
      const b = visibleBox(el);
      if (areaOf(b) < 400) continue;
      for (const f of found) layerEls.push({ el, kind: f.kind, box: b, stops: f.stops || null });
    }

    const backdropFor = (p, ink) => {
      // Layers behind the text, nearest first, until an opaque colour is found.
      const stack = [];
      let unknown = null;
      let base = null;
      let baseNode = root;
      for (let n = p; n; n = n.parentElement) {
        const s = cs(n);
        for (const l of paintLayers(s)) {
          if (l.kind === "photo") unknown = unknown || "photo background on " + selOf(n);
          else stack.push({ type: "gradient", stops: l.stops, el: n });
        }
        const bgc = parseColor(s.backgroundColor);
        if (s.backdropFilter && s.backdropFilter !== "none" && (!bgc || bgc.a < 0.999)) unknown = unknown || "translucent glass on " + selOf(n);
        if (bgc && bgc.a > 0.003) {
          if (bgc.a >= 0.999) {
            base = bgc;
            baseNode = n;
            break;
          }
          stack.push({ type: "color", c: bgc });
        }
      }
      if (!base) base = { r: 255, g: 255, b: 255, a: 1 };
      // overlapping layers that are not ancestors
      for (const L of layerEls) {
        if (L.el.contains(p)) continue;
        // only what sits inside the box that paints the opaque base can lie between that base and the text
        if (!baseNode.contains(L.el)) continue;
        const i = isect(L.box, ink);
        if (areaOf(i) < 0.25 * areaOf(ink)) continue;
        if (L.kind === "media") unknown = unknown || `${L.el.tagName.toLowerCase()} behind text`;
        else if (L.stops) stack.unshift({ type: "gradient", stops: L.stops, el: L.el });
      }
      let cands = [base];
      for (let i = stack.length - 1; i >= 0; i--) {
        const layer = stack[i];
        if (layer.type === "color") cands = cands.map((c) => over(layer.c, c));
        else {
          const next = [];
          for (const c of cands) {
            next.push(c);
            for (const st of layer.stops) next.push(over(st, c));
          }
          // keep it small: the extremes carry the answer
          const uniq = new Map();
          for (const c of next) uniq.set([c.r, c.g, c.b].map((v) => Math.round(v / 2)).join(","), c);
          let arr = Array.from(uniq.values()).sort((a, b) => lum(a) - lum(b));
          if (arr.length > 24) arr = arr.filter((_, k) => k % Math.ceil(arr.length / 24) === 0 || k === arr.length - 1);
          cands = arr;
        }
      }
      return { cands, unknown, base };
    };

    const checked = { total: 0, pass: 0, fail: 0, unknown: 0 };
    const fails = [];
    const unknowns = [];
    let minRatio = Infinity;
    for (const [el, recs] of textElements) {
      if (excluded(el)) continue;
      const s = cs(el);
      if (s.visibility !== "visible" || !isRendered(el)) continue;
      const op = opacityOf(el);
      if (op <= 0.1) continue;
      // visible ink only
      const cl = chainClip(el);
      let ink = null;
      const lineRects = [];
      for (const rec of recs) for (const l of inkOf(rec)) {
        const v = isect(l, cl);
        if (areaOf(v) < 1) continue;
        if (lineRects.length < 16) lineRects.push([r1(v.l), r1(v.t), r1(v.r), r1(v.b)]);
        ink = ink ? { l: Math.min(ink.l, v.l), t: Math.min(ink.t, v.t), r: Math.max(ink.r, v.r), b: Math.max(ink.b, v.b) } : { ...v };
      }
      if (!ink) continue;
      const fg = parseColor(s.color);
      if (!fg) continue;
      const fs = parseFloat(s.fontSize);
      const fw = parseInt(s.fontWeight, 10) || 400;
      const large = fs >= 24 || (fs >= 18.66 && fw >= 700);
      const need = large ? 3 : 4.5;
      const alpha = fg.a * op;
      checked.total++;
      const bd = backdropFor(el, ink);
      let lo = Infinity;
      let hi = 0;
      let worst = null;
      for (const c of bd.cands) {
        const eff = alpha < 0.999 ? over({ ...fg, a: alpha }, c) : fg;
        const rr = ratioOf(eff, c);
        if (rr < lo) {
          lo = rr;
          worst = { fg: eff, bg: c };
        }
        if (rr > hi) hi = rr;
      }
      const item = () => ({
        ...describe(el),
        size: r1(fs),
        weight: fw,
        need,
        ratio: r2(lo),
        ratioBest: r2(hi),
        fg: hex(worst.fg),
        bg: hex(worst.bg),
      });
      const forSampling = () => ({ rects: lineRects, sampleFg: { r: Math.round(fg.r), g: Math.round(fg.g), b: Math.round(fg.b), a: r2(alpha) } });
      if (bd.unknown) {
        checked.unknown++;
        if (unknowns.length < 400) unknowns.push({ ...item(), reason: bd.unknown, ...forSampling() });
        continue;
      }
      if (lo >= need - 1e-9) {
        checked.pass++;
        minRatio = Math.min(minRatio, lo);
      } else if (hi < need - 1e-9) {
        checked.fail++;
        minRatio = Math.min(minRatio, lo);
        if (fails.length < 200) fails.push(item());
      } else {
        // passes against some of the possible backgrounds (gradient) and fails against others: cannot be decided here
        checked.unknown++;
        if (unknowns.length < 400) unknowns.push({ ...item(), reason: `gradient behind text (${r2(lo)}–${r2(hi)}:1)`, ...forSampling() });
      }
    }
    out.contrast = { ...checked, minRatio: Number.isFinite(minRatio) ? r2(minRatio) : null, fails, unknowns };
    out.ms = Math.round(performance.now() - t0);
    return out;
  }

  /* ================================================================== live phase */
  const isEnglish = opts.lang === "en";
  out.meta = {
    url: location.pathname + location.search,
    title: doc.title,
    lang: root.lang,
    vw: VW,
    vh: VH,
    docH: root.scrollHeight,
    scrollY: window.scrollY,
    h1: Array.from(doc.querySelectorAll("h1")).map((h) => clip(h.textContent, 60)),
    textNodes: textRecs.length,
    elements: doc.querySelectorAll("*").length,
  };

  /* ---------- gate 2: horizontal overflow ---------- */
  {
    const scrollWidth = root.scrollWidth;
    const clientWidth = root.clientWidth;
    const culprits = [];
    // body has overflow-x: clip, so overflowing content is cut off instead of widening the page. Look for it directly.
    for (const el of doc.body.querySelectorAll("*")) {
      const s = cs(el);
      if (s.position === "fixed" || s.display === "none" || s.display === "contents") continue;
      const r = el.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) continue;
      if (r.right <= clientWidth + 1 && r.left >= -1) continue;
      if (excluded(el) || s.visibility !== "visible") continue;
      const v = isect(boxOf(el), clipOf(el, true));
      if (areaOf(v) < 1) continue;
      const right = v.r - clientWidth;
      const left = -v.l;
      if (right <= 1 && left <= 1) continue;
      // report the outermost element only
      if (el.parentElement && culprits.some((c) => c._el === el.parentElement)) continue;
      culprits.push({ _el: el, ...describe(el), right: r1(r.right), left: r1(r.left), over: r1(Math.max(right, left)), w: r1(r.width) });
    }
    out.overflowX = {
      scrollWidth,
      clientWidth,
      over: scrollWidth - clientWidth,
      culprits: culprits.slice(0, MAX).map((c) => {
        const copy = { ...c };
        delete copy._el; // the DOM node is only needed while looking for the outermost culprit
        return copy;
      }),
      culpritCount: culprits.length,
    };
  }

  /* ---------- gate 3: clipped text ---------- */
  {
    const items = [];
    // (a) elements with direct text that clip their own overflow
    for (const [el] of textElements) {
      if (excluded(el)) continue;
      const s = cs(el);
      const hx = s.overflowX === "hidden" || s.overflowX === "clip";
      const hy = s.overflowY === "hidden" || s.overflowY === "clip";
      if (!hx && !hy) continue;
      if (!isVisible(el) || exemptClamp(el, s)) continue;
      const cw = el.clientWidth;
      const ch = el.clientHeight;
      if (cw === 0 && ch === 0) continue;
      if (hx && el.scrollWidth > cw + 1) items.push({ ...describe(el), kind: "self", axis: "x", value: `scrollWidth ${el.scrollWidth} > clientWidth ${cw}` });
      if (hy && el.scrollHeight > ch + 1) items.push({ ...describe(el), kind: "self", axis: "y", value: `scrollHeight ${el.scrollHeight} > clientHeight ${ch}` });
    }
    // (b) text partly cut off by an ancestor with overflow hidden/clip (not scrollers, not ellipsis, not moving tracks)
    const movingMap = new WeakMap();
    const moving = (el) => {
      if (movingMap.has(el)) return movingMap.get(el);
      let v = false;
      try {
        // a track that slides (scroll-linked, or an endless loop that the harness froze at its first frame)
        v = el.getAnimations().some((a) => {
          const kf = a.effect && a.effect.getKeyframes ? a.effect.getKeyframes() : [];
          const touchesPosition = kf.some((k) => "translate" in k || "transform" in k || "scale" in k || "rotate" in k);
          if (!touchesPosition) return false;
          const scrollLinked = a.timeline && a.timeline.constructor && a.timeline.constructor.name !== "DocumentTimeline";
          return scrollLinked || a.playState === "running" || a.playState === "paused";
        });
      } catch {
        v = false;
      }
      if (!v && el.parentElement) v = moving(el.parentElement);
      movingMap.set(el, v);
      return v;
    };
    const seen = new Set();
    for (const [el, recs] of textElements) {
      if (excluded(el) || seen.has(el)) continue;
      const s = cs(el);
      if (s.visibility !== "visible" || !isRendered(el) || opacityOf(el) <= 0.1) continue;
      if (moving(el)) continue;
      for (const rec of recs) {
        const lines = inkOf(rec);
        let worst = 1;
        let clipper = null;
        for (const l of lines) {
          const a0 = areaOf(l);
          if (a0 < 4) continue;
          // find the first clipper that cuts this line
          let x = el;
          while (x) {
            const own = x === body || x === root ? null : ownClip(x);
            if (own) {
              const f = areaOf(isect(l, own)) / a0;
              if (f < 0.9) {
                if (f < worst) {
                  worst = f;
                  clipper = x;
                }
                break;
              }
            }
            x = cbOf(x);
          }
        }
        // an element clipping its own text is reported by check (a); this one is for text cut by a container around it
        if (clipper && clipper !== el && worst > 0.02) {
          const cl = cs(clipper);
          const hardClip = (cl.overflowX === "hidden" || cl.overflowX === "clip" || cl.overflowY === "hidden" || cl.overflowY === "clip") && cl.overflowX !== "auto" && cl.overflowX !== "scroll" && cl.overflowY !== "auto" && cl.overflowY !== "scroll";
          if (hardClip && !exemptClamp(clipper, cl) && !moving(clipper)) {
            seen.add(el);
            items.push({ ...describe(el), kind: "ancestor", axis: "", value: `${Math.round((1 - worst) * 100)}% of a line cut off by ${selOf(clipper)}`, clipper: selOf(clipper) });
          }
        }
        if (seen.has(el)) break;
      }
    }
    out.clipped = items.slice(0, MAX * 2);
    out.clippedCount = items.length;
  }

  /* ---------- gate 4: overlapping text ---------- */
  {
    const CAND = "h1,h2,h3,h4,h5,h6,p,li,a,button,label,td,th,figcaption,blockquote,dt,dd,summary,address,legend,caption";
    const blocks = new Map();
    const order = [];
    for (const rec of textRecs) {
      const p = rec.el;
      if (excluded(p) || allowOverlap(p)) continue;
      const s = cs(p);
      if (s.visibility !== "visible" || opacityOf(p) <= 0.1) continue;
      const owner = p.closest(CAND) || p;
      const c = chainClip(p);
      for (const l of inkOf(rec)) {
        const v = isect(l, c);
        if (areaOf(v) < 1) continue;
        let b = blocks.get(owner);
        if (!b) {
          b = { el: owner, id: order.length, lines: [] };
          blocks.set(owner, b);
          order.push(b);
        }
        b.lines.push(v);
      }
    }
    out._blocks = null;
    const CELL = 96;
    const grid = new Map();
    const items = [];
    for (const b of order) {
      for (const l of b.lines) {
        const it = { b, l };
        items.push(it);
        for (let gx = Math.floor(l.l / CELL); gx <= Math.floor(l.r / CELL); gx++) {
          for (let gy = Math.floor(l.t / CELL); gy <= Math.floor(l.b / CELL); gy++) {
            const k = gx + "," + gy;
            let arr = grid.get(k);
            if (!arr) grid.set(k, (arr = []));
            arr.push(it);
          }
        }
      }
    }
    const pairs = new Map();
    for (const arr of grid.values()) {
      for (let i = 0; i < arr.length; i++) {
        for (let j = i + 1; j < arr.length; j++) {
          const A = arr[i];
          const B = arr[j];
          if (A.b === B.b) continue;
          const a = areaOf(isect(A.l, B.l));
          if (a <= 4) continue;
          if (A.b.el.contains(B.b.el) || B.b.el.contains(A.b.el)) continue;
          const key = A.b.id < B.b.id ? A.b.id + "|" + B.b.id : B.b.id + "|" + A.b.id;
          const prev = pairs.get(key);
          if (!prev || prev.area < a) pairs.set(key, { A: A.b, B: B.b, area: a, la: A.l, lb: B.l });
        }
      }
    }
    const list = Array.from(pairs.values()).sort((x, y) => y.area - x.area);
    out.overlaps = list.slice(0, MAX).map((p) => ({
      a: describe(p.A.el),
      b: describe(p.B.el),
      area: Math.round(p.area),
      ra: [r1(p.la.l), r1(p.la.t), r1(p.la.r - p.la.l), r1(p.la.b - p.la.t)],
      rb: [r1(p.lb.l), r1(p.lb.t), r1(p.lb.r - p.lb.l), r1(p.lb.b - p.lb.t)],
    }));
    out.overlapCount = list.length;
    out._textBlocks = order.map((b) => ({ el: b.el, lines: b.lines })); // used below, removed before returning
  }

  /* ---------- gate 5: images ---------- */
  {
    const broken = [];
    const noAlt = [];
    const pending = [];
    const imgs = Array.from(doc.images);
    for (const img of imgs) {
      const src = img.currentSrc || img.getAttribute("src") || "";
      if (!img.hasAttribute("alt")) noAlt.push({ ...describe(img), src: clip(src, 80) });
      if (img.complete && img.naturalWidth === 0 && src) broken.push({ ...describe(img), src: clip(src, 100), value: "naturalWidth 0" });
      else if (!img.complete && src && isRendered(img)) pending.push({ ...describe(img), src: clip(src, 100), value: "not loaded" });
    }
    out.images = { total: imgs.length, broken: broken.slice(0, MAX), noAlt: noAlt.slice(0, MAX), pending: pending.slice(0, MAX), brokenCount: broken.length, noAltCount: noAlt.length, pendingCount: pending.length };
  }

  /* ---------- gate 7: tap targets (touch only) ---------- */
  if (opts.touch) {
    const fails = [];
    const warns = [];
    let checked = 0;
    for (const el of doc.querySelectorAll("a[href], button, [role=button], input:not([type=hidden]), select, summary")) {
      const s = cs(el);
      if (!isVisible(el) || excluded(el) || s.pointerEvents === "none") continue;
      if (el.disabled) continue;
      const r = el.getBoundingClientRect();
      // inline links inside running text are exempt
      const parent = el.parentElement;
      if (el.tagName === "A" && parent && (parent.tagName === "P" || parent.tagName === "LI")) {
        let other = false;
        for (const n of parent.childNodes) if (n.nodeType === 3 && /\S/.test(n.nodeValue)) other = true;
        if (other) continue;
      }
      checked++;
      const w = Math.round(r.width * 10) / 10;
      const h = Math.round(r.height * 10) / 10;
      if (w < 24 || h < 24) fails.push({ ...describe(el), w, h, value: `${w}×${h}px` });
      else if (w < 44 || h < 44) warns.push({ ...describe(el), w, h, value: `${w}×${h}px` });
    }
    out.tap = { checked, fails: fails.slice(0, MAX), warns: warns.slice(0, MAX), failCount: fails.length, warnCount: warns.length };
  }

  /* ---------- gate 8: untranslated (English pages) ---------- */
  if (isEnglish) {
    const greekRe = /[Ͱ-Ͽἀ-῿]/g;
    const letterRe = /\p{L}/gu;
    const wordRe = /[Ͱ-Ͽἀ-῿]{4,}/g;
    const found = new Map();
    const consider = (el, text, label) => {
      const letters = (text.match(letterRe) || []).length;
      if (!letters) return;
      const greek = (text.match(greekRe) || []).length;
      if (greek / letters <= 0.05) return;
      const words = text.match(wordRe) || [];
      const key = clip(text, 80);
      if (!found.has(key)) found.set(key, { ...(el ? describe(el) : { sel: label, text: clip(text, 48), where: "document" }), greekShare: r2(greek / letters), words: words.slice(0, 4), longWords: words.length, decorative: el ? ariaHidden(el) : false });
    };
    for (const [el, recs] of textElements) {
      if (srOnly(el) || !isRendered(el)) continue;
      const langEl = el.closest("[lang]");
      if (langEl && langEl !== root && !(langEl.getAttribute("lang") || "").startsWith("en")) continue; // declared as another language
      if (el.closest("address, [hreflang]")) continue;
      if (opacityOf(el) <= 0.01) continue;
      consider(el, recs.map((r) => r.text).join(" ").replace(/\s+/g, " ").trim());
    }
    consider(null, doc.title, "<title>");
    const md = doc.querySelector('meta[name="description"]');
    if (md) consider(null, md.getAttribute("content") || "", "<meta description>");
    const all = Array.from(found.values());
    const withWords = all.filter((f) => f.longWords > 0);
    out.greek = { elements: all.slice(0, MAX), count: all.length, wordElements: withWords.length };
  }

  /* ---------- gate 9: headings ---------- */
  {
    const hs = Array.from(doc.querySelectorAll("h1,h2,h3,h4,h5,h6")).filter((h) => isRendered(h) && !ariaHidden(h) && cs(h).visibility === "visible");
    const replaced3d = (h) => {
      const hero = h.closest("[data-glass]");
      return !!hero && hero.getAttribute("data-glass") === "3d" && !!hero.querySelector("canvas");
    };
    const list = hs.map((h) => {
      const op = opacityOf(h);
      const seen = areaOf(visibleBox(h)) >= 1 && op > 0.1;
      const sr = srOnly(h);
      return { level: Number(h.tagName[1]), text: clip(h.textContent, 60), sel: selOf(h), where: whereOf(h), visible: (seen && !sr) || (replaced3d(h) && !sr), srOnly: sr, replacedBy3d: replaced3d(h) && op <= 0.1 };
    });
    const h1s = list.filter((h) => h.level === 1);
    const skips = [];
    let prev = 0;
    for (const h of list) {
      if (prev && h.level > prev + 1) skips.push({ from: prev, to: h.level, text: h.text, sel: h.sel, where: h.where });
      prev = h.level;
    }
    if (list.length && list[0].level !== 1) skips.unshift({ from: 0, to: list[0].level, text: list[0].text, sel: list[0].sel, where: list[0].where });
    // A title set in several blocks (the masked lines of a headline) must keep a space between them in its text:
    // "Μιλήστε" and "μαζί μας" side by side must not read "Μιλήστεμαζί μας" for copy and paste, search snippets and screen readers.
    // Two text runs in different blocks that touch (a letter or digit on both sides, no white space between) are reported.
    const glued = [];
    for (const h of hs) {
      const blockOf = (node) => {
        for (let el = node.parentElement; el && el !== h; el = el.parentElement) {
          const d = cs(el).display;
          if (d !== "inline" && d !== "contents") return el;
        }
        return h;
      };
      const joins = [];
      let prev = null;
      const tw = doc.createTreeWalker(h, NodeFilter.SHOW_TEXT);
      for (let n = tw.nextNode(); n; n = tw.nextNode()) {
        const el = n.parentElement;
        if (!n.nodeValue.length || !el || !isRendered(el) || ariaHidden(el)) continue;
        if (prev) {
          const a = prev.nodeValue.slice(-1);
          const b = n.nodeValue[0];
          if (/[\p{L}\p{N}]/u.test(a) && /[\p{L}\p{N}]/u.test(b) && blockOf(prev) !== blockOf(n)) {
            const before = prev.nodeValue.trimEnd().split(/\s+/).pop();
            const after = n.nodeValue.trimStart().split(/\s+/)[0];
            joins.push({ before: clip(before, 24), after: clip(after, 24), joined: before + after, caseJoin: /\p{Ll}/u.test(a) && /\p{Lu}/u.test(b) });
          }
        }
        prev = n;
      }
      if (joins.length) glued.push({ level: Number(h.tagName[1]), text: clip(h.textContent, 60), sel: selOf(h), where: whereOf(h), joins: joins.slice(0, 4) });
    }
    out.headings = { h1Visible: h1s.filter((h) => h.visible).length, h1Total: h1s.length, h1: h1s.slice(0, 6), count: list.length, skips: skips.slice(0, 20), glued: glued.slice(0, 20), all: list.slice(0, 60) };
  }

  /* ---------- structure: landmarks, language, a way out ---------- */
  out.structure = {
    header: !!doc.querySelector("header"),
    main: !!doc.querySelector("main"),
    footer: !!doc.querySelector("footer"),
    htmlLang: root.lang || "",
    links: doc.querySelectorAll("a[href]").length,
  };

  /* ---------- critic measurements ---------- */
  // type scale
  {
    const sizes = new Map();
    const smallBody = [];
    const tiny = [];
    const small = new Set();
    for (const [el, recs] of textElements) {
      if (excluded(el) || !isVisible(el)) continue;
      const s = cs(el);
      const px = parseFloat(s.fontSize);
      const key = Math.round(px * 2) / 2;
      const chars = recs.reduce((n, r) => n + r.text.replace(/\s+/g, " ").trim().length, 0);
      let e = sizes.get(key);
      if (!e) sizes.set(key, (e = { px: key, elements: 0, chars: 0, sample: selOf(el) }));
      e.elements++;
      e.chars += chars;
      if (px < 11 && !small.has(el)) {
        small.add(el);
        tiny.push({ ...describe(el), size: r1(px) });
      }
      const labelLike = s.textTransform === "uppercase" || (parseFloat(s.letterSpacing) || 0) > 0.06 * px;
      if (opts.viewport === "mobile" && px < 16 && !labelLike && el.closest("p, li") !== null && !small.has(el)) {
        small.add(el);
        smallBody.push({ ...describe(el), size: r1(px) });
      }
    }
    out.typeScale = { sizes: Array.from(sizes.values()).sort((a, b) => a.px - b.px), smallBody: smallBody.slice(0, MAX), smallBodyCount: smallBody.length, tinyLabels: tiny.slice(0, MAX), tinyCount: tiny.length };
  }

  // line length
  {
    const flagged = [];
    const all = [];
    const mc = doc.createElement("canvas").getContext("2d");
    for (const el of doc.querySelectorAll("p, blockquote, li, dd")) {
      if (excluded(el) || !isVisible(el)) continue;
      if (el.tagName === "LI" && el.querySelector("p, ul, ol, li")) continue;
      const s = cs(el);
      const fs = parseFloat(s.fontSize);
      if (fs > 32) continue;
      const text = el.textContent.replace(/\s+/g, " ").trim();
      if (text.length < 40) continue;
      // running text only: most of it is the element's own text, not a grid of links, numbers and labels
      let own = 0;
      for (const n of el.childNodes) if (n.nodeType === 3) own += n.nodeValue.replace(/\s+/g, " ").trim().length;
      if (own < 0.6 * text.length) continue;
      range.selectNodeContents(el);
      const tops = new Set(Array.from(range.getClientRects()).filter((r) => r.width > 1 && r.height > 1).map((r) => Math.round(r.top / Math.max(4, fs * 0.5))));
      const lines = tops.size;
      if (lines < 3) continue;
      const cpl = text.length / lines;
      mc.font = `${s.fontStyle} ${s.fontWeight} ${s.fontSize} ${s.fontFamily}`;
      const avg = mc.measureText(text.slice(0, 120)).width / Math.min(120, text.length);
      const cap = avg > 0 ? el.clientWidth / avg : 0;
      const rec = { ...describe(el), lines, cpl: Math.round(cpl), capacity: Math.round(cap), width: Math.round(el.clientWidth), size: r1(fs) };
      all.push(rec.cpl);
      if (cpl < 25 || cpl > 85) flagged.push(rec);
    }
    out.lineLength = { paragraphs: all.length, flagged: flagged.slice(0, MAX), flaggedCount: flagged.length };
  }

  // alignment
  {
    const lefts = new Map();
    const rights = new Map();
    const add = (map, edge, el, kind) => {
      const k = Math.round(edge);
      let e = map.get(k);
      if (!e) map.set(k, (e = { edge: k, count: 0, els: [], refs: [] }));
      e.count++;
      if (e.els.length < 4) {
        e.els.push({ ...describe(el), kind, edge: r1(edge) });
        e.refs.push(el);
      }
    };
    const isDecorated = (el) => {
      const s = cs(el);
      const bg = s.backgroundColor && s.backgroundColor !== "rgba(0, 0, 0, 0)" && s.backgroundColor !== "transparent";
      const border = ["Top", "Right", "Bottom", "Left"].some((d) => parseFloat(s["border" + d + "Width"]) > 0 && s["border" + d + "Style"] !== "none");
      return bg || border || (s.boxShadow && s.boxShadow !== "none");
    };
    // An element inset by the padding of the framed box around it (a logo in a white frame) is not misaligned.
    const insetInFrame = (el, side) => {
      const r = el.getBoundingClientRect();
      let a = el.parentElement;
      for (let i = 0; a && i < 3; i++, a = a.parentElement) {
        if (!isDecorated(a)) continue;
        const ar = a.getBoundingClientRect();
        const d = side === "left" ? r.left - ar.left : ar.right - r.right;
        if (d >= 1 && d <= 14) return true;
      }
      return false;
    };
    const seenEl = new Set();
    const consider = (el, kind) => {
      if (seenEl.has(el)) return;
      seenEl.add(el);
      if (excluded(el) || !isVisible(el)) return;
      const s = cs(el);
      if (s.position === "fixed") return;
      if ((s.transform && s.transform !== "none") || (s.translate && s.translate !== "none") || (s.rotate && s.rotate !== "none")) return;
      let moving = false;
      for (let n = el; n && n !== body; n = n.parentElement) {
        const ps = cs(n);
        if ((ps.transform && ps.transform !== "none") || (ps.translate && ps.translate !== "none")) {
          // transformed ancestors (reveal wrappers rest at identity); only skip real offsets
          const m = ps.transform !== "none" ? new DOMMatrixReadOnly(ps.transform) : null;
          if (m && (Math.abs(m.e) > 0.5 || Math.abs(m.f) > 0.5 || Math.abs(m.a - 1) > 0.01)) moving = true;
        }
      }
      if (moving) return;
      const r = el.getBoundingClientRect();
      if (r.width < 24 || r.height < 10) return;
      const v = visibleBox(el);
      if (areaOf(v) < 0.9 * r.width * r.height) return; // partly clipped
      add(lefts, r.left, el, kind);
      add(rights, r.right, el, kind);
    };
    for (const el of doc.querySelectorAll("h1,h2,h3,h4,h5,h6,p,figcaption,blockquote")) consider(el, "text");
    for (const el of doc.querySelectorAll("img, video, iframe")) consider(el, "media");
    for (const el of doc.querySelectorAll("li, article, figure, a, button, div")) {
      const s = cs(el);
      const r = el.getBoundingClientRect();
      const bg = s.backgroundColor && s.backgroundColor !== "rgba(0, 0, 0, 0)" && s.backgroundColor !== "transparent";
      const border = ["Top", "Right", "Bottom", "Left"].some((d) => parseFloat(s["border" + d + "Width"]) > 0 && s["border" + d + "Style"] !== "none");
      const decorated = bg || border || (s.boxShadow && s.boxShadow !== "none") || (parseFloat(s.borderTopLeftRadius) > 0 && (bg || border));
      if (!decorated) continue;
      const tag = el.tagName;
      if (tag === "DIV" && !(parseFloat(s.borderTopLeftRadius) > 0 && r.width >= 100 && r.height >= 60 && r.width < VW * 0.95)) continue;
      if (r.width < 100 && !(tag === "A" || tag === "BUTTON")) continue;
      if (r.width >= VW * 0.97) continue; // full-bleed bands are not part of the grid
      const kind = tag === "A" || tag === "BUTTON" ? (r.width <= 460 && r.height <= 96 ? "button" : "card") : "card";
      consider(el, kind);
    }
    const nearMisses = [];
    const scan = (map, side) => {
      for (const e of map.values()) {
        let best = null;
        for (let d = 1; d <= 6; d++) {
          for (const k of [e.edge - d, e.edge + d]) {
            const o = map.get(k);
            if (o && o.count > e.count && (!best || o.count > best.count)) best = o;
          }
        }
        if (!best) continue;
        const els = e.els.filter((x, i) => x && !insetInFrame(e.refs[i], side));
        if (els.length) nearMisses.push({ side, edge: e.edge, count: e.count, dominantEdge: best.edge, dominantCount: best.count, distance: Math.abs(best.edge - e.edge), els });
      }
    };
    scan(lefts, "left");
    scan(rights, "right");
    nearMisses.sort((a, b) => b.dominantCount - a.dominantCount || a.distance - b.distance);
    const top = (map) => Array.from(map.values()).sort((a, b) => b.count - a.count).slice(0, 8).map((e) => ({ edge: e.edge, count: e.count }));
    out.alignment = { left: top(lefts), right: top(rights), nearMisses: nearMisses.slice(0, 24), nearMissCount: nearMisses.length };
  }

  // spacing
  {
    const sections = [];
    for (const el of mainKids) {
      if (!isRendered(el)) continue;
      const r = el.getBoundingClientRect();
      if (r.height < 2) continue;
      const s = cs(el);
      sections.push({ el, i: mainKids.indexOf(el) + 1, top: r.top, bottom: r.bottom, theme: el.getAttribute("data-theme") || "", padT: parseFloat(s.paddingTop) || 0, padB: parseFloat(s.paddingBottom) || 0, cTop: Infinity, cBottom: -Infinity });
    }
    for (const sec of sections) {
      for (const tb of out._textBlocks) {
        if (!sec.el.contains(tb.el)) continue;
        for (const l of tb.lines) {
          sec.cTop = Math.min(sec.cTop, l.t);
          sec.cBottom = Math.max(sec.cBottom, l.b);
        }
      }
      for (const img of sec.el.querySelectorAll("img")) {
        if (excluded(img) || !isVisible(img)) continue;
        const v = visibleBox(img);
        sec.cTop = Math.min(sec.cTop, v.t);
        sec.cBottom = Math.max(sec.cBottom, v.b);
      }
    }
    const gaps = [];
    const hist = {};
    for (let k = 0; k + 1 < sections.length; k++) {
      const a = sections[k];
      const b = sections[k + 1];
      if (!Number.isFinite(a.cBottom) || !Number.isFinite(b.cTop)) continue;
      const gap = Math.round(b.cTop - a.cBottom);
      gaps.push({ from: a.i, to: b.i, gap, themes: `${a.theme || "-"}→${b.theme || "-"}` });
      hist[gap] = (hist[gap] || 0) + 1;
    }
    // heading → following text block
    const headGaps = {};
    const samples = [];
    const blocks = out._textBlocks;
    for (let k = 0; k < blocks.length; k++) {
      const hb = blocks[k];
      if (!/^H[1-6]$/.test(hb.el.tagName) || !isVisible(hb.el)) continue;
      const hr = hb.el.getBoundingClientRect();
      const sec = topSection(hb.el);
      for (let j = k + 1; j < blocks.length && j < k + 40; j++) {
        const nb = blocks[j];
        if (hb.el.contains(nb.el) || nb.el.contains(hb.el)) continue;
        if (topSection(nb.el) !== sec) break;
        const nr = nb.el.getBoundingClientRect();
        if (nr.top < hr.bottom - 1) continue;
        if (Math.min(nr.right, hr.right) - Math.max(nr.left, hr.left) < 8) continue;
        const gap = Math.round(nr.top - hr.bottom);
        if (gap > 400) break;
        headGaps[gap] = (headGaps[gap] || 0) + 1;
        if (samples.length < 40) samples.push({ gap, h: selOf(hb.el), next: selOf(nb.el), text: clip(hb.el.textContent, 28), where: whereOf(hb.el) });
        break;
      }
    }
    out.spacing = {
      sections: sections.map((s) => ({ i: s.i, theme: s.theme, height: Math.round(s.bottom - s.top), padT: Math.round(s.padT), padB: Math.round(s.padB), contentTop: Number.isFinite(s.cTop) ? Math.round(s.cTop - s.top) : null, contentBottom: Number.isFinite(s.cBottom) ? Math.round(s.bottom - s.cBottom) : null })),
      sectionGaps: gaps,
      sectionGapValues: hist,
      headingGapValues: headGaps,
      headingGapSamples: samples,
    };
  }
  delete out._textBlocks;
  delete out._blocks;

  // regions that legitimately change between runs (3D scene, embedded map, endless animations)
  {
    const dyn = [];
    const push = (el, why) => {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) dyn.push({ x: Math.round(r.left + scrollX), y: Math.round(r.top + scrollY), w: Math.round(r.width), h: Math.round(r.height), why });
    };
    for (const c of doc.querySelectorAll("canvas, iframe, video, [data-qa-dynamic]")) push(c, c.tagName.toLowerCase());
    for (const a of doc.getAnimations()) {
      try {
        const t = a.effect && a.effect.getComputedTiming();
        if (t && t.iterations === Infinity && a.effect.target) push(a.effect.target, "endless-animation");
      } catch {
        /* ignore */
      }
    }
    out.dynamic = dyn;
  }

  /* ---------- gate 10 (reduced motion): headings must be visible when scrolled to ---------- */
  if (opts.rm) {
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const frame = () => new Promise((r) => requestAnimationFrame(() => r()));
    const hs = Array.from(doc.querySelectorAll("h1,h2,h3,h4,h5,h6")).filter((h) => isRendered(h) && !excluded(h));
    const res = [];
    for (const h of hs) {
      h.scrollIntoView({ block: "center", inline: "nearest" });
      await frame();
      await frame();
      await sleep(40);
      // opacity right now (the cached values from before the scrolling may be stale)
      let op = 1;
      for (let n = h; n; n = n.parentElement) op *= parseFloat(getComputedStyle(n).opacity);
      const r = h.getBoundingClientRect();
      const tall = r.height > innerHeight;
      const inside = r.left >= -1 && r.right <= innerWidth + 1 && (tall ? r.top < innerHeight && r.bottom > 0 : r.top >= -1 && r.bottom <= innerHeight + 1);
      // not cut away by an ancestor: sample the heading's centre
      const cxp = Math.min(Math.max(r.left + r.width / 2, 1), innerWidth - 1);
      const cyp = Math.min(Math.max(r.top + r.height / 2, 1), innerHeight - 1);
      const top = doc.elementFromPoint(cxp, cyp);
      const reachable = !top || h.contains(top) || top.contains(h) || top.closest("header") !== null;
      res.push({ level: Number(h.tagName[1]), text: clip(h.textContent, 60), sel: selOf(h), where: whereOf(h), opacity: r2(op), inside, reachable, rect: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)] });
    }
    window.scrollTo(0, 0);
    await frame();
    out.rmHeadings = res;
  }

  delete out._textBlocks;
  out.ms = Math.round(performance.now() - t0);
  return out;
}
