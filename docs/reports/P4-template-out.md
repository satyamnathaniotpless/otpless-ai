<!-- Purpose: final phase report — the roadmap is complete, what exists, what was independently verified, and what the founder must do next. -->

# Phase report — P4 Template Out · 2026-08-01

**Status:** shipped. Evals green (0 failures, 12 check groups). **The build roadmap is complete.** The platform now enters maintenance mode per `docs/RUNBOOK_MAINTENANCE.md`.

## What shipped

**`docs/DEPARTMENT_AUTOMATION_PLAYBOOK.md`** — the document that lets someone who did not build this platform stand up department #2. The model, the build sequence, what `packs/shared` gives you free, what you must write with the exact template files, the six failure modes we actually hit with the general lesson from each, the guardrail patterns that transferred, how to run the build with subagents, and a recommendation for department #2. It is grounded in the four phase reports rather than in theory — every failure mode in it is one that happened here.

**`docs/RUNBOOK_MAINTENANCE.md`** — the standing duties, with an honest precondition stated up front: most of it is inert until the deployment is live.

**`docs/proposals/_template.md`** — a proposal requires an observation of repeated manual work someone is doing by hand today, and requires the proposer to argue why a form or a cron would not do instead. Most repeated work does not deserve an agent.

## Final review — verified, not reported

For the final phase I checked the load-bearing claims against the repository directly rather than trusting the phase reports that made them:

| Claim | How verified | Result |
|---|---|---|
| ADR-005: `packs/shared` imported unchanged by agents 2–5 | `git log -- packs/shared/` | Last modified at P1. Untouched through all of P2 and P3. **Holds.** |
| Five complete packs | Filesystem | 40 skills across 5 packs; all five carry `agent.md`, `goals.md`, `playbook.md`, `evidence.md` |
| Gate ledger complete | `docs/gates.md` | G1–G25, continuous, no gaps or collisions |
| No secrets in git | Pattern scan over tracked files | None |
| Evals green | `node evals/run.mjs` | 0 failures, 12 check groups |

## Department #2 — a recommendation, not a decision

**Support**, on the same four criteria People/HR satisfied: greenfield, high-volume structured work, urgent need, tolerant of draft-first. Support's failure mode — a wrong drafted reply, caught before send — mirrors recruiting's risk profile almost exactly, and tickets give the same many-similar-cases leverage. Sales ops likely needs a CRM contract written first and carries higher stakes per message.

Two of the four criteria turn on business facts this repo cannot supply: whether support ticket volume is actually painful today, and whether sales ops already has clean structured data. **That makes this the founder's call, not an engineering one.** The playbook states what would flip the answer.

## The honest position

Five agents exist. **None has run.** Every guardrail claim in this repository is verified by fresh-context review and eval fixtures, never by production behaviour. The largest known gap is one no amount of further building closes: the eval harness verifies structure, references, slug agreement, and arithmetic, but it cannot verify that a skill's prose produces the behaviour it describes when a model executes it. Whether People-Ops' two-shape output contract holds against a real employee asking an ambiguous question under pressure is unknown until it runs.

The single most valuable next action is not more building. It is closing **G1–G6 and G9** so the system runs against real work and starts producing the evidence that everything else — the trust ladder, the retro loop, the calibration of the 20-draft sample and the light-edit threshold — is waiting on.

## What the founder and CTO need to do

Full detail in `docs/gates.md`. The critical path, in order of leverage:

**CTO — unblocks the deployment entirely:** G1 Fly.io org · G2 Postgres · G4 `qm-deploy` repo · G5 Google Workspace + OAuth + SPF/DKIM · G6 Slack app · G9 sign-in sender. `platform/scripts/bootstrap-qm.sh` preflights all of them and refuses to mutate anything until they pass, so the deploy is one command once they land.

**Founder — cheap and high-leverage:** G3 Anthropic key + budget cap · G7 Notion token · **G8 the agents' public names**, which is a decision rather than a credential and is currently a placeholder token in every candidate-facing template.

**Founder — gates specific agents rather than the platform:** G14 HRMS provider · G16/G17 Employees DB and Policies wiki (**G17 in particular: People-Ops will correctly refuse to answer almost everything until real policy content exists and is approved — that is the design working, but it means the agent's usefulness is gated on founder writing time**) · G18 BGV vendor · G21/G22 WhatsApp compliance and infrastructure decisions · G23 comp-benchmark source · G24 survey tooling · G25 Culture tracker.

**Two that will bite quietly if forgotten:** **G13** — the Gmail connector can draft but not send, so the first L1 promotion would appear to succeed and do nothing (ADR-007 exists to make that loud). **G19** — the command policy carries no named per-action-class rows yet, so no promotion can cite a row that exists.

## Maintenance mode

The loop from here is in `docs/RUNBOOK_MAINTENANCE.md`: watch evals and qm health, weekly retro per agent, weekly evidence rollup review, monthly upstream qm merge, gate ledger review, proposals when repeated manual work is observed, and `brain/` kept current in the same commit as the change it describes.
