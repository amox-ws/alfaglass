// Build the site and run `next start` as a child process that dies with the harness.

import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import net from "node:net";
import path from "node:path";
import { killGroup, onCleanup, sleep } from "./lifecycle.mjs";

function nextBin(root) {
  const require = createRequire(path.join(root, "package.json"));
  return require.resolve("next/dist/bin/next");
}

/** True if nothing answers on the port (IPv4 or IPv6 loopback) and it can be bound. */
export async function isPortFree(port) {
  const connects = (host) =>
    new Promise((resolve) => {
      const sock = net.connect({ port, host });
      const done = (v) => {
        sock.destroy();
        resolve(v);
      };
      sock.setTimeout(800, () => done(false));
      sock.once("connect", () => done(true));
      sock.once("error", () => done(false));
    });
  if ((await connects("127.0.0.1")) || (await connects("::1"))) return false;
  return new Promise((resolve) => {
    const srv = net.createServer();
    srv.once("error", () => resolve(false));
    srv.listen(port, "localhost", () => srv.close(() => resolve(true)));
  });
}

/** Run `next build`. Resolves { ok, code, tail }. */
export function build(root, { onLine } = {}) {
  return new Promise((resolve) => {
    const proc = spawn(process.execPath, [nextBin(root), "build"], {
      cwd: root,
      env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1", CI: "1" },
      stdio: ["ignore", "pipe", "pipe"],
      detached: true,
    });
    const unregister = onCleanup(() => killGroup(proc));
    let tail = "";
    const feed = (d) => {
      const s = d.toString();
      tail = (tail + s).slice(-6000);
      if (onLine) onLine(s);
    };
    proc.stdout.on("data", feed);
    proc.stderr.on("data", feed);
    proc.on("close", (code) => {
      unregister();
      resolve({ ok: code === 0, code, tail });
    });
    proc.on("error", (err) => {
      unregister();
      resolve({ ok: false, code: -1, tail: String(err) });
    });
  });
}

/** Start `next start -p <port>` and wait until `/` answers 200. Returns { url, stop }. */
export async function startServer(root, port, { timeout = 90000 } = {}) {
  if (!(await isPortFree(port))) {
    throw new Error(`Port ${port} is already in use. Pick another with --port (each worktree needs its own).`);
  }
  const proc = spawn(process.execPath, [nextBin(root), "start", "-p", String(port), "-H", "localhost"], {
    cwd: root,
    env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1", NODE_ENV: "production" },
    stdio: ["ignore", "pipe", "pipe"],
    detached: true,
  });
  let output = "";
  const feed = (d) => {
    output = (output + d.toString()).slice(-6000);
  };
  proc.stdout.on("data", feed);
  proc.stderr.on("data", feed);
  const unregister = onCleanup(() => killGroup(proc));
  const stop = () => {
    // The cleanup entry stays registered until the process is really gone, so the exit hook can still SIGKILL it.
    const timer = setTimeout(() => killGroup(proc, "SIGKILL"), 2000);
    timer.unref();
    proc.once("exit", () => {
      clearTimeout(timer);
      unregister();
    });
    killGroup(proc, "SIGTERM");
  };

  // Always "localhost": the Proxy rewrites Greek URLs and Next treats a rewrite to a different host as external.
  const url = `http://localhost:${port}`;
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    if (proc.exitCode !== null) {
      unregister();
      throw new Error(`next start exited (code ${proc.exitCode}). Is the site built? Output:\n${output.slice(-1500)}`);
    }
    try {
      const res = await fetch(`${url}/`, { signal: AbortSignal.timeout(3000), redirect: "manual" });
      if (res.status === 200) return { url, stop, get output() { return output; } };
    } catch {
      /* not up yet */
    }
    await sleep(300);
  }
  stop();
  throw new Error(`next start did not answer 200 within ${timeout / 1000}s. Output:\n${output.slice(-1500)}`);
}
