#!/usr/bin/env node
// Purpose: verify that what the live Otto core actually holds matches what this repo builds —
// the first check we have that reads *live* state instead of comparing our documents against
// each other.
//
// Usage:
//   node platform/scripts/verify-live-layer.mjs --config <path to qm.config.jsonc> \
//       [--sandbox-dir <path>] [--qm-dir <path>] [--json]
//
// --config is required: the qm.config.jsonc of a real deployment (e.g. ./qm-deploy/qm.config.jsonc).
// --sandbox-dir defaults to "sandbox/" beside --config; if it doesn't exist, the local-vs-live
// drift check is skipped with an explicit note (not a failure). --qm-dir overrides where this
// script looks for an installed @yc-software/qm (see resolveQmDir below).
//
// Talks to live core via `target: "fly"` (routes through `flyctl ssh`, signed with core's own
// CORE_SIGNING_SECRET) — requires flyctl on PATH and FLY_ACCESS_TOKEN/FLY_API_TOKEN in the
// environment. Takes 30-90s. Never echoes env vars or dumps skill/tool file contents.
//
// Zero new dependencies: stdlib only, plus the @yc-software/qm package already installed in the
// deployment directory. Exits 0 only if every applicable check passes; 1 on any failure
// (reachability, status, bootstrapped, hash-sync, or drift); 2 on a usage error.

import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function printUsage() {
  console.error(
    [
      "Usage: node platform/scripts/verify-live-layer.mjs --config <path to qm.config.jsonc> [--sandbox-dir <path>] [--qm-dir <path>] [--json]",
      "",
      "  --config <path>        required. Path to the deployment's qm.config.jsonc.",
      "  --sandbox-dir <path>   optional. Defaults to \"sandbox/\" beside --config.",
      "  --qm-dir <path>        optional. Override where an installed @yc-software/qm is found.",
      "  --json                 print a machine-readable result object instead of the human report.",
    ].join("\n")
  );
}

function parseArgs(argv) {
  let config = null;
  let sandboxDir = null;
  let qmDir = null;
  let json = false;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--config") config = argv[++i];
    else if (a.startsWith("--config=")) config = a.slice("--config=".length);
    else if (a === "--sandbox-dir") sandboxDir = argv[++i];
    else if (a.startsWith("--sandbox-dir=")) sandboxDir = a.slice("--sandbox-dir=".length);
    else if (a === "--qm-dir") qmDir = argv[++i];
    else if (a.startsWith("--qm-dir=")) qmDir = a.slice("--qm-dir=".length);
    else if (a === "--json") json = true;
    else if (a === "-h" || a === "--help") {
      printUsage();
      process.exit(0);
    } else {
      console.error(`Unrecognized argument: ${a}`);
      printUsage();
      process.exit(2);
    }
  }
  return { config, sandboxDir, qmDir, json };
}

const args = parseArgs(process.argv.slice(2));

if (!args.config) {
  console.error("verify-live-layer: --config <path to qm.config.jsonc> is required\n");
  printUsage();
  process.exit(2);
}

const configPath = path.resolve(args.config);
if (!fs.existsSync(configPath)) {
  console.error(`verify-live-layer: config file not found: ${configPath}`);
  process.exit(2);
}
const configDir = path.dirname(configPath);
const sandboxDir = args.sandboxDir ? path.resolve(args.sandboxDir) : path.join(configDir, "sandbox");
const sandboxDirExists = fs.existsSync(sandboxDir);

// ---------------------------------------------------------------------------
// Locate the installed @yc-software/qm (see CLAUDE.md-adjacent brief: do not hardcode a path).
// ---------------------------------------------------------------------------

function resolveQmDir({ dir, override }) {
  if (override) {
    const abs = path.resolve(override);
    if (!fs.existsSync(path.join(abs, "dist/src/deployment-layer.js"))) {
      throw new Error(`--qm-dir ${override} does not look like an @yc-software/qm install (missing dist/src/deployment-layer.js)`);
    }
    return abs;
  }
  // "./contract" is the one subpath @yc-software/qm@0.1.4 actually lists in its package.json
  // "exports" map, so it's the only bare specifier under this package that require.resolve will
  // succeed on. Its resolved path is always "<pkgRoot>/dist/src/contract.js" — walk back up three
  // segments to get pkgRoot, then address dist/src/*.js directly as absolute paths (which bypass
  // the exports map entirely, since only bare-specifier resolution enforces it).
  try {
    const req = createRequire(path.join(dir, path.sep));
    const contractPath = req.resolve("@yc-software/qm/contract");
    const pkgRoot = path.dirname(path.dirname(path.dirname(contractPath)));
    if (fs.existsSync(path.join(pkgRoot, "dist/src/deployment-layer.js"))) return pkgRoot;
  } catch {
    // fall through to the node_modules fallback below
  }
  const fallback = path.join(dir, "node_modules", "@yc-software", "qm");
  if (fs.existsSync(path.join(fallback, "dist/src/deployment-layer.js"))) return fallback;
  throw new Error(
    `could not locate an installed @yc-software/qm relative to ${dir}. Try --qm-dir <path>, or run this script from the deployment directory (the directory containing --config).`
  );
}

let qmDir;
try {
  qmDir = resolveQmDir({ dir: configDir, override: args.qmDir });
} catch (e) {
  console.error(`verify-live-layer: ${e.message}`);
  process.exit(1);
}

const { currentDeploymentLayerState, deploymentLayerBody } = await import(
  pathToFileURL(path.join(qmDir, "dist/src/deployment-layer.js")).href
);
const { loadConfigAt } = await import(pathToFileURL(path.join(qmDir, "dist/src/config.js")).href);

let config;
try {
  const loaded = loadConfigAt(configPath);
  config = loaded && typeof loaded === "object" && "config" in loaded ? loaded.config : loaded;
} catch (e) {
  console.error(`verify-live-layer: could not load config at ${configPath}: ${e.message}`);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Reporting helpers (house style: platform/scripts/build-sandbox-layer.mjs + evals/run.mjs)
// ---------------------------------------------------------------------------

let failCount = 0;
const failures = []; // { check, detail }

function row(status, label, detail) {
  if (!status) {
    failCount++;
    failures.push({ check: label, detail: detail || "" });
  }
  if (!args.json) {
    const mark = status ? "✅" : "❌";
    console.log(`${mark} ${label}${detail ? " — " + detail : ""}`);
  }
}

function section(title) {
  if (!args.json) console.log(`\n=== ${title} ===\n`);
}

function shortHash(h) {
  return h ? h.slice(0, 12) : "(none)";
}

const result = {
  ok: false,
  config: configPath,
  sandboxDir,
  sandboxDirExists,
  reachable: false,
  error: null,
  status: null,
  bootstrapped: null,
  contentHash: null,
  runtimeContentHash: null,
  runtimeSynced: null,
  inventory: null,
  tools: null,
  drift: null,
  failures: null,
  failureCount: null,
};

function finish() {
  result.ok = failCount === 0;
  result.failureCount = failCount;
  result.failures = failures;
  if (args.json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    section("SUMMARY");
    console.log(`Total failures: ${failCount}`);
    if (result.ok) {
      console.log("\n✅ VERIFICATION PASSED\n");
    } else {
      console.log("\n❌ VERIFICATION FAILED\n");
    }
  }
  process.exit(result.ok ? 0 : 1);
}

// ---------------------------------------------------------------------------
// 1. Reachability
// ---------------------------------------------------------------------------

section("1. REACHABILITY + LAYER STATE");

const opts = { config, configPath, target: "fly", configDir };

let state = null;
try {
  state = await currentDeploymentLayerState(opts);
  result.reachable = true;
  row(true, "live deployment-layer read succeeded");
} catch (e) {
  result.error = e && e.message ? e.message : String(e);
  row(false, "live deployment-layer read failed", result.error);
  finish();
}

// ---------------------------------------------------------------------------
// 2 & 3. status / bootstrapped
// ---------------------------------------------------------------------------

result.status = state.status;
result.bootstrapped = state.bootstrapped;

row(state.status === "applied", `status is "${state.status}"`, state.status === "degraded" ? "core is serving a degraded (partially applied) layer" : "");
row(!state.bootstrapped, "core has a durable deployment-layer record", state.bootstrapped ? "no durable record on core — an empty bundle was synthesised; nothing is loaded" : "");

// ---------------------------------------------------------------------------
// 4. runtimeContentHash vs contentHash
// ---------------------------------------------------------------------------

result.contentHash = state.contentHash;
result.runtimeContentHash = state.runtimeContentHash;

const contentHashShort = shortHash(state.contentHash);
const runtimeHashShort = shortHash(state.runtimeContentHash);

if (state.runtimeContentHash == null) {
  result.runtimeSynced = false;
  row(false, "runtime has picked up the stored bundle", `runtimeContentHash not reported by core (stored contentHash ${contentHashShort}...)`);
} else {
  result.runtimeSynced = state.runtimeContentHash === state.contentHash;
  row(
    result.runtimeSynced,
    "runtime has picked up the stored bundle",
    result.runtimeSynced ? `${contentHashShort}...` : `core has stored ${contentHashShort}... but the runtime is serving ${runtimeHashShort}...`
  );
}

// ---------------------------------------------------------------------------
// 5. Inventory (report only — not a pass/fail check)
// ---------------------------------------------------------------------------

section("2. INVENTORY");

let bundle = null;
try {
  bundle = JSON.parse(state.body);
} catch (e) {
  row(false, "live bundle body parses as JSON", e.message);
}

const toolEntries = bundle && Array.isArray(bundle.tools) ? bundle.tools : [];
const skillEntries = bundle && Array.isArray(bundle.skills) ? bundle.skills : [];

const toolIds = toolEntries.map((t) => (typeof t.path === "string" ? t.path.split("/")[1] : "(unknown)")).sort();
const skillIds = new Set();
for (const s of skillEntries) {
  if (typeof s.path !== "string") continue;
  const parts = s.path.split("/");
  if (parts[0] === "skills" && parts.length > 1) skillIds.add(parts[1]);
}

result.inventory = { toolCount: toolEntries.length, skillCount: skillIds.size, toolIds };

if (!args.json) {
  console.log(`tools: ${toolEntries.length} (${toolIds.join(", ") || "none"})`);
  console.log(`skills: ${skillIds.size} (${[...skillIds].sort().join(", ") || "none"})`);
}

// ---------------------------------------------------------------------------
// 6. Approval rules live on core (report only — the section a human reads to answer "what is
// actually enforced right now")
// ---------------------------------------------------------------------------

section("3. APPROVAL RULES LIVE ON CORE");

const tools = [];
for (const t of toolEntries) {
  const id = typeof t.path === "string" ? t.path.split("/")[1] : "(unknown)";
  let descriptor;
  try {
    descriptor = JSON.parse(t.content);
  } catch (e) {
    row(false, `tools/${id}/tool.json parses as JSON`, e.message);
    continue;
  }
  const approvals = Array.isArray(descriptor.approvals) ? descriptor.approvals : [];
  const egress = Array.isArray(descriptor.egress) ? descriptor.egress : [];
  tools.push({
    id,
    approvals: approvals.map((a) => ({
      decision: a.decision || "require_approval",
      value: typeof a.command === "string" ? a.command : a.pattern,
    })),
    egress,
  });
}
result.tools = tools;

if (!args.json) {
  for (const t of tools.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))) {
    console.log(`${t.id}:`);
    if (t.approvals.length === 0) {
      console.log("  (no approval rules — ungated)");
    } else {
      for (const a of t.approvals) console.log(`  ${a.decision}  ${a.value}`);
    }
    if (t.egress.length > 0) console.log(`  egress: ${t.egress.join(", ")}`);
  }
  if (tools.length === 0) console.log("(no tools live)");
}

// ---------------------------------------------------------------------------
// 7. Local vs live drift (only when the sandbox dir exists)
// ---------------------------------------------------------------------------

section("4. LOCAL VS LIVE DRIFT");

if (!sandboxDirExists) {
  if (!args.json) console.log(`skipped — no sandbox directory at ${sandboxDir}`);
  result.drift = { checked: false, note: `no sandbox directory at ${sandboxDir}` };
} else {
  let localBody = null;
  try {
    localBody = deploymentLayerBody(sandboxDir);
  } catch (e) {
    row(false, "local sandbox bundle builds", `${sandboxDir}: ${e.message}`);
  }

  if (localBody !== null) {
    const localHash = createHash("sha256").update(localBody).digest("hex");
    const matches = localHash === state.contentHash;
    if (matches) {
      row(true, "local sandbox matches live", `${shortHash(localHash)}...`);
      result.drift = { checked: true, matches: true, localHash: shortHash(localHash) };
    } else if (bundle) {
      const localBundle = JSON.parse(localBody);
      const localMap = new Map();
      for (const e of [...localBundle.tools, ...localBundle.skills]) localMap.set(e.path, e.content);
      const liveMap = new Map();
      for (const e of [...toolEntries, ...skillEntries]) liveMap.set(e.path, e.content);

      const onlyLive = [...liveMap.keys()].filter((k) => !localMap.has(k)).sort();
      const onlyLocal = [...localMap.keys()].filter((k) => !liveMap.has(k)).sort();
      const differs = [...localMap.keys()].filter((k) => liveMap.has(k) && liveMap.get(k) !== localMap.get(k)).sort();

      row(
        false,
        "local sandbox matches live",
        `local ${shortHash(localHash)}... vs live ${shortHash(state.contentHash)}... (${onlyLive.length} live-only, ${onlyLocal.length} local-only, ${differs.length} differ)`
      );
      result.drift = { checked: true, matches: false, localHash: shortHash(localHash), liveHash: shortHash(state.contentHash), onlyLive, onlyLocal, differs };

      if (!args.json) {
        for (const p of onlyLive) console.log(`  present-live-only: ${p}`);
        for (const p of onlyLocal) console.log(`  present-local-only: ${p}`);
        for (const p of differs) console.log(`  content-differs: ${p}`);
      }
    } else {
      row(false, "local sandbox matches live", "hash mismatch, but the live bundle body could not be parsed to compute a diff (see section 5)");
      result.drift = { checked: true, matches: false, localHash: shortHash(localHash), liveHash: shortHash(state.contentHash), note: "live body unparseable — no path-level diff available" };
    }
  }
}

finish();
