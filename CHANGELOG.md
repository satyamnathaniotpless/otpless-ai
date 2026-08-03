# Changelog

## v1.3.0 — 2026-08-03 · qm rollback proven; the security-posture fiction removed

- **`qm rollback --to <digest>` proven against the live deployment** and verified on the running service, not from CLI help. Method and result in `docs/ADRS.md` ADR-010 correction §6. Tested with two *functional* images rather than by breaking production.
- **The limitation matters more than the success:** rollback repoints the sandbox **image** only. The deployment layer does not roll back — and our guardrails (`approvals[]`, skills) live in the layer. So rollback cannot undo a bad guardrail publish; recovery there is re-publishing prior content from git, verified by `verify-live-layer.mjs`. That mechanism exists but has never been drilled.
- **`packs/shared/trust-ladder/SKILL.md` corrected and republished (layer v9)** — it was live and telling every agent its autonomy was "enforced by qm's command policy," a mechanism qm does not have. It now names the real one and states two things it never had: `approvals` do not gate connector actions, and **absence of a rule means ungated, not L0**.
- Auto/Strict/Dangerous "security postures" removed across 14 files (both PRDs with dated correction notes, all five scope files, runbooks, plans, layer README, `agents/integrator.md`). `platform/deploy-layer/otpless/scopes/people-ops.md` was a substantive rework — it assigned a standing "Strict" posture that does not exist and therefore protected nothing.
- `brain/decisions/log.md` records the ADR-004 → ADR-010 supersession without rewriting the original row.
- **`docs/proposals/platform-agent.md`**: both blockers cleared or reduced; recommendation moves to *buildable*, with layer changes PR-only permanently. The deciding objection is now volume — the "count the publishes after a month" test has not been allowed to run.
- Decisions: where a constraint is invariant, generate it rather than asking an author to remember it; `qm check`/`publish` is the backstop that cannot be bypassed, native checks are early warning.

## v1.2.0 — 2026-08-03 · Enforcement re-founded on real qm mechanisms
- Safety model rebuilt on mechanisms qm actually has, after finding it was documented against a "command policy" and "security postures" qm does not implement.
- `platform/deploy-layer/otpless/command-policy.md` rewritten as a compilation source (`<!-- policy-table -->` blocks, policy as data) and `platform/scripts/build-tool-policy.mjs` (new) compiles it into qm `approvals[]` descriptors — 22 `deny` rules staged across six write tools that do not exist yet (`gmail-send`, `notion-write`, `slack-send`, `calendar-invite`, `whatsapp-send`, `hrms-write`).
- `platform/scripts/verify-live-layer.mjs` (new) — first check that reads the live deployment instead of comparing our documents to each other; signed read of the running core confirms every approval rule actually in force. Ran green against live core.
- `evals/run.mjs` §4 strengthened: runs the compiler and verifies all six never-delegated classes compile to `deny` in the compiled JSON, not merely the markdown; confirmed red-when-broken.
- Deployment layer published as v8 (image digest unchanged — descriptors travel in the layer).
- `egress` corrected across six files (`platform/contracts/{hrms,whatsapp,bgv,gmail,README}.md`, `docs/proposals/platform-agent.md`) — it is validated-only in qm contract v1, not the platform-enforced host allowlist it was described as.
- ADR-010 correction (2026-08-03, `docs/ADRS.md`): egress doesn't enforce and closing G27 won't change that; `approvals` DO reach core intact (verified live, `status: applied`, rules verbatim); the earlier probe measured a stale sandbox, not an ungated one; a custom `sandbox/Dockerfile` can silently stop copying tool binaries.
- Open, not promoted on: runtime behavior of `approvals` (whether `deny` refuses outright and `require_approval` pauses) unverified by a live agent command; `qm rollback` unproven; gate G27 (sandbox egress proxy) still open.
- Decisions: policy is compiled data, verified by reading the live deployment rather than comparing documents.

## v1.1.0 — 2026-08-02 · Otto is live · P5 packs loaded onto the deployment

The platform went from "built and gated" to running. Recorded late — this entry was written on 2026-08-03 from the commit history, because the day it happened went unlogged.

- **Otto live on Fly.io (`sin`)** — 5 services (core, web-ui, admin, portal, auth), Managed Postgres, Tigris object storage, Sprites sandbox backend. `qm check --live` green including an S3 round trip. Portal at `otpless-portal.fly.dev`. Everything the first real deploy taught is in `docs/RUNBOOK_DEPLOY.md` §4b and `docs/reports/DEPLOY-live.md`.
- **`platform/scripts/build-sandbox-layer.mjs`** — the join between our packs and the deployment, and the answer to how `packs/` reaches a sandbox that only accepts `skills/<id>/<file>`. Verifies frontmatter, reference resolution, bundle size against the 1 MB core API limit, PII, and path collisions; rewrites relative config references as it maps.
- **Recruiting packs loaded — deployment layer v6**: 15 skills (shared + recruiting), integration contracts, and a per-deployment `user.md` that stays out of git.
- **The recruiting agent is named Scout** (gate G8 closed), and its disclosure line names the operator rather than a role title.
- **Otto naming** — the platform is Otto; the harness stays qm. Every CLI command, config file, and package name (`qm up`, `qm.config.jsonc`, `@yc-software/qm`) is unchanged, because that is what upstream docs and help output call it.
- **ADR-009: qm has no MCP.** External access is connectors (OAuth via Admin + `/keychain`), sandbox tools, or plugins. Contracts that described MCP were corrected, along with the template that would have propagated the error to the next one. ADR-006's capability premise amended in the same pass — the Slack-can't-read-reactions claim was false; that decision stands on its security argument alone.
- **ADR-010: enforcement re-founded** on `approvals`/`egress`, with a probe written to test the primitive before building on it.
- **`docs/AGENT_DEPLOY_ACCESS.md`** — what a session actually needs to run the deploy loop: two Fly tokens, not the other fifteen secrets, because `qm up` verifies secret *names* via `fly secrets list` and never values.
- **`docs/proposals/platform-agent.md`** — a proposal for the agent that would maintain Otto itself, recommending build-but-not-yet with an explicit exit criterion.
- Gates: G8 closed, G12 closed as obsolete, G13 reframed to connector send, G27 (sandbox egress proxy) and G28 (Resend sending domain) added from live observation.
- Evals grew to 13 check groups. Two of the additions found real defects in the harness itself: the PII walk was blind to `.md.example` files (four carried the founder's real email), and the cross-reference check silently stopped scanning after the first fenced code block.
- Decisions: depend on the published qm package rather than a fork; there is no `deploy/layers/` contract; skills and tool descriptors ship in the versioned deployment layer while tool binaries ship in the image, so the **layer version** is the signal a skills change landed, not the image digest.

## v1.0.0 — 2026-08-01 · P4 template out · roadmap complete
- Build roadmap complete; platform enters maintenance mode. Deployment remains gated (gates G1–G9, G14–G25 open); no agent has run against a real person.
- `docs/DEPARTMENT_AUTOMATION_PLAYBOOK.md` — the executable playbook for standing up department #2 and every department after: the model (process = code, everything specific = data), the six actual failure modes hit during P0–P3 with the lesson from each, build sequence, what `packs/shared` gives free, guardrail patterns that worked, parallel-build coordination (fresh-context review is not optional), and department #2 recommendation (support is the structural fit; founder decides).
- `docs/RUNBOOK_MAINTENANCE.md` — standing operating procedure once the roadmap ships: eval watch, qm health, per-agent retro, evidence review, upstream merge, gate ledger, new proposals, brain currency. Most duties are inert until deployment is live.
- `docs/proposals/_template.md` — one-page brief format for proposing a new agent/department, requiring evidence of observed repeated manual work (not ideas).
- Decisions: department #2 recommendation (support), new proposals require observed work (not ideas), fresh-context review is the cost of parallelism, never optional. ADR-005 validated by five agents; one metric owner per fact (recruiter cites, analyst computes); scope slugs canonical.
- Evals: 12 check groups, 0 failures. Build roadmap delivered and evaluated; operator manual written.

## v0.5.0 — 2026-08-01 · P3 department complete
- Analyst + Culture & Growth packs (7 + 7 skills): attrition signals, comp drift, engagement drilldown, survey analysis; review tracking, 1:1 cadence, offboarding checklist, culture pulse survey cycle, team-tenure heatmap, culture changelog, peer-review aggregation.
- WhatsApp integration contract (`platform/contracts/whatsapp.md`): capability shape, template approval gate (G21), sender-identity decision (G22), in-draft mode at all trust levels pending MCP build.
- Scopes + crons: `scopes/analyst.md`, `scopes/culture.md`, 11 new scheduled jobs (company weekly digest, monthly analyst deep-dive, pulse cadence, review-cycle checkins).
- Gates G20–G25: WhatsApp sender (G20), template approval (G21), sender-identity decision (G22), comp-band market data (G23), pulse-survey tooling (G24), culture tracker Notion (G25).
- Slug reconciliation: all five scope files carry Slug column matching pack evidence.md; `packs/onboarding/config/evidence.md` created (never existed, blocking onboarder promotions).
- Decisions: small-N suppression (complementary + partition-aware), one metric owner (analyst computes funnel rates, recruiter cites), scope slug authority, ADR-005 validated by five agents.
- Evals: 11 → 12 check groups (metric-ownership guard, slug-match validator, new promotion-rate boundary case, survey-suppression partition check); 0 failures.
- P3 packs built and reviewed, not live (gates G1–G9, G14–G25 open).

## v0.4.0 — 2026-08-01 · P2 lifecycle agents
- Onboarder + People-Ops packs (10 + 6 skills): notice-period warmth, BGV, provisioning, onboarding checklist; policy Q&A, HRMS reads, payroll prep, letters, vendor renewals.
- Integration contracts: `platform/contracts/hrms.md`, `notion-employees.md`, `bgv.md` with PII handling backfilled to all six.
- Scopes + crons: `scopes/onboarder.md`, `scopes/people-ops.md`, 11 new scheduled jobs (check-in reminders, payroll prep, vendor renewals).
- Gates G14–G19: HRMS vendor choice (G14), HRMS credentials (G15 CTO-owned), Employees DB (G16), Policies wiki (G17), BGV vendor (G18), command-policy compile (G19).
- ADR-005 validated: `packs/shared` reusable across departments, verified by independent build of onboarding and people-ops without coordination.
- Evals: 11 check groups, 0 failures; P2 packs built and reviewed, not live (gates G1–G9, G14–G19 open).

## v0.3.0 — 2026-08-01 · P1 measurement layer + operator manual
- Measurement layer: draft-acceptance evidence, promotion arithmetic, operator manual (evals x10, green).
- `platform/evidence/` — two-tier evidence: raw ledger in qm scope storage (private), weekly rollup in git (counts only).
- `packs/shared/metrics/SKILL.md` — classifies drafts into four buckets, generates rollup, opens promotion PRs when gates clear.
- `packs/shared/trust-ladder/SKILL.md` and `packs/shared/retro/SKILL.md` — updated to consume evidence rollup; promotion and playbook PRs are deliberate separate reviews.
- `platform/deploy-layer/otpless/crons.md` — two new rows: `recruit-watch-reply` (F9 reply watch) and `recruit-evidence-rollup` (Sunday 21:00 IST, ordered before retro).
- `docs/OPERATING_RECRUITER.md` — operator's manual: daily loop, all 10 recruiting skills, config-only changes, known limitations.
- Evals: 8 → 10 check groups (promotion-gate arithmetic with boundary cases, evidence-rollup PII guard, backup-artifact guard).

## v0.2.0 — 2026-08-01 · P0 deployment-ready
- Build team: 7 subagent roles (architect, builder, reviewer, evaluator, integrator, librarian, deployer) in `agents/`, generated to `.claude/agents/`.
- `platform/contracts/` — integration contracts for Notion, Gmail, Calendar, Slack + `_template.md`.
- `platform/deploy-layer/otpless/scopes/` — scope definitions as data files; `packs/recruiting/config/` — agent config and goals files.
- Cron table in `platform/deploy-layer/otpless/crons.md` — scheduled work (new-applicant watch, SLA sweep, 08:30 IST digest + standup, weekly retro).
- `docs/gates.md` — unified human-gate ledger (13 gates, G1–G13, each with one accountable owner).
- `platform/scripts/bootstrap-qm.sh` (preflight-only by default) + verify-deployment.md.
- Eval harness: 8 check groups (structure, skill-shape, generic disclosure/draft lint, never-delegated coverage, gate hygiene, secret-shape guard, cross-reference, ratings). GREEN, 0 failures.
- ADR-006 & ADR-007 — approval gate (not Slack reactions), draft as contract boundary.

## v0.1.0 — 2026-08-01 · Commissioning build
- Platform docs: README, CLAUDE.md (operating manual), BOOTSTRAP_PROMPT (build + maintain prompts), PRDs, ADR-001..005, deploy runbook.
- packs/shared v1: identity, standup, retro, trust-ladder skills + agent config template.
- packs/recruiting v1: 9 skills (router, triage, review, outreach, reply, schedule, reject, pipeline, watch), playbook ported from yc-software/recruiting (Notion/IST/WhatsApp-adapted), 7 role playbooks + generic _template.
- brain/ seed: company facts, policy templates (DRAFT), hiring playbook pointer, decisions log.
- platform/deploy-layer/otpless: org config, command policy (trust-ladder enforcement), layer README.
- evals v1: structure + lint + rating fixtures — GREEN (0 failures, 46 structure checks, 8/8 fixtures).
- Built by: 1 orchestrator + 2 parallel builder agents (sonnet) + evaluator run; lint self-reference issue fixed by extracting banned list to evals/fixtures/banned-phrases.txt.
