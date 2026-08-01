# The build team

Canonical subagent definitions for the build loop. `.claude/agents/` is a generated copy — run `node platform/scripts/sync-agents.mjs` after editing anything here, never edit the copy.

| Agent | Model | Owns | Called when |
|---|---|---|---|
| `architect` | opus | Phase plans, ADRs, interface contracts | The decision is expensive to reverse or crosses packs |
| `builder` | sonnet | Skills, configs, playbooks, code | Any bulk generation, to a tight brief |
| `reviewer` | sonnet | Checklist review, fresh context | Before every ship, always without builder context |
| `evaluator` | sonnet | Eval harness, fixtures, red-teaming | Every new behavior, every phase exit |
| `integrator` | sonnet | MCP contracts, qm deploy layer, connectors | Work touching a system we do not own |
| `librarian` | haiku | `brain/`, CHANGELOG, README status, cross-refs | End of every phase; any knowledge change |
| `deployer` | sonnet | Runbook execution, verification, gate ledger | Anything touching real infrastructure |

**Routing rules.** The orchestrator delegates by default and does directly only what coordination requires. Reviewer never sees the builder's brief or reasoning. Builders run in parallel only on disjoint file sets. Model tier follows ADR-002 — opus is for architecture and final phase review, not for volume.

Revisit this roster at each phase boundary: add a role when the same kind of work is being improvised twice, remove one that has not been called in two phases.
