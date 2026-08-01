#!/usr/bin/env node
// Purpose: zero-dependency eval harness — STRUCTURE, LINT, and RATING FIXTURES checks; exits non-zero on any failure.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const RECRUITING_SKILLS = [
  "recruit",
  "triage",
  "review-applicants",
  "outreach",
  "reply",
  "reject",
  "schedule",
  "pipeline",
  "recruit-watch",
];

const SHARED_SKILLS = ["identity", "standup", "retro", "trust-ladder"];

const RECRUITING_CONFIG_FILES = [
  "packs/recruiting/config/playbook.md",
  "packs/recruiting/config/user.md.example",
  "packs/recruiting/config/notion.md",
];

const JOB_PLAYBOOKS = [
  "jobs/_template.md",
  "jobs/founding-recruiter.md",
  "jobs/android-sdk.md",
  "jobs/ios-sdk.md",
  "jobs/backend.md",
  "jobs/security.md",
  "jobs/ml.md",
  "jobs/ai-automation.md",
];

const BANNED_PHRASES = ["perfect fit", "ideal candidate", "rockstar", "ninja ", "guru"];
const GUARDRAIL_FILES = ["packs/recruiting/outreach/SKILL.md", "packs/recruiting/reject/SKILL.md"];
const PII_ALLOWED_ADDRESS = "recruiting@otpless.com";
const PII_PATTERN = /[a-z0-9._%+-]+@(gmail\.com|otpless\.com)/gi;

let failures = 0;

function exists(relPath) {
  return fs.existsSync(path.join(ROOT, relPath));
}

function readFile(relPath) {
  return fs.readFileSync(path.join(ROOT, relPath), "utf8");
}

function walkMarkdown(dir) {
  const out = [];
  const abs = path.join(ROOT, dir);
  if (!fs.existsSync(abs)) return out;
  for (const entry of fs.readdirSync(abs, { withFileTypes: true })) {
    const rel = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walkMarkdown(rel));
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      out.push(rel);
    }
  }
  return out;
}

function row(status, label, detail) {
  const mark = status ? "✅" : "❌";
  if (!status) failures++;
  console.log(`${mark} ${label}${detail ? " — " + detail : ""}`);
}

// ---------------------------------------------------------------------------
console.log("\n=== 1. STRUCTURE ===\n");

console.log("-- shared skills (4) --");
for (const s of SHARED_SKILLS) {
  row(exists(`packs/shared/${s}/SKILL.md`), `packs/shared/${s}/SKILL.md`);
}

console.log("\n-- recruiting skills (9) --");
for (const s of RECRUITING_SKILLS) {
  row(exists(`packs/recruiting/${s}/SKILL.md`), `packs/recruiting/${s}/SKILL.md`);
}

console.log("\n-- recruiting config files --");
for (const p of RECRUITING_CONFIG_FILES) {
  row(exists(p), p);
}

console.log("\n-- job playbooks (template + 7 roles) --");
for (const j of JOB_PLAYBOOKS) {
  row(exists(`packs/recruiting/config/${j}`), `packs/recruiting/config/${j}`);
}

console.log("\n-- brain + eval fixtures --");
row(exists("brain/README.md"), "brain/README.md");
row(exists("evals/fixtures/applicants.json"), "evals/fixtures/applicants.json");

// ---------------------------------------------------------------------------
console.log("\n=== 2. LINT (packs/**/*.md) ===\n");

const allPackMd = walkMarkdown("packs");

console.log(`-- banned phrases: ${BANNED_PHRASES.join(", ")} --`);
let phraseHits = 0;
for (const rel of allPackMd) {
  const text = readFile(rel).toLowerCase();
  for (const phrase of BANNED_PHRASES) {
    if (text.includes(phrase)) {
      row(false, `${rel} contains banned phrase`, `"${phrase}"`);
      phraseHits++;
    }
  }
}
if (phraseHits === 0) row(true, `no banned phrases found across ${allPackMd.length} files`);

console.log("\n-- guardrail presence: 'disclosure' AND 'draft' in outreach + reject SKILL.md --");
for (const rel of GUARDRAIL_FILES) {
  if (!exists(rel)) {
    row(false, rel, "file does not exist");
    continue;
  }
  const text = readFile(rel).toLowerCase();
  const hasDisclosure = text.includes("disclosure");
  const hasDraft = text.includes("draft");
  row(hasDisclosure && hasDraft, rel, `disclosure=${hasDisclosure} draft=${hasDraft}`);
}

console.log(`\n-- PII guard: no @gmail.com / @otpless.com other than ${PII_ALLOWED_ADDRESS} --`);
let piiHits = 0;
for (const rel of allPackMd) {
  const text = readFile(rel);
  const matches = text.match(PII_PATTERN) || [];
  const bad = matches.filter((m) => m.toLowerCase() !== PII_ALLOWED_ADDRESS);
  if (bad.length > 0) {
    row(false, `${rel} contains disallowed address(es)`, [...new Set(bad)].join(", "));
    piiHits++;
  }
}
if (piiHits === 0) row(true, `no disallowed addresses found across ${allPackMd.length} files`);

// ---------------------------------------------------------------------------
console.log("\n=== 3. RATING FIXTURES ===\n");

function applyRules(a) {
  if (a.hasArtifactLink && a.artifactSubstantive) return "advance";
  if (a.fraudDepth === "strong") return "advance";
  if (!a.hasArtifactLink && !a.fraudDepth) return "reject";
  if (a.mlNotebooksOnly) return "reject";
  if (a.sdkRoleAppOnly && !a.exceptionalSlope) return "reject";
  return "dig";
}

const fixturesPath = "evals/fixtures/applicants.json";
if (!exists(fixturesPath)) {
  row(false, fixturesPath, "fixtures file missing — cannot run rating checks");
} else {
  const fixtures = JSON.parse(readFile(fixturesPath));
  for (const f of fixtures) {
    const got = applyRules(f);
    const ok = got === f.expected;
    row(ok, `${f.id} (${f.name})`, `expected=${f.expected} got=${got}`);
  }
}

// ---------------------------------------------------------------------------
console.log("\n=== SUMMARY ===\n");
console.log(`Total failures: ${failures}`);

if (failures > 0) {
  console.log("\n❌ EVAL FAILED\n");
  process.exit(1);
} else {
  console.log("\n✅ EVAL PASSED\n");
  process.exit(0);
}
