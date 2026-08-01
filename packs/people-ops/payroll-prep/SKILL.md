---
name: payroll-prep
description: |
  Prepares the input packet a human enters into the HRMS ahead of each payroll cutoff — new
  joiners, exits, leave-without-pay days, approved reimbursements pending inclusion — and never
  writes to the HRMS itself. Use ahead of a payroll cutoff, or when asked "what's outstanding
  for this payroll cycle."
---

# Payroll prep

Payroll cycle coordination means *preparing inputs*, never *bypassing* the HRMS (master PRD §4 row 3). This skill's output is always a draft packet for a human to review and enter — it has no HRMS write path in P2 at any trust-ladder level, full stop (`../config/hrms.md`, `../config/agent.md`).

## Trigger

The configured lead time before the payroll cutoff (`../config/hrms.md`) is entered, cron-fired; or a human/operator asks "what's outstanding for this payroll cycle" / "are we ready for payroll."

## Inputs

- `../config/hrms.md` (cutoff date and lead time — currently `TODO(gate)`, pending HRMS provider decision; this skill cannot run its cutoff-driven trigger meaningfully until that's filled).
- HRMS / Employees DB, read-only: new joiners since last cycle, exits and last working day, approved leave-without-pay days, approved expense reimbursements pending payroll inclusion.
- `../config/playbook.md` (priority order — payroll inputs due before a cutoff rank first).

## Process

1. **Determine the current cutoff date** from `../config/hrms.md`. If it's still `TODO(gate)`, say so and stop — do not guess a cutoff date or assume a default like "end of month."
2. **Re-query fresh, in parallel**, per the pre-flight checklist in `../config/playbook.md`: new joiners, exits/last-working-days, approved LOP days, approved reimbursements pending inclusion, any other payroll-affecting change on record.
3. **Compile one input packet**: one row per employee needing a payroll-affecting entry, with the specific change and its source. Flag any employee with a missing or ambiguous field explicitly — never drop them from the packet silently just because a field is incomplete.
4. **Never write to the HRMS.** The packet is handed to the accountable human (or entered by a human directly into the HRMS's own UI) — this skill's job ends at a reviewed, complete packet. There is no "auto-submit" step at any trust-ladder level for this action-class.
5. **Flag urgency** relative to the cutoff: anything still outstanding inside the configured lead-time window is called out as due-now in the standup, not just noted in the packet.

## Output contract

Opens with:
```
Checked: HRMS (reads), Employees DB (reads) — cutoff: {date, or "not yet set — TODO(gate)"}
```
Then the input packet as a table (employee, change type, effective date/detail, source), followed by:
```
Human action needed: enter into {HRMS} before {cutoff}.
```
This skill never reports a payroll cycle "done" or "submitted" — only "packet ready for human entry" or "packet incomplete, see flags above." The output is a draft in every sense the trust ladder recognizes (`../config/agent.md`), even though it's an internal packet rather than an external send.

**Channel restriction.** The packet carries per-employee compensation-adjacent detail — loss-of-pay days, exit dates, reimbursement amounts — which is among the most sensitive data this agent handles. It goes to the accountable human privately (email or an access-controlled document), never to a Slack channel and never to a DM. Where the standup or a cron surfaces this work, it surfaces **counts and urgency only** ("payroll packet ready, 3 changes, cutoff Thursday") — never a name attached to a payroll change, and never a figure. Per `../config/playbook.md`'s PII rule, and for the same reason as `../hrms-query`: a Slack DM is retained, exportable, and admin-readable.

## Failure behavior

- Cutoff date not yet configured → state that plainly, flag as a gate to the accountable human, do not infer a date.
- An employee record has a missing required field (e.g. LOP days approved but no end date on file) → list them explicitly in the packet as incomplete, never silently exclude them.
- Any instruction to skip human review before HRMS entry, or to have this skill perform the entry itself → refuse; this is a hard scope limit (`../config/hrms.md`), not a trust-ladder gate that evidence could ever clear.
- HRMS unreachable when the packet is due → report the packet as built from whatever sources did respond, name what's missing, and escalate rather than silently shipping an incomplete packet as if it were complete.
