<!-- Purpose: phase report for P0 — what shipped, what it cost, what the founder/CTO must unblock. -->

# Phase report — P0 Deployment-Ready · 2026-08-01

**Status:** shipped. Evals green (0 failures, 8 check groups). The qm deployment itself is **not** live and cannot be — it is blocked on credentials only a human can provide (G1–G9). Everything around that gate is done, so the deploy is now one script run, not a design exercise.

## What shipped

**The build team (Step 0).** Seven roles — architect, builder, reviewer, evaluator, integrator, librarian, deployer — canonical in `agents/`, generated into `.claude/agents/` by `platform/scripts/sync-agents.mjs`. Definitions are never duplicated by hand. This phase ran entirely through them: three parallel builders, a fresh reviewer with no builder context, an evaluator, a fix pass, a librarian.

**Integration contracts** (`platform/contracts/`). Notion, Gmail, Calendar, Slack, each with the same section shape, plus `_template.md`. Skills now consume a contract — what we read, what we write, how staleness is handled, how a write is verified, what the connector *cannot* do — instead of knowing about APIs. The next department does not re-derive the Notion schema.

**The deployment layer as data.** `scopes/_template.md` + `scopes/recruiter.md` (a new agent is one file), `crons.md` (a new schedule is one row: new-applicant watch, hourly SLA sweep, 08:30 IST digest and standup, Monday pipeline report, weekly retro). Every cron defaults to *draft*, not auto-post, because Slack posts to a human channel are L0-gated.

**The F8 gap closed.** `packs/recruiting/candidate-status/` — the PRD specifies it and v0.1.0 never built it, while triage and schedule both assume it exists.

**The agent scoreboard as data.** `packs/recruiting/config/{agent,goals}.md` + a generic `goals.md.example`. Notably it keeps the ≥80% draft-acceptance *quality bar* and the ≥95% *promotion gate* explicitly distinct — they are different numbers and conflating them would silently corrupt every future trust decision.

**Deploy staging.** `bootstrap-qm.sh` preflights all 13 gates, and its default mode mutates nothing — `--apply` is required, and it refuses even then while any gate is open (verified: exits non-zero, zero mutation). `verify-deployment.md` turns the runbook's 8 checks into read-back procedures using synthetic records only.

**The gate ledger** (`docs/gates.md`) — 13 gates, each with one accountable human, the current workaround, and the exact unblock action.

**Evals: 3 check groups → 8.** Structure, skill-shape (a generic glob, so future skills are covered automatically), generalized disclosure/draft lint, never-delegated coverage, gate hygiene, secret-shape guard, cross-reference resolution, 11 rating fixtures. The evaluator proved each new assertion goes red when the thing it guards is broken — an untested check is not a check.

## Decisions made this phase

| Decision | Rationale |
|---|---|
| **ADR-006** — approvals are recorded by qm's gate, never a Slack reaction | The Slack MCP cannot read reactions, so the PRD's 👍-to-act would have silently never fired. Independently: a reaction is not an attributable, content-versioned authorization, and approval belongs where enforcement lives. |
| **ADR-007** — the draft is the universal contract boundary at every trust level | The Gmail MCP exposes no send operation. Making the draft the boundary means a missing send capability degrades to "a human clicks send" (already our L0 behavior), never to an outage or a bypass. |
| Integration contracts live at `platform/contracts/` | Stops every new department re-deriving another team's schema. |
| Scopes, crons, contracts are data with `_template` siblings | ADR-005 applied to the platform layer, not just to job playbooks. |
| Gate G9 default: qm's built-in auth broker with Resend | The runbook left this an open fork; the fastest path should be the default. External IdP instead requires an ADR. |

## What the review caught

A fresh reviewer found three blockers worth recording, because each is a class of error to keep testing for:

1. **Gate ownership drifted across parallel authors.** Three files attributed the Gmail/Calendar/Slack credentials to the Founder; the ledger and runbook say CTO. A reader would have escalated to the wrong person — precisely the ambiguity the one-accountable-human rule exists to prevent.
2. **G8 could never close.** The bootstrap script gated on an env var, while the ledger instructed the founder to paste the name into `org-config.md` — and that file had no such field. Following the documentation would have left preflight permanently red. Fixed so either route satisfies it, and the missing field was added.
3. **G5 preflight under-checked.** It verified two of the six OAuth variables `.mcp.json` actually needs, so `--apply` could pass while both Google connectors failed to authenticate at runtime.

All fixed and re-verified. The pattern to note: every one of these was an *inconsistency between independently-written files*, not a bug inside any single file. Parallel builders make that the dominant failure mode, and the fresh-context review is what catches it.

## Human gates — nothing here is agent-closeable

Full detail, owner, and unblock action per gate: `docs/gates.md`.

| Owner | Gates | What it unblocks |
|---|---|---|
| **CTO** | G1 Fly.io org · G2 Postgres · G4 `qm-deploy` repo · G5 Google Workspace + OAuth + SPF/DKIM · G6 Slack app · G9 sign-in sender · G12 verify MCP packages · G13 Gmail send capability | The entire deployment. G1–G6 + G9 are the critical path; the rest are verification. |
| **Founder** | G3 Anthropic key + budget cap · G7 Notion token · G8 agent public name · G11 L1 promotion (later) | Model access, the Applicants DB, and everything candidate-facing that carries the agent's name. |

Two of these are cheap and unblock disproportionately: **G8** (the agent's public name — a decision, not a credential) and **G3**. G11 is not yet applicable; it needs evidence that does not exist until the system runs.

One flag worth the founder's attention: **G13**. The Gmail connector can draft but not send. That is fine today — L0 is drafts-only by design — but it must be closed before any send action-class is promoted, or the promotion will appear to succeed and quietly do nothing.

## Next

P1 — Recruiter agent complete. Its first job is the gap this phase exposed: **nothing in the platform measures draft-acceptance**, yet every trust promotion in ADR-004 depends on that number. The ladder is currently unpromotable by construction. Plan: `docs/plans/p1-recruiter-complete.md`.
