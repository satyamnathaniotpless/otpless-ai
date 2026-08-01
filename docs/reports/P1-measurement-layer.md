<!-- Purpose: phase report for P1 — the measurement layer that makes the trust ladder real, plus the manual an operator runs the agent from. -->

# Phase report — P1 Measurement Layer + Operator Manual · 2026-08-01

**Status:** shipped. Evals green (0 failures, 10 check groups). The Recruiter agent is **not** on qm and no trust promotion has occurred — both require the deployment, which is credential-gated. What shipped is everything that makes a promotion *possible and auditable* once the system runs.

## The problem this phase existed to fix

ADR-004 gates every autonomy promotion on "≥95% of that action-class's drafts sent unedited over a trailing window." Nothing in the platform produced that number. The trust ladder was therefore unpromotable by construction — the agent would have sat at L0 forever, not because policy said so but because the instrument was missing. A ladder nobody can climb is worse than no ladder: it reads as governance while doing nothing.

## What shipped

**The measurement layer** (`packs/shared/metrics/`, `platform/evidence/`). Each draft resolves into one of four coarse buckets — `sent_unedited`, `sent_light_edit`, `sent_rewrite`, `discarded` — and a weekly rollup turns those into the rate the gate reads. It is in `packs/shared/`, not in recruiting, because every future agent in every future department earns autonomy on the same instrument.

**Three judgment calls inside it**, all recorded in ADR-008 so they can be argued with rather than discovered later:

- *Discarded drafts count in the denominator.* A draft the human threw away is a failed draft, not an absent one. This is the single easiest place to accidentally flatter the number, and the eval suite has a fixture that fails if `discarded` is ever dropped.
- *A 20-draft minimum sample.* Without a floor, one accepted draft is a 100% acceptance rate and the 95% gate is theatre. Below the floor the class reports *insufficient evidence*, which is deliberately a different outcome from a failing rate.
- *Counts in git, identities in qm.* The raw ledger is candidate-linkable, so it stays in qm scope storage and never enters a repo. The rollup is counts only — and that is enforced by a check, not by prose (see below).

**Promotion is now arithmetic, not advocacy.** The metrics skill owns opening the promotion PR, cites the rollup, and **refuses to open one at all** when any cell of the gate fails — reporting which cell and by how much instead of arguing for an exception. Promotion PRs and playbook PRs are deliberately separate: a human should never be asked to approve a tone change and an autonomy increase in one review.

**The operator's manual** (`docs/OPERATING_RECRUITER.md`) — the daily loop, all ten recruiting skills, how to change the system without code (a new role is one file), what happens when it is wrong, and today's real limitations stated plainly rather than glossed.

**Two missing crons found and bound.** PRD F9 specifies a candidate-reply watch; no cron had ever been bound for it. Added `recruit-watch-reply`, and `recruit-evidence-rollup` ordered to run before the retro that reads it.

**Evals 8 → 10 check groups.** The promotion arithmetic now has 10 fixtures, weighted at the boundaries where the likely bugs live: exactly 95.0% (a `>` instead of `>=` denies it), sample of exactly 20, window of exactly 14 days, and a case where discarded drafts are what drag the rate under. Each was proven to go red by breaking the operator and confirming the right fixture flipped. The evidence PII guard enforces ADR-008 structurally — email/phone/UUID shapes rejected, and rollup field and column names whitelisted against the schema, so "add a `candidate_email` column" is not a bypass.

## What review and evals caught

- **A stale claim I caused.** A builder correctly wrote that the reply-watch leg had no cron; I then added that cron an hour later and did not update the sibling file. The fresh reviewer caught the contradiction. Worth noting because it is the same failure mode as P0's blockers — *inconsistency between independently-written files*, which is the dominant risk when work runs in parallel, and the reason the fresh-context review is non-negotiable rather than ceremonial.
- **A mechanism described in two places that existed in neither.** Both the trust ladder and the cron table said promotion PRs come "typically via the retro cycle," but retro only ever opened playbook PRs. Nothing implemented the step. Fixed by giving it to the skill that actually holds the evidence.
- **A bad citation** to a PRD subsection that does not exist, and an "appears identically" claim about the approval prompt that was false in one of five files. Both trivial; both would have cost a reader their trust in the document.
- **A stray `.bak` I committed** by `git add`-ing a directory. Removed, ignored, and the harness now fails on recurrence.

## Human gates

Unchanged from P0 — nothing in this phase closed or added one. Full ledger: `docs/gates.md`. The critical path is still **G1–G6 + G9** (CTO) for the deployment and **G3, G7** (Founder) for model and Notion access. **G8** (the agent's public name) remains the cheapest high-leverage unblock: it is a decision, not a credential, and it is currently a placeholder token in every candidate-facing template.

**G11 is now well-defined for the first time.** The L1 promotion gate previously asked a human to approve a promotion with no artifact to audit. It now has one: a counts-only rollup, a stated formula, and a decision table. When the founder is eventually asked to merge a promotion, the question will be arithmetic they can check in a minute.

## Honest limitations

- The evidence layer has never processed a real draft. The PII guard has only ever run against the template and schema docs, not a generated rollup — it must be re-verified when the first real one lands.
- The 20-draft floor is an estimate of what is reachable in a two-week window at OTPLESS's volume. It is the number most likely to need revising once real traffic exists, in either direction.
- The rollup's PII guard catches person-identifying *shapes* (email, phone, UUID) and unauthorized *columns*. A bare name typed into a prose field would pass. Closing that reliably needs more than a zero-dependency harness.

## Next

P2 — Onboarder and People-Ops agents. The commissioning test of ADR-005: if the platform is what it claims, a second and third agent are a new pack plus a scope file, and the shared layer — identity, trust ladder, metrics, standup, retro — is imported unchanged. If either agent needs a change to `packs/shared/`, that is a finding worth reporting, not a detail to quietly patch.
