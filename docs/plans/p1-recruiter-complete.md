<!-- Purpose: build plan for P1 — the Recruiter agent complete, including the measurement layer the trust ladder depends on. -->

# Plan — P1 Recruiter Agent Complete

**Milestone:** README Status "Recruiter agent on qm, trust ladder L0 → L1".

## The gap that matters

ADR-004 and `packs/shared/trust-ladder` gate every promotion on "≥95% of that action-class's drafts sent unedited over a trailing window." **Nothing in the platform produces that number.** The ladder is currently unpromotable by construction — L0 forever, not by policy but by missing instrumentation. P1's first job is the measurement layer; the rest of P1 is the recruiter's remaining surface area.

## Decisions

1. **Two-tier evidence, split on PII.** The raw draft-outcome ledger (which draft, which candidate, what the human changed) lives in qm scope storage — it is linkable to a person and must never enter git (PRD §8.6, DPDP). The **weekly rollup is counts only** (action-class × window × drafts × unedited × edited × discarded × incidents) and *does* land in git, because that is the artifact a promotion PR cites and a human audits.
2. **Measurement is shared, not recruiting-specific.** `packs/shared/metrics/` — every agent in every future department earns autonomy on the same instrument (ADR-005).
3. **A promotion is a generated PR body, not a prose claim.** The rollup file plus a fixed template produces the evidence block; if the numbers do not clear the gate, the skill refuses to open the PR rather than arguing for an exception.
4. **Edit classification is coarse on purpose.** unedited / light-edit / rewrite / discarded. Finer granularity invites the agent to score itself generously; the retro skill reads the same buckets to propose playbook changes.

## Build list

| Owner | Files | Notes |
|---|---|---|
| architect→builder | `packs/shared/metrics/SKILL.md`, `platform/evidence/README.md`, `platform/evidence/_rollup-template.md`, `packs/shared/config/evidence.md.example` | The measurement layer; PII split is the load-bearing rule |
| builder | `packs/shared/retro/SKILL.md` update (consume rollup buckets), `packs/shared/trust-ladder/SKILL.md` update (cite the rollup as *the* evidence source) | Edit, do not regenerate |
| builder | `packs/recruiting/config/user.md.example` review, shadow-mode operating doc `docs/OPERATING_RECRUITER.md` | The doc the Founding Recruiter inherits on day one (PRD goal 4) |
| evaluator | fixtures for F5 scheduling, F6 rejection tone by stage, F8 status conflation, promotion-gate arithmetic | The promotion math must have a red-when-broken test |
| librarian | brain/, CHANGELOG, README Status | Same commit |

## Evals that prove it

- Promotion arithmetic: a rollup at 94.9% must fail the L1 gate; 95.0% passes; a rollup with any incident in the window fails L2 regardless of rate.
- Rollup schema: no field capable of carrying a person's identity.
- Rejection tone: an Applied-stage rejection fixture must not use post-onsite language, and vice versa.
- Status conflation: a fixture where Calendar says `needsAction` must never render as "scheduled"/"confirmed".

## Human gates this plan creates

- **Trust-ladder L1 promotion approval** (already G-listed) — now with a defined evidence artifact the founder can actually audit before merging.
