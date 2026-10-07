// Process cleanup registry: everything the harness starts (Chrome, next start, temp profiles) is
// registered here and torn down on normal exit, errors, Ctrl-C and SIGTERM.
// Cleanup functions must be synchronous: they also run from the "exit" event.

const tasks = new Set();
let installed = false;
let running = false;

function runAll() {
  if (running) return;
  running = true;
  for (const fn of [...tasks].reverse()) {
    try {
      fn();
    } catch {
      /* best effort */
    }
  }
  tasks.clear();
}

function install() {
  if (installed) return;
  installed = true;
  process.on("exit", runAll);
  for (const sig of ["SIGINT", "SIGTERM", "SIGHUP"]) {
    process.on(sig, () => {
      console.error(`\n[qa] ${sig} received, cleaning up`);
      runAll();
      process.exit(130);
    });
  }
  process.on("uncaughtException", (e) => {
    console.error("[qa] uncaught exception:", e);
    runAll();
    process.exit(2);
  });
  process.on("unhandledRejection", (e) => {
    console.error("[qa] unhandled rejection:", e);
    runAll();
    process.exit(2);
  });
}

/** Register a synchronous cleanup function. Returns a function that unregisters it. */
export function onCleanup(fn) {
  install();
  tasks.add(fn);
  return () => tasks.delete(fn);
}

/** Kill a detached child and everything in its process group. */
export function killGroup(child, signal = "SIGKILL") {
  if (!child || child.exitCode !== null || child.pid == null) return;
  try {
    process.kill(-child.pid, signal);
  } catch {
    try {
      child.kill(signal);
    } catch {
      /* already gone */
    }
  }
}

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
