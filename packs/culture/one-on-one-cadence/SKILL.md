---
name: one-on-one-cadence
description: |
  Tracks whether a manager and report's 1:1 happened on cadence and nudges when it's overdue —
  never what was discussed. Use when the user says "1:1", "check in on 1:1s", "who's overdue",
  or the weekly cadence cron fires.
---

# 1:1 cadence nudges

This skill's entire vocabulary is "happened" / "hasn't happened yet, N days overdue." It never asks, records, or infers what was discussed — see `../config/playbook.md` §The guardrail of this agent, point 5.

## Trigger

Weekly, cron-fired, once per manager-report pair; or ad hoc: "check in on 1:1s", "has {report} had their 1:1 with {manager}", "who's overdue".

## Inputs

- `../config/goals.md` (the 1:1 cadence expectation — TODO(gate) until Founder/People Lead sets it; this skill cannot compute "overdue" without it and must say so explicitly until then).
- The 1:1 log (Culture tracker, `../config/notion.md`) — last confirmed date per pair.
- Manager-report pairs (Employees DB, read-only, `../config/notion.md`).
- Calendar, if the pair uses one for scheduling (existence/`responseStatus` only, never event content).

## Process

1. If the cadence expectation in `../config/goals.md` is still `TODO(gate)`, report that plainly for every pair rather than computing a false "overdue" against an invented interval.
2. Re-query the 1:1 log fresh for each pair's last-confirmed date. Never assume "still fine" from memory.
3. **Calendar `responseStatus: accepted` means scheduled, not happened.** A held meeting is only logged once the manager explicitly confirms it occurred — never infer occurrence from an accepted invite, a past-dated event, or silence.
4. If the confirmed-date is older than the configured cadence (or no 1:1 has ever been logged for a pair), draft a nudge to the manager asking them to confirm their next/most recent 1:1 with {report} — never to the report, since scheduling a manager's own 1:1 is the manager's action (same pattern as `packs/onboarding/check-ins/SKILL.md`).
5. Present the nudge via the standard `d) draft  s) send  e) edit  ?) something else` prompt (action-class `one_on_one_nudge`, L0).
6. On explicit confirmation from the manager ("done", a date), update the 1:1 log with that date — nothing else. Re-read the record to confirm the write stuck before reporting it done.

## Output contract

One line stating what was checked (cadence expectation status, pairs reviewed), then either: a per-pair "up to date" / "N days overdue, nudge drafted" table, or an explicit statement that no cadence expectation is set yet and no overdue calculation can be made.

## Failure behavior

- Cadence expectation not yet set (`TODO(gate)`) → report this explicitly for every pair; never default to a guessed interval (e.g. "assume weekly") to have something to report.
- Manager doesn't respond to nudges after a reasonable number of cycles → escalate the process gap to the accountable human as a scheduling/process issue, never as a comment on the manager's or the report's performance.
- Any request to record what was discussed, or to infer sentiment/quality from the fact a 1:1 happened → refuse; that is content, and this skill's output contract has no field for it.
- 1:1 log unreachable → report "Culture tracker: couldn't check," exclude that pair from the table rather than guessing its status.
