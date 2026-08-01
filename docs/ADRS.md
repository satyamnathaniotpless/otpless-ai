# Architecture Decision Records

## ADR-001 — Adopt qm as the harness core; own everything above it

**Decision:** Do not build a harness from scratch. Use yc-software/qm (MIT) via its documented **private-fork pattern**: a standalone private repo seeded by bare clone + mirror push (never GitHub's Fork button — fork visibility and shared object networks make forks of public repos unsafe for private customization). All OTPLESS-specific material lives in `deploy/layers/otpless/`; core stays byte-identical to upstream so merges stay small. The `update-qm` skill merges upstream monthly; `upstream-pr` sends generic fixes back.

**Why:** "Custom harness for OTPLESS" is achieved at the layer that matters — org config, command policy, sandbox image, skill packs, custom tools — not by rewriting session storage and Slack plumbing. Rebuilding qm ≈ months of undifferentiated work and a permanent maintenance tax; the fork gives 100% control (it's our repo, we can diverge core any day the trade is worth it) with ~0% of the rebuild cost.

**Consequences:** we accept qm's architecture (Node/Fastify core, Postgres, per-scope sandboxes, plugin surfaces); if upstream dies, we own a working snapshot and diverge.

**Staging (amended):** deployment does not require the fork — `qm init` from the published `@yc-software/qm` package materializes a config-only deployment repo, which is how we go live (RUNBOOK §2). The private fork is adopted lazily, at the first moment we need to customize core or read core + customizations in one tree; until then it's deferred cost. When adopted: plain bare-clone + mirror push (never GitHub's Fork button), layer in `deploy/layers/otpless/`, upstream CI runs in our account.

### ADR-001 correction (2026-08-01) — the `deploy/layers/` directory contract does not exist

**What we got wrong.** ADR-001 above, `docs/RUNBOOK_DEPLOY.md` §2–§3, and `platform/deploy-layer/otpless/README.md` all state that OTPLESS-specific material lives in the deployment repo at `deploy/layers/otpless/`, "matching qm's documented layer-directory contract." **There is no such contract.** Verified by running `qm init . --org otpless --target fly` against the published `@yc-software/qm@0.1.4` and inspecting what it actually materializes.

**The real deployment-directory contract (`"contract": 1`):**

| Real artifact | What it holds | What we had assumed |
|---|---|---|
| `qm.config.jsonc` | orgId, publicUrl, target, modelProvider, appPrefix, region, flyOrg, `services[]`, `plugins[]`, `skills[]`, per-service `env` / `secretEnv`, sandbox app | our `org-config.md` compiles here |
| `sandbox/skills/<id>/SKILL.md` | the sandbox layer — skills mounted into the agent | we expected a layer directory |
| `sandbox/tools/<id>/tool.json` | custom tools, executable alongside | not previously modelled |
| `sandbox/Dockerfile` (optional) | only for extra system packages | — |
| `skills: []` in config | **extra directories of SKILL.md mounted into the agent** — this is how our packs load | we assumed a git-URL skill-pack import |
| `.codex/skills/deploy-qm/` | the deploy agent skill qm ships | as documented |

**Two further corrections of fact:**

1. **qm requires Node ≥ 24.** The CLI refuses to run below it. Neither the runbook nor gate G1 mentioned a runtime prerequisite.
2. **qm does not build from source, so a Fly app must never be pointed at a source repo.** The CLI selects immutable runtime image digests from its release manifest and orchestrates the Fly apps itself via `qm up`. Running `flyctl launch` against this repository fails with "Could not detect runtime or Dockerfile" — correctly, because `otpless-ai` is skill packs and config, not a service. There is nothing here for Fly to build, and there never will be.

**Why this matters beyond the file paths.** This is the platform's own documentation committing the failure mode the department playbook warns about — a capability assumed rather than verified — and it survived four phases because nothing executed against the real package until now. ADR-007 exists because the Gmail connector could not do what we assumed; this correction exists for the same reason, one layer down. The lesson generalizes: an integration contract written from a README is a hypothesis until something runs.

**What does not change:** the substance of ADR-001. qm core stays unforked, our material stays separate and version-controlled here, and the private fork remains deferred. Only the mechanism by which our material reaches the deployment was wrong.

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

## ADR-006 — Approval happens in qm's gate, never in a channel affordance

**Decision:** Human approval of a drafted action is recorded by qm's own approval mechanism (command policy gate, surfaced in the web UI and via qm's Slack plugin). Slack is a *notification and discussion* surface, not an authorization surface. The PRD's "👍-to-act" shorthand (`PRD_Recruiting_System.md` §6) is retired as a mechanism and kept only as a description of the desired ergonomics: one gesture, in Slack, to approve.

**Why:** two independent reasons, and either alone is sufficient. (1) Capability: the Slack MCP exposes message and thread text, not reactions — an emoji approval is not observable by the agent, so a system built on it would silently never fire, or worse, invite polling hacks. (2) Security: an approval is an authorization event and belongs where enforcement lives (ADR-004). A reaction is unauthenticated relative to our policy layer — anyone in the channel can add one, there is no record of *which* draft version was approved, and the audit trail is a Slack emoji. Approvals must be attributable, versioned to the exact content approved, and replayable in an incident review.

**Consequences:** the trust ladder's evidence (ADR-004, and the rollup in `docs/plans/p1-recruiter-complete.md`) reads from qm's approval log, which is authoritative, rather than from channel scraping. Any future channel (WhatsApp, email) inherits the same rule: the channel carries the draft, qm carries the approval. If qm's Slack plugin later offers interactive buttons bound to its approval gate, that is the ergonomic win — still the gate, just a nicer button.

## ADR-007 — The draft is the contract boundary; send capability is verified, never worked around

**Decision:** Every skill's output contract ends at a **created draft**, in every channel, at every trust level. Whether the platform can then *send* that draft is a connector capability question answered at deploy time by `platform/scripts/verify-deployment.md`, not an assumption baked into skills. Where the connector cannot send (today: the Gmail MCP surface exposes draft/read/label operations and no send), the gap is recorded in the contract's "Capability gaps" section and closed by extending the MCP — never by a raw HTTP call, a headless browser, or a human's mailbox.

**Why:** the discovery that we can draft but not send would, in a naively-built system, surface as a mystery failure at the worst moment — the first L1 auto-send after a promotion. Making the draft the universal boundary means the system's behavior is identical at L0 and L1 up to the final step, so promotion changes one gate and nothing else. It also means a missing capability degrades to "a human clicks send," which is exactly the L0 behavior we already run, rather than to an outage.

**Consequences:** an action-class cannot be promoted to L1 until its channel's send capability is verified present and approval-gated — that verification is a precondition on the promotion PR, alongside the acceptance-rate evidence. `platform/contracts/*.md` carries the current truth per channel.

## ADR-008 — Autonomy evidence: counts in git, identities in qm, and a minimum sample

**Decision:** Draft-acceptance evidence — the number every trust-ladder promotion depends on (ADR-004) — is produced in two tiers. The **raw ledger** (which draft, which candidate, what the human changed) stays in qm scope storage and never enters git. The **weekly rollup** is counts only, lands in git under `platform/evidence/`, and is what a promotion PR cites. Outcomes are bucketed coarsely: `sent_unedited`, `sent_light_edit`, `sent_rewrite`, `discarded`. Acceptance rate is `sent_unedited / (sent_unedited + sent_light_edit + sent_rewrite + discarded)`. A promotion additionally requires a **minimum sample of 20 drafts** for that action-class within the window; below that the class is *insufficient evidence*, which is reported distinctly from a failing rate.

**Why:** three failure modes, each closed by one part of the decision. (1) *Privacy*: the useful raw signal is inherently linkable to a candidate, so it cannot be the artifact humans review in a PR — but counts can be, and counts are what the gate actually needs. (2) *Self-grading*: fine-grained edit scoring invites an agent to classify its way to a promotion; four coarse buckets, with discarded drafts in the denominator, make the number hard to flatter. A discarded draft is a failed draft, not an absent one. (3) *Small numbers*: without a floor, one accepted draft is a 100% acceptance rate and the 95% gate is theatre. Twenty is a judgment call — low enough to be reachable inside a 2-week window at our volume, high enough that a single lucky draft cannot clear it.

**Accepted consequence — the window is quantized to weekly rollup boundaries.** Because rollups are generated weekly, an action-class that clears its sample floor mid-week waits until the next rollup to become promotable; the trailing window is weekly-granular, not rolling-daily. This is deliberate, not an oversight: promotions are merged at the weekly ops review (master PRD §7), so daily recomputation would produce a number no human consumes that week. Revisit only if promotion latency ever becomes the binding constraint.

**Consequences:** promotions become arithmetic a human can audit in one table rather than a claim an agent makes in prose, and the skill refuses to open a promotion PR when the numbers do not clear rather than arguing for an exception. Every future agent and department inherits the same instrument. Revisit the sample floor once real volume exists — if the recruiting agent produces hundreds of drafts a week, 20 is too permissive.
