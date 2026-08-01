#!/usr/bin/env node
// Purpose: materialize the canonical build-team definitions in agents/ into .claude/agents/ (generated copy — never edit .claude/agents by hand).

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const SRC = path.join(ROOT, "agents");
const DEST = path.join(ROOT, ".claude", "agents");
const BANNER = "<!-- GENERATED from agents/ by platform/scripts/sync-agents.mjs — edit the source, not this copy. -->\n";

fs.mkdirSync(DEST, { recursive: true });

const sources = fs
  .readdirSync(SRC)
  .filter((f) => f.endsWith(".md") && f !== "README.md");

// Drop definitions whose source was deleted, so a removed role stops being routable.
for (const stale of fs.readdirSync(DEST).filter((f) => f.endsWith(".md") && !sources.includes(f))) {
  fs.unlinkSync(path.join(DEST, stale));
  console.log(`removed  .claude/agents/${stale}`);
}

for (const file of sources) {
  const text = fs.readFileSync(path.join(SRC, file), "utf8");
  // Banner goes after frontmatter so the YAML block stays first in the file.
  const end = text.startsWith("---\n") ? text.indexOf("\n---\n", 3) + 5 : 0;
  fs.writeFileSync(path.join(DEST, file), text.slice(0, end) + BANNER + text.slice(end));
  console.log(`synced   .claude/agents/${file}`);
}

console.log(`\n${sources.length} agent definition(s) in .claude/agents/`);
