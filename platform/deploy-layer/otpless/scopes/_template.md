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

## Security posture

{Auto (org default) or Strict — see `command-policy.md` §1/§7. State which, and why if it diverges from org default.}

## Cron ids bound

- `{cron-id}` — see `crons.md`
- ...

## Action-classes with current trust level

| Action-class | Current level | Notes |
|---|---|---|
| {e.g. Scheduling confirmations} | L0 | Per `command-policy.md` §2/§3 |

## Accountable human

{Name, role — the human who reviews this scope's PRs, drafts, and incidents.}

## Memory / knowledge sources

- `brain/` — {which subpaths this scope reads}
- {any pack-specific config/playbook files}

## Gates outstanding

- TODO(gate): {what, who}
