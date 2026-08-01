<!-- Purpose: the generic onboarding checklist, instantiable per role/level with no skill change (ADR-005 mirrors packs/recruiting/config/jobs/_template.md). -->

# checklists/_template.md — onboarding checklist template

Copy this file to `checklists/{role-slug}.md`, fill every `{brace}`, and that role/level's onboarding runs across notice-period-warmth, bgv, paperwork, provisioning, day-one, buddy-assignment, and check-ins with no skill changes. This file is the *template* for a role/level (like `jobs/_template.md`); the *live, per-person* instance of it (dates, statuses) lives in the Onboarding checklist DB (TODO(gate): not yet built, master PRD §6) once that exists — until then, skills draft against this file directly and hand tracking to a human.

## Role

- **Role:** {Role name — matches recruiting's Role values where applicable}
- **Level:** {IC / Senior IC / Manager — whatever bands apply}
- **Owner (accountable human for this hire's onboarding):** {Founder / CTO / People Lead}
- **Typical notice period for this hire pool:** {e.g. 30–90 days — Indian notice periods run long; this is why the warmth loop exists, see `../playbook.md`}

## Notice-period warmth

- **Cadence:** {default weekly — see `../playbook.md`; override here only if this role needs a tighter cadence}
- **Role-specific talking points:** {e.g. team/project they're joining, a recent shipped feature to reference}
- **Known counteroffer risk factors for this role:** {e.g. senior/scarce-skill roles in a hot market carry higher risk — flag for closer attention}

## Background verification (BGV)

- **Checks required:** {e.g. employment history, education, criminal record, address}
- **Vendor:** see `../vendors.md` — never hardcode a vendor name in a skill or here beyond a reference
- **SLA:** {e.g. N business days from initiation — confirm once a vendor is selected}

## Paperwork / documents required

- {doc 1 — e.g. PAN card}
- {doc 2 — e.g. Aadhaar / address proof}
- {doc 3 — e.g. previous employer relieving letter + last 3 payslips}
- {doc 4 — e.g. education certificates}
- {add or remove rows per role/level}

## Device & account provisioning

- **Devices:** {e.g. laptop spec appropriate to this role}
- **Accounts:** {e.g. email, Slack, Notion, role-specific tools}
- **Access level:** {role-specific system access, e.g. prod-read for backend, none for non-technical roles}
- **Lead time before start date:** {e.g. request by T-7, verify ready by T-2}

## Day-one plan

- {e.g. 09:30 — welcome + logistics}
- {e.g. 10:00 — buddy intro}
- {e.g. 11:00 — manager 1:1}
- {e.g. afternoon — role-specific first task}

## Buddy

- **Selection criteria for this role:** {e.g. same team, joined within the last year, strong track record helping new joiners}

## 30/60/90 check-ins

- **30-day focus:** {e.g. ramped on codebase/domain, shipped something small}
- **60-day focus:** {e.g. owns a small scope end-to-end}
- **90-day focus:** {e.g. full productivity checkpoint — scheduling only; any performance judgment made in this check-in is human, never the agent's, per the never-delegated list}
