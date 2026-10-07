#!/usr/bin/env node
// Automated QA harness: builds the site, serves it with `next start`, drives the local Chrome over CDP,
// runs the gates from docs/redesign/PLAN.md and writes qa/runs/<label>/. Exit code 1 if any gate fails.
// See scripts/qa/README.md.

import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Browser } from "./lib/cdp.mjs";
import { diffShots, sampleContrastBatch, startFileServer, writeSheets } from "./lib/compose.mjs";
import { applyContrastSamples, evaluateLoad, evaluatePerf } from "./lib/gates.mjs";
import { REDUCED, VIEWPORTS, runLoad } from "./lib/load.mjs";
import { runPerf } from "./lib/perf.mjs";
import { buildSummary } from "./lib/report.mjs";
import { build, startServer } from "./lib/server.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REGRESSION_LIMIT_PCT = 0.5;

const USAGE = `Usage: node scripts/qa/run.mjs [options]   (npm run qa -- [options])

  --group <name[,name]>   page group(s): home, company-facilities, catalogue, product, news, contact, links-legal
  --pages <list>          comma list of page ids from scripts/qa/pages.json, or URL paths such as /etaireia
  --lang el|en|all        which language's pages to run (default el; English is a separate phase)
  --label <name>          run label, output goes to qa/runs/<label>/ (default: timestamp)
  --port <n>              port for the 'next start' child process (default 3100); use another one per worktree
  --skip-build            reuse the existing .next build instead of running 'next build' first
  --perf                  also measure LCP, TBT and dropped frames on the mobile profile (slow: fresh Chrome per run)
  --perf-runs <n>         measurements per page (default 1, implies --perf); the gate uses the median of the runs
  --baseline save|compare save the screenshots as the approved baseline (only the selected group(s); all without --group),
                          or pixel-diff against it. Without --group/--pages, compare is a whole-site regression run
                          (screenshots only, no content gates; add --gates to run them too).
  --expect-change <list>  groups allowed to change in a compare run: diffed and reported, never failing
  --regress <groups|none> compare with --group/--pages: which other groups to re-shoot (default: all with a baseline)
  --gates                 run the content gates in a whole-site compare run as well
  --jobs <n>              pages loaded in parallel (default 4)
  --help
`;

function fail(msg, code = 2) {
  console.error(`[qa] ${msg}`);
  process.exit(code);
}

function parseArgs(argv) {
  const o = { group: null, pages: null, label: null, port: 3100, skipBuild: false, perf: false, perfRuns: 1, baseline: null, lang: "el", jobs: 4, regress: "all", expectChange: [], gates: false };
  for (let i = 0; i < argv.length; i++) {
    let a = argv[i];
    let val = null;
    if (a.startsWith("--") && a.includes("=")) {
      val = a.slice(a.indexOf("=") + 1);
      a = a.slice(0, a.indexOf("="));
    }
    const next = () => {
      if (val !== null) return val;
      const v = argv[++i];
      if (v === undefined || v.startsWith("--")) fail(`${a} needs a value\n${USAGE}`);
      return v;
    };
    switch (a) {
      case "--group": o.group = next(); break;
      case "--pages": o.pages = next(); break;
      case "--lang": o.lang = next(); break;
      case "--label": o.label = next(); break;
      case "--port": o.port = Number(next()); break;
      case "--skip-build": o.skipBuild = true; break;
      case "--perf": o.perf = true; break;
      case "--perf-runs": o.perfRuns = Number(next()); o.perf = true; break;
      case "--baseline": o.baseline = next(); break;
      case "--regress": o.regress = next(); break;
      case "--expect-change": o.expectChange = next().split(",").map((s) => s.trim()).filter(Boolean); break;
      case "--gates": o.gates = true; break;
      case "--jobs": o.jobs = Number(next()); break;
      case "--help": case "-h": console.log(USAGE); process.exit(0); break;
      default: fail(`unknown option ${a}\n${USAGE}`);
    }
  }
  if (!["el", "en", "all"].includes(o.lang)) fail(`--lang must be el, en or all\n${USAGE}`);
  if (o.baseline && !["save", "compare"].includes(o.baseline)) fail(`--baseline must be save or compare\n${USAGE}`);
  if (!Number.isInteger(o.port) || o.port < 1024 || o.port > 65535) fail("--port must be a number between 1024 and 65535");
  if (!Number.isInteger(o.jobs) || o.jobs < 1 || o.jobs > 12) fail("--jobs must be a number between 1 and 12");
  if (!Number.isInteger(o.perfRuns) || o.perfRuns < 1 || o.perfRuns > 9) fail("--perf-runs must be a number between 1 and 9");
  return o;
}

function findRoot(start) {
  let dir = path.resolve(start);
  for (;;) {
    const pkg = path.join(dir, "package.json");
    if (existsSync(pkg)) {
      try {
        const j = JSON.parse(readFileSync(pkg, "utf8"));
        if ((j.dependencies && j.dependencies.next) || (j.devDependencies && j.devDependencies.next)) return dir;
      } catch {
        /* keep looking */
      }
    }
    const up = path.dirname(dir);
    if (up === dir) return null;
    dir = up;
  }
}

function git(root, ...args) {
  try {
    return execFileSync("git", args, { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return "";
  }
}

/** Newest modification time of any file below dir (0 if it does not exist). */
function newestMtime(dir) {
  let newest = 0;
  const walk = (d) => {
    let entries = [];
    try {
      entries = readdirSync(d, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else {
        try {
          newest = Math.max(newest, statSync(p).mtimeMs);
        } catch {
          /* ignore */
        }
      }
    }
  };
  walk(dir);
  return newest;
}

const stamp = () => new Date().toISOString().replace(/[-:]/g, "").replace(/\..*/, "").replace("T", "-");
const slug = (s) => s.replace(/^\/+/, "").replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase() || "home";

async function pool(items, size, worker) {
  const results = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(size, items.length) }, async () => {
      while (next < items.length) {
        const i = next++;
        results[i] = await worker(items[i], i);
      }
    })
  );
  return results;
}

/** Keeps report.json readable: long diagnostic lists are cut, counts stay. */
function trimLoad(l) {
  const copy = { ...l };
  if (copy.contrast) copy.contrast = { ...copy.contrast, unknowns: copy.contrast.unknowns.slice(0, 80), fails: copy.contrast.fails.slice(0, 80), warns: (copy.contrast.warns || []).slice(0, 80) };
  if (copy.raw) {
    const { headings, ...rest } = copy.raw;
    copy.measurements = { typeScale: rest.typeScale, lineLength: rest.lineLength, alignment: rest.alignment, spacing: rest.spacing };
    copy.raw = { meta: rest.meta, overflowX: rest.overflowX, clippedCount: rest.clippedCount, overlapCount: rest.overlapCount, images: rest.images, tap: rest.tap, greek: rest.greek, headings: { ...headings, all: undefined }, rmHeadings: rest.rmHeadings, dynamic: rest.dynamic };
  }
  return copy;
}

async function main() {
  const startedMs = Date.now();
  const opts = parseArgs(process.argv.slice(2));
  const root = findRoot(process.cwd()) ?? findRoot(HERE);
  if (!root) fail("Run this from inside the site's repository (no package.json with next found).");

  /* ------------------------------------------------ page selection and run mode */
  const config = JSON.parse(readFileSync(path.join(HERE, "pages.json"), "utf8")).groups;
  const everyPage = Object.entries(config).flatMap(([group, list]) => list.map((p) => ({ ...p, group })));
  const groupNames = Object.keys(config);
  for (const g of opts.expectChange) if (!groupNames.includes(g)) fail(`--expect-change: unknown group "${g}". Groups: ${groupNames.join(", ")}`);
  const langOk = (p) => opts.lang === "all" || p.lang === opts.lang;
  const explicitScope = !!(opts.group || opts.pages);
  let selected;
  if (opts.pages) {
    selected = opts.pages.split(",").map((s) => s.trim()).filter(Boolean).map((tok) => {
      const hit = everyPage.find((p) => p.id === tok || p.url === tok);
      if (hit) return hit;
      if (tok.startsWith("/")) return { id: slug(tok), url: tok, lang: tok === "/en" || tok.startsWith("/en/") ? "en" : "el", group: "adhoc", template: "ad hoc" };
      return fail(`unknown page "${tok}". Known ids: ${everyPage.map((p) => p.id).join(", ")}`);
    });
  } else if (opts.group) {
    const wanted = opts.group.split(",").map((s) => s.trim());
    for (const g of wanted) if (!groupNames.includes(g)) fail(`unknown group "${g}". Groups: ${groupNames.join(", ")}`);
    selected = everyPage.filter((p) => wanted.includes(p.group) && langOk(p));
  } else selected = everyPage.filter(langOk);
  if (!selected.length) fail("no pages selected");

  const compare = opts.baseline === "compare";
  // A whole-site compare run is a regression run: screenshots and diffs only (the content gates belong to --group runs).
  const regressionOnly = compare && !explicitScope && !opts.gates;
  const gated = regressionOnly ? [] : selected;
  const englishIncluded = gated.some((p) => p.lang === "en");
  const scopeGroups = [...new Set(gated.map((p) => p.group))];
  const selectedIds = new Set(selected.map((p) => p.id));

  /* ------------------------------------------------ output folders */
  const label = opts.label || stamp();
  const outDir = path.join(root, "qa", "runs", label);
  const shotsDir = path.join(outDir, "shots");
  const diffsDir = path.join(outDir, "diffs");
  const baselineRoot = path.join(root, "qa", "baseline");
  if (existsSync(outDir)) rmSync(outDir, { recursive: true, force: true });
  mkdirSync(shotsDir, { recursive: true });

  const gitInfo = { branch: git(root, "rev-parse", "--abbrev-ref", "HEAD") || "(no git)", commit: git(root, "rev-parse", "--short", "HEAD"), dirty: git(root, "status", "--porcelain").length > 0 };
  const scopeNote = regressionOnly
    ? `regression run over ${[...new Set(selected.map((p) => p.group))].length} groups · lang ${opts.lang}${opts.expectChange.length ? ` · expect change: ${opts.expectChange.join(",")}` : ""}`
    : `${opts.pages ? "pages" : "groups"} ${opts.pages ? selected.map((p) => p.id).join(",") : scopeGroups.join(",")} · lang ${opts.pages ? [...new Set(selected.map((p) => p.lang))].join("+") : opts.lang}`;
  console.log(`[qa] ${label}: ${selected.length} pages (${scopeNote}) in ${root}`);

  /* ------------------------------------------------ build and server */
  const buildInfo = { ran: false, seconds: 0 };
  if (!opts.skipBuild) {
    const t = Date.now();
    console.log("[qa] next build …");
    const b = await build(root);
    buildInfo.ran = true;
    buildInfo.seconds = Math.round((Date.now() - t) / 1000);
    if (!b.ok) {
      const text = `# QA summary: ${label}\n\n**RESULT: FAIL** (build)\n\n\`next build\` failed (exit ${b.code}). Last output:\n\n\`\`\`\n${b.tail.slice(-3000)}\n\`\`\`\n`;
      writeFileSync(path.join(outDir, "summary.md"), text);
      writeFileSync(path.join(outDir, "report.json"), JSON.stringify({ label, result: "FAIL", build: { ok: false, code: b.code, tail: b.tail.slice(-3000) } }, null, 1));
      console.error(text);
      process.exit(1);
    }
    console.log(`[qa] build ok (${buildInfo.seconds}s)`);
  } else if (!existsSync(path.join(root, ".next", "BUILD_ID"))) {
    fail("--skip-build, but there is no production build (.next/BUILD_ID). Run once without --skip-build.");
  }
  const notes = [];
  if (opts.skipBuild) {
    const builtAt = statSync(path.join(root, ".next", "BUILD_ID")).mtimeMs;
    const edited = Math.max(newestMtime(path.join(root, "src")), newestMtime(path.join(root, "public")), existsSync(path.join(root, "next.config.ts")) ? statSync(path.join(root, "next.config.ts")).mtimeMs : 0);
    if (edited > builtAt + 2000) {
      const msg = `the production build (.next) is older than the files in src/ or public/ by ${Math.round((edited - builtAt) / 1000)} s: these results describe the previous build; run without --skip-build`;
      notes.push(msg);
      console.log(`[qa] WARNING: ${msg}`);
    }
  }
  const server = await startServer(root, opts.port);
  console.log(`[qa] server ${server.url}`);

  try {
    const sm = await fetch(`${server.url}/sitemap.xml`).then((r) => r.text()).catch(() => "");
    const inSitemap = new Set([...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => decodeURIComponent(new URL(m[1]).pathname.replace(/\/$/, "") || "/")));
    if (inSitemap.size) for (const p of selected) if ((p.expectStatus ?? 200) === 200 && !inSitemap.has(decodeURIComponent(p.url.replace(/\/$/, "") || "/"))) notes.push(`${p.id}: ${p.url} is not in the sitemap`);
  } catch {
    /* sitemap check is best effort */
  }

  /* ------------------------------------------------ what gets captured for the baseline comparison */
  const VPS3 = [VIEWPORTS.mobile, VIEWPORTS.tablet, VIEWPORTS.desktop];
  const baselineFile = (p, vp) => path.join(baselineRoot, p.group, `${p.id}-${vp}.png`);
  const hasBaseline = (p, vp) => existsSync(baselineFile(p, vp));
  // Pages whose screenshots are compared without running the content gates on them.
  let captureOnly = [];
  if (compare) {
    if (regressionOnly) captureOnly = selected;
    else if (opts.regress !== "none") {
      const only = opts.regress === "all" ? null : opts.regress.split(",");
      captureOnly = everyPage.filter((p) => !scopeGroups.includes(p.group) && langOk(p) && (!only || only.includes(p.group)));
    }
  }
  const noBaseline = []; // groups / pages that cannot be compared yet
  const capture = [];
  for (const p of captureOnly) {
    if (VPS3.some((vp) => hasBaseline(p, vp.name))) capture.push(p);
    else noBaseline.push(p);
  }

  /* ------------------------------------------------ the loads */
  const browser = await Browser.launch();
  const files = await startFileServer([outDir, baselineRoot]);
  const jobs = [];
  for (const p of gated) for (const vp of [...VPS3, REDUCED]) jobs.push({ page: p, vp, analyze: true });
  for (const p of capture) for (const vp of VPS3) if (hasBaseline(p, vp.name)) jobs.push({ page: p, vp, analyze: false });
  // heavy pages first keeps the workers busy until the end
  const order = jobs.map((j, i) => i).sort((a, b) => (jobs[b].page.template === "home" ? 1 : 0) - (jobs[a].page.template === "home" ? 1 : 0));
  console.log(`[qa] ${jobs.length} page loads, ${Math.min(opts.jobs, jobs.length)} in parallel`);

  let done = 0;
  const loadResults = new Array(jobs.length);
  await pool(order, opts.jobs, async (idx) => {
    const job = jobs[idx];
    let res = null;
    for (let attempt = 1; attempt <= 2; attempt++) {
      res = await runLoad(browser, { baseUrl: server.url, page: job.page, vp: job.vp, shotsDir, screenshots: job.vp.name !== "desktop-rm", analyze: job.analyze });
      if (!res.fatal || !/timed out|crash|connection|closed/i.test(res.fatal)) break;
      console.log(`[qa] retrying ${job.page.id} ${job.vp.name}: ${res.fatal}`);
    }
    res.group = job.page.group;
    res.analyzed = job.analyze;
    res.template = job.page.template;
    if (job.analyze) res.gates = evaluateLoad(res);
    loadResults[idx] = res;
    done++;
    const failed = (res.gates || []).filter((g) => g.status === "fail").map((g) => g.gate);
    console.log(`[qa] ${String(done).padStart(String(jobs.length).length)}/${jobs.length} ${job.page.id.padEnd(20)} ${job.vp.name.padEnd(10)} ${(res.ms / 1000).toFixed(1).padStart(5)}s ${res.fatal ? "FATAL " + res.fatal : failed.length ? "fail: " + failed.join(", ") : job.analyze ? "ok" : "shots"}`);
  });
  const analyzed = loadResults.filter((l) => l.analyzed);

  /* ------------------------------------------------ contrast over photos, glass and the 3D scene: sample the pixels */
  {
    const sampleJobs = [];
    for (const l of analyzed) {
      if (!l.sampleFile || !l.contrast) continue;
      const items = l.contrast.unknowns.map((u, i) => (u.rects && u.rects.length ? { key: i, rects: u.rects, fg: u.sampleFg, need: u.need } : null)).filter(Boolean);
      if (items.length) sampleJobs.push({ id: `${l.pageId}-${l.viewport}`, load: l, file: path.join(shotsDir, l.sampleFile), dpr: l.shots.dpr, items });
    }
    if (sampleJobs.length) {
      const results = await sampleContrastBatch({ browser, files, jobs: sampleJobs });
      for (const j of sampleJobs) applyContrastSamples(j.load.contrast, results.get(j.id) || []);
    }
    for (const l of analyzed) {
      if (l.sampleFile) {
        rmSync(path.join(shotsDir, l.sampleFile), { force: true });
        delete l.sampleFile;
      }
      if (l.contrast) for (const u of l.contrast.unknowns) {
        delete u.rects;
        delete u.sampleFg;
      }
      l.gates = evaluateLoad(l);
    }
  }

  /* ------------------------------------------------ baseline compare */
  const regression = [];
  if (compare) {
    mkdirSync(diffsDir, { recursive: true });
    const items = [];
    for (const l of loadResults) {
      if (!l.shots || l.viewport === "desktop-rm") continue;
      const page = everyPage.find((p) => p.id === l.pageId) || { id: l.pageId, group: l.group };
      const old = baselineFile(page, l.viewport);
      const exempt = opts.expectChange.includes(l.group) || (explicitScope && selectedIds.has(l.pageId));
      if (!existsSync(old)) {
        regression.push({ pageId: l.pageId, group: l.group, viewport: l.viewport, status: "no-baseline", counts: false, pct: 0, regions: 0 });
        continue;
      }
      let oldMasks = [];
      try {
        oldMasks = JSON.parse(readFileSync(old.replace(/\.png$/, ".json"), "utf8")).dynamic || [];
      } catch {
        /* no sidecar */
      }
      items.push({ id: `${l.pageId}-${l.viewport}`, newFile: path.join(shotsDir, l.shots.full), oldFile: old, dpr: l.shots.dpr, masks: [...(l.dynamic || []), ...oldMasks], meta: { l, exempt } });
    }
    console.log(`[qa] diffing ${items.length} screenshots against qa/baseline`);
    const diffs = await diffShots({ browser, files, items, outDir: diffsDir });
    for (const d of diffs) {
      const { l, exempt } = items.find((x) => x.id === d.id).meta;
      regression.push({
        pageId: l.pageId,
        group: l.group,
        viewport: l.viewport,
        counts: !exempt,
        status: exempt ? "expected" : d.pct > REGRESSION_LIMIT_PCT ? "fail" : "pass",
        pct: d.pct,
        changedPixels: d.changedPixels,
        regions: d.regions,
        boxes: d.boxes,
        diffImage: d.diffImage,
        crops: d.crops,
      });
    }
  }

  /* A change that exceeds the limit is shot and compared once more: noise from a busy machine rarely repeats, a real change does. */
  if (compare) {
    const suspicious = regression.filter((r) => r.status === "fail");
    if (suspicious.length) {
      console.log(`[qa] ${suspicious.length} screenshot(s) changed beyond the limit; shooting them once more to rule out noise`);
      const again = [];
      await pool(suspicious, opts.jobs, async (r) => {
        const page = everyPage.find((p) => p.id === r.pageId);
        const vp = VPS3.find((v) => v.name === r.viewport);
        const res = await runLoad(browser, { baseUrl: server.url, page, vp, shotsDir, screenshots: true, analyze: false });
        if (res.shots) again.push({ r, res });
      });
      const items2 = again.map(({ r, res }) => {
        const old = baselineFile(everyPage.find((p) => p.id === r.pageId), r.viewport);
        let oldMasks = [];
        try {
          oldMasks = JSON.parse(readFileSync(old.replace(/\.png$/, ".json"), "utf8")).dynamic || [];
        } catch {
          /* no sidecar */
        }
        return { id: `${r.pageId}-${r.viewport}`, newFile: path.join(shotsDir, res.shots.full), oldFile: old, dpr: res.shots.dpr, masks: [...(res.dynamic || []), ...oldMasks], meta: { r } };
      });
      const diffs2 = await diffShots({ browser, files, items: items2, outDir: diffsDir });
      for (const d of diffs2) {
        const r = items2.find((x) => x.id === d.id).meta.r;
        // the second attempt decides: a real change shows up again, noise from a busy machine usually does not
        const first = r.pct;
        Object.assign(r, { pct: d.pct, changedPixels: d.changedPixels, regions: d.regions, boxes: d.boxes, diffImage: d.diffImage || r.diffImage, crops: d.crops || r.crops });
        r.status = d.pct > REGRESSION_LIMIT_PCT ? "fail" : "pass";
        r.firstAttemptPct = first;
        r.retried = true;
      }
    }
  }

  /* ------------------------------------------------ contact sheets (gated pages only) */
  const sheets = {};
  for (const group of scopeGroups) {
    sheets[group] = [];
    for (const kind of ["desktop", "mobile"]) {
      const tiles = analyzed
        .filter((l) => l.group === group && l.viewport === kind && l.shots)
        .sort((a, b) => selected.findIndex((p) => p.id === a.pageId) - selected.findIndex((p) => p.id === b.pageId))
        .map((l) => ({
          id: l.pageId,
          label: `${l.pageId} · ${kind} ${l.shots.width}px · ${l.url} · ${l.shots.height}px tall`,
          w: l.shots.width,
          vh: l.shots.viewportHeight,
          docH: l.shots.height,
          dpr: l.shots.dpr,
          foldFile: path.join(shotsDir, l.shots.fold),
          fullFile: path.join(shotsDir, l.shots.full),
          scenes: (l.shots.scenes || []).map((sc) => ({ name: sc.name, frames: sc.frames.map((f) => ({ pct: f.pct, file: path.join(shotsDir, f.file) })) })),
        }));
      sheets[group].push(...(await writeSheets({ browser, files, tiles, kind, group, outDir })));
    }
  }
  files.stop();
  await browser.close();

  /* ------------------------------------------------ baseline save (only the selected pages; --group g saves group g) */
  if (opts.baseline === "save") {
    const failedAny = analyzed.some((l) => (l.gates || []).some((g) => g.status === "fail"));
    if (failedAny) console.log("[qa] warning: saving a baseline from a run that has failing gates");
    for (const group of scopeGroups) {
      const dir = path.join(baselineRoot, group);
      mkdirSync(dir, { recursive: true });
      for (const l of analyzed.filter((x) => x.group === group && x.shots && x.viewport !== "desktop-rm")) {
        copyFileSync(path.join(shotsDir, l.shots.full), path.join(dir, `${l.pageId}-${l.viewport}.png`));
        copyFileSync(path.join(shotsDir, l.shots.fold), path.join(dir, `${l.pageId}-${l.viewport}-fold.png`));
        writeFileSync(path.join(dir, `${l.pageId}-${l.viewport}.json`), JSON.stringify({ dynamic: l.dynamic || [], width: l.shots.width, height: l.shots.height, dpr: l.shots.dpr }));
      }
      let meta = {};
      try {
        meta = JSON.parse(readFileSync(path.join(dir, "meta.json"), "utf8"));
      } catch {
        /* first save */
      }
      writeFileSync(path.join(dir, "meta.json"), JSON.stringify({ ...meta, group, savedAt: new Date().toISOString(), label, commit: gitInfo.commit, branch: gitInfo.branch, pages: [...new Set([...(meta.pages || []), ...gated.filter((p) => p.group === group).map((p) => p.id)])] }, null, 1));
      console.log(`[qa] baseline saved: qa/baseline/${group}/`);
    }
  }

  /* ------------------------------------------------ performance (median of --perf-runs runs per page) */
  let perfResults = [];
  if (opts.perf && gated.length) {
    console.log(`[qa] perf: ${gated.length} pages × ${opts.perfRuns} run${opts.perfRuns > 1 ? "s" : ""}, a fresh Chrome per run (mobile profile, 4x CPU, slow network) …`);
    perfResults = await runPerf(server.url, gated, {
      runs: opts.perfRuns,
      onRun: (id, i, n, r) => console.log(`[qa] perf ${id.padEnd(20)} run ${i}/${n} ${r.error ? "ERROR " + r.error : `LCP ${r.lcp} ms, TBT ${r.tbt} ms, frames>50ms ${r.scroll ? r.scroll.over50 : 0}`}`),
    });
    for (const e of perfResults) e.gate = evaluatePerf(e);
  }
  server.stop();

  /* ------------------------------------------------ reports */
  const durationSec = Math.round((Date.now() - startedMs) / 1000);
  const ctx = {
    label,
    git: gitInfo,
    options: opts,
    mode: regressionOnly ? "regression" : "gates",
    pages: gated,
    loads: analyzed,
    perfResults,
    regression,
    noBaseline,
    expectChange: opts.expectChange,
    sheets,
    durationSec,
    build: buildInfo,
    englishIncluded,
    scopeNote,
    capturedPages: [...gated, ...capture],
    notes,
    cpus: os.cpus().length,
    startedAt: new Date(startedMs).toISOString().slice(0, 16).replace("T", " "),
  };
  const summary = buildSummary(ctx);
  writeFileSync(path.join(outDir, "summary.md"), summary.text);
  const skippedGates = regressionOnly ? [{ gate: "all content gates", reason: "skipped (regression run: use --group <name> for the gates)" }] : englishIncluded ? [] : [{ gate: "untranslated", reason: "skipped (English phase)" }];
  writeFileSync(
    path.join(outDir, "report.json"),
    JSON.stringify(
      {
        label,
        result: summary.result,
        mode: ctx.mode,
        startedAt: new Date(startedMs).toISOString(),
        durationSec,
        git: gitInfo,
        options: opts,
        build: buildInfo,
        scope: { groups: scopeGroups, pages: gated.map((p) => p.id), languages: [...new Set(selected.map((p) => p.lang))], expectChange: opts.expectChange },
        skippedGates,
        notes,
        failing: summary.failing,
        pages: gated.map((p) => ({ ...p, loads: Object.fromEntries(analyzed.filter((l) => l.pageId === p.id).map((l) => [l.viewport, trimLoad(l)])) })),
        perf: perfResults,
        regression,
        noBaseline: noBaseline.map((p) => ({ id: p.id, group: p.group })),
        sheets,
        host: { node: process.version, platform: `${os.platform()} ${os.arch()}`, cpus: os.cpus().length },
      },
      null,
      1
    )
  );

  console.log(`\n${summary.text.split("\n").slice(0, 44).join("\n")}`);
  console.log(`[qa] ${summary.result} in ${durationSec}s. Report: qa/runs/${label}/summary.md`);
  process.exit(summary.result === "PASS" ? 0 : 1);
}

main().catch((err) => {
  console.error("[qa] harness error:", err);
  process.exit(2);
});
