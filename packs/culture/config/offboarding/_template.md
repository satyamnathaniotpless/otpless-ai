<!-- CONFIG-STATUS: DRAFT -->
<!-- Purpose: blank offboarding + exit-interview definition for one exit type — copy this to add a new exit type; a new exit type is one file (ADR-005: data, not process). -->

> ⚠️ **DRAFT — NOT APPROVED. `../../offboarding/SKILL.md` and `../../exit-interview/SKILL.md` refuse to run this on a real employee until Status is Approved.** Flip both this banner and the `CONFIG-STATUS` comment to `APPROVED` in the same edit a human (Founder/People Lead) signs off both the checklist and the question set — never before, and never by the agent itself.

# Exit type: {exit-type-name}

**Status:** DRAFT — not yet approved for use on a real employee.
**Owner:** {who is accountable, e.g. "Founder" or "People Lead"}
**Approved by:** {left blank until approved}
**Approved date:** {left blank until approved}

## When this template applies

{e.g. "Employee-initiated resignation, standard notice period." Be specific enough that `../../offboarding/SKILL.md` never has to guess which file matches a given exit — if it can't tell, it escalates rather than picking.}

## Exit interview applies?

{Yes/No/Ask — some exit types (e.g. involuntary) may skip the standard exit interview entirely, or use a different, separately-approved question set. This is a human policy call, not the agent's to infer from the exit type name alone — leave `TODO(gate)` if undecided rather than defaulting to "Yes."}

## Offboarding checklist

| # | Item | Owner | Due (relative to last working day) | Notes |
|---|---|---|---|---|
| 1 | {e.g. Access revocation (email, Slack, Notion, prod systems)} | {e.g. CTO/IT} | {e.g. last day, EOD} | This pack tracks completion only — it never executes the revocation itself |
| 2 | {e.g. Equipment return} | {e.g. IT/Admin} | {e.g. last day} | |
| 3 | {e.g. Final settlement input handed to People-Ops} | People-Ops (`packs/people-ops/payroll-prep/SKILL.md`) | {e.g. 5 business days before last day} | This pack tracks the handoff happened — it never computes the settlement figure |
| 4 | {e.g. Knowledge transfer document} | {Manager} | {e.g. last day} | |
| 5 | Exit interview scheduled (if applicable above) | This agent | {e.g. within notice period, before last day} | Triggers `../../exit-interview/SKILL.md` |

## Exit interview question set (if applicable above)

{The actual questions, in order. Every question here is what actually gets asked — nothing improvised mid-interview, no follow-up beyond what's listed.}

| # | Question |
|---|---|
| 1 | {question text} |

## Escalation categories (fixed, restated for this file's own reviewer — not editable per exit type)

Harassment, discrimination, safety, legal matters — any of these surfacing in an answer triggers `../../config/playbook.md` §Immediate escalation pattern regardless of which question was being asked. This list is the same for every exit type; it is not something a new instance of this template customizes.
