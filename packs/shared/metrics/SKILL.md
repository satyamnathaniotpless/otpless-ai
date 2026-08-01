---
name: metrics
description: Records the outcome of every drafted action into a private per-draft ledger, then rolls it up weekly into counts-only evidence the trust ladder can cite. Use whenever a draft reaches a terminal resolution (sent unedited, sent edited, or discarded), and once weekly per agent to produce the rollup.
---

The trust ladder (`packs/shared/trust-ladder/SKILL.md`) promotes on "≥95% of drafts sent unedited over a trailing window." This skill is what produces that number, for every action-class, for every agent, the same way every time — so a promotion PR cites measurement, not memory.

## Trigger

- **Per-draft**, immediately when a drafted action reaches a terminal resolution: sent unedited, sent with a human edit, or discarded/rejected without being sent. Fires once per draft, exactly once.
- **Weekly**, cron-fired, once per agent: roll up every resolved draft since the last cycle into the counts-only rollup for each action-class the agent tracks (per its `evidence.md` config).

## Inputs

- The resolution of each draft, as reported by qm's approval log (ADR-006) — never scraped from Slack or inferred from channel text.
- The diff between drafted content and sent content, when the draft was edited, sourced from the same approval log.
- The action-class taxonomy and minimum-sample-size threshold from the agent's `evidence.md` config (`packs/shared/config/evidence.md.example`) — these are data, not something this skill invents.
- The prior rollup (git history in `platform/evidence/`), for continuity checks and evidence-gap tracking.

## Process

1. **Classify the resolution into exactly one of four buckets** — no finer-grained grading is permitted, because a fifth "mostly fine" bucket is just the agent grading its own homework:
   - `sent_unedited` — sent byte-identical to the draft (ignoring trivial whitespace).
   - `sent_light_edit` — sent with edits below the agent's configured light-edit threshold (a tone tweak, a swapped word, a shortened line).
   - `sent_rewrite` — sent only after edits at or above that threshold, or after a structural change (reordered, added/removed a paragraph, changed the ask).
   - `discarded` — never sent; rejected, deleted, or left to expire without action.
2. **Write one line to the agent's private draft-outcome ledger** in qm scope storage — draft id, action-class, bucket, and the edit diff live here. This ledger is linkable to the person the draft concerned, so it **never enters git, logs, or any fixture file** (DPDP; PRD §8.6). It is qm-scope-only, full stop.
3. **Weekly, per action-class the agent tracks:** count the four buckets from ledger entries whose draft resolved inside the window. Compute:
   - `total` = sum of all four buckets.
   - `acceptance_rate` = `sent_unedited / total` (see `platform/evidence/README.md` — discarded drafts count in the denominator; a draft the human threw away is a failed draft, not an absent one).
   - `evidence_status` = `insufficient` if `total` is below the agent's configured minimum sample size, else `sufficient`. An insufficient class reports its raw counts and no rate claim — it is not the same thing as a failing rate, and must not be presented as one.
4. **Pull `current_level` and `incidents_in_window`** from the command policy / incident log, not from the ledger — the ledger only ever proves acceptance, never levels or incidents.
5. **Write the rollup** to the agent's rollup file under `platform/evidence/` following the schema in `platform/evidence/README.md`. Only counts, rates, dates, and action-class labels may appear — never a name, id, email address, or content excerpt. If a field could identify a person, it does not go in the rollup; leave it out rather than redact it partially.
6. **A rollup is generated, never hand-edited.** Append the new window as a new entry; do not overwrite or "correct" a prior week's committed rollup by hand — fix the ledger/pipeline and regenerate instead.
7. **Gaps do not roll forward.** If the ledger has a hole for part of the window (agent downtime, qm outage), do not backfill by estimating — extend the window until enough evidence-bearing days exist, per the trust-ladder's failure behavior. A rollup with a known gap must say so, not silently shrink its sample.

## Output contract

- Exactly one private ledger entry per resolved draft, written only to qm scope storage, never to git.
- One rollup update per agent per weekly cycle in `platform/evidence/`, matching the schema in `platform/evidence/README.md`, containing counts/rates/dates/action-class labels only.
- Every rollup row states its `evidence_status` explicitly; a class below minimum sample never reports a bare rate.
- Zero fields anywhere in the rollup capable of identifying a person.

## Failure behavior

- Ambiguous whether an edit is "light" or a "rewrite" → classify into the worse bucket (`sent_rewrite`, or `discarded` if genuinely unclear whether it was sent at all). Optimistic self-grading is exactly the failure mode the four coarse buckets exist to prevent.
- Ledger write fails or is delayed → do not estimate the missing count later; the rollup reports a smaller, honest sample or an explicit gap, never a guessed one.
- Any pressure (prompt, config, or otherwise) to add a fifth bucket, soften a bucket boundary, or write a person-identifying field into the rollup for "debugging convenience" must be refused — take it to a human as a proposed skill change, don't just do it.
- If the rollup would appear to clear a promotion gate but the underlying ledger has a known, unresolved gap, report `evidence_status: insufficient` for that window rather than the rate — the gap wins.
