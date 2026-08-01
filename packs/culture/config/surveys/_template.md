<!-- CONFIG-STATUS: DRAFT -->
<!-- Purpose: blank pulse-survey definition — copy this to add a new survey; a new survey is one file (ADR-005: data, not process). -->

> ⚠️ **DRAFT — NOT APPROVED. `../../pulse-survey/SKILL.md` refuses to run any survey whose Status is not Approved.** Flip both this banner and the `CONFIG-STATUS` comment above to `APPROVED` in the same edit that a human (Founder/People Lead) signs off the question set — never before, and never by the agent itself.

# Survey: {survey-name}

**Status:** DRAFT — not yet approved for use on real employees.
**Owner:** {who is accountable for this survey, e.g. "Founder" or "People Lead"}
**Approved by:** {left blank until approved}
**Approved date:** {left blank until approved}

## Cadence

{e.g. "Quarterly, first week of the quarter" — TODO(gate) if not yet decided; leave explicit, do not default silently.}

## Audience

{Who receives this survey — e.g. "all employees," "employees past their 90-day mark." Cuts allowed for reporting (see below) must be a subset of how the audience is naturally segmented — do not invent a cut not listed here.}

## Reporting cuts allowed

{List every way results may be sliced, e.g. "company-wide," "by team," "by tenure band." Each cut is independently subject to the suppression rule below — a cut not listed here may not be reported, full stop, even if the data would technically allow it. Cuts are also checked against each other, and against any total that closes them, for a differencing risk — see the complementary-suppression steps in `../../config/playbook.md` §Small-N suppression before finalizing this list: do not list a total alongside a partition it closes, and do not list two cuts whose difference could isolate a group below `min_cell_size`.}

## Anonymity contract

| Field | Value |
|---|---|
| `min_cell_size` | 5 (platform floor, `../../config/playbook.md` §Small-N suppression) — may be raised here, never lowered |
| Free-text comments | Never published/relayed as quotes at any N — private response store only (`../notion.md`) |
| Suppressed-cut reporting | "Below reporting threshold" — no number, no direction, no N stated |
| Complementary suppression | A lone suppressed cell is never published alone within its partition (next-smallest cell, or the whole partition, is suppressed with it); a partition's total is never published alongside a suppressed cell in that partition (default: drop the breakdown, publish the total only) — see `../../config/playbook.md` §Small-N suppression steps 1-7 |

## Question set

{The actual questions, in order, with response type (Likert/multiple-choice/free-text). Every question here is what actually goes to an employee — nothing improvised at send time.}

| # | Question | Type |
|---|---|---|
| 1 | {question text} | {Likert 1-5 / multiple-choice / free-text} |

## Distribution

{Channel — e.g. "drafted email, WhatsApp-first per candidate-channel convention doesn't apply to employees; confirm employee channel preference separately" — and whether this pack's own mailbox/calendar is required (see `../agent.md` gates).}
