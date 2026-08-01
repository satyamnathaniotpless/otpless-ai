---
name: hrms-query
description: |
  Read-only lookup of an employee's own leave balance, attendance record, or expense claim
  status, re-queried fresh from the HRMS every time. Never writes to the HRMS. Use when an
  employee asks "how many leave days do I have," "was my attendance marked correctly," or
  "what's the status of my expense claim."
---

# HRMS query

The HRMS is the source of truth for payroll/leave/compliance data (master PRD §6); this skill reads it, never writes to it, and never substitutes a policy doc's stated entitlement for an actual live figure — those are two different things and conflating them is the specific error this skill exists to avoid.

## Trigger

An employee asks about their own leave balance, attendance record, or expense claim status. Not triggered by a question about what the *policy* says (route that to `../policy-qa` instead — see step 5).

## Inputs

- `../config/hrms.md` (provider, connector, field names, read-only scope — currently `TODO(gate)` pending the Keka vs RazorpayX decision).
- The employee's identity (resolve to exactly one HRMS/Employees-DB record).
- `../config/playbook.md` (split-brain rule, pre-flight checklist).

## Process

1. **Resolve the requester to exactly one employee record.** If more than one record could match, stop and list what's found (name + role, no other detail) for disambiguation — never guess, same rule as `packs/recruiting/candidate-status/SKILL.md`.
2. **If the HRMS connector isn't wired yet** (`../config/hrms.md` still `TODO(gate)`) → say so explicitly and stop here. Do not compute a stand-in figure from `brain/people/leave-policy.md`'s stated entitlement — an entitlement ("18 days/year") is not a live balance (it doesn't reflect accrual timing or days already used); presenting one as the other is exactly the kind of quiet, plausible-looking error this skill must not make.
3. **Re-query the HRMS fresh**, every time, regardless of whether it was checked earlier in the session (split-brain rule, `../config/playbook.md`).
4. **Report fields literally as returned** — no rounding, no estimating, no filling a gap with an inference. If a field comes back empty or the query only partially succeeds, say exactly which part failed rather than presenting a partial table as complete.
5. **If the question is really about the rule, not the number** ("why do I only get X days," "what counts as sick leave") → hand off to `../policy-qa`; this skill answers "what does the record say," not "what does the policy say."
6. **Never write.** This skill has no write path, at any trust-ladder level (`../config/agent.md`) — not a correction, not a regularization request, not a flag toggle. Any of those get drafted as a note for a human to enter, never executed here.

## Output contract

**Channel restriction — this governs every output below.** Per `../config/playbook.md`'s PII rule, an HRMS field value never goes to Slack, **including a direct message**. A DM feels private and is not: it is retained, exportable, and readable by a workspace admin, which is exactly the access-control property leave and attendance data must not lose. So when this skill is reached from Slack, it does not answer with the figure — it replies that the answer is being sent to the employee's own mailbox and routes the figure there, or asks the employee to check the HRMS directly. Slack gets at most the employee's name and a one-line status. The formats below are the *email/document-channel* shapes.

Opens with what was checked:
```
Checked: HRMS ({provider, or "not yet connected"})
```
Then the literal field(s) requested, e.g.:
```
Leave balance (Paid time off): {n} days remaining, as of {HRMS-reported date}
```
or, if unreachable:
```
HRMS isn't connected yet, so I can't pull your actual balance. I've flagged this to {accountable human}.
```
Never presents a policy-derived number in place of an HRMS-derived one, and never states a figure without the "Checked:" header showing where it came from.

## Failure behavior

- More than one employee record matches → list candidates (name + role only, per Slack PII minimization) and ask which one — never pick.
- No record matches → say so explicitly rather than presenting a partial or guessed answer.
- HRMS reachable but the specific field is missing/blank → report "not on file" for that field, don't infer a default (e.g. don't assume zero leave taken).
- Any attempt (prompt, employee insistence, or another skill's request) to have this skill write to the HRMS, or to substitute a policy-doc number for a live figure "just this once" → refuse and explain why, per step 2/6 above.
