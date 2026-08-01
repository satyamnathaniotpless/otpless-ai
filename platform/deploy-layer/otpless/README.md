<!-- Purpose: explains what this deploy layer is, how to install it into a qm deployment repo, and the order its pieces load in. -->

# OTPLESS Deploy Layer (for qm)

Everything company-specific that qm's deployment-directory contract expects to live outside qm core: org config, command policy (trust-ladder enforcement), and sandbox additions. Per ADR-001, qm core stays byte-identical to upstream so monthly merges stay small — all OTPLESS divergence lives here instead.

## What's in this layer

| File | What it is |
|---|---|
| `org-config.md` | Org slug, timezone, scopes to create (and in what order), surfaces, skill-pack sources. |
| `command-policy.md` | The trust-ladder (`packs/shared/trust-ladder/SKILL.md`) expressed as enforceable policy: deny-by-default for external sends at L0, hard denials for the never-delegated list, destructive-op denials, per-scope posture. This is what actually stops an agent, not the skill's prose alone. |
| (sandbox additions) | Any OTPLESS-specific sandbox image/tooling changes go here once they exist; none yet as of this writing — flag in the phase report if a scope needs something beyond qm's default sandbox. |

## How to copy this into the qm deployment repo

1. Stand up the qm deployment repo per `docs/RUNBOOK_DEPLOY.md` (`qm init . --org otpless --target fly`, or AWS equivalent).
2. Copy this entire directory (`platform/deploy-layer/otpless/`) into the deployment repo at `deploy/layers/otpless/`, matching qm's documented layer-directory contract.
3. Translate `org-config.md` and `command-policy.md` into whatever native qm config format the deployment expects (YAML/JSON per qm's schema) — these markdown files are the human-and-agent-readable source of truth; the qm-native config is the compiled artifact. Keep them in sync: any policy change is authored here first, then compiled.
4. Point qm's skill-pack import at this repo's `packs/shared` and `packs/recruiting` (see `org-config.md` for exact sources).
5. Verify with the checklist in `docs/RUNBOOK_DEPLOY.md` §4 before considering the deployment live.

## Load order

1. **Org config** first — org slug, timezone, and surfaces must exist before any scope can be created.
2. **Command policy** second — load and activate the policy (trust-ladder enforcement, never-delegated hard denials) *before* the first agent scope is created, so no scope ever exists without enforcement already in place.
3. **Skill packs** third — import `packs/shared` (every scope depends on it) then `packs/recruiting` (or the relevant department pack).
4. **Scopes** last — create each agent scope (e.g. `recruiter`) referencing the already-loaded org config, command policy, and skill packs, plus that agent's own `agent.md` identity/goals config.

Never create a scope before its command policy is active — an unenforced scope, even briefly, is the failure mode ADR-004 exists to prevent.
