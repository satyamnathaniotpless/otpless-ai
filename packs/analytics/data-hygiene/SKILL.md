---
name: data-hygiene
description: |
  Checks data quality across the Notion/HRMS spine — required-field completeness, duplicate
  rows, cross-system disagreement, and stale timestamps that block a metric elsewhere in this
  pack. Use for "data hygiene", "is our data clean", "any duplicate rows", or as a section of
  the weekly/monthly People report. Read-only: this skill never writes a fix, only flags one.
---

# Data hygiene

The People Analyst "owns data hygiene across the Notion/HRMS spine" (master PRD §4) in the sense of *detecting and flagging* it — this pack has no write path to the Applicants DB, Employees DB, Policies wiki, or HRMS at any trust-ladder level (see `../config/notion.md`). A found issue is escalated to whichever agent/human owns that write surface (Recruiter for Applicants DB, Onboarder for Employees DB, the accountable human for cross-system disagreement); this skill never edits a row itself.

## Scope note — two different outputs, deliberately

This skill produces two different kinds of output, and they are not interchangeable:

1. **Leadership-facing (in the weekly/monthly report, via `../report`)**: **counts only**, by category — "7 Applicants-DB rows missing a required field," "2 duplicate-candidate pairs detected." No row-level detail, ever, in this output. This is the aggregate-only guardrail applying here same as everywhere else in this pack.
2. **Fix-it escalation (to the record-owning agent/accountable human, never to #people or the leadership report)**: row-level enough to be actionable — which row, which field is missing or disagrees. This is bounded by the *existing* PII rules in `platform/contracts/notion.md` / `platform/contracts/notion-employees.md` / `platform/contracts/hrms.md` (name + one factual one-liner, no PII beyond that), not loosened by this skill — it is an operational fix-it note, the same kind of thing F7 already sends when it flags a specific stale candidate to the recruiter, not a leadership analytic claim about a person.

This skill does **not** re-check Policies-wiki mirror-drift — that's already People-Ops's `policy-qa` skill's job (`packs/people-ops/policy-qa/SKILL.md`, per `platform/contracts/notion-employees.md`'s citation-requirement rules); duplicating it here would risk two disagreeing verdicts on the same drift.

## Trigger

"data hygiene", "is our data clean", "any duplicate rows", or invoked by `../report` as a section.

## Inputs

- Notion Applicants DB (`packs/recruiting/config/notion.md`), Notion Employees DB (`packs/onboarding/config/notion.md`, once it exists), HRMS (`platform/contracts/hrms.md`, read-only, once connected) — all read fresh, never cached.
- `../config/metrics.md` (hygiene check categories).

## Process

1. Re-query each source fresh.
2. **Required-field completeness**: for the Applicants DB, flag rows missing Stage, Owner, Source, or Applied date. For the Employees DB (once it exists), flag rows missing Manager, Start date, or Lifecycle stage.
3. **Duplicate/near-duplicate detection**: same email or phone across multiple Applicants rows; same name + start date across multiple Employees rows.
4. **Cross-system disagreement**: for a field both the Employees DB and HRMS claim (name, start date, employment status), compare values per employee. Per `platform/contracts/hrms.md`'s authority split (HRMS authoritative for payroll/compliance fields, Notion Employees DB authoritative for lifecycle/coordination fields), a disagreement is never resolved by picking one side — it's flagged as-is to the accountable human.
5. **Stale timestamps**: any Stage-change or Lifecycle-stage-change timestamp missing or clearly stale enough to block `../funnel-source` or `../headcount` from computing a metric — flag it, and note which downstream metric it affected.
6. **Compose two outputs** per the Scope note above: the counts-only leadership section, and (separately, if anything was found) the row-level fix-it escalation to the appropriate owner.

## Output contract

**Leadership section**: a table — category, count, trend vs. last period. No row-level detail. Suppression per `../config/metrics.md` applies to this output the same as any other leadership-facing section, though in practice hygiene counts are rarely small enough to trigger it.

**Fix-it escalation** (separate, internal, not part of the report): one line per flagged row — which system, which row/field, which check it failed, name + one factual one-liner (per the existing contract PII rules) — addressed to the owning agent's accountable human, never posted to #people.

## Failure behavior

- A source is unreachable → exclude it from this run's check entirely and say so in the leadership section ("HRMS: couldn't check this period"), never report zero flags from a system that wasn't actually checked.
- Ambiguous which row is authoritative in a duplicate pair → flag both to the owning human, never guess or merge.
- Asked to have this skill fix a row directly, at any trust-ladder level → refuse; this pack has no write path to any of these systems, full stop, not a promotion-eligible gap.
- Asked to re-check Policies-wiki drift here → decline and point to `packs/people-ops/policy-qa/SKILL.md`, which already owns that check.
