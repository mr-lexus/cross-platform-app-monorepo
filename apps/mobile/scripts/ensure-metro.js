// Ensures a Metro dev server is reachable on :8081 before the native build
// scripts launch the app. The RN CLI's own Metro spawn is unreliable in
// non-interactive shells, which left the app unable to load its bundle.
const { spawn } = require("child_process");
const http = require("http");
const path = require("path");

const METRO_STATUS_URL = "http://localhost:8081/status";
const TIMEOUT_MS = 30000;

function isMetroUp() {
  return new Promise((resolve) => {
    const req = http.get(METRO_STATUS_URL, (res) => {
      res.resume();
      resolve(res.statusCode === 200);
    });
    req.on("error", () => resolve(false));
    req.setTimeout(1000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function main() {
  if (await isMetroUp()) {
    return;
  }
  // react-native's exports map does not expose ./cli.js, but ./package.json
  // is exported — resolve that and step from the package root to the CLI.
  const rnPkgJson = require.resolve("react-native/package.json", {
    paths: [path.join(__dirname, "..")],
  });
  const cli = path.join(path.dirname(rnPkgJson), "cli.js");
  const child = spawn(process.execPath, [cli, "start"], {
    cwd: path.join(__dirname, ".."),
    detached: true,
    stdio: "ignore",
  });
  child.unref();

  const deadline = Date.now() + TIMEOUT_MS;
  while (Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    if (await isMetroUp()) {
      return;
    }
  }
  console.warn("Metro did not become ready in 30s - continuing anyway.");
}

main();
