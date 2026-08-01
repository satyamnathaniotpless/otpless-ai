<!-- Purpose: running, append-only log of decisions that shape agent behavior — seeded from the ADRs, grown as new decisions are made. -->

# Decision Log

Append new decisions to the bottom. One line each: date, decision, one-line why. Full reasoning for architecture-level decisions lives in `docs/ADRS.md`; this log is the fast-scan index plus anything smaller than a formal ADR.

| Date | Decision | One-liner |
|---|---|---|
| 2026-08-01 | ADR-001: Adopt qm as the harness core | Private-fork qm (MIT) rather than build a harness from scratch; all OTPLESS-specific material lives in `deploy/layers/otpless/`, core stays mergeable. |
| 2026-08-01 | ADR-002: Model & token policy | Haiku for mechanical transforms, sonnet as default workhorse, top-tier model only for architecture/ambiguous judgment — token cost is an operating cost. |
| 2026-08-01 | ADR-003: Company brain — git canonical, Notion mirror | `brain/` in git is the source of truth for agent-readable knowledge; Notion is a synced, human-friendly mirror, never hand-edited as canon. |
| 2026-08-01 | ADR-004: Trust ladder enforced by policy, not convention | Autonomy levels (L0→L1→L2) are encoded in qm's command policy and per-scope posture, not left to prompt discipline; promotions/demotions are config changes with evidence. |
| 2026-08-01 | ADR-005: Generic by construction | Role/department-specific content is always data (config instantiated from `_template.md`), never process (skills) — marginal cost of a new role/department/agent trends to zero. |
| 2026-08-01 | ADR-006: Human approval is recorded by qm's approval gate, not Slack reactions | Slack is a notification surface, not an authorization surface; the MCP cannot read reactions and approvals must be attributable, versioned, and replayable. |
| 2026-08-01 | ADR-007: The draft is the universal contract boundary | Every skill's output ends at a created draft in every channel, at every trust level; send capability is verified at deploy time, never worked around. |
| 2026-08-01 | Integration contracts live at `platform/contracts/`, consumed by skills | Stops each new department re-deriving another team's schema. |
| 2026-08-01 | Scopes, crons, and contracts are data files with `_template.md` siblings | ADR-005 applied: a new agent, schedule, or connector integration is one file or one row. |
| 2026-08-01 | `docs/gates.md` is the single ledger for human gates | One accountable human per gate, no gate rediscovered per phase. |
| 2026-08-01 | Web sign-in default (gate G9): qm's built-in auth broker with Resend as sender; external IdP requires an ADR | The fastest path is the default; any diversion documented upfront. |
| 2026-08-01 | ADR-008: Autonomy evidence is two-tier — counts in git, person-linkable ledger in qm scope storage | The raw signal is candidate-linkable and cannot be the artifact a human reviews in a PR, but counts are all the gate needs. |
| 2026-08-01 | Discarded drafts count in the acceptance-rate denominator | A draft the human threw away is a failed draft, not an absent one. |
| 2026-08-01 | Minimum sample of 20 drafts before any promotion | Without a floor, one accepted draft is a 100% rate and the 95% gate is theatre. |
| 2026-08-01 | The evidence window is quantized to weekly rollup boundaries | Promotions are merged at the weekly ops review, so daily recomputation produces a number nobody consumes. |
| 2026-08-01 | Promotion PRs come from the metrics/rollup step, playbook PRs from retro, never combined | A human should never be asked to approve a tone change and an autonomy increase in one review. |
- 2026-08-01 · **Hosting: Fly.io** for the qm deployment (binding per deployment directory; AWS would require a fresh init). Decided by founder.
