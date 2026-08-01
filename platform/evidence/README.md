# platform/evidence

Purpose: the counts-only weekly rollups that give the trust ladder (ADR-004) a real number to promote or demote on — this directory is what a human reads before merging a promotion PR.

## The two-tier split, and why

Every draft an agent produces resolves one of four ways (`sent_unedited`, `sent_light_edit`, `sent_rewrite`, `discarded`), and that resolution is evidence. But the *record* of one specific resolution — this draft, this candidate, this diff — is linkable to a real person. Under DPDP (`docs/PRD_Recruiting_System.md` §8 guardrail 6; master PRD §6 "Audit + privacy") that record cannot live in git: git is durable, replicated, cloned to laptops, and never truly deleted. So the platform keeps two tiers, deliberately apart:

1. **The ledger — qm scope storage, never git.** One entry per resolved draft: draft id, action-class, bucket, edit diff. This is where a person could be identified from the data, so it stays inside qm's access-controlled scope storage, subject to qm's own retention and access rules, and is never copied into a repo, a log line, or a fixture file. See `packs/shared/metrics/SKILL.md` for how it's written.
2. **The rollup — this directory, in git.** A weekly aggregate: counts and a rate, per action-class, per agent, per window. No field here can identify a person — by construction, not by redaction. This is the artifact a promotion PR cites and a human audits; it needs to be diffable, versioned, and readable without touching qm at all.

The rule that makes this safe: **a rollup is generated, never hand-edited.** It is produced mechanically from the ledger by the weekly cron in `packs/shared/metrics/SKILL.md`. If a rollup number looks wrong, fix the ledger or the pipeline and regenerate — do not open a PR that edits a committed rollup file by hand. A hand-edited rollup is indistinguishable from a fabricated one, and the whole point of this directory is that a human doesn't have to take the number on faith.

## Layout

```
platform/evidence/
  README.md                 (this file)
  _rollup-template.md       (blank template, ADR-005: instantiable by any agent in any department)
  <agent-scope>/
    <window-end-date>.md    (one rollup file per agent per window, e.g. people-ops/2026-08-02.md)
```

Each agent's own directory accumulates one file per closed window; prior weeks are kept as history and are never overwritten.

## Rollup schema

One rollup file covers one agent, one window, every action-class that agent tracks. Header fields, then one table row per action-class.

### Header

| Field | Type | Meaning |
|---|---|---|
| `agent` | string (agent-scope slug) | Which agent this rollup belongs to, e.g. `recruiting`. Not a person — the agent's own scope name. |
| `window_start` | date (`YYYY-MM-DD`) | First day of the evidence window. |
| `window_end` | date (`YYYY-MM-DD`) | Last day of the evidence window (the date this rollup was generated for). |
| `window_days` | integer | `window_end − window_start`, in days. Gaps (§ below) mean this can exceed the nominal 14/28-day cycle. |
| `generated_at` | timestamp (ISO 8601, UTC) | When the rollup was mechanically produced. |
| `generated_by` | string | The job/cron identifier that produced it, e.g. `weekly-evidence-rollup`. Never a human name. |
| `source` | string (fixed value) | `qm approval log` — per ADR-006, the only authoritative source; never "Slack." |
| `known_gaps` | string or `none` | Any period inside the window with missing/incomplete ledger data. Dates only, no reason tied to a person. |

### Per-action-class table

| Column | Type | Meaning |
|---|---|---|
| `action_class` | string (slug, matches `command-policy.md` exactly) | The action-class this row measures, e.g. `scheduling_confirmation`. |
| `sent_unedited` | integer ≥ 0 | Count of drafts sent byte-identical to drafted. |
| `sent_light_edit` | integer ≥ 0 | Count of drafts sent with edits below the light-edit threshold. |
| `sent_rewrite` | integer ≥ 0 | Count of drafts sent only after substantial rewrite. |
| `discarded` | integer ≥ 0 | Count of drafts never sent. |
| `total` | integer ≥ 0 | Sum of the four counts above. |
| `evidence_status` | enum: `sufficient` \| `insufficient` | `insufficient` when `total` is below the agent's configured minimum sample size (floor: 20 — see `packs/shared/config/evidence.md.example`). |
| `acceptance_rate` | float, 2 decimals, `0.00`–`1.00`, or `n/a` | `n/a` whenever `evidence_status = insufficient`. Otherwise computed per the formula below. |
| `current_level` | enum: `L0` \| `L1` \| `L2` | This action-class's level as of `window_end`, per `command-policy.md`. |
| `incidents_in_window` | integer ≥ 0 | Count of demotion-triggering bad sends attributed to this action-class inside the window. |

No other columns. If a field cannot be expressed as one of the types above without risking a name, an id, an email, or a content excerpt, it does not belong in this table — leave it out of the schema entirely rather than trying to sanitize it per-row.

## The acceptance-rate formula

```
acceptance_rate = sent_unedited / (sent_unedited + sent_light_edit + sent_rewrite + discarded)
```

`discarded` is in the denominator. A draft a human threw away failed just as surely as one they rewrote — it is not excluded as if it never happened. This is the number every gate below keys off; there is no other rate anywhere in this platform.

## Minimum sample size

An action-class needs **at least 20 resolved drafts** in the window before its rate means anything. Below 20, one lucky (or unlucky) draft swings the rate by 5 points or more — report `evidence_status: insufficient`, not a rate. **Insufficient evidence is not a failing rate** — it is a different, weaker claim ("we don't know yet"), and the two must never be presented as the same thing in a rollup, a standup, or a promotion PR.

## Promotion arithmetic (decision table)

An action-class clears a level only when **every** condition in its row holds, measured from the rollup(s) covering the stated window:

| Target level | Acceptance rate | Window | Sample | Additional precondition |
|---|---|---|---|---|
| **L1** | ≥ 95% | ≥ 14 days | ≥ 20 drafts | The channel's send capability is verified present (ADR-007) before this action-class may promote to L1 — evidence alone is not enough for a send-capable class. |
| **L2** | ≥ 95% | ≥ 28 days | ≥ 20 drafts | `incidents_in_window = 0`. Any incident inside the window blocks L2 regardless of rate. |

Evidence gaps do not roll forward: if the window has a `known_gaps` entry, the window is extended until it covers enough gap-free evidence-bearing days — a gap is never papered over by treating the days on either side of it as continuous. Both `platform/evidence/_rollup-template.md` and `packs/shared/trust-ladder/SKILL.md` restate this so it can't be missed at either the data or the policy layer.

A rollup failing any cell above is not an argument for an exception — it is the answer.
