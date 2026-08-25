#!/usr/bin/env node
// Ensures a Metro dev server that BELONGS TO THIS REPOSITORY is listening on
// :8081 AND can actually serve this app's bundle before `react-native
// run-ios` / `run-android` launches the app.
//
// Why /status alone is insufficient:
//   GET /status -> 200 proves only that *something* answers HTTP on 8081.
//   A Metro instance from ANOTHER project (stale checkout, different repo)
//   or a wedged Metro passes that check, and the native build then launches
//   into a red screen ("No script URL provided") because the debug build
//   fetches its bundle from the hardcoded http://localhost:8081 regardless
//   of who owns the server. A 200 on /status also says nothing about
//   whether the module graph can actually be built and served.
//
// Ownership check:
//   Every process LISTENing on :8081 is inspected: command line via
//   `ps -p <pid> -o command=` and (fallback signal) working directory via
//   `lsof -a -p <pid> -d cwd -Fn`. A listener is OURS iff its command line
//   or its cwd lives under WORKSPACE_ROOT.
//
// Kill rules:
//   - all listeners owned    -> reuse them and go straight to the probe
//   - foreign METRO-like     -> SIGTERM (up to 5s), then SIGKILL, then wait
//     listener                  until :8081 is actually free, spawn ours
//   - foreign non-Metro      -> hard error naming the pid/command. We never
//     listener                  kill unrelated services squatting on 8081.
//
// Spawned Metro gets an explicit --port=8081 on purpose: if another process
// races us for the port, Metro must FAIL rather than silently move to 8082
// while the app still points at 8081.
//
// Readiness probe (the core fix): poll
//   GET /index.bundle?platform=<platform>&dev=true&minify=false
// until it returns HTTP 200 -- i.e. the bundle for THIS platform really
// builds and serves. The response body is not needed; it is drained and
// destroyed immediately after reading the status. Per-attempt socket timeout
// is 15s: during a cold graph build Metro holds the request open, so
// retrying is correct (Metro keeps building across attempts). Overall
// budget: 240s from script start. If the probe never passes we print
// diagnostics and exit 1 -- NEVER "continue anyway"; run-ios/run-android
// must not launch a doomed app.

const { spawn } = require("child_process");
const http = require("http");
const path = require("path");

const MOBILE_ROOT = path.join(__dirname, "..");
const WORKSPACE_ROOT = path.resolve(__dirname, "../..");
const PORT = 8081;
const PROBE_TIMEOUT_MS = 15000;
const TOTAL_BUDGET_MS = 240000;

function run(cmd, args) {
  return new Promise((resolve) => {
    const child = spawn(cmd, args, { stdio: ["ignore", "pipe", "pipe"] });
    let out = "";
    child.stdout.on("data", (chunk) => {
      out += chunk;
    });
    child.stderr.resume();
    child.on("error", () => resolve({ ok: false, out }));
    child.on("close", (code) => resolve({ ok: code === 0, out }));
  });
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function listListeners() {
  // Empty output / exit code 1 both mean: nobody is listening.
  const { out } = await run("lsof", ["-ti", `tcp:${PORT}`, "-sTCP:LISTEN"]);
  return out
    .split("\n")
    .map((line) => Number(line.trim()))
    .filter((n) => Number.isInteger(n) && n > 0);
}

async function inspectListener(pid) {
  const [{ out: command }, { out: fdOut }] = await Promise.all([
    run("ps", ["-p", String(pid), "-o", "command="]),
    run("lsof", ["-a", "-p", String(pid), "-d", "cwd", "-Fn"]),
  ]);
  // `-Fn` prefixes name fields with 'n' (the classic pipeline pipes through
  // `sed 's/^n//'`); keep the first line that looks like an absolute path.
  const cwd =
    fdOut
      .split("\n")
      .map((line) => line.replace(/^n/, ""))
      .find((line) => line.startsWith("/")) ?? "";
  return { pid, command: command.trim(), cwd };
}

const isOwned = ({ command, cwd }) =>
  command.includes(WORKSPACE_ROOT) || cwd.includes(WORKSPACE_ROOT);

const isMetroLike = ({ command }) =>
  (command.includes("cli.js") && command.includes("start")) ||
  command.includes("metro");

function pidAlive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

async function terminate(pids) {
  for (const pid of pids) {
    try {
      process.kill(pid, "SIGTERM");
    } catch {
      // already gone -- nothing to terminate
    }
  }
  const graceDeadline = Date.now() + 5000;
  while (Date.now() < graceDeadline && pids.some(pidAlive)) {
    await sleep(250);
  }
  for (const pid of pids) {
    if (pidAlive(pid)) {
      try {
        process.kill(pid, "SIGKILL");
      } catch {
        // died between the liveness check and the kill -- done either way
      }
    }
  }
}

async function waitPortFree(timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if ((await listListeners()).length === 0) return true;
    await sleep(500);
  }
  return false;
}

async function describeListeners() {
  const pids = await listListeners();
  if (pids.length === 0) return "nothing is listening on port 8081";
  const infos = await Promise.all(pids.map(inspectListener));
  return infos.map(({ command, pid }) => `pid ${pid}: ${command}`).join("; ");
}

async function probeBundle(platform) {
  return new Promise((resolve) => {
    const req = http.get(
      {
        host: "localhost",
        port: PORT,
        path: `/index.bundle?platform=${platform}&dev=true&minify=false`,
      },
      (res) => {
        const ok = res.statusCode === 200;
        res.resume(); // drain what has arrived...
        res.destroy(); // ...and drop the rest -- the body is not needed
        resolve(ok);
      },
    );
    req.setTimeout(PROBE_TIMEOUT_MS, () => req.destroy(new Error("timeout")));
    req.on("error", () => resolve(false));
  });
}

async function waitForBundle(platform, metroPid, startedAt) {
  const label = platform === "android" ? "Android" : "iOS";
  const deadline = startedAt + TOTAL_BUDGET_MS;
  let lastProgressAt = 0;
  while (Date.now() < deadline) {
    if (await probeBundle(platform)) {
      const seconds = ((Date.now() - startedAt) / 1000).toFixed(1);
      console.log(`Metro ready (pid ${metroPid}, bundle 200 in ${seconds}s)`);
      process.exit(0);
    }
    if (lastProgressAt === 0 || Date.now() - lastProgressAt >= 10000) {
      lastProgressAt = Date.now();
      const elapsed = Math.round((Date.now() - startedAt) / 1000);
      console.log(
        `waiting for Metro to compile the ${label} bundle... (${elapsed}s)`,
      );
    }
    await sleep(2000);
  }

  console.error(
    `\nERROR: no servable ${label} bundle within ${TOTAL_BUDGET_MS / 1000}s.`,
  );
  console.error(`Port ${PORT}: ${await describeListeners()}.`);
  console.error("Not launching the app against a dev server we cannot verify.");
  process.exit(1);
}

function spawnMetro() {
  // react-native's exports map does not expose ./cli.js, but ./package.json
  // is exported -- resolve that and step from the package root to the CLI.
  const rnPkgJson = require.resolve("react-native/package.json", {
    paths: [MOBILE_ROOT],
  });
  const cli = path.join(path.dirname(rnPkgJson), "cli.js");
  const child = spawn(process.execPath, [cli, "start", `--port=${PORT}`], {
    cwd: MOBILE_ROOT,
    detached: true,
    stdio: "ignore",
  });
  // A spawn failure surfaces asynchronously; swallow it here so the probe's
  // diagnostics report the situation instead of an unhandled exception.
  child.on("error", () => {});
  child.unref();
  return child.pid;
}

async function main() {
  const platform = (process.argv[2] ?? "ios").toLowerCase();
  if (platform !== "ios" && platform !== "android") {
    console.error(
      `Unknown platform "${platform}" -- expected "ios" or "android".`,
    );
    process.exit(1);
  }

  const startedAt = Date.now();
  const listeners = await listListeners();

  if (listeners.length > 0) {
    const infos = [];
    for (const pid of listeners) {
      const info = await inspectListener(pid);
      // Process vanished between lsof and ps/lsof -- nothing to decide.
      if (!info.command && !info.cwd) continue;
      infos.push(info);
    }

    const foreign = infos.filter((info) => !isOwned(info));
    const squatters = foreign.filter((info) => !isMetroLike(info));
    if (squatters.length > 0) {
      console.error(
        `Port ${PORT} is held by process(es) that do not belong to this repo:`,
      );
      for (const s of squatters) {
        console.error(`  pid ${s.pid}: ${s.command}`);
      }
      console.error("Refusing to kill them. Stop them manually and re-run.");
      process.exit(1);
    }

    if (foreign.length > 0) {
      console.log(
        `Stopping stale Metro from another project: ${foreign
          .map((f) => `pid ${f.pid}`)
          .join(", ")}`,
      );
      await terminate(foreign.map((f) => f.pid));
      if (!(await waitPortFree(10000))) {
        console.error(`Port ${PORT} did not free after killing stale Metro.`);
        process.exit(1);
      }
    }
  }

  let metroPid;
  if ((await listListeners()).length > 0) {
    // At least one owned listener survived the checks -- reuse it.
    metroPid = (await listListeners())[0];
    console.log(`Reusing existing Metro from this repo (pid ${metroPid}).`);
  } else {
    metroPid = spawnMetro();
  }

  await waitForBundle(platform, metroPid, startedAt);
}

main().catch((err) => {
  console.error(err?.stack ?? err);
  process.exit(1);
});
