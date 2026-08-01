#!/usr/bin/env node
// Purpose: zero-dependency eval harness — STRUCTURE, SKILL SHAPE, LINT, NEVER-DELEGATED
// COVERAGE, GATE HYGIENE, SECRET-SHAPE GUARD, CROSS-REFERENCE, RATING FIXTURES, PROMOTION
// GATE, and EVIDENCE ROLLUP PII GUARD checks; exits non-zero on any failure.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

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
  "candidate-status",
];

const SHARED_SKILLS = ["identity", "standup", "retro", "trust-ladder", "metrics"];

const RECRUITING_CONFIG_FILES = [
  "packs/recruiting/config/playbook.md",
  "packs/recruiting/config/user.md.example",
  "packs/recruiting/config/notion.md",
  "packs/recruiting/config/agent.md",
  "packs/recruiting/config/goals.md",
];

const SHARED_CONFIG_FILES = ["packs/shared/config/goals.md.example", "packs/shared/config/evidence.md.example"];

const PLATFORM_EVIDENCE_FILES = ["platform/evidence/README.md", "platform/evidence/_rollup-template.md"];

// Added only if present on disk when the harness loads (another builder may still be writing
// it) — never created by this check, and never required if genuinely absent. Because
// `exists()` re-checks the filesystem every run, once added this becomes a real regression
// guard: if the file is later deleted, this row starts failing.
const CONDITIONAL_DOC_FILES = [];
if (fs.existsSync(path.join(ROOT, "docs/OPERATING_RECRUITER.md"))) {
  CONDITIONAL_DOC_FILES.push("docs/OPERATING_RECRUITER.md");
}

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

const CONTRACT_FILES = [
  "platform/contracts/README.md",
  "platform/contracts/notion.md",
  "platform/contracts/gmail.md",
  "platform/contracts/calendar.md",
  "platform/contracts/slack.md",
  "platform/contracts/_template.md",
];

const DEPLOY_LAYER_FILES = [
  "platform/deploy-layer/otpless/crons.md",
  "platform/deploy-layer/otpless/scopes/_template.md",
  "platform/deploy-layer/otpless/scopes/recruiter.md",
];

const PLATFORM_SCRIPTS = ["platform/scripts/bootstrap-qm.sh", "platform/scripts/verify-deployment.md"];

const BANNED_PHRASES = ["perfect fit", "ideal candidate", "rockstar", "ninja ", "guru"];

// Criterion for the draft-first + AI-disclosure lint below: any recruiting skill whose
// process can put text in front of a candidate (email, WhatsApp text, or a candidate-visible
// calendar invite) must gate on BOTH an explicit human draft-review step and the AI-disclosure
// line — CLAUDE.md's draft-first guardrail and disclosure guardrail, together, every time.
// This is a named, explicit list (not "every recruiting skill") because triage/pipeline/
// recruit-watch/review-applicants/recruit/candidate-status only read and report — they never
// themselves originate candidate-facing text.
const CANDIDATE_FACING_SKILLS = ["outreach", "reply", "reject", "schedule"];

// The six hard-denied action classes from CLAUDE.md's guardrails (mirrored in
// command-policy.md §4). Named as a constant so this check fails loudly if a future edit to
// command-policy.md silently drops one of the six, rather than only noticing in a security
// review.
const NEVER_DELEGATED_CLASSES = [
  "offers",
  "compensation",
  "terminations",
  "performance judgments",
  "post-interview rejections",
  "policy changes",
];
const COMMAND_POLICY_PATH = "platform/deploy-layer/otpless/command-policy.md";

const REQUIRED_SKILL_SECTIONS = ["trigger", "inputs", "process", "output contract", "failure behavior"];

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

console.log(`\n-- recruiting skills (${RECRUITING_SKILLS.length}) --`);
for (const s of RECRUITING_SKILLS) {
  row(exists(`packs/recruiting/${s}/SKILL.md`), `packs/recruiting/${s}/SKILL.md`);
}

console.log("\n-- recruiting config files --");
for (const p of RECRUITING_CONFIG_FILES) {
  row(exists(p), p);
}

console.log("\n-- shared config files --");
for (const p of SHARED_CONFIG_FILES) {
  row(exists(p), p);
}

console.log("\n-- platform evidence --");
for (const p of PLATFORM_EVIDENCE_FILES) {
  row(exists(p), p);
}

if (CONDITIONAL_DOC_FILES.length > 0) {
  console.log("\n-- conditional docs (present on disk at harness-load time) --");
  for (const p of CONDITIONAL_DOC_FILES) {
    row(exists(p), p);
  }
}

console.log("\n-- job playbooks (template + 7 roles) --");
for (const j of JOB_PLAYBOOKS) {
  row(exists(`packs/recruiting/config/${j}`), `packs/recruiting/config/${j}`);
}

console.log("\n-- integration contracts --");
for (const p of CONTRACT_FILES) {
  row(exists(p), p);
}

console.log("\n-- deploy layer --");
for (const p of DEPLOY_LAYER_FILES) {
  row(exists(p), p);
}
row(exists(COMMAND_POLICY_PATH), COMMAND_POLICY_PATH);

console.log("\n-- platform scripts --");
for (const p of PLATFORM_SCRIPTS) {
  row(exists(p), p);
}

console.log("\n-- brain + gate ledger + eval fixtures --");
row(exists("brain/README.md"), "brain/README.md");
row(exists("docs/gates.md"), "docs/gates.md");
row(exists("evals/fixtures/applicants.json"), "evals/fixtures/applicants.json");

// ---------------------------------------------------------------------------
console.log("\n=== 2. SKILL SHAPE (packs/**/SKILL.md) ===\n");

// General check over a glob, not a hardcoded list, so future skills are covered
// automatically: every packs/**/SKILL.md must contain all five required sections as a
// heading (any # level), matched case-insensitively on the heading text.
const skillFiles = walkMarkdown("packs").filter((p) => p.endsWith("SKILL.md"));
row(skillFiles.length > 0, `found ${skillFiles.length} SKILL.md file(s) under packs/`);
for (const rel of skillFiles) {
  const text = readFile(rel);
  const headings = [...text.matchAll(/^#{1,6}\s+(.+)$/gm)].map((m) => m[1].trim().toLowerCase());
  const missing = REQUIRED_SKILL_SECTIONS.filter((section) => !headings.some((h) => h.startsWith(section)));
  row(missing.length === 0, rel, missing.length ? `missing section(s): ${missing.join(", ")}` : undefined);
}

// ---------------------------------------------------------------------------
console.log("\n=== 3. LINT (packs/**/*.md) ===\n");

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

console.log(
  "\n-- draft-first + AI-disclosure coverage: 'disclosure' AND 'draft' in every candidate-facing recruiting skill --"
);
for (const name of CANDIDATE_FACING_SKILLS) {
  const rel = `packs/recruiting/${name}/SKILL.md`;
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
console.log("\n=== 4. NEVER-DELEGATED COVERAGE ===\n");

if (!exists(COMMAND_POLICY_PATH)) {
  row(false, COMMAND_POLICY_PATH, "file does not exist — cannot verify never-delegated coverage");
} else {
  const text = readFile(COMMAND_POLICY_PATH).toLowerCase();
  for (const cls of NEVER_DELEGATED_CLASSES) {
    row(text.includes(cls), `command-policy.md §4 mentions "${cls}"`);
  }
}

// ---------------------------------------------------------------------------
console.log("\n=== 5. GATE HYGIENE ===\n");

// Heuristic (kept deliberately simple, explained here rather than buried in code):
// A "TODO(gate)" marker counts only when written as `TODO(gate):` (colon-suffixed) AND the
// text right after the colon is not a template placeholder ("{...}" or "<...>", the form
// used by _template.md files and by role-definition docs in agents/ that describe the
// convention itself rather than opening a real gate). For every marker that survives that
// filter, we require docs/gates.md to contain at least one alphabetic word (>=4 chars,
// minus a short stopword list) drawn from the marker's own text — a cheap proxy for "this
// marker's topic is tracked in the ledger" that doesn't require wiring an exact gate ID to
// every TODO(gate) site.
const GATE_HYGIENE_EXCLUDE_DIRS = ["evals", "docs/plans"];
const GATE_STOPWORDS = new Set([
  "gate", "gates", "todo", "agent", "agents", "that", "this", "with", "from", "into",
  "who", "what", "per", "own", "not", "once", "before", "after", "only", "also", "goes",
  "every", "some", "were", "been", "will", "must", "when", "then", "than", "have", "has",
  "role", "roles", "path", "goes",
]);

function isExcludedFromGateHygiene(relPath) {
  return GATE_HYGIENE_EXCLUDE_DIRS.some((d) => relPath === d || relPath.startsWith(d + "/"));
}

function trackedFiles() {
  const out = execSync("git ls-files", { cwd: ROOT, encoding: "utf8" });
  return out.split("\n").filter(Boolean);
}

const TRACKED = trackedFiles();

const gatesMdPath = "docs/gates.md";
let gatesMdText = "";
if (!exists(gatesMdPath)) {
  row(false, gatesMdPath, "docs/gates.md missing — cannot check gate hygiene");
} else {
  gatesMdText = readFile(gatesMdPath);
}

row(gatesMdText.trim().length > 0, "docs/gates.md is non-empty");
const gateHeaderRow = gatesMdText.split("\n").find((l) => l.includes("|") && /owner/i.test(l));
row(
  Boolean(gateHeaderRow),
  "docs/gates.md has a table header row containing an 'Owner' column",
  gateHeaderRow ? gateHeaderRow.trim() : "no matching header row found"
);

let gateMarkerCount = 0;
let gateMismatches = 0;
for (const rel of TRACKED) {
  if (isExcludedFromGateHygiene(rel)) continue;
  const abs = path.join(ROOT, rel);
  let text;
  try {
    text = fs.readFileSync(abs, "utf8");
  } catch {
    continue; // binary or unreadable — skip
  }
  const re = /TODO\(gate\):\s*(.*)/g;
  let m;
  while ((m = re.exec(text))) {
    const rest = m[1].trim();
    if (rest.startsWith("{") || rest.startsWith("<")) continue; // template placeholder
    gateMarkerCount++;
    const words = (rest.match(/[A-Za-z]+/g) || [])
      .map((w) => w.toLowerCase())
      .filter((w) => w.length >= 4 && !GATE_STOPWORDS.has(w));
    const found = words.some((w) => new RegExp(`\\b${w}\\b`, "i").test(gatesMdText));
    if (!found) {
      gateMismatches++;
      row(false, `${rel}: TODO(gate) marker has no matching topic in docs/gates.md`, rest.slice(0, 90));
    }
  }
}
if (gateMismatches === 0) {
  row(true, `${gateMarkerCount} TODO(gate) marker(s) checked — every one has a matching topic in docs/gates.md`);
}

// ---------------------------------------------------------------------------
console.log("\n=== 6. SECRET-SHAPE GUARD (tracked files) ===\n");

// Patterns are shape-based (what a real secret *looks like*), not value lists. A bare
// env-var NAME (e.g. `NOTION_TOKEN`) or a `${VAR}`/`$VAR` placeholder is fine — only a
// credential-shaped literal is flagged. The RESEND_API_KEY rule specifically excludes an
// assignment whose value is itself a `${...}`/`$VAR` reference, so `.mcp.json`-style
// placeholders never trip it.
const SECRET_PATTERNS = [
  { name: "Anthropic API key", re: /sk-ant-[A-Za-z0-9_-]{10,}/ },
  { name: "Slack bot token", re: /xoxb-[A-Za-z0-9-]{10,}/ },
  { name: "Notion internal integration token", re: /\b(?:ntn_|secret_)[A-Za-z0-9]{10,}/ },
  { name: "AWS access key ID", re: /\bAKIA[0-9A-Z]{16}\b/ },
  { name: "PEM private key block", re: /-----BEGIN [A-Z ]*PRIVATE KEY-----/ },
  {
    name: "RESEND_API_KEY assigned a literal value",
    re: /RESEND_API_KEY\s*=\s*(?!\$\{|\$[A-Za-z_])[^\s"'`]{6,}/,
  },
];

let secretHits = 0;
let secretFilesScanned = 0;
for (const rel of TRACKED) {
  const abs = path.join(ROOT, rel);
  let stat;
  try {
    stat = fs.statSync(abs);
  } catch {
    continue;
  }
  if (!stat.isFile() || stat.size > 2_000_000) continue;
  let text;
  try {
    text = fs.readFileSync(abs, "utf8");
  } catch {
    continue; // binary — skip
  }
  secretFilesScanned++;
  for (const { name, re } of SECRET_PATTERNS) {
    const m = text.match(re);
    if (m) {
      row(false, `${rel} matches credential-shaped pattern`, `${name}: "${m[0].slice(0, 24)}…"`);
      secretHits++;
    }
  }
}
if (secretHits === 0) row(true, `no credential-shaped strings found across ${secretFilesScanned} tracked files`);

// Editor/backup droppings must never be committed. A stray `.bak` beside a canonical file
// is worse than clutter here: platform/evidence/ is built on "generated, never hand-edited,
// one file per window," and a duplicate invites someone to edit the wrong one. Caught live
// once (a `git add <dir>` swept one in), hence the check.
console.log("\n-- no backup/editor artifacts tracked in git --");
const ARTIFACT_RE = /(\.bak|\.orig|\.rej|~)$/;
const artifacts = TRACKED.filter((rel) => ARTIFACT_RE.test(rel));
for (const rel of artifacts) row(false, `${rel} is a backup/editor artifact committed to git`, "git rm --cached it");
if (artifacts.length === 0) row(true, `no backup/editor artifacts among ${TRACKED.length} tracked files`);

// ---------------------------------------------------------------------------
console.log("\n=== 7. CROSS-REFERENCE CHECK (packs/** + platform/** markdown) ===\n");

// Looks for two path-like shapes: markdown links `[text](path)` and backtick-quoted
// paths like `../reply`, `packs/x/y.md`, `./notion.md`. A candidate only counts as "a
// repo path" if it contains a "/", uses only safe path characters, isn't a URL/mailto,
// and carries no template placeholder ({...}, <...>, $VAR — those are intentionally
// unresolved in _template.md-style files). A relative path (./ or ../) resolves against
// the containing file's directory; a path rooted at a known top-level dir (packs/,
// platform/, docs/, evals/, brain/, agents/, .claude/) resolves from repo root.
// fs.existsSync covers files and directories alike, so an extension-less skill reference
// like `../reply` passes as long as that directory exists. Known limitation (documented,
// not silently swallowed): a same-directory bare filename like `crons.md` has no "/" and
// is skipped — this check only catches path-shaped references, not every prose mention.
//
// One deliberate exception: a resolved path that doesn't exist but is `git check-ignore`d
// (e.g. `packs/recruiting/config/user.md` — real per-deployment config, gitignored by
// design, template checked in as `user.md.example`) is not a broken reference, so it's not
// flagged. A typo'd path is not gitignored and still fails normally.
function isGitIgnored(relPath) {
  try {
    execSync(`git check-ignore -q -- ${JSON.stringify(relPath)}`, { cwd: ROOT });
    return true; // exit 0 => ignored
  } catch {
    return false;
  }
}

function looksLikePath(s) {
  if (!s.includes("/")) return false;
  if (s.includes("://")) return false;
  if (/[{<>$]/.test(s)) return false;
  if (!/^[.\w/-]+$/.test(s)) return false;
  return true;
}

const TOP_DIRS = ["packs/", "platform/", "docs/", "evals/", "brain/", "agents/", ".claude/"];

function resolveCandidate(candidate, fileDir) {
  const clean = candidate.split("#")[0];
  if (clean.startsWith("./") || clean.startsWith("../")) {
    return path.normalize(path.join(fileDir, clean));
  }
  if (TOP_DIRS.some((d) => clean.startsWith(d))) return clean;
  return null;
}

const crossRefFiles = [...walkMarkdown("packs"), ...walkMarkdown("platform")];
let crossRefChecked = 0;
let crossRefMissing = 0;
for (const rel of crossRefFiles) {
  const text = readFile(rel);
  const fileDir = path.dirname(rel);
  const candidates = new Set();
  for (const m of text.matchAll(/\]\(([^)]+)\)/g)) candidates.add(m[1].trim());
  for (const m of text.matchAll(/`([^`]+)`/g)) candidates.add(m[1].trim());
  for (const c of candidates) {
    if (!looksLikePath(c)) continue;
    const resolved = resolveCandidate(c, fileDir);
    if (!resolved) continue;
    crossRefChecked++;
    if (!exists(resolved) && !isGitIgnored(resolved)) {
      crossRefMissing++;
      row(false, `${rel} references a missing path`, `"${c}" -> ${resolved}`);
    }
  }
}
if (crossRefMissing === 0) {
  row(true, `${crossRefChecked} repo-path reference(s) resolved across ${crossRefFiles.length} files`);
}

// ---------------------------------------------------------------------------
console.log("\n=== 8. RATING FIXTURES ===\n");

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
console.log("\n=== 9. PROMOTION GATE (evals/fixtures/promotions.json) ===\n");

// Implements the arithmetic from platform/evidence/README.md + ADR-008 exactly once, driven
// entirely by fixtures — this is the sole place in the repo that codes the promotion math.
// Order matters: sample floor is checked before rate (a small sample is "insufficient
// evidence", never a rate claim, per ADR-008 and trust-ladder.md), then rate, then window,
// then the level-specific extra precondition (channel capability for L1 / incidents for L2).
const PROMOTION_SAMPLE_FLOOR = 20;
const PROMOTION_RATE_FLOOR = 0.95; // inclusive: rate === 0.95 must pass — `>=`, never `>`.
const PROMOTION_WINDOW_FLOOR = { L1: 14, L2: 28 };

function evaluatePromotion(f) {
  const total = f.sent_unedited + f.sent_light_edit + f.sent_rewrite + f.discarded;
  if (total < PROMOTION_SAMPLE_FLOOR) return "insufficient_evidence";
  const rate = f.sent_unedited / total;
  if (rate < PROMOTION_RATE_FLOOR) return "denied_rate";
  if (f.window_days < PROMOTION_WINDOW_FLOOR[f.level]) return "denied_window";
  if (f.level === "L1" && !f.capability_verified) return "denied_capability";
  if (f.level === "L2" && (f.incidents || 0) > 0) return "denied_incident";
  return "granted";
}

const promotionsPath = "evals/fixtures/promotions.json";
if (!exists(promotionsPath)) {
  row(false, promotionsPath, "fixtures file missing — cannot run promotion-gate checks");
} else {
  const promoFixtures = JSON.parse(readFile(promotionsPath));
  for (const f of promoFixtures) {
    const got = evaluatePromotion(f);
    const ok = got === f.expected;
    row(ok, `${f.id} (${f.agent}/${f.action_class}, ${f.level})`, `expected=${f.expected} got=${got}`);
  }
}

// ---------------------------------------------------------------------------
console.log("\n=== 10. EVIDENCE ROLLUP PII GUARD (platform/evidence/**) ===\n");

// ADR-008: the rollup is counts-only, by construction, not by redaction. This check enforces
// that structurally (only schema-listed field/column names may appear) and by value-shape
// (no email, phone, or Notion-page-id-shaped string anywhere under the directory). The
// agent-scope name (e.g. "recruiting") is a permitted value of the `agent` field — it
// identifies an agent, not a person — so it is intentionally not flagged by any rule here.
function walkAll(dir) {
  const out = [];
  const abs = path.join(ROOT, dir);
  if (!fs.existsSync(abs)) return out;
  for (const entry of fs.readdirSync(abs, { withFileTypes: true })) {
    const rel = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkAll(rel));
    else if (entry.isFile()) out.push(rel);
  }
  return out;
}

// Union of the two schema tables in platform/evidence/README.md (header fields + per-action-
// class columns) — the only field/column names allowed to appear as a backtick-quoted first
// table cell anywhere in this directory.
const EVIDENCE_HEADER_FIELDS_ALLOWED = new Set([
  "agent", "window_start", "window_end", "window_days", "generated_at", "generated_by",
  "source", "known_gaps",
]);
const EVIDENCE_TABLE_COLUMNS_ALLOWED = new Set([
  "action_class", "sent_unedited", "sent_light_edit", "sent_rewrite", "discarded", "total",
  "evidence_status", "acceptance_rate", "current_level", "incidents_in_window",
]);
const EVIDENCE_ALL_FIELDS_ALLOWED = new Set([
  ...EVIDENCE_HEADER_FIELDS_ALLOWED,
  ...EVIDENCE_TABLE_COLUMNS_ALLOWED,
]);

const EVIDENCE_EMAIL_RE = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i;
// Three digit-groups of 3-4 digits each, each optionally separated by a single dash/dot/
// space, optionally preceded by a country code — shaped like a phone number. Deliberately
// does NOT match a YYYY-MM-DD date (whose non-first groups are 2 digits) or an HH:MM:SS
// timestamp fragment (also 2-digit groups), since both fail the \d{3,4} minimum.
const EVIDENCE_PHONE_RE = /(?:\+?\d{1,3}[-.\s]?)?\d{3,4}[-.\s]?\d{3,4}[-.\s]?\d{3,4}\b/;
const EVIDENCE_UUID_RE = /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/i;
const EVIDENCE_HEX32_RE = /\b[0-9a-f]{32}\b/i;

const evidenceFiles = walkAll("platform/evidence");
row(evidenceFiles.length > 0, `found ${evidenceFiles.length} file(s) under platform/evidence/`);

let evidencePiiHits = 0;
for (const rel of evidenceFiles) {
  const text = readFile(rel);

  const emailHit = text.match(EVIDENCE_EMAIL_RE);
  if (emailHit) {
    row(false, `${rel} contains an email-shaped value`, emailHit[0]);
    evidencePiiHits++;
  }
  const phoneHit = text.match(EVIDENCE_PHONE_RE);
  if (phoneHit) {
    row(false, `${rel} contains a phone-number-shaped value`, phoneHit[0]);
    evidencePiiHits++;
  }
  const uuidHit = text.match(EVIDENCE_UUID_RE) || text.match(EVIDENCE_HEX32_RE);
  if (uuidHit) {
    row(false, `${rel} contains a Notion-page-id-shaped value`, uuidHit[0]);
    evidencePiiHits++;
  }

  // Backtick-quoted field name opening a table row (both the Header field/value tables and
  // the descriptive per-column tables use this shape) — must be a schema-known name.
  for (const m of text.matchAll(/^\|\s*`([a-z_]+)`\s*\|/gm)) {
    const field = m[1];
    if (!EVIDENCE_ALL_FIELDS_ALLOWED.has(field)) {
      row(false, `${rel} has an undocumented header field`, field);
      evidencePiiHits++;
    }
  }

  // The actual (non-backtick) per-action-class table header row in a generated/template
  // rollup — identified by its first cell literally being "action_class" — must contain only
  // schema-listed columns, nothing added.
  for (const line of text.split("\n")) {
    const cells = line.split("|").map((c) => c.trim()).filter(Boolean);
    if (cells.length === 0 || cells[0].toLowerCase() !== "action_class") continue;
    const extra = cells.filter((c) => !EVIDENCE_TABLE_COLUMNS_ALLOWED.has(c.toLowerCase()));
    if (extra.length > 0) {
      row(false, `${rel} action-class table has undocumented column(s)`, extra.join(", "));
      evidencePiiHits++;
    }
  }
}
if (evidencePiiHits === 0) {
  row(
    true,
    `no PII-shaped values or undocumented fields found across ${evidenceFiles.length} file(s) under platform/evidence/`
  );
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
