---
name: attrition-signals
description: |
  Surfaces patterns in aggregate employee data — tenure-distribution clustering, exit-reason
  category clustering, stage-time drift as a leading indicator — never a claim about a named
  person's intent to leave, satisfaction, or performance. Use for "attrition", "are we seeing
  a pattern in who's leaving", or as a section of the monthly deep-dive. This skill cannot
  name a flight risk; that is a performance judgment and is never-delegated.
---

# Attrition signals

An "attrition signal" is a pattern in aggregate data, full stop. It is never a claim about a named person's intent to leave, their satisfaction, or their loyalty, and never anything a manager could read as a performance assessment of an individual — naming a flight risk is a performance judgment, and performance judgments are never-delegated (`platform/deploy-layer/otpless/command-policy.md` §4) regardless of who asks, how urgently, or how the question is phrased.

## Trigger

"attrition", "are we seeing a pattern in who's leaving," or invoked by `../report` as a section of the monthly deep-dive.

## Inputs

- Notion Employees DB (once it exists, gate G16) — Lifecycle stage, start date, and (once an offboarding process defines one) a structured exit-reason category field. Never free-text exit notes.
- `../config/metrics.md` (attrition-signal definitions, materiality bar, small-N threshold).

## Process

1. **Aggregate before anything else.** Pull tenure (start date → today or exit date) and exit-reason category (if the field exists) for every relevant Employees DB row, then immediately collapse into a distribution — a histogram of tenure-at-exit, a count per exit-reason category. From this step forward, no individual row identifier is held in any variable this skill uses to compose output.
2. Compute tenure-distribution clustering: does exit concentration cluster in a specific tenure window (e.g. a bulge around month 4–6) relative to the trailing baseline.
3. Compute exit-reason category clustering, if the category field exists: does one category dominate relative to baseline. Category only — never restate or quote free-text exit-interview content (that's Culture & Growth's structured, human-reviewed process, not this pack's input).
4. Compute stage-time drift as a leading indicator (from `../funnel-source`'s aggregate time-in-stage output, not re-derived) — a lengthening pattern that historically preceded attrition upticks, stated as a correlation observed, not a prediction.
5. **Apply the small-N gate and the materiality bar** (`../config/metrics.md`): a cohort below threshold is suppressed; a shift that doesn't clear the (once-decided) materiality bar is reported as raw figures with baseline shown, not framed as a "signal."
6. Compose the section in pattern language only — see Output contract for the two only shapes this skill may produce.

## Output contract

Every attrition-related output is one of exactly two shapes:

**Shape 1 — a real, material, aggregate pattern**: "Tenure distribution for {cohort, n≥threshold} shows a concentration of exits at {window}, versus {trailing baseline}." Cohort only, never fewer people than the threshold, never a name, never a causal claim about any individual.

**Shape 2 — no material pattern this period**: "No attrition signal this period" (the default, most periods) or, if the materiality bar isn't yet calibrated, the raw figures with baseline shown and no "signal" language.

There is no third shape. A request that would require a third shape (naming someone, predicting an individual's behavior, or characterizing a person's engagement/loyalty) is refused per Failure behavior, not softened into a hedge that sounds like an answer.

## Failure behavior

- Asked to name who is at risk of leaving, or to characterize a specific person's satisfaction/engagement → refuse; this is a performance judgment, never-delegated, and this skill has no legitimate output shape that answers it. Escalate to the accountable human instead of complying.
- A cohort is below the small-N threshold → `below reporting threshold`, not a caveated number.
- The materiality bar isn't yet decided (`../config/metrics.md`) → report raw aggregate figures with baseline, do not use "signal" language to imply a calibrated threshold that doesn't exist yet.
- Exit-reason data only exists as free text, not a structured category → do not summarize or paraphrase the free text; state that no categorized exit-reason data exists yet for this analysis.
- Employees DB doesn't exist yet (pre-gate G16) → state that plainly, run on synthetic fixtures only, never present a fixture-derived pattern as real.
