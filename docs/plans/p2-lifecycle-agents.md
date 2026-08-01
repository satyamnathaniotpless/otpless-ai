<!-- Purpose: build plan for P2 — Onboarder and People-Ops agents, and the honest test of whether the platform generalizes. -->

# Plan — P2 Lifecycle Agents

**Milestone:** README Status "Onboarder + People-Ops agents (P2)". Master PRD §4 agents #2 and #3, §8 P2 row.

## What this phase is really testing

ADR-005 claims a new agent costs a pack plus a scope file, and that `packs/shared` — identity, trust ladder, metrics, standup, retro — is imported unchanged. P2 is the first time that claim meets a department that is not recruiting. **If either agent requires a change to `packs/shared`, that is the headline finding of the phase, not a detail to patch quietly.** Builders are instructed to report such a need rather than satisfy it.

## Decisions

1. **Two packs, not one "people" pack.** Onboarder and People-Ops have different trust profiles (People-Ops runs Strict on HRMS writes per command policy §1) and different data. One pack per agent keeps scopes cleanly separable.
2. **People-Ops answers only from the Policies wiki, never from model knowledge.** This is the load-bearing guardrail of the agent — an improvised leave-policy answer is worse than no answer. Every response cites its source page, and no-citation means no answer.
3. **HRMS is read-only in P2, and unchosen.** Keka vs RazorpayX is an open PRD question with no decision. Build the contract against the *capability* (read leave balance, prepare payroll inputs), mark the provider as a gate, and never write.
4. **Onboarding checklists are data.** `checklists/_template.md` instantiated per role/level, exactly like `jobs/_template.md`. A new hire type is one file.
5. **The brain gets the policies, not the pack.** Policy *content* lives in `brain/people/` (ADR-003, canonical); the pack holds process for answering from it. Seeds there are marked DRAFT and stay DRAFT — real policy text is a founder gate.

## Build list

| Owner | Paths (disjoint) |
|---|---|
| builder A | `packs/onboarding/**` — skills + config + checklist template |
| builder B | `packs/people-ops/**` — skills + config + letters templates |
| integrator | `platform/contracts/{hrms,notion-employees}.md`, `platform/deploy-layer/otpless/scopes/{onboarder,people-ops}.md`, crons rows |
| builder C | `brain/people/**` — policies index, onboarding knowledge, DRAFT markers honoured |
| reviewer ×2 | fresh, one per pack |
| evaluator | structure/shape/lint coverage for two new packs; citation-required check for People-Ops |

## Evals that prove it

- Both new packs pass the existing generic checks (skill shape, disclosure, cross-reference) with **no new special-casing** — if the harness needs per-pack exceptions, the packs are not generic.
- People-Ops: a policy-answer skill must structurally require a citation; a fixture asserts an uncited answer is a failure.
- Never-delegated still holds across both packs (terminations and comp are People-Ops-adjacent and the most likely place for leakage).
- Onboarding checklist template is instantiable — a second role file requires no skill change.

## Human gates this plan creates

- HRMS provider decision (Keka vs RazorpayX) — Founder/CTO, blocks any real HRMS wiring.
- Employees DB + Policies wiki creation in Notion — Founder.
- Real policy content (leave, expense, letters) — Founder; seeds stay DRAFT until then.
- BGV vendor (SpringVerify/OnGrid) account — CTO.
