// Minimal Chrome DevTools Protocol client on Node's built-in WebSocket and fetch (no dependencies).
// One headless Chrome process with a throw-away profile; every page is a target attached over a
// single browser-level socket (flattened sessions), so several pages can be driven in parallel.

import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { killGroup, onCleanup, sleep } from "./lifecycle.mjs";

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/usr/bin/google-chrome",
  "/usr/bin/google-chrome-stable",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
].filter(Boolean);

export function findChrome() {
  const hit = CHROME_CANDIDATES.find((p) => existsSync(p));
  if (!hit) throw new Error(`Chrome not found. Set CHROME_PATH. Tried: ${CHROME_CANDIDATES.join(", ")}`);
  return hit;
}

class Connection {
  #ws;
  #id = 0;
  #pending = new Map();
  #handlers = new Map(); // `${sessionId}|${event}` -> Set<fn>
  closed = false;

  constructor(ws) {
    this.#ws = ws;
    ws.addEventListener("message", (e) => this.#onMessage(e));
    ws.addEventListener("close", () => {
      this.closed = true;
      for (const { reject, method } of this.#pending.values()) reject(new Error(`${method}: connection closed`));
      this.#pending.clear();
    });
  }

  #onMessage(e) {
    const msg = JSON.parse(typeof e.data === "string" ? e.data : Buffer.from(e.data).toString());
    if (msg.id !== undefined) {
      const p = this.#pending.get(msg.id);
      if (!p) return;
      this.#pending.delete(msg.id);
      clearTimeout(p.timer);
      if (msg.error) p.reject(new Error(`${p.method}: ${msg.error.message}`));
      else p.resolve(msg.result);
      return;
    }
    if (msg.method) {
      const set = this.#handlers.get(`${msg.sessionId ?? ""}|${msg.method}`);
      if (set) for (const fn of [...set]) fn(msg.params ?? {});
    }
  }

  send(method, params = {}, sessionId, timeout = 45000) {
    if (this.closed) return Promise.reject(new Error(`${method}: connection closed`));
    const id = ++this.#id;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.#pending.delete(id);
        reject(new Error(`${method}: timed out after ${timeout} ms`));
      }, timeout);
      this.#pending.set(id, { resolve, reject, timer, method });
      const msg = { id, method, params };
      if (sessionId) msg.sessionId = sessionId;
      this.#ws.send(JSON.stringify(msg));
    });
  }

  on(sessionId, event, fn) {
    const key = `${sessionId ?? ""}|${event}`;
    let set = this.#handlers.get(key);
    if (!set) this.#handlers.set(key, (set = new Set()));
    set.add(fn);
    return () => set.delete(fn);
  }

  dropSession(sessionId) {
    for (const key of [...this.#handlers.keys()]) if (key.startsWith(`${sessionId}|`)) this.#handlers.delete(key);
  }

  close() {
    try {
      this.#ws.close();
    } catch {
      /* ignore */
    }
  }
}

export class Page {
  constructor(browser, targetId, sessionId) {
    this.browser = browser;
    this.targetId = targetId;
    this.sessionId = sessionId;
    this.closed = false;
  }

  send(method, params = {}, timeout) {
    return this.browser.conn.send(method, params, this.sessionId, timeout);
  }

  on(event, fn) {
    return this.browser.conn.on(this.sessionId, event, fn);
  }

  /** Resolves with the first event params that satisfy `pred` (default: any). */
  waitFor(event, { pred = () => true, timeout = 30000 } = {}) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        off();
        reject(new Error(`timed out waiting for ${event}`));
      }, timeout);
      const off = this.on(event, (p) => {
        if (!pred(p)) return;
        clearTimeout(timer);
        off();
        resolve(p);
      });
    });
  }

  /** Evaluate an expression in the page; awaits promises; returns the JSON value. */
  async eval(expression, { timeout = 60000 } = {}) {
    const r = await this.send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true }, timeout);
    if (r.exceptionDetails) {
      const d = r.exceptionDetails;
      throw new Error(`page exception: ${d.exception?.description ?? d.text}`);
    }
    return r.result.value;
  }

  /** Call a self-contained function in the page with JSON-serialisable arguments. */
  call(fn, ...args) {
    return this.eval(`(${fn.toString()})(...${JSON.stringify(args)})`, { timeout: 120000 });
  }

  async screenshot(params = {}) {
    const r = await this.send("Page.captureScreenshot", params, 120000);
    return Buffer.from(r.data, "base64");
  }

  async close() {
    if (this.closed) return;
    this.closed = true;
    this.browser.conn.dropSession(this.sessionId);
    try {
      await this.browser.conn.send("Target.closeTarget", { targetId: this.targetId }, undefined, 8000);
    } catch {
      /* browser already gone */
    }
  }
}

export class Browser {
  constructor(proc, profile, conn) {
    this.proc = proc;
    this.profile = profile;
    this.conn = conn;
    this.pages = new Set();
  }

  static async launch({ args = [], label = "qa" } = {}) {
    const chrome = findChrome();
    const profile = mkdtempSync(path.join(tmpdir(), `${label}-chrome-`));
    const proc = spawn(
      chrome,
      [
        "--headless=new",
        "--remote-debugging-port=0",
        `--user-data-dir=${profile}`,
        "--no-first-run",
        "--no-default-browser-check",
        "--hide-scrollbars",
        "--mute-audio",
        "--force-color-profile=srgb",
        "--disable-background-timer-throttling",
        "--disable-backgrounding-occluded-windows",
        "--disable-renderer-backgrounding",
        "--disable-ipc-flooding-protection",
        "--disable-features=Translate,MediaRouter,OptimizationHints,CalculateNativeWinOcclusion",
        ...args,
        "about:blank",
      ],
      { stdio: ["ignore", "ignore", "pipe"], detached: true }
    );
    let stderr = "";
    proc.stderr.on("data", (d) => {
      stderr = (stderr + d).slice(-4000);
    });
    const unregister = onCleanup(() => {
      killGroup(proc);
      try {
        rmSync(profile, { recursive: true, force: true });
      } catch {
        /* ignore */
      }
    });

    try {
      // Chrome writes the chosen debugging port to <profile>/DevToolsActivePort.
      const portFile = path.join(profile, "DevToolsActivePort");
      let wsUrl = null;
      for (let i = 0; i < 400 && !wsUrl; i++) {
        if (proc.exitCode !== null) throw new Error(`Chrome exited early (code ${proc.exitCode}): ${stderr.slice(-500)}`);
        if (existsSync(portFile)) {
          const [port, wsPath] = readFileSync(portFile, "utf8").trim().split("\n");
          if (port && wsPath) wsUrl = `ws://127.0.0.1:${port}${wsPath}`;
        }
        if (!wsUrl) await sleep(100);
      }
      if (!wsUrl) throw new Error(`Chrome did not expose a DevTools port within 40 s. stderr: ${stderr.slice(-400)}`);
      const ws = new WebSocket(wsUrl);
      await new Promise((resolve, reject) => {
        ws.addEventListener("open", resolve, { once: true });
        ws.addEventListener("error", () => reject(new Error("DevTools socket error")), { once: true });
      });
      const browser = new Browser(proc, profile, new Connection(ws));
      browser._unregister = unregister;
      return browser;
    } catch (err) {
      unregister();
      killGroup(proc);
      try {
        rmSync(profile, { recursive: true, force: true });
      } catch {
        /* ignore */
      }
      throw err;
    }
  }

  /** Open a blank page (its own window, so it is never treated as a background tab). */
  async newPage() {
    const { targetId } = await this.conn.send("Target.createTarget", { url: "about:blank", newWindow: true });
    const { sessionId } = await this.conn.send("Target.attachToTarget", { targetId, flatten: true });
    const page = new Page(this, targetId, sessionId);
    this.pages.add(page);
    page.on("Inspector.targetCrashed", () => {
      page.crashed = true;
    });
    return page;
  }

  async close() {
    if (this._unregister) this._unregister();
    this._unregister = null;
    try {
      await this.conn.send("Browser.close", {}, undefined, 4000);
    } catch {
      /* ignore */
    }
    this.conn.close();
    await sleep(150);
    killGroup(this.proc);
    try {
      rmSync(this.profile, { recursive: true, force: true });
    } catch {
      /* ignore */
    }
  }
}
