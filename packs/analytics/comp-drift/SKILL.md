---
name: comp-drift
description: |
  Compares published role comp bands against external market data, at the band level only —
  never an individual's compensation. Use for "are we competitive on comp", "comp-band drift",
  or as a section of the monthly deep-dive. Comp is never-delegated at the individual level;
  this skill never reads or reports an individual's actual compensation.
---

# Comp-band drift

Comp is on the never-delegated list (`platform/deploy-layer/otpless/command-policy.md` §4) at the individual level — deciding, discussing, or disclosing a specific person's compensation is a human action, always. What this skill does instead is compare the **band the company has already published** for a role against **external market data** for the equivalent role/level — a statement about a policy input, not about any person.

## Trigger

Monthly cadence, as a section of `../config/reports/monthly-deepdive.md` — comp bands and market benchmarks don't move week to week, so a weekly run would just repeat the same answer. Also on demand ("are we competitive on comp for {role}").

## Inputs

- `packs/recruiting/config/jobs/<role>.md` for each role (published comp band — real numbers, e.g. `packs/recruiting/config/jobs/backend.md`).
- An external market-data source — **not yet configured**; see `../config/metrics.md`'s "Market-data source" TODO(gate). This skill has no source to read until that lands.
- `../config/metrics.md` (comp-band-drift definition, small-N threshold — though this metric is band-level, not per-person, so small-N suppression rarely applies here; it would apply only if a market source itself reported figures broken down by a cohort small enough to identify someone, which this skill would then suppress the same as any other breakdown).

## Process

1. Check whether a market-data source is configured (`../config/metrics.md`). If not, stop and report that plainly — do not estimate, guess, or infer a market figure from general knowledge.
2. If configured: for each role, read the published band from `packs/recruiting/config/jobs/<role>.md`.
3. Compute drift (band midpoint vs. market figure, per `../config/metrics.md`'s formula) for the equivalent role/level.
4. Compose the section at the band level only — role name, published band, market figure, drift percentage. Nothing else.

## Output contract

Either:
- **No market source configured**: `Comp-band drift: no market-data source configured yet (see config/metrics.md) — reporting published bands only.` followed by the current published band per role (from the job playbooks), with no drift figure.
- **Market source configured**: a table — role, published band, market figure, drift % — band-level only.

In neither shape does this skill ever read, mention, or imply an individual employee's actual compensation, ESOP grant, or any figure from the Employees DB `Comp / ESOP` field. If asked directly for an individual's comp or whether a specific person is under/over their band, refuse and escalate — that is a comp discussion, never-delegated regardless of who asks or how the question is framed.

## Failure behavior

- A role's job playbook has no comp band filled in → state that role is missing a band, do not infer one from a similar role.
- Asked to compare a specific employee's actual pay against the band → refuse; this skill's only inputs are the published band and market data, never an individual figure, and there is no code path in this skill that reads the Employees DB `Comp / ESOP` field at all.
- Market-data source configured but unreachable this run → "Market-data source: couldn't check," report published bands only, same as the not-configured case, and say why.
