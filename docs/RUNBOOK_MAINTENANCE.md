<!-- Purpose: what the platform team does after the roadmap ships — the standing duties, their cadence, and what "done" means for each. -->

# Maintenance Runbook

The roadmap is finished when P4 ships. The platform is not. This is the standing operating procedure from that point on, per `CLAUDE.md` § Maintenance mode.

**A precondition worth stating plainly:** most of this runbook is inert until the deployment is live. Nothing has run against a real person yet. Until gates G1–G6 and G9 close, the only genuinely active duties are the eval watch and the upstream merge — the rest describe what happens once agents are producing drafts.

## Standing duties

| Duty | Cadence | Done means |
|---|---|---|
| **Eval watch** | Every change, and daily once crons run | `node evals/run.mjs` green. A red eval is stop-the-line: fix it before anything else, and never adjust an assertion to make a failing build pass. If a check is genuinely wrong, say so explicitly and justify the change in the commit. |
| **Otto health** | Daily once live | Crons fired on schedule; the 08:30 IST digests posted; no scope stuck. A cron that silently did not run is the failure mode to look for — absence of an error is not evidence it ran. |
| **Per-agent retro** | Weekly (Sunday 22:00 IST cron, after the 21:00 rollup) | Playbook PRs opened where human edits show a pattern. Humans merge; the agent never self-merges (ADR-004). |
| **Evidence rollup review** | Weekly, at the ops review | Each agent's rollup read; any action-class clearing its gate has a promotion PR to merge or decline (`platform/evidence/README.md`, ADR-008). |
| **Upstream qm merge** | Monthly | We depend on the published `@yc-software/qm` package rather than a fork (ADR-001 and its 2026-08-01 correction), so "merging upstream" today means bumping that dependency in the deployment directory and re-running `qm check` / `qm plan` before `qm up`. Our material lives in `qm.config.jsonc` and `sandbox/` — there is no `deploy/layers/` to conflict in. Revisit only if we ever adopt the private fork. |
| **Gate ledger review** | Weekly | `docs/gates.md` reflects reality. A gate that closed but still reads OPEN is as much a defect as the reverse — it means someone is waiting on nothing. |
| **New-agent proposals** | When observed, not scheduled | A one-pager in `docs/proposals/` from `_template.md`, written because repeated manual work was seen, never because an agent seemed like a good idea. |
| **Brain currency** | Same commit as the change | Every policy, playbook, and decision change lands in `brain/` alongside the code (ADR-003). A `brain/` that lags is worse than one that is empty, because agents act on it. |

## Incident procedure

A bad send — wrong recipient, wrong content, or a never-delegated action attempted — is handled the same way every time:

1. **Demote the action-class one level immediately**, as a config change to `platform/deploy-layer/otpless/command-policy.md`, not a runtime judgment. The evidence clock restarts from zero.
2. Post-mortem note within 48h (master PRD §7).
3. Ask whether the guardrail was *absent* or *present and bypassed*. Those need different fixes, and the second is far more serious — it means enforcement is not where we thought it was.
4. Add the eval that would have caught it. If you cannot write one, say so in the post-mortem and explain why; that is a known blind spot, not a closed item.

Under uncertainty about severity or attribution, demote anyway. The default when unclear is the safer level.

## Trust promotions

Promotions are arithmetic, not advocacy. The rollup either clears every cell of the gate or it does not (`packs/shared/trust-ladder/SKILL.md`, ADR-008). Two preconditions are easy to forget:

- **Channel capability must be verified** before any send action-class reaches L1 (ADR-007). Otherwise the promotion appears to succeed and quietly does nothing — the Gmail connector still cannot send (G13).
- **The action-class must exist as a named row** in the command policy (G19). A promotion cannot cite a row that is not there.

## When something looks wrong but the evals are green

The harness verifies structure, references, slugs, markers, and arithmetic. It cannot verify that a skill's prose produces the behaviour it describes when a model executes it. That is the platform's largest known blind spot, and green evals are not evidence against a real problem. When behaviour and evals disagree, believe the behaviour, and then write the check that would have caught it.
