---
name: recruit-watch
description: |
  Background monitor running as qm crons/watches — new applicant alerts, SLA breach alerts,
  morning digest. Runs unattended, 24x7, server-side. Not invoked by conversational trigger.
---

# Recruit Watch (F9) — qm crons, P2+

## Trigger

Not conversational — runs as scheduled qm crons/watches once deployed (P2), per the schedule bound in `platform/deploy-layer/otpless/crons.md`. Listed here so the recruit router and operators know it exists; do not invoke manually except to test.

## Inputs

- `../config/notion.md`, `../config/user.md`, `../config/playbook.md`
- Notion Applicants data source (polled), Slack #hiring

## Process

A watch loop only observes and surfaces — it never sends anything externally on its own. Every post below is an internal Slack draft/note; anything that would reach a candidate still goes through `../reply`, `../outreach`, `../schedule`, or `../reject` and waits on that action-class's trust-ladder level (`platform/deploy-layer/otpless/command-policy.md` §2 — deny-by-default for external sends at L0).

1. **New applicant watch** — cron `recruit-watch-applicant` (`crons.md`): poll Notion for new Applied rows; on a new row, post a Slack summary to #hiring — 3-sentence tone (background + signal + recommendation), same tone as `../review-applicants`, but PII-minimized per `packs/shared/identity/SKILL.md` §8: candidate name plus one factual one-liner only, never comp, phone, or full application content. No reaction on this post constitutes approval of anything (`docs/ADRS.md` ADR-006) — it is informational.
2. **SLA breach watch** — cron `recruit-watch-sla` (`crons.md`): poll Notion for any candidate >5 days in stage with no flag yet; post a Slack alert per breach, tagging the row's Owner, same PII-minimization rule as above.
3. **Reply watch** — cron `recruit-watch-reply` (`crons.md`): poll Gmail for candidate replies; add each to the next `../triage` run rather than acting immediately. A reply is never marked handled until a successful re-query confirms it, so a missed tick delays triage rather than dropping the candidate.
4. **Morning digest** — cron `recruit-triage-digest` (`crons.md`): run the equivalent of `../triage` Step 1-3 and post the summary to #hiring — no operator prompt needed for this scheduled post specifically, but per `crons.md` the post itself is a draft awaiting approval until the digest action-class earns a trust-ladder promotion, same as every other Slack post to a human channel (`command-policy.md` §2).

## Output contract

Every automated Slack post states what was checked and when, same transparency rule as `../config/playbook.md`, and stays within the PII-minimization rule in `packs/shared/identity/SKILL.md` §8 (name + one factual one-liner, nothing more). Digest and alerts are informational — they never draft or send candidate-facing messages themselves, and no Slack reaction on them is ever treated as an approval (`docs/ADRS.md` ADR-006: approval is recorded by qm's own command-policy gate, never a channel affordance). Drafting candidate-facing content still goes through `../reply`, `../outreach`, `../schedule`, or `../reject` with the standard d/s/e/? gate.

## Failure behavior

If Notion or Gmail polling fails, post a single Slack alert noting the outage and back off — do not spam retries into #hiring. This skill never bypasses the draft-first guardrail: it surfaces, it does not act. Any manual test run must still update the Notion row it touches and re-query to confirm, exactly like every other skill.
