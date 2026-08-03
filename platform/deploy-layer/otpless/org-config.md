<!-- Purpose: org-level qm config — slug, timezone, scopes, surfaces, and where skill packs load from — the source to compile into qm's native org config format. -->

# Org Config — otpless

## Org identity

| Field | Value |
|---|---|
| Platform name | **Otto** — OTPLESS's agent platform; runs on the qm harness (`yc-software/qm`). See the naming note in `README.md` — commands, config files, and the package name stay `qm`. |
| Org slug | `otpless` |
| Timezone | `Asia/Kolkata` (IST) — all crons (standup 08:30 IST, digests, retros) are scheduled against this |
| Currency (for any config that needs one) | INR (₹), LPA convention for comp bands |
| Agent public name | **Scout** (recruiter agent) — founder-decided 2026-08-02 |

## Scopes to create (in order)

| Order | Scope | Agent | Phase | Notes |
|---|---|---|---|---|
| 1 | `recruiter` | Recruiter | P0/P1 | First scope created; imports `packs/shared` + `packs/recruiting` |
| 2 | `onboarder` | Onboarder | P2 | Timed to first joiners from the 7-hire sprint |
| 3 | `people-ops` | People-Ops | P2 | Starts on **Strict** posture per `command-policy.md` §1/§7 |
| 4 | `analyst` | People Analyst | P3 | |
| 5 | `culture` | Culture & Growth | P3 | |

Do not create a scope out of order relative to its phase without an explicit decision logged in `brain/decisions/log.md` — the phase ordering reflects real dependencies (e.g. `onboarder` needs live joiners to be useful, `people-ops` needs the Policies wiki seeded first).

## Surfaces

| Surface | Channels | Notes |
|---|---|---|
| Slack | `#hiring` (recruiter scope), `#people` (all People-department scopes; cross-agent handoffs happen here) | Agents post as their own bot identity per `packs/shared/identity/SKILL.md` |
| Web | qm web UI | Founder + CTO sign-in; later People Lead; each human's own session, scopes isolated per qm's model |

## Skill-pack sources

This repo (`otpless-ai`) is the source for both packs qm imports:

| Pack | Path in this repo | Used by |
|---|---|---|
| Shared infrastructure | `packs/shared` | Every scope, always imported first |
| Recruiting | `packs/recruiting` | `recruiter` scope |
| (future) Onboarding, People-Ops, Analyst, Culture packs | `packs/<name>` — not yet built | Their respective scopes, P2/P3 |

Import both by pointing qm's skill-pack config at this repo's git URL and the two paths above; re-import (or let qm's pack-update mechanism pull) whenever a pack changes.
