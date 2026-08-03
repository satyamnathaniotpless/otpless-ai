#!/usr/bin/env node
// Purpose: read the rule tables authored in platform/deploy-layer/otpless/command-policy.md
// and emit the approvals[] array each named tool's sandbox/tools/<id>/tool.json should carry,
// so the policy file has a real runtime counterpart and cannot silently drift from it.
//
// Usage:
//   node platform/scripts/build-tool-policy.mjs                # dry run: verify + report, write nothing
//   node platform/scripts/build-tool-policy.mjs --out <dir>    # also write <dir>/<tool-id>.approvals.json
//
// Zero dependencies. Node >=22 compatible. Never modifies command-policy.md — this script
// compiles that file; the source table is not this script's to change.
//
// What this validates (everything qm itself validates on a tool descriptor, per
// docs/ADRS.md ADR-010, so a bad rule fails here rather than at deploy time):
//   - a rule's `command` XOR `pattern` (enforced by construction here: each rule row carries
//     exactly one match_type, so there is nothing to check for "both present" — the check that
//     matters is that match_type is one of the two legal values and match_value is non-empty)
//   - pattern length <= 256 chars
//   - decision is exactly "require_approval" or "deny" (no other value validates against qm)
//   - tool ids match qm's shape: ^[a-z0-9][a-z0-9-]{0,63}$
// Plus one OTPLESS-specific check with real teeth: every one of the six never-delegated
// classes must exist as a `deny` rule somewhere in the compiled output. A phrase in a document
// is not enforcement; a deny rule is closer to it.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const COMMAND_POLICY_PATH = path.join(ROOT, "platform/deploy-layer/otpless/command-policy.md");

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function parseArgs(argv) {
  let out = null;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--out") out = argv[++i];
    else if (a.startsWith("--out=")) out = a.slice("--out=".length);
    else {
      console.error(`Unrecognized argument: ${a}`);
      process.exit(2);
    }
  }
  return { out };
}

const { out: OUT_DIR } = parseArgs(process.argv.slice(2));
const DRY_RUN = !OUT_DIR;

// ---------------------------------------------------------------------------
// Constants (verified facts, ADR-010 — not re-derived, do not extend on assumption)
// ---------------------------------------------------------------------------

const TOOL_ID_RE = /^[a-z0-9][a-z0-9-]{0,63}$/;
const LEGAL_DECISIONS = new Set(["require_approval", "deny"]);
const LEGAL_MATCH_TYPES = new Set(["command", "pattern"]);
const PATTERN_MAX_LEN = 256;

// Mirrors evals/run.mjs's NEVER_DELEGATED_CLASSES (kept in sync by hand, not imported, so this
// script stays independently runnable with zero dependencies — same convention as
// build-sandbox-layer.mjs's PII_ALLOWED_ADDRESSES mirror). The six hard-denied action classes
// from CLAUDE.md's guardrails / ADR-004, restated as ADR-010's deny rules in
// command-policy.md §4. This is the check with real teeth: fail loudly, not quietly, if any
// of the six is missing or is not `deny`.
const NEVER_DELEGATED_CLASSES = [
  "offers",
  "compensation",
  "terminations",
  "performance judgments",
  "post-interview rejections",
  "policy changes",
];

// ---------------------------------------------------------------------------
// Table extraction
// ---------------------------------------------------------------------------
// A rule/tool table is bracketed by:
//   <!-- policy-table: id=<name> kind=<rule|tools> columns=a,b,c -->
//   | header | ... |
//   |---|---|
//   | data | ... |
//   <!-- /policy-table -->
// The compiler ignores the human-readable header row entirely and maps data-row cells
// positionally onto the `columns=` list from the marker, so prose elsewhere in the file
// (including other pipe tables, e.g. §7's scope summary, which carries no marker) is never
// mistaken for policy data.

const START_RE = /^<!--\s*policy-table:\s*(.*?)-->\s*$/;
const END_RE = /^<!--\s*\/policy-table\s*-->\s*$/;

function parseAttrs(raw) {
  const attrs = {};
  for (const m of raw.matchAll(/(\w+)=(\S+)/g)) {
    attrs[m[1]] = m[2];
  }
  return attrs;
}

function splitRow(line) {
  // Strip one leading and one trailing '|' (if present), then split on '|'.
  let s = line.trim();
  if (s.startsWith("|")) s = s.slice(1);
  if (s.endsWith("|")) s = s.slice(0, -1);
  return s.split("|").map((c) => c.trim());
}

function isSeparatorRow(cells) {
  return cells.length > 0 && cells.every((c) => /^:?-+:?$/.test(c));
}

function stripCell(cell) {
  // Rule/tool cells are authored as either plain text or `backtick-quoted`; strip a single
  // pair of surrounding backticks if present. Comma-separated lists (the Tools column) are
  // split by the caller, not here.
  const t = cell.trim();
  if (t.startsWith("`") && t.endsWith("`") && t.length >= 2) return t.slice(1, -1);
  return t;
}

function extractTables(text) {
  const lines = text.split("\n");
  const tables = [];
  let i = 0;
  let inFence = false;
  while (i < lines.length) {
    if (/^```/.test(lines[i].trim())) {
      inFence = !inFence;
      i++;
      continue;
    }
    if (inFence) {
      i++;
      continue;
    }
    const startMatch = lines[i].match(START_RE);
    if (!startMatch) {
      i++;
      continue;
    }
    const attrs = parseAttrs(startMatch[1]);
    const startLine = i + 1;
    const columns = (attrs.columns || "").split(",").map((c) => c.trim()).filter(Boolean);
    i++;
    // Skip to end marker, collecting '|'-prefixed lines in between.
    const rowLines = [];
    let endLine = -1;
    while (i < lines.length) {
      if (END_RE.test(lines[i])) {
        endLine = i + 1;
        i++;
        break;
      }
      if (lines[i].trim().startsWith("|")) rowLines.push(lines[i]);
      i++;
    }
    if (endLine === -1) {
      tables.push({
        id: attrs.id || "(unknown)",
        kind: attrs.kind || "(unknown)",
        columns,
        rows: [],
        error: `policy-table starting at line ${startLine} has no matching <!-- /policy-table --> marker`,
      });
      continue;
    }
    // First '|' line is the human-readable header, second is the separator; both are
    // discarded. Everything after that is data.
    const dataLines = rowLines.slice(2).filter((l) => !isSeparatorRow(splitRow(l)));
    const rows = dataLines.map((l) => splitRow(l).map(stripCell));
    tables.push({ id: attrs.id || "(unknown)", kind: attrs.kind || "(unknown)", columns, rows, startLine, endLine });
  }
  return tables;
}

// ---------------------------------------------------------------------------
// Load + parse
// ---------------------------------------------------------------------------

const errors = [];

if (!fs.existsSync(COMMAND_POLICY_PATH)) {
  console.error(`FATAL: ${path.relative(ROOT, COMMAND_POLICY_PATH)} does not exist`);
  process.exit(1);
}
const policyText = fs.readFileSync(COMMAND_POLICY_PATH, "utf8");
const tables = extractTables(policyText);

for (const t of tables) {
  if (t.error) errors.push(t.error);
}

const toolTables = tables.filter((t) => t.kind === "tools" && !t.error);
const ruleTables = tables.filter((t) => t.kind === "rule" && !t.error);

if (toolTables.length === 0) {
  errors.push("no kind=tools policy-table found — cannot validate tool ids referenced by rules");
}

// ---------------------------------------------------------------------------
// Tool registry
// ---------------------------------------------------------------------------

const registry = new Map(); // tool_id -> { status, purpose }

for (const t of toolTables) {
  const idIdx = t.columns.indexOf("tool_id");
  const statusIdx = t.columns.indexOf("status");
  const purposeIdx = t.columns.indexOf("purpose");
  if (idIdx === -1 || statusIdx === -1) {
    errors.push(`tools table "${t.id}" (line ${t.startLine}) missing required columns tool_id/status`);
    continue;
  }
  for (const row of t.rows) {
    const toolId = row[idIdx];
    const status = row[statusIdx] || "";
    const purpose = purposeIdx === -1 ? "" : row[purposeIdx] || "";
    if (!TOOL_ID_RE.test(toolId)) {
      errors.push(`tool id "${toolId}" (table "${t.id}") does not match qm's shape ^[a-z0-9][a-z0-9-]{0,63}$`);
      continue;
    }
    if (registry.has(toolId)) {
      errors.push(`tool id "${toolId}" declared more than once in the registry`);
      continue;
    }
    registry.set(toolId, { status, purpose });
  }
}

// ---------------------------------------------------------------------------
// Rule extraction + validation
// ---------------------------------------------------------------------------

const REQUIRED_RULE_COLUMNS = ["action_class", "slug", "tools", "match_type", "match_value", "decision", "reason"];

const rules = []; // { actionClass, slug, tools: [...], matchType, matchValue, decision, reason, table }
const gaps = []; // rule tables with zero data rows

for (const t of ruleTables) {
  const missingCols = REQUIRED_RULE_COLUMNS.filter((c) => !t.columns.includes(c));
  if (missingCols.length > 0) {
    errors.push(`rule table "${t.id}" (line ${t.startLine}) missing column(s): ${missingCols.join(", ")}`);
    continue;
  }
  if (t.rows.length === 0) {
    gaps.push(t.id);
    continue;
  }
  const idx = Object.fromEntries(REQUIRED_RULE_COLUMNS.map((c) => [c, t.columns.indexOf(c)]));
  for (const [rowNum, row] of t.rows.entries()) {
    const actionClass = row[idx.action_class];
    const slug = row[idx.slug];
    const toolsCell = row[idx.tools];
    const matchType = row[idx.match_type];
    const matchValue = row[idx.match_value];
    const decision = row[idx.decision];
    const reason = row[idx.reason];
    const where = `table "${t.id}" row ${rowNum + 1} (action class "${actionClass}")`;

    const toolIds = (toolsCell || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (toolIds.length === 0) {
      errors.push(`${where}: no tools listed`);
      continue;
    }
    let rowOk = true;
    for (const toolId of toolIds) {
      if (!TOOL_ID_RE.test(toolId)) {
        errors.push(`${where}: tool id "${toolId}" does not match qm's shape ^[a-z0-9][a-z0-9-]{0,63}$`);
        rowOk = false;
      } else if (!registry.has(toolId)) {
        errors.push(`${where}: tool id "${toolId}" is not declared in the §1 tool registry`);
        rowOk = false;
      }
    }
    if (!LEGAL_MATCH_TYPES.has(matchType)) {
      errors.push(`${where}: match_type "${matchType}" is not "command" or "pattern"`);
      rowOk = false;
    }
    if (!matchValue) {
      errors.push(`${where}: match_value is empty`);
      rowOk = false;
    } else if (matchType === "pattern" && matchValue.length > PATTERN_MAX_LEN) {
      errors.push(`${where}: pattern is ${matchValue.length} chars, exceeds qm's ${PATTERN_MAX_LEN}-char cap`);
      rowOk = false;
    }
    if (!LEGAL_DECISIONS.has(decision)) {
      errors.push(`${where}: decision "${decision}" is not "require_approval" or "deny"`);
      rowOk = false;
    }
    if (!reason) {
      errors.push(`${where}: reason is empty — every approvals entry must carry a human-readable reason`);
      rowOk = false;
    }
    if (!rowOk) continue;

    rules.push({ actionClass, slug, tools: toolIds, matchType, matchValue, decision, reason, table: t.id });
  }
}

// ---------------------------------------------------------------------------
// The check with real teeth: every never-delegated class must be a `deny` rule
// ---------------------------------------------------------------------------

for (const cls of NEVER_DELEGATED_CLASSES) {
  const matches = rules.filter((r) => r.actionClass.toLowerCase().includes(cls));
  if (matches.length === 0) {
    errors.push(`FATAL: never-delegated class "${cls}" has no rule at all in command-policy.md`);
    continue;
  }
  const notDenied = matches.filter((r) => r.decision !== "deny");
  if (notDenied.length > 0) {
    errors.push(
      `FATAL: never-delegated class "${cls}" has a rule that is not "deny" (found: ${notDenied
        .map((r) => `${r.table}/${r.decision}`)
        .join(", ")})`
    );
  }
}

// ---------------------------------------------------------------------------
// Assemble per-tool approvals[]
// ---------------------------------------------------------------------------

const allToolIds = new Set([...registry.keys(), ...rules.flatMap((r) => r.tools)]);
const approvalsByTool = new Map(); // tool_id -> [{command|pattern, decision, reason}]

for (const toolId of allToolIds) approvalsByTool.set(toolId, []);
for (const rule of rules) {
  for (const toolId of rule.tools) {
    if (!approvalsByTool.has(toolId)) continue;
    // command/pattern first for readability in the emitted JSON.
    const entry =
      rule.matchType === "command"
        ? { command: rule.matchValue, decision: rule.decision, reason: rule.reason }
        : { pattern: rule.matchValue, decision: rule.decision, reason: rule.reason };
    approvalsByTool.get(toolId).push(entry);
  }
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

console.log(`=== build-tool-policy: ${DRY_RUN ? "dry run" : `writing to ${OUT_DIR}`} ===\n`);

console.log(`Source: ${path.relative(ROOT, COMMAND_POLICY_PATH)}`);
console.log(`Tool tables found: ${toolTables.length} | Rule tables found: ${ruleTables.length}`);
console.log(`Tools in registry: ${registry.size} (${[...registry.keys()].join(", ") || "none"})\n`);

console.log("-- rules per tool --");
if (allToolIds.size === 0) {
  console.log("  (none)");
} else {
  for (const toolId of [...allToolIds].sort()) {
    const list = approvalsByTool.get(toolId) || [];
    const status = registry.get(toolId)?.status || "(not in registry)";
    console.log(`  ${toolId}: ${list.length} rule(s) — ${status}`);
  }
}

const decisionCounts = { deny: 0, require_approval: 0 };
for (const r of rules) decisionCounts[r.decision] = (decisionCounts[r.decision] || 0) + r.tools.length;
console.log(`\n-- counts by decision (rule x tool expansions) --`);
console.log(`  deny: ${decisionCounts.deny}`);
console.log(`  require_approval: ${decisionCounts.require_approval}`);

// "Staged for tools not yet shipped": rule x tool expansions where the tool's registry status
// is anything other than the exact value "shipped". Reported plainly, per the task's
// instruction — this is neither a pass nor a failure, it is the honest state of a policy
// authored ahead of its tools.
let stagedForUnshipped = 0;
for (const r of rules) {
  for (const toolId of r.tools) {
    const status = (registry.get(toolId)?.status || "").trim().toLowerCase();
    if (status !== "shipped") stagedForUnshipped++;
  }
}
console.log(`\n${stagedForUnshipped} rule(s) staged for tool(s) not yet shipped.`);

console.log("\n-- gaps: action-classes/tables with no rule (not a pass) --");
if (gaps.length === 0) {
  console.log("  (none)");
} else {
  for (const g of gaps) console.log(`  policy-table "${g}" has a header but zero data rows`);
}

if (errors.length > 0) {
  console.log(`\n-- ${errors.length} error(s) --`);
  for (const e of errors) console.log(`  ❌ ${e}`);
} else {
  console.log("\n✅ no errors — every rule validated (command XOR pattern, pattern ≤256 chars, legal decision, known tool id), and all six never-delegated classes are deny rules.");
}

if (!DRY_RUN && errors.length === 0) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  for (const [toolId, list] of approvalsByTool.entries()) {
    const outPath = path.join(OUT_DIR, `${toolId}.approvals.json`);
    fs.writeFileSync(outPath, JSON.stringify({ approvals: list }, null, 2) + "\n");
  }
  console.log(`\nWrote ${approvalsByTool.size} fragment(s) to ${OUT_DIR}`);
} else if (!DRY_RUN && errors.length > 0) {
  console.log("\nNot writing output — fix the error(s) above first.");
}

process.exit(errors.length > 0 ? 1 : 0);
