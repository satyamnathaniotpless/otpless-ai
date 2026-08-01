---
name: recruit-watch
description: |
  Background monitor running as qm crons/watches — new applicant alerts, SLA breach alerts,
  morning digest. Runs unattended, 24x7, server-side. Not invoked by conversational trigger.
---

# Recruit Watch (F9) — qm crons, P2+

## Trigger

Not conversational — runs as scheduled qm crons/watches once deployed (P2). Listed here so the recruit router and operators know it exists; do not invoke manually except to test.

## Inputs

- `../config/notion.md`, `../config/user.md`, `../config/playbook.md`
- Notion Applicants data source (polled), Slack #hiring

## Process

1. **New applicant watch** (near-continuous, any hour): poll Notion for new Applied rows; on a new row, post a Slack summary to #hiring within minutes — 3-sentence format (background + signal + recommendation), same format as `../review-applicants`.
2. **SLA breach watch** (hourly): poll Notion for any candidate >5 days in stage with no flag yet; post a Slack alert per breach, tagging the row's Owner.
3. **Reply watch** (near-continuous): poll Gmail for candidate replies; add each to the next `../triage` run rather than acting immediately.
4. **Morning digest** (daily, 8:30 IST): run the equivalent of `../triage` Step 1-3 and post the summary to #hiring automatically — no operator prompt needed for this scheduled post specifically.

## Output contract

Every automated Slack post states what was checked and when, same transparency rule as `../config/playbook.md`. Digest and alerts are informational — they never draft or send candidate-facing messages themselves; drafting still goes through `../reply`, `../outreach`, `../schedule`, or `../reject` with the standard d/s/e/? gate.

## Failure behavior

If Notion or Gmail polling fails, post a single Slack alert noting the outage and back off — do not spam retries into #hiring. This skill never bypasses the draft-first guardrail: it surfaces, it does not act. Any manual test run must still update the Notion row it touches and re-query to confirm, exactly like every other skill.
