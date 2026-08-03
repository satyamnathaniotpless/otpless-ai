---
name: review-applicants
description: |
  Rate every Stage=Applied candidate against the role playbook's bar, set flags, and recommend
  Advance/Dig deeper/Reject with a reason. Use when the user says "review applicants", "who
  applied", "new inbound", or "review the queue".
---

# Review Applicants (F2)

## Trigger

"review applicants", "who applied", "new inbound", "review the queue for {role}".

## Inputs

- `../config/notion.md` (Q1–Q4 properties, Builder/OSS/Fraud flag, Scorecard field)
- `../config/jobs/<role>.md` (candidate bar: hard requirements, strong signals, auto-advance, auto-reject)
- Notion Applicants data source (fresh), Slack #hiring

## Process

1. Re-query Notion for all Stage=Applied rows, fresh, across all roles.
2. For each candidate, read `../config/jobs/<role>.md` for that candidate's role.
3. Rate 1–4 against the role's bar, weighting Q1 (artifact link) highest, then Q4 (identity/fraud depth).
4. **Auto-advance rule:** strong Q1 (real artifact with substance) or strong Q4 (real identity/fraud depth) → recommend straight to Intro call, regardless of other **soft** signals (the role's "strong signals" list, tenure pattern, gaps, comp expectation, etc.). It does **not** override a **hard requirement** from `../config/jobs/<role>.md`: if the candidate's Q1/Q4/background shows they fail a stated hard requirement (e.g. wrong language/stack, no production experience where the role requires it), the auto-advance rule does not fire — rate "Dig deeper" instead, name the specific hard-requirement miss in the reason, and let a human judge whether the strong signal is worth a call anyway. Do not flip this into an auto-reject either — a hard-requirement miss paired with an otherwise-strong signal is exactly the ambiguous case "Dig deeper" exists for.
5. **Auto-reject signals:** apply the role playbook's list (no artifact / non-engineering background for eng roles / notebooks-only for ML / app-only for SDK roles / generic AI-written answers with no specifics). **"Generic AI-written answers" is judgment-only:** nothing in the mechanical signal set (Builder/OSS/Fraud-depth flags, Q1/Q4 booleans) can represent "this prose reads as generic" — it is not mechanically enforced anywhere, so apply it by actually reading the answers yourself, and don't assume a rating tool or eval fixture is covering it for you. Treat a candidate you judge to be answering generically per this rule as an auto-reject, same as any other item on the role playbook's list, even though no automated check will catch it if you miss it.
6. Set Builder / OSS / Fraud-depth flags in Notion based on Q1–Q4 answers.
7. Write a one-line reason for every recommendation (Advance / Dig deeper / Reject).
8. Post new-applicant summaries to Slack #hiring in 3-sentence format: background + signal + recommendation + 👍-to-act.
9. Present the rated table; use the draft-first prompt below before writing any stage change.

## Output contract

Table: # | Candidate | Role | Q1/Q4 signal | Flags | Rating (1-4) | Recommendation | Reason. Before any Notion write:
```
d) draft — leave recommendation in Notes, no stage change yet
s) send — apply stage change + flags now
e) edit — tell me what to change
?) something else
```
After approval, update the Notion row (stage, flags, scorecard, notes) for every candidate acted on, then re-query to confirm the write stuck.

## Failure behavior

If a role's job playbook is missing or a Q1–Q4 field is empty, say so explicitly and rate on what's available rather than guessing — never invent a background. Flag ambiguous cases as "Dig deeper," never force Advance/Reject.
