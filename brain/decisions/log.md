<!-- Purpose: running, append-only log of decisions that shape agent behavior — seeded from the ADRs, grown as new decisions are made. -->

# Decision Log

Append new decisions to the bottom. One line each: date, decision, one-line why. Full reasoning for architecture-level decisions lives in `docs/ADRS.md`; this log is the fast-scan index plus anything smaller than a formal ADR.

| Date | Decision | One-liner |
|---|---|---|
| 2026-08-01 | ADR-001: Adopt qm as the harness core | Private-fork qm (MIT) rather than build a harness from scratch; all OTPLESS-specific material lives in `deploy/layers/otpless/`, core stays mergeable. **[superseded same-day: no such directory contract exists in qm's real deployment contract; see `docs/ADRS.md` "ADR-001 correction"]** |
| 2026-08-01 | ADR-002: Model & token policy | Haiku for mechanical transforms, sonnet as default workhorse, top-tier model only for architecture/ambiguous judgment — token cost is an operating cost. |
| 2026-08-01 | ADR-003: Company brain — git canonical, Notion mirror | `brain/` in git is the source of truth for agent-readable knowledge; Notion is a synced, human-friendly mirror, never hand-edited as canon. |
| 2026-08-01 | ADR-004: Trust ladder enforced by policy, not convention | Autonomy levels (L0→L1→L2) are encoded in qm's command policy and per-scope posture, not left to prompt discipline; promotions/demotions are config changes with evidence. **[mechanism superseded 2026-08-03 — see ADR-010 row below; the policy itself stands unchanged]** |
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
| 2026-08-01 | ADR-005 validated by two independent agents built without coordination | The claim that packs/shared is reusable was previously untested outside the department it was designed for. |
| 2026-08-01 | `brain/` is canonical for policy; Notion Policies wiki is its mirror, per ADR-003 | The wiki serves as drift detector; disagreement between the two means escalate, never invent policy. |
| 2026-08-01 | Slack DM is not a private channel — no HRMS field value, payroll figure, or document goes to Slack including DMs | A DM feels private and is not; that's exactly the access control property employee data must not lose. |
| 2026-08-01 | Per-action-class rows do not yet exist in command policy; they compile at deployment (gate G19) | No promotion may cite a policy row that does not exist. |
| 2026-08-01 | Every integration contract carries a PII handling section, inherited from `_template.md` | Three contracts written in one phase had already diverged on it. |
| 2026-08-01 | G15 (HRMS credentials) is CTO-owned, not Founder | Master PRD §5 makes CTO the credential owner; the two Founder-owned credential gates each have workspace-admin or spend rationale that G15 lacks. |
| 2026-08-01 | Survey small-N suppression is complementary and partition-aware, not per-cell | Per-cell suppression is defeated by subtraction, so an anonymity promise that only thresholds each cell is not true. |
| 2026-08-01 | One owner per metric: funnel-rate metrics defined and computed once by analyst, cited by recruiter | Two independent computations of the same metric give leadership two numbers and no way to tell which is stale. |
| 2026-08-01 | Scope files carry the canonical action-class slug; pack evidence.md must match exactly | The rollup, the ledger, and the promotion PR all cite the slug, and independent files had already drifted three slugs in each direction. |
| 2026-08-01 | ADR-005 held for agents four and five: both imported `packs/shared` unchanged | Five independent data points, not two. |
| 2026-08-01 | Department #2 recommendation: **support** (founder decides) | Support's failure mode mirrors recruiting's, ticket volume enables leverage; sales ops needs CRM contract first and higher stakes-per-message argue longer L0 dwell time. |
| 2026-08-01 | New agent proposals require observed repeated manual work, not ideas | Most repeated work is better solved by a form, cron, or deleting the process; a proposal without evidence is planning, not building. |
| 2026-08-01 | Fresh-context review is the cost of parallel work, not optional | Every drift failure in P0–P3 happened because builders held mutually inconsistent pictures of shared facts; reviewer starting cold catches what each builder believed locally. |
| 2026-08-03 | Command policy is compiled data, not prose: `command-policy.md` tables compile to qm `approvals[]` descriptors and are verified by reading the live deployment, not by comparing documents to each other (ADR-010 correction) | The prior model cited a "command policy" and "security postures" qm does not implement; only a signed read of the running core proves a rule is actually in force. |
| 2026-08-03 | `egress` is validated-only in qm contract v1, not a platform-enforced host allowlist — corrected across six contract/proposal files | Closing gate G27 will not add enforcement egress doesn't have; a contract must not claim a guarantee its mechanism can't keep. |
| 2026-08-03 | ADR-004's mechanism is superseded by ADR-010; its policy stands unchanged | ADR-004 claimed autonomy was "encoded in qm's command policy and per-scope security posture." Verified against `@yc-software/qm@0.1.4`: neither concept exists. Real enforcement is `approvals[{command\|pattern, decision}]` on tool descriptors, compiled from `command-policy.md`; absence of a rule means ungated, not L0. The L0→L1→L2 ladder, the ≥95%/min-20-sample bar, and the six never-delegated classes are unchanged. |
