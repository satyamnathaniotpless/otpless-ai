---
name: onboard-watch
description: |
  Background scan across every active hire (offer-accept through day 90) — categorizes what
  needs attention in priority order, for the daily digest or an on-demand "what needs attention"
  ask. Use when the user says "onboarding triage", "what needs attention", "start of day", or
  the daily 08:30 IST digest cron fires.
---

# Onboard watch — digest and background monitoring

## Trigger

Daily, 08:30 IST, cron-fired digest to #people; plus immediate alerts whenever a hard date-driven gate is newly at risk (BGV/paperwork/provisioning incomplete inside 3 business days of a start date — see `../day-one`); or ad hoc: "onboarding triage", "what needs attention", "what's going on with onboarding".

## Inputs

- `../config/playbook.md` (priority order, escalation rules)
- Every hire currently between "offer accepted" and "day 90" — Employees DB once it exists (`../config/notion.md`), or the interim checklist-tracking docs otherwise
- Calendar (upcoming day-one events and 30/60/90 invites)
- Message threads (for touchpoint recency)

## Process

1. Re-query fresh across every active hire — never from memory, per the split-brain rule in `../config/playbook.md`.
2. Categorize every hire's open items into exactly one bucket per item, priority order:
   1. Escalations already flagged (comp/offer/policy question, counteroffer signal, BGV flag) — surface these first, always
   2. Day-one readiness gates at risk (start date within 3 business days, any checklist item incomplete)
   3. Notice-period touchpoints due or overdue (≥7 days since last contact)
   4. BGV / paperwork / provisioning nudges due
   5. 30/60/90 check-ins due to be scheduled
   6. New handoffs awaiting acknowledgment and checklist instantiation
3. Present counts + top items only per category (summary, not a full table) — Q&A-driven, never a firehose.
4. On the daily cron, post this summary to #people. On an ad hoc ask, present it and then ask which category the operator wants to focus on.
5. On pick, re-query that category's sources fresh again, then hand off to the matching sub-skill (`../notice-period-warmth`, `../bgv`, `../paperwork`, `../provisioning`, `../day-one`, `../check-ins`, `../buddy-assignment`) for the detailed table and action.
6. This skill never drafts or sends itself — any action always goes through the sub-skill's own approval gate.

## Output contract

Opens with `Checked: {sources queried}` (or notes what was skipped and why). Then the 6-category summary table with counts, posted to #people on the daily cron or shown inline on an ad hoc ask. No hire with an escalation flag may be missing from category 1.

## Failure behavior

If a source is unreachable, note it explicitly in the header ("Skipped: Calendar — unavailable") and proceed with the rest rather than blocking. Never present a summary without stating what was checked. If the digest would otherwise be empty (no active hires), post that explicitly rather than staying silent — silence reads as a dead cron.
