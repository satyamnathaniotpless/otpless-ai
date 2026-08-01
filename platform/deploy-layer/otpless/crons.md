<!-- Purpose: the scheduled-work table qm compiles into its native cron/watch config — every recurring job the recruiter scope runs, server-side, 24x7. -->

# Crons — recruiter scope

All schedules below are **Asia/Kolkata (IST)**; cron expressions are UTC-equivalent and must be compiled accounting for the IST offset (UTC+5:30) when translated into qm's native cron format. **A cron never sends externally** — it drafts and posts internally (Slack draft, internal note, Notion write it can already make per its trust level) unless the relevant action-class has earned L1 per `command-policy.md` §3. Digest/report posts to Slack channels count as external-visible per `command-policy.md` §2 until that action-class is promoted, so today every row below produces a *draft* for operator approval, not a live post, unless already noted otherwise.

| id | scope | schedule (cron / IST) | skill invoked | output surface | failure behavior | phase |
|---|---|---|---|---|---|---|
| `recruit-watch-applicant` | recruiter | `*/5 * * * *` (every 5 min, all day) | `/recruit-watch` (new-applicant leg, F9) | Slack `#hiring` draft (3-sentence format) | Notion contract unavailable → skip this run, log, retry next tick; do not backfill by guessing what was missed — next successful poll re-queries fresh | P2 |
| `recruit-watch-sla` | recruiter | `0 * * * *` (hourly) | `/recruit-watch` (SLA breach leg, F9) | Slack `#hiring` draft (🔴 flag) | Same as above; a missed hour is not back-filled, the next run's re-query is authoritative | P2 |
| `recruit-triage-digest` | recruiter | `0 3 * * *` (08:30 IST) | `/triage` (F1, digest mode) | Slack `#hiring` draft | Any source (Notion/Gmail/Calendar) down → post digest with that section explicitly marked "unreachable," never omit silently | P2 |
| `recruit-standup` | recruiter | `0 3 * * *` (08:30 IST) | standup (per `packs/shared` goals/standup framework, PRD §6) | Slack `#people` draft | Same failure behavior as digest — missing metric reported as "unknown," not zero | P2 |
| `recruit-pipeline-report` | recruiter | `0 3 * * 1` (Monday 08:30 IST) | `/pipeline` (F7) | Slack `#hiring` draft (canvas or message) | Any source down → report partial funnel, label incomplete, do not extrapolate missing roles | P1/P2 |
| `recruit-retro` | recruiter | `30 16 * * 0` (22:00 IST Sunday) | weekly retro (diff human edits vs drafts → playbook PR, `packs/shared/retro/SKILL.md`) | GitHub PR against this agent's own config/playbook | Eval suite red before opening PR → fix first, do not open a PR against failing evals; agent never self-merges | Maintenance |

## Notes

- `recruit-watch-applicant` at 5-minute polling is the compiled approximation of F9's "within minutes, any hour" — see `platform/contracts/notion.md` capability-gap note: there is no push/subscribe, only polling.
- Cron cadence choices (`*/5`, hourly, daily 08:30) are this integrator's proposal to satisfy PRD timing language; not sourced from a PRD-specified cron expression — confirm with the accountable human if a tighter/looser interval is wanted before this compiles into qm's live schedule.
- Any row whose action-class reaches L1 for that specific Slack send pattern (per `command-policy.md` §3, evidence-based, PR-merged) switches its output surface from "draft" to "auto-post" — this table's "output surface" column must be updated in the same PR that promotes the action-class.
