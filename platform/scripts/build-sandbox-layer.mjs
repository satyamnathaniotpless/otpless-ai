#!/usr/bin/env node
// Purpose: assemble a qm-ready `sandbox/skills/` tree from this repo's packs, and refuse to
// emit a broken one. This is the integration seam between the repo (packs/**, platform/
// contracts/**) and qm's sandbox layer (verified facts about that layer are recorded in the
// task that produced this script, not re-derived here — see docs/reports/ for the phase report
// this shipped in).
//
// Usage:
//   node platform/scripts/build-sandbox-layer.mjs                     # dry run: verify + report, write nothing
//   node platform/scripts/build-sandbox-layer.mjs --out <dir>          # write the tree to <dir>/skills/**
//   node platform/scripts/build-sandbox-layer.mjs --packs shared,recruiting --out <dir>
//
// Zero dependencies. Node 22 compatible. Never modifies anything under packs/ — this script
// adapts the pack layout at build time; the source layout is not this script's to change.

import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function parseArgs(argv) {
  let out = null;
  let packsArg = "shared,recruiting"; // ADR-005-friendly default: adding a pack is one CLI arg.
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--out") out = argv[++i];
    else if (a.startsWith("--out=")) out = a.slice("--out=".length);
    else if (a === "--packs") packsArg = argv[++i];
    else if (a.startsWith("--packs=")) packsArg = a.slice("--packs=".length);
    else {
      console.error(`Unrecognized argument: ${a}`);
      process.exit(2);
    }
  }
  const packs = packsArg
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return { out, packs };
}

const { out: OUT_DIR, packs: SELECTED_PACKS } = parseArgs(process.argv.slice(2));
const DRY_RUN = !OUT_DIR;

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

// qm's hard cap on the JSON-encoded bundle (skills + tool descriptors). Verified fact, not
// derived — exceeding it is a qm build error.
const BUNDLE_BYTE_CAP = 1_000_000;

// Mirrors evals/run.mjs's PII_ALLOWED_ADDRESSES (kept in sync by hand, not imported, so this
// script stays independently runnable with zero dependencies and no coupling to the eval
// harness's module shape). Agent mailboxes are infrastructure, not personal data; a human
// address anywhere in the emitted tree is still a defect.
const PII_ALLOWED_ADDRESSES = ["recruiting@otpless.com", "people@otpless.com", "onboarding@otpless.com"];
const PII_PATTERN = /[a-z0-9._%+-]+@(gmail\.com|otpless\.com)/gi;

// Mirrors evals/run.mjs's SECRET_PATTERNS (shape-based, not a value list) — a bare env-var NAME
// or a ${VAR}/$VAR placeholder is fine, only a credential-shaped literal is flagged.
const SECRET_PATTERNS = [
  { name: "Anthropic API key", re: /sk-ant-[A-Za-z0-9_-]{10,}/ },
  { name: "Slack bot token", re: /xoxb-[A-Za-z0-9-]{10,}/ },
  { name: "Notion internal integration token", re: /\b(?:ntn_|secret_)[A-Za-z0-9]{10,}/ },
  { name: "AWS access key ID", re: /\bAKIA[0-9A-Z]{16}\b/ },
  { name: "PEM private key block", re: /-----BEGIN [A-Z ]*PRIVATE KEY-----/ },
  { name: "RESEND_API_KEY assigned a literal value", re: /RESEND_API_KEY\s*=\s*(?!\$\{|\$[A-Za-z_])[^\s"'`]{6,}/ },
];

// Criterion for this allowlist (the part reviewers should re-check when it grows): every
// SKILL.md reference this script is told to make load-bearing (../config/X, packs/recruiting/
// config/X, platform/contracts/X) is rewritten by the three rules below and therefore never
// reaches this list carrying its original prefix. Anything that STILL starts with one of these
// top-level repo directories after rewriting is, by construction, a reference this build was
// never asked to bundle — a citation to a design doc, an ADR, a gate id's home, a sibling
// department's pack, or the deploy layer, meant for a human/reviewer reading the file, not a
// path the running agent opens. Only bare relative references (./ or ../) are treated as real
// navigational dependencies and checked against the emitted tree; everything else that doesn't
// match this list either is likewise not a real dependency (e.g. "recruit-config/playbook.md",
// a prose citation to the *source* YC repo's own layout) and is skipped, not flagged.
const ALLOWLISTED_CITATION_PREFIXES = ["docs/", "brain/", "platform/", "packs/", "evals/", "agents/", ".claude/"];

// The three reference rewrites this build is told to implement, applied to copied SKILL.md
// content only (never to config/contract files — see the phase report for why that scope is
// deliberately narrow, and what it leaves unresolved in evidence.md's two internal ../ refs).
const REWRITE_RULES = [
  { name: "../config/X -> ../recruit/config/X", re: /\.\.\/config\//g, to: "../recruit/config/" },
  { name: "platform/contracts/X -> ../recruit/contracts/X", re: /\bplatform\/contracts\//g, to: "../recruit/contracts/" },
  { name: "packs/recruiting/config/X -> ../recruit/config/X", re: /packs\/recruiting\/config\//g, to: "../recruit/config/" },
];

const REQUIRED_FRONTMATTER_FIELDS = ["name", "description"];

// ---------------------------------------------------------------------------
// Small filesystem helpers
// ---------------------------------------------------------------------------

function readText(absPath) {
  return fs.readFileSync(absPath, "utf8");
}

function listDirs(absPath) {
  if (!fs.existsSync(absPath)) return [];
  return fs
    .readdirSync(absPath, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name);
}

// Recursively collect every file under absDir, returned as paths relative to absDir (posix
// separators, so they compose cleanly with the rest of this script's path handling).
function walkAllFiles(absDir, relPrefix = "") {
  const out = [];
  for (const entry of fs.readdirSync(absDir, { withFileTypes: true })) {
    const abs = path.join(absDir, entry.name);
    const rel = relPrefix ? `${relPrefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) out.push(...walkAllFiles(abs, rel));
    else if (entry.isFile()) out.push(rel);
  }
  return out;
}

let gitIgnoreCache = new Map();
function isGitIgnored(relPath) {
  if (gitIgnoreCache.has(relPath)) return gitIgnoreCache.get(relPath);
  let ignored;
  try {
    execSync(`git check-ignore -q -- ${JSON.stringify(relPath)}`, { cwd: ROOT });
    ignored = true; // exit 0 => ignored
  } catch {
    ignored = false;
  }
  gitIgnoreCache.set(relPath, ignored);
  return ignored;
}

// ---------------------------------------------------------------------------
// Step 1 — collect skills (packs/<pack>/<skill>/SKILL.md) and apply rewrite rules
// ---------------------------------------------------------------------------

// emitted: Map<relPathUnderRepoRootStyle, content> where every key is rooted at "skills/..."
// (this is the tree qm publishes from, so paths are written exactly as they'll land on disk
// under the deployment directory's sandbox/ root).
const emitted = new Map();

const report = {
  packsRequested: SELECTED_PACKS,
  skillsEmitted: [], // { name, pack }
  collisions: [], // { name, packs: [a, b] }
  filesCopied: 0,
  rewrites: [], // { file, rule, count }
  failures: [], // { check, detail }
  allowedUnresolvable: [], // { file, ref }
  expectedMissingGitignored: [], // { file, ref, resolved, source }
  frontmatterErrors: [], // { file, error }
};

function fail(check, detail) {
  report.failures.push({ check, detail });
}

// skillOwners: name -> pack that first claimed it (first pack in SELECTED_PACKS order wins the
// emitted copy; every claimant, including the first, is recorded so collisions are visible).
const skillOwners = new Map();

for (const pack of SELECTED_PACKS) {
  const packDir = path.join(ROOT, "packs", pack);
  if (!fs.existsSync(packDir)) {
    fail("pack exists", `--packs named "${pack}" but packs/${pack}/ does not exist`);
    continue;
  }
  for (const skillName of listDirs(packDir)) {
    const skillMdAbs = path.join(packDir, skillName, "SKILL.md");
    if (!fs.existsSync(skillMdAbs)) continue; // not a skill dir (e.g. packs/<pack>/config)

    if (skillOwners.has(skillName)) {
      const firstPack = skillOwners.get(skillName);
      report.collisions.push({ name: skillName, packs: [firstPack, pack] });
      fail("skill-name collision", `"${skillName}" is defined by both packs/${firstPack} and packs/${pack}`);
      continue; // keep the first pack's copy; do not overwrite it with the colliding one
    }
    skillOwners.set(skillName, pack);

    let content = readText(skillMdAbs);
    for (const rule of REWRITE_RULES) {
      const matches = content.match(rule.re);
      if (matches && matches.length > 0) {
        report.rewrites.push({ file: `skills/${skillName}/SKILL.md`, rule: rule.name, count: matches.length });
        content = content.replace(rule.re, rule.to);
      }
    }

    emitted.set(`skills/${skillName}/SKILL.md`, content);
    report.skillsEmitted.push({ name: skillName, pack });
  }
}

// ---------------------------------------------------------------------------
// Step 2 — recruiting-specific config/contracts mapping (explicit, not generalized — see
// header comment on REWRITE_RULES; extending this pattern to another department's own router
// is future work for whoever adds that department, not invented here).
// ---------------------------------------------------------------------------

if (SELECTED_PACKS.includes("recruiting")) {
  const cfgSrcAbs = path.join(ROOT, "packs", "recruiting", "config");
  if (fs.existsSync(cfgSrcAbs)) {
    for (const rel of walkAllFiles(cfgSrcAbs)) {
      const content = readText(path.join(cfgSrcAbs, rel));
      emitted.set(`skills/recruit/config/${rel}`, content); // not rewritten — only SKILL.md is
      report.filesCopied++;
    }
  }

  const contractsSrcAbs = path.join(ROOT, "platform", "contracts");
  if (fs.existsSync(contractsSrcAbs)) {
    for (const entry of fs.readdirSync(contractsSrcAbs, { withFileTypes: true })) {
      if (!entry.isFile() || !entry.name.endsWith(".md")) continue; // platform/contracts/*.md, top-level only
      const content = readText(path.join(contractsSrcAbs, entry.name));
      emitted.set(`skills/recruit/contracts/${entry.name}`, content); // not rewritten
      report.filesCopied++;
    }
  }
}

// ---------------------------------------------------------------------------
// Verification 1 — every top-level entry under skills/ is a directory containing SKILL.md.
// (Guards the invariant this script is supposed to guarantee by construction — still asserted
// explicitly, since a future edit to the copy logic above could violate it silently otherwise.)
// ---------------------------------------------------------------------------

const topLevelSkillDirs = new Set();
for (const relPath of emitted.keys()) {
  const parts = relPath.split("/"); // e.g. ["skills", "recruit", "config", "notion.md"]
  if (parts[0] === "skills" && parts.length > 1) topLevelSkillDirs.add(parts[1]);
}
for (const dirName of topLevelSkillDirs) {
  const hasSkillMd = emitted.has(`skills/${dirName}/SKILL.md`);
  if (!hasSkillMd) {
    fail("skills/<name> must be a skill directory", `skills/${dirName}/ has no SKILL.md`);
  }
}

// ---------------------------------------------------------------------------
// Verification 2 — every SKILL.md has parseable frontmatter with name + description.
// ---------------------------------------------------------------------------

function parseFrontmatter(text) {
  if (!text.startsWith("---\n")) return { ok: false, error: "no leading --- frontmatter block" };
  const end = text.indexOf("\n---", 4);
  if (end === -1) return { ok: false, error: "frontmatter block never closes with ---" };
  const block = text.slice(4, end);
  const lines = block.split("\n");
  const fields = {};
  let currentKey = null;
  for (const line of lines) {
    const topLevel = /^([A-Za-z0-9_-]+):\s*(.*)$/.exec(line);
    if (topLevel && !/^\s/.test(line)) {
      currentKey = topLevel[1];
      fields[currentKey] = topLevel[2].trim();
    } else if (currentKey && /^\s/.test(line) && line.trim().length > 0) {
      // continuation line of a block scalar (e.g. "description: |") — any non-empty indented
      // content after the key counts as the value being present.
      fields[currentKey] = (fields[currentKey] ? fields[currentKey] + " " : "") + line.trim();
    }
  }
  const missing = REQUIRED_FRONTMATTER_FIELDS.filter((f) => !fields[f] || fields[f].replace(/^\|>?$/, "").trim() === "");
  if (missing.length > 0) return { ok: false, error: `missing required field(s): ${missing.join(", ")}` };
  return { ok: true, fields };
}

for (const [relPath, content] of emitted) {
  if (!relPath.endsWith("SKILL.md")) continue;
  const parsed = parseFrontmatter(content);
  if (!parsed.ok) {
    report.frontmatterErrors.push({ file: relPath, error: parsed.error });
    fail("SKILL.md frontmatter", `${relPath}: ${parsed.error}`);
  }
}

// ---------------------------------------------------------------------------
// Verification 3 — every relative path reference in every emitted file resolves.
// ---------------------------------------------------------------------------

function stripFences(text) {
  return text.replace(/^[ \t]*(```|~~~)[\s\S]*?^[ \t]*\1[ \t]*$/gm, "");
}

function looksLikePath(s) {
  if (!s.includes("/")) return false;
  if (s.includes("://")) return false;
  if (/[{<>$]/.test(s)) return false; // template placeholders — intentionally not a real path
  if (!/^[.\w/-]+$/.test(s)) return false;
  return true;
}

function extractCandidates(text) {
  const scannable = stripFences(text);
  const out = new Set();
  for (const m of scannable.matchAll(/\]\(([^)]+)\)/g)) out.add(m[1].trim());
  for (const m of scannable.matchAll(/`([^`]+)`/g)) out.add(m[1].trim());
  return [...out].filter(looksLikePath);
}

// True if relPath is a file in the emitted tree, or a directory prefix of one (so an
// extension-less skill reference like `../reply` passes as long as skills/reply/ has content).
function emittedHas(relPath) {
  if (emitted.has(relPath)) return true;
  const prefix = relPath.endsWith("/") ? relPath : relPath + "/";
  for (const key of emitted.keys()) {
    if (key.startsWith(prefix)) return true;
  }
  return false;
}

// Reverse-maps an emitted path back to the repo source path it was copied from, so an
// unresolved reference can be checked against .gitignore before being called broken (mirrors
// evals/run.mjs's exact exception for packs/recruiting/config/user.md — real per-deployment
// config, gitignored by design, checked in only as user.md.example).
function reverseMapToSource(emittedRelPath) {
  if (emittedRelPath.startsWith("skills/recruit/config/")) {
    return "packs/recruiting/config/" + emittedRelPath.slice("skills/recruit/config/".length);
  }
  if (emittedRelPath.startsWith("skills/recruit/contracts/")) {
    return "platform/contracts/" + emittedRelPath.slice("skills/recruit/contracts/".length);
  }
  return null;
}

let refsChecked = 0;
for (const [relPath, content] of emitted) {
  const fileDir = path.posix.dirname(relPath);
  for (const candidate of extractCandidates(content)) {
    const clean = candidate.split("#")[0];
    if (clean === "") continue;

    if (clean.startsWith("./") || clean.startsWith("../")) {
      // Real navigational reference — must resolve inside the emitted tree.
      refsChecked++;
      const resolved = path.posix.normalize(path.posix.join(fileDir, clean));
      if (emittedHas(resolved)) continue;

      const source = reverseMapToSource(resolved);
      if (source && isGitIgnored(source)) {
        report.expectedMissingGitignored.push({ file: relPath, ref: candidate, resolved, source });
        continue;
      }
      fail("dead reference", `${relPath} references "${candidate}" -> ${resolved} (not present in emitted tree)`);
      continue;
    }

    if (ALLOWLISTED_CITATION_PREFIXES.some((p) => clean.startsWith(p))) {
      refsChecked++;
      report.allowedUnresolvable.push({ file: relPath, ref: candidate });
      continue;
    }

    // Doesn't start with ./, ../, or a recognized top-level repo dir — not a repo-path shape
    // this build recognizes (e.g. a prose citation to the *source* YC repo's own layout, like
    // "recruit-config/playbook.md"). Not checked, not flagged — same convention evals/run.mjs
    // already uses (resolveCandidate returns null and the candidate is silently skipped).
  }
}

// ---------------------------------------------------------------------------
// Verification 4 — bundle byte size, mirroring qm's shape.
// ---------------------------------------------------------------------------

const bundleSkills = [...emitted.entries()]
  .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
  .map(([p, content]) => ({ path: p, content }));
const bundleShape = { contract: 1, tools: [], skills: bundleSkills };
const bundleJson = JSON.stringify(bundleShape);
const bundleBytes = Buffer.byteLength(bundleJson, "utf8");
if (bundleBytes >= BUNDLE_BYTE_CAP) {
  fail("bundle size", `${bundleBytes} bytes >= ${BUNDLE_BYTE_CAP} byte cap`);
}

// ---------------------------------------------------------------------------
// Verification 5 — skill-name collisions (already detected during Step 1; nothing further to
// do here beyond having populated report.collisions above).
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Verification 6 — no secrets, no email address other than the allowlisted agent mailboxes.
// ---------------------------------------------------------------------------

for (const [relPath, content] of emitted) {
  const emailMatches = content.match(PII_PATTERN) || [];
  const badEmails = emailMatches.filter((m) => !PII_ALLOWED_ADDRESSES.includes(m.toLowerCase()));
  if (badEmails.length > 0) {
    fail("PII guard", `${relPath} contains disallowed address(es): ${[...new Set(badEmails)].join(", ")}`);
  }
  for (const { name, re } of SECRET_PATTERNS) {
    const m = content.match(re);
    if (m) {
      fail("secret-shape guard", `${relPath} matches ${name}: "${m[0].slice(0, 24)}..."`);
    }
  }
}

// ---------------------------------------------------------------------------
// Materialize (only if verification passed and --out was given) or clean up.
// ---------------------------------------------------------------------------

const ok = report.failures.length === 0;

if (ok && OUT_DIR) {
  const outAbs = path.resolve(OUT_DIR);
  if (fs.existsSync(outAbs)) fs.rmSync(outAbs, { recursive: true, force: true });
  for (const [relPath, content] of emitted) {
    const abs = path.join(outAbs, relPath);
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, content, "utf8");
  }
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

function row(status, label, detail) {
  const mark = status ? "✅" : "❌";
  console.log(`${mark} ${label}${detail ? " — " + detail : ""}`);
}

console.log(`\n=== build-sandbox-layer: ${DRY_RUN ? "DRY RUN" : `writing to ${OUT_DIR}`} ===`);
console.log(`packs: ${SELECTED_PACKS.join(", ")}\n`);

console.log("-- skills emitted --");
for (const s of report.skillsEmitted) row(true, `skills/${s.name}/SKILL.md`, `from packs/${s.pack}`);
console.log(`(${report.skillsEmitted.length} skill(s))\n`);

if (report.collisions.length > 0) {
  console.log("-- skill-name collisions --");
  for (const c of report.collisions) row(false, `"${c.name}"`, `defined by both packs/${c.packs[0]} and packs/${c.packs[1]}`);
  console.log();
}

console.log("-- config/contracts files copied --");
row(true, `${report.filesCopied} file(s) copied under skills/recruit/config/** and skills/recruit/contracts/**`);
console.log();

console.log("-- reference rewrites applied --");
if (report.rewrites.length === 0) {
  row(true, "no rewrite rule fired (nothing to rewrite in this pack selection)");
} else {
  for (const r of report.rewrites) row(true, r.file, `${r.rule} (${r.count}x)`);
}
console.log();

console.log(`-- reference resolution (${refsChecked} reference(s) checked) --`);
if (report.allowedUnresolvable.length > 0) {
  console.log(`allowed-unresolvable (documentation citations, ${report.allowedUnresolvable.length}):`);
  for (const a of report.allowedUnresolvable) console.log(`   ℹ️  ${a.file} cites "${a.ref}"`);
}
if (report.expectedMissingGitignored.length > 0) {
  console.log(`expected-missing (gitignored, per-deployment, ${report.expectedMissingGitignored.length}):`);
  for (const g of report.expectedMissingGitignored) {
    console.log(`   ℹ️  ${g.file} references "${g.ref}" -> ${g.resolved} (source ${g.source} is gitignored)`);
  }
}
const deadRefs = report.failures.filter((f) => f.check === "dead reference");
if (deadRefs.length === 0) {
  row(true, "no dead references");
} else {
  for (const d of deadRefs) row(false, d.check, d.detail);
}
console.log();

console.log("-- frontmatter --");
if (report.frontmatterErrors.length === 0) {
  row(true, `all ${[...emitted.keys()].filter((k) => k.endsWith("SKILL.md")).length} SKILL.md file(s) have parseable name + description`);
} else {
  for (const e of report.frontmatterErrors) row(false, e.file, e.error);
}
console.log();

console.log("-- bundle size --");
row(
  bundleBytes < BUNDLE_BYTE_CAP,
  `${bundleBytes.toLocaleString()} / ${BUNDLE_BYTE_CAP.toLocaleString()} bytes`,
  `headroom: ${(BUNDLE_BYTE_CAP - bundleBytes).toLocaleString()} bytes (${(100 * (1 - bundleBytes / BUNDLE_BYTE_CAP)).toFixed(1)}%)`
);
console.log();

const otherFailures = report.failures.filter((f) => f.check !== "dead reference" && f.check !== "skill-name collision");
if (otherFailures.length > 0) {
  console.log("-- other failures --");
  for (const f of otherFailures) row(false, f.check, f.detail);
  console.log();
}

console.log("=== SUMMARY ===");
console.log(`Skills emitted: ${report.skillsEmitted.length}`);
console.log(`Files copied (config/contracts): ${report.filesCopied}`);
console.log(`Rewrites applied: ${report.rewrites.reduce((n, r) => n + r.count, 0)} occurrence(s) across ${report.rewrites.length} file/rule pair(s)`);
console.log(`Bundle bytes: ${bundleBytes.toLocaleString()} / ${BUNDLE_BYTE_CAP.toLocaleString()} (headroom ${(BUNDLE_BYTE_CAP - bundleBytes).toLocaleString()})`);
console.log(`Total failures: ${report.failures.length}`);

if (!ok) {
  console.log(`\n❌ VERIFICATION FAILED — ${DRY_RUN ? "no output written (dry run)" : `refusing to write ${OUT_DIR}`}\n`);
  process.exit(1);
} else {
  console.log(`\n✅ VERIFICATION PASSED${DRY_RUN ? " (dry run — nothing written)" : ` — written to ${OUT_DIR}`}\n`);
  process.exit(0);
}
