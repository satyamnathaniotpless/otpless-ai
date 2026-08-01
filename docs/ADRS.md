# Architecture Decision Records

## ADR-001 — Adopt qm as the harness core; own everything above it

**Decision:** Do not build a harness from scratch. Use yc-software/qm (MIT) via its documented **private-fork pattern**: a standalone private repo seeded by bare clone + mirror push (never GitHub's Fork button — fork visibility and shared object networks make forks of public repos unsafe for private customization). All OTPLESS-specific material lives in `deploy/layers/otpless/`; core stays byte-identical to upstream so merges stay small. The `update-qm` skill merges upstream monthly; `upstream-pr` sends generic fixes back.

**Why:** "Custom harness for OTPLESS" is achieved at the layer that matters — org config, command policy, sandbox image, skill packs, custom tools — not by rewriting session storage and Slack plumbing. Rebuilding qm ≈ months of undifferentiated work and a permanent maintenance tax; the fork gives 100% control (it's our repo, we can diverge core any day the trade is worth it) with ~0% of the rebuild cost.

**Consequences:** we accept qm's architecture (Node/Fastify core, Postgres, per-scope sandboxes, plugin surfaces); if upstream dies, we own a working snapshot and diverge.

**Staging (amended):** deployment does not require the fork — `qm init` from the published `@yc-software/qm` package materializes a config-only deployment repo, which is how we go live (RUNBOOK §2). The private fork is adopted lazily, at the first moment we need to customize core or read core + customizations in one tree; until then it's deferred cost. When adopted: plain bare-clone + mirror push (never GitHub's Fork button), layer in `deploy/layers/otpless/`, upstream CI runs in our account.

## ADR-002 — Model & token policy

**Decision:** haiku for mechanical transforms; sonnet as the default workhorse for skills/code/reviews/fixtures; top-tier model only for architecture, ambiguous judgment, and final phase reviews. Subagents receive paths not payloads; reads are batched and never repeated within a session; edits preferred over regeneration. qm scopes inherit the same policy: watch/cron loops run on the cheapest model that passes that loop's eval fixtures.

**Why:** the platform runs 24×7; token cost is an operating cost like payroll. The eval harness, not model size, is the quality guarantee.

## ADR-003 — Company brain: git canonical, Notion mirror

**Decision:** `brain/` in this repo is the single source of truth for company knowledge agents act on: policies, playbooks, decisions, org facts, templates. Notion carries a human-friendly mirror (and the operational databases: Applicants, Employees), synced from git by a librarian cron — never hand-edited as canon. Every change that alters behavior (a policy, a template, a bar) must land in `brain/` in the same commit as the code/config change.

**Why:** agents need versioned, diffable, eval-testable knowledge with attribution — that's git. Humans need browsable pages — that's Notion. One direction of sync kills the two-sources-of-truth failure mode. Structured operational data (candidates, employees) stays in Notion databases because forms, views, and human edits live there; the brain stores knowledge, not records.

## ADR-004 — Trust ladder enforced by policy, not convention

**Decision:** Autonomy levels (L0 drafts-only → L1 routine auto-send → L2 rule-based auto-execute) are encoded in qm's predeclared command policy and per-scope security posture, which apply in every posture including Dangerous. Promotions require measured evidence (≥95% unedited-draft acceptance over the window defined per action class) and a human merge of the promotion PR. Any bad send auto-demotes the action class via the same config file. Never delegated regardless of level: offers, comp, terminations, performance judgments, post-interview rejections, policy changes.

**Why:** "the agent behaves because the prompt says so" does not survive contact with 100s of agents. Enforcement must live where the tools are executed.

## ADR-005 — Generic by construction

**Decision:** Role-specific and department-specific content is always data (config/playbook files instantiated from `_template.md` files), never process (skills). Opening a new role = one file in `packs/recruiting/config/jobs/`. A new department = a new pack importing `packs/shared`. A new agent = a qm scope + identity kit + goals file.

**Why:** the 7-hire sprint is the commissioning run; the platform's product is marginal cost ≈ zero for the next role, agent, and department.
