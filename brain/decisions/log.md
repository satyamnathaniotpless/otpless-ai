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
- 2026-08-01 · **Hosting: Fly.io** for the qm deployment (binding per deployment directory; AWS would require a fresh init). Decided by founder.
