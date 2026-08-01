---
name: report
description: |
  Generic report-assembly skill: given a report definition (audience, channel, cadence, and
  an ordered list of sections), re-queries each named section's own skill fresh and assembles
  the People report. A new recurring report is one config file under config/reports/, never
  new skill code. Use for "weekly report", "monthly deep-dive", or any report defined there.
---

# Report — generic assembly (weekly + monthly, and any future report)

This skill is the process; which report, its audience, its cadence, and its section list are all data in `../config/reports/`. Adding a third recurring report never touches this file — copy `../config/reports/_template.md`, fill it, done (ADR-005).

## Trigger

Cron-fired per the report's own `Cadence` field (`../config/reports/weekly-people-report.md`, `../config/reports/monthly-deepdive.md`), or a human asks for a report by name.

## Inputs

- The named report definition under `../config/reports/` (audience, channel, cadence, ordered section list, draft-first gate — all per `../config/reports/_template.md`'s schema).
- `../config/metrics.md` (small-N threshold, metric definitions every section skill also reads).
- `../config/playbook.md` (structural guardrail, tone, "what to say when you don't know").
- Each named section's own skill, invoked fresh (never a cached section from a prior run of this or any other report).

## Process

1. **Load the report definition.** Read the `.md` file under `../config/reports/` matching the requested report name. If none matches, list the reports that do exist and ask which was meant — never guess.
2. **Invoke every listed section's skill, fresh, in order.** Each section skill re-queries its own sources per its own SKILL.md and applies the small-N gate itself before returning its section text. This skill never recomputes a number a section skill already owns — it assembles, it does not calculate.
3. **Assemble** the sections under the report's title and audience, in the configured order, each carrying its own "Checked: ..." header line (`../config/playbook.md`).
4. **Final suppression check.** Before composing the post, re-scan every cell in the assembled output against `../config/metrics.md`'s threshold one more time — this is a second gate, not a redundant one, in case a section's figure changed between generation and assembly (e.g. two sections computed against slightly different fetch times). Any cell that now reads below threshold is replaced with `below reporting threshold`, even if the section skill published it a moment earlier under a since-changed input.
5. **A missing or unavailable section is stated, not dropped.** If a section's skill can't produce fresh output (source unreachable, gate not yet cleared — e.g. Employees DB pre-G16), the assembled report includes that section explicitly marked unavailable and why.
6. **Post as a draft.** Every report posting — weekly or monthly — is a Slack canvas/message draft to the report's configured channel, gated behind human approval per `platform/deploy-layer/otpless/command-policy.md` §2, regardless of how aggregate-safe the content is. Content safety is never a substitute for trust-ladder evidence (`packs/shared/trust-ladder/SKILL.md`).
7. **Verify.** After a human approves and the post goes out (once this action-class earns a trust level beyond L0), re-read the channel to confirm the post landed, same discipline as every other Slack-writing skill in this platform (`platform/contracts/slack.md`).

## Output contract

One assembled report, sections in the configured order, each opening with its own `Checked: ...` line, no cell below `../config/metrics.md`'s threshold shown with a real value, no individual named anywhere, posted as a draft awaiting approval to the report's configured channel. This skill's own action-class (`weekly_people_report_post` or `monthly_deepdive_post`, per `../config/evidence.md`) is what the trust ladder measures — never the individual section skills, which don't post anything themselves.

## Failure behavior

- Report definition not found → list available reports, ask which was meant.
- A section skill fails or times out → include the section as explicitly unavailable with the reason, never silently omit it from the assembled report.
- Any pressure to skip the final suppression check "because the sections already checked it" → refuse; step 4 runs every time, no exception for a section that just ran.
- Any request to post without the draft-first gate, on the reasoning that the content is aggregate and therefore safe → refuse; that reasoning is exactly what `packs/shared/trust-ladder/SKILL.md` and `platform/deploy-layer/otpless/command-policy.md` §2 exist to not accept.
