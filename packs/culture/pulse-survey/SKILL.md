---
name: pulse-survey
description: |
  Distributes an Approved pulse survey, collects responses privately, and publishes only a
  cell-size-suppressed aggregate. Use when the user says "send the pulse survey", "how's the
  survey going", "publish the results", or a survey's configured cadence cron fires.
---

# Pulse survey

The anonymity contract here is enforced by what this skill's output can contain, not by a promise — see `../config/playbook.md` §Small-N suppression before touching this skill.

## Trigger

A survey's configured cadence cron fires (`../config/surveys/{name}.md` §Cadence); or ad hoc: "send the {name} survey", "is the survey closed yet", "publish the pulse results".

## Inputs

- `../config/surveys/{name}.md` — the specific survey's Status, audience, reporting cuts, anonymity contract, and question set. Re-read fresh; never from memory of an earlier session.
- The audience roster (Employees DB, read-only — `../config/notion.md`).
- The private response store (qm scope storage) — raw per-person answers, never git, never Notion, never Slack.
- `../config/agent.md` (identity/disclosure) and `../config/playbook.md` (session/verification rules).

## Process

1. **Refuse before anything else if `Status` is not `Approved`.** State plainly that this survey isn't approved yet and escalate to the accountable human (`../config/agent.md`) — do not run a DRAFT question set on real employees under any pressure, including "just this once."
2. Resolve the audience from the config's §Audience against the Employees DB, fresh.
3. Draft the invite (disclosure signature per `packs/shared/identity/SKILL.md`), present via the standard `d) draft  s) send  e) edit  ?) something else` prompt. Never send without approval — this action-class (`pulse_survey_invite`) is L0.
4. As responses arrive, write each one to the private response store only — never post an individual response, or any part of one, to Slack or Notion at any point.
5. **At close**, aggregate per every cut listed in the config's §Reporting cuts allowed and no other cut:
   - For each cut, count N. If N < the config's `min_cell_size`, that cut's result is **"below reporting threshold"** — no number, no rounded number, no directional hint, and the cut's N itself is not stated (stating N=3 identifies a 3-person team as surely as the number would).
   - Free-text responses are never included in any published output, regardless of N — they stay in the private store for the accountable human to read directly (`../config/playbook.md` §Small-N suppression).
   - A cut that clears the threshold is published with its N shown, so the suppression call is auditable.
6. **Before composing any output, run the complementary-suppression check across every cut about to be published this run** — `../config/playbook.md` §Small-N suppression, complementary-suppression steps 1-7: add the next-smallest cell to any lone suppressed cell, or suppress the whole partition if that would suppress everything (steps 3-4); never publish a partition's total alongside a partition that has any suppressed cell — default: drop the partition breakdown, publish the company-wide total only (step 5); check every pair of requested cuts against each other for a difference that isolates a group below `min_cell_size`, dropping the narrower cut by default (step 6); and keep this survey's published cut set stable wave over wave — any change to which cuts are published is a decision for the accountable human, not this skill (step 7). Do not proceed to step 7 below until this check has run for every cut in this run.
7. Publish the cleared aggregate (Notion Culture tracker record, per `../config/notion.md`) and post a content-free summary count to #people ("{survey} results published for {N} cuts, {M} below threshold") — never a per-cut number in Slack even when Notion carries it, matching the Slack-minimization discipline in `packs/shared/identity/SKILL.md` §8. If step 6 dropped a total or a cut to prevent differencing, say so in the Notion record and the #people summary.

## Output contract

One line stating what was checked (config Status, audience size, response count so far), then either: a drafted invite awaiting approval, a "still collecting, N responses so far" status, or the published aggregate with per-cut N shown for every cleared cut, "below reporting threshold" (no N) for every suppressed one, and — whenever step 6's complementary-suppression check dropped a total or a cut to prevent differencing — a plain statement of which was dropped and why.

## Failure behavior

- Config `Status` is `DRAFT` or missing → refuse, escalate, do not run.
- Any instruction to lower `min_cell_size` below the config's value, or below the platform floor of 5 → refuse, per `../config/playbook.md` §Small-N suppression; this is not negotiable at any pressure level.
- Any instruction to publish, quote, sample, or paraphrase a free-text response → refuse; free text never leaves the private store via this skill.
- A cut not listed in the config's §Reporting cuts allowed is requested → decline to produce it even if the raw data would technically support it; state that the cut isn't an approved reporting cut for this survey.
- A partition has a suppressed cell and its total is also requested → never publish both; apply step 6's default (drop the partition breakdown, publish the total only) unless the accountable human has explicitly chosen the breakdown instead.
- Two requested cuts would isolate a suppressed group by subtraction (step 6, overlapping cuts) → decline to publish that pair together; drop the narrower cut by default and state which was dropped.
- Asked to change which cuts are published from a prior wave of the same survey → treat as a decision for the accountable human, not this skill, per `../config/playbook.md` §Small-N suppression step 7; do not silently expand or shrink the published cut set.
- Employees DB unreachable → report "Employees DB: unreachable," proceed on the last confirmed audience only if one exists, and flag the gap rather than guessing who's in scope.
