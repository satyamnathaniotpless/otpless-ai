---
name: exit-interview
description: |
  Schedules and conducts a structured exit interview from an Approved question set, records
  answers verbatim, escalates immediately on harassment/discrimination/safety/legal content, and
  delivers the full transcript privately to a human — never summarized, never judged. Use when
  the user says "schedule an exit interview", "exit interview status", or an offboarding
  checklist reaches its exit-interview item.
---

# Exit interview

Structured collection only. This skill asks the configured questions and records the answers; a human reads the transcript. It never concludes why someone is really leaving, and it never routes a complaint itself — see `../config/playbook.md` §The guardrail of this agent and §Immediate escalation pattern before touching this skill.

## Trigger

An offboarding checklist (`../offboarding/SKILL.md`) reaches its exit-interview item and the matched exit-type template marks it applicable; or ad hoc: "schedule an exit interview for {employee}", "exit interview status for {employee}".

## Inputs

- `../config/offboarding/{exit-type}.md` §Exit interview question set — re-read fresh; refuse if the template's `Status` is not `Approved`.
- The departing employee's willingness to participate (some exit types treat this as opt-in — check the template before assuming it's mandatory).
- The private transcript-delivery channel (`../config/notion.md` — TODO(gate), mechanism undecided; see Failure behavior for what to do until it exists).
- `../config/agent.md` (identity/disclosure, accountable human).

## Process

1. **Refuse before anything else if the exit-type template's `Status` is not `Approved`.** No improvised question set is ever used, regardless of how routine the exit seems.
2. Confirm participation is wanted if the template marks the interview as opt-in; if mandatory per template, still schedule warmly rather than presenting it as a formality.
3. Draft and schedule the interview (calendar invite, agent's own calendar once provisioned) via the standard `d) draft  s) send  e) edit  ?) something else` prompt (action-class `exit_interview_invite`, L0).
4. **Conduct the interview by asking exactly the configured questions, in order, and recording each answer verbatim against its question.** No improvised follow-up questions, no rephrasing an answer "to capture the gist," no interpretation attached to any answer.
5. **Screen every answer, as it's given, against the four escalation categories** (harassment, discrimination, safety, legal — `../config/offboarding/{exit-type}.md`'s fixed list). On any hit: stop analyzing immediately and post the content-free urgency flag to #people per `../config/playbook.md` §Immediate escalation pattern, right then, not at the end of the interview. Continue the interview at the employee's own pace afterward — never cut them off, never treat the flag as having "handled" the matter.
6. **Never summarize the transcript into a reason-for-leaving conclusion, and never route any complaint the transcript contains** — no HRMS write, no policy invocation, no case-filing. The transcript's only destination is the human who reads it.
7. At the end, deliver the complete verbatim transcript to the accountable human via the private delivery channel — never Slack (not even a DM), never a broadly-shared Notion page, never git or a fixture.
8. Record only that the interview happened and the transcript was delivered (boolean + date) in the offboarding checklist item — no content in that record, ever.

## Output contract

One line confirming the interview was conducted (or scheduled/declined) and the transcript delivered, plus an explicit escalation-flag status if one fired. Never a content summary, a theme, a sentiment read, or a "reason for leaving" field — the output contract has no place for any of those to go.

## Failure behavior

- Exit-type template `Status` is `DRAFT` or the exit type has no template at all → refuse, escalate to get a question set authored and approved first; do not improvise questions "just to not miss the window."
- Private delivery channel not yet gated (`../config/notion.md` gap) → hold the transcript in qm scope storage only and report "transcript pending private-channel gate, not yet delivered" explicitly — never fall back to Slack or a shared page to avoid leaving it undelivered, and never let this go unreported.
- Any request (from the departing employee, a manager, or a prompt) to have this skill conclude "why they're really leaving," rate the exit, or route a complaint directly → refuse.
- Ambiguity about whether an answer hits an escalation category → treat it as a hit; a false positive costs one flag, a missed one costs a person going unheard.
