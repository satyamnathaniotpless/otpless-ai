<!-- Purpose: blank qm scope definition — copy this file to add a new agent scope (e.g. onboarder, people-ops); fill every section, unknowns get TODO(gate). -->

# Scope: {scope-id}

## Scope id

`{scope-id}` — matches the scope name in `org-config.md` Scopes table.

## Agent identity config pointer

`packs/{pack}/config/agent.md` (filled from `packs/shared/config/agent.md.example`).

## Packs imported

1. `packs/shared` (always first — every scope depends on it)
2. `packs/{department}` — {what it adds}

## Connectors required

- {system}: `platform/contracts/{system}.md`
- ...

## Write/send enforcement

{There is no per-scope posture dial (`command-policy.md` §7 — "no posture, no knob"). State which write/send tools (§1) this scope will use, and for each: whether it has a `command-policy.md` row today (`require_approval` in §2, or `deny` in §4/§5) or is simply not wired yet (draft-only, no tool shipped).}

## Cron ids bound

- `{cron-id}` — see `crons.md`
- ...

## Action-classes with current trust level

Add a `Slug` column alongside the prose name. The slug is the canonical action-class vocabulary — it must match this pack's `config/evidence.md` exactly (take it from there where a row already exists; invent or merge on conflict and record why, same as `evidence.md` itself notes), and it is what the evidence rollup and a promotion PR cite (ADR-008). Never-delegated rows get no slug — they never enter the ladder — mark them `n/a`.

| Action-class | Slug | Current level | Notes |
|---|---|---|---|
| {e.g. Scheduling confirmations} | `{e.g. scheduling_confirmation}` | L0 | Per `command-policy.md` §2/§3 |
| {e.g. Offers / comp / ...} | n/a | NEVER DELEGATED | Per `command-policy.md` §4 |

## Accountable human

{Name, role — the human who reviews this scope's PRs, drafts, and incidents.}

## Memory / knowledge sources

- `brain/` — {which subpaths this scope reads}
- {any pack-specific config/playbook files}

## Gates outstanding

- TODO(gate): {what, who}
