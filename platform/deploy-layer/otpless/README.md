<!-- Purpose: explains what this deploy layer is, how to install it into a qm deployment repo, and the order its pieces load in. -->

# OTPLESS Deploy Layer (for qm)

Everything company-specific that qm's deployment-directory contract expects to live outside qm core: org config, command policy (trust-ladder enforcement), and sandbox additions. Per ADR-001, qm core stays byte-identical to upstream so monthly merges stay small — all OTPLESS divergence lives here instead.

## What's in this layer

| File | What it is |
|---|---|
| `org-config.md` | Org slug, timezone, scopes to create (and in what order), surfaces, skill-pack sources. |
| `command-policy.md` | The trust-ladder (`packs/shared/trust-ladder/SKILL.md`) expressed as enforceable policy: deny-by-default for external sends at L0, hard denials for the never-delegated list, destructive-op denials, per-scope posture. This is what actually stops an agent, not the skill's prose alone. |
| (sandbox additions) | Any OTPLESS-specific sandbox image/tooling changes go here once they exist; none yet as of this writing — flag in the phase report if a scope needs something beyond qm's default sandbox. |

## How this layer reaches a qm deployment

Corrected 2026-08-01 — see `docs/ADRS.md` "ADR-001 correction". There is no `deploy/layers/` directory in qm's real deployment-directory contract (verified against `@yc-software/qm@0.1.4`, `"contract": 1`), so there is nothing to copy this directory *into*. This directory stays here, in `otpless-ai`, as the authored source; it is **compiled** into qm-native config in the deployment repo, not copied wholesale.

1. Stand up the qm deployment repo per `docs/RUNBOOK_DEPLOY.md` (`qm init . --org otpless --target fly`, or AWS equivalent). This materializes `qm.config.jsonc`, `sandbox/skills/<id>/SKILL.md`, `sandbox/tools/<id>/tool.json`, an optional `sandbox/Dockerfile`, and `.codex/skills/deploy-qm/` — nothing under `deploy/layers/`.
2. Compile `org-config.md` and `command-policy.md` (this directory) into `qm.config.jsonc` and the sandbox layer, field by field (mapping below). These markdown files stay the human-and-agent-readable source of truth; `qm.config.jsonc` is the compiled artifact. Keep them in sync: any policy change is authored here first, then recompiled.
3. Verify with the checklist in `docs/RUNBOOK_DEPLOY.md` §4 before considering the deployment live.

### Field mapping: `org-config.md` → `qm.config.jsonc`

| `org-config.md` field | Compiles to | Notes |
|---|---|---|
| Org slug (`otpless`) | `orgId` | Direct. |
| Surfaces (Slack `#hiring`/`#people`, Web) | `services[]` | **Verified against a real `qm init . --org otpless --target fly` run**, which scaffolds the full set: `core` (the agent runtime and API, always required), `slack`, `web-ui`, `admin`, `portal`, and `auth` (the built-in sign-in broker that emails one-time links — drop it only to sign in through an external OIDC provider). Our Slack surface is the `slack` entry; the web surface is `web-ui` + `admin` + `portal`. |
| Skill-pack sources (`packs/shared`, `packs/recruiting`) | `skills[]` and/or `sandbox/skills/<id>/SKILL.md` | `skills[]` points at **directories** of `SKILL.md` mounted into the agent — not a git-URL import, which is what we previously assumed. How a directory living in this repo (`otpless-ai`), rather than the deployment repo, reaches `skills[]` — checked out as a build step, a mounted path, or copied in at `qm init`/CI time — is **unverified**; see `docs/RUNBOOK_DEPLOY.md` §3, `TODO(gate)`. |
| Timezone (`Asia/Kolkata`) | **Not a `qm.config.jsonc` field.** | The verified field list (`orgId`, `publicUrl`, `target`, `modelProvider`, `appPrefix`, `region`, `flyOrg`, `services[]`, `plugins[]`, `skills[]`, per-service `env`/`secretEnv`, `sandbox.app`) has no timezone slot. Timezone-dependent scheduling (standup 08:30 IST, digests, retros) is agent/skill config carried in the packs themselves, not deployment config — restating this for clarity, not a gap to close. |
| Agent public name (G8) | **Not a `qm.config.jsonc` field either.** | Applied post-deployment to Slack handle / mailbox display name / disclosure line; not compiled into org config. |

### `command-policy.md` → qm's policy surface: **UNVERIFIED**

The verified `qm.config.jsonc` field list above has no policy field. Where trust-ladder enforcement (deny-by-default at L0, never-delegated hard denials, destructive-op denials, per-scope posture) actually lands in a real qm deployment — a `plugins[]` entry, a `sandbox/tools/` addition, something else entirely — has not been confirmed against a real config. `TODO(gate)`: verify by running `qm check` against a `qm.config.jsonc` that attempts to express a `command-policy.md` rule, and record what qm accepts (or rejects) here. Until that lands, treat `command-policy.md` as authoritative prose enforced by convention and by whatever the scope's own skills refuse to do — not yet mapped to a qm-enforced field.

## Load order

1. **Org config** first — `orgId` and `services[]` must be compiled and applied before any scope can be created.
2. **Command policy** second — load and activate the policy (trust-ladder enforcement, never-delegated hard denials) *before* the first agent scope is created, so no scope ever exists without enforcement already in place. Given the unverified mapping above, this currently means confirming the policy is expressed *somewhere* qm will enforce before proceeding — not skipping this step because the field is unclear.
3. **Skill packs** third — `packs/shared` (every scope depends on it) then `packs/recruiting` (or the relevant department pack), via `skills[]` / `sandbox/skills/` per the mapping above.
4. **Scopes** last — create each agent scope (e.g. `recruiter`) referencing the already-loaded org config, command policy, and skill packs, plus that agent's own `agent.md` identity/goals config.

Never create a scope before its command policy is active — an unenforced scope, even briefly, is the failure mode ADR-004 exists to prevent.
