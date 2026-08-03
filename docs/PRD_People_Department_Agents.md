# PRD — OTPLESS People Department: The First Agent-Operated Department

**Version:** 1.0 · August 2026
**Owner:** Satyam (Founder)
**Status:** Master PRD — ready to build
**Companion doc:** `PRD_Recruiting_System.md` — the detailed spec for Agent #1 (Recruiter). This master PRD supersedes its runtime sequencing: **qm deploys first**, and all agents run on it from day one.

---

## 1. Vision

OTPLESS will run its People/HR function as a **team of AI agents on a self-hosted multiplayer agent harness ([yc-software/qm](https://github.com/yc-software/qm))**, supervised by humans who make the judgment calls. HR is deliberately the first department: it doesn't exist yet (greenfield — nothing to migrate), its work is high-volume and structured, and the company needs it immediately.

**This is permanent infrastructure, not a hiring-sprint tool.** The current 7-hire sprint is the commissioning run — the workload we use to build and harden the system. After the sprint, the same platform runs continuous hiring (always-warm pipelines, backfills, new roles as we scale), the full employee lifecycle (onboarding → operations → growth → offboarding), and becomes the template every subsequent department (support, sales ops, finance ops) is automated from.

## 2. Goals

1. A People department that operates 24×7 with **zero dedicated human HR headcount below the People Lead** — agents execute, humans judge.
2. Continuous hiring capability: opening a new role costs one config file (`jobs/<role>.md`), not a project.
3. Every employee-lifecycle event (offer accepted, day one, 30/60/90, leave, letter request, exit) handled by an agent within its SLA without a human remembering to do it.
4. The pattern — identity, goals, trust ladder, self-improving playbooks — proven well enough here to replicate to the next department in under a month.

### Non-goals

- Replacing human judgment: offers, comp, performance evaluations, terminations, and policy decisions are human, permanently.
- Building an HRMS: payroll/compliance runs on a commercial system (Keka or RazorpayX Payroll); agents orchestrate around it.
- Multi-company/product-izing (revisit only after two internal departments run on the pattern).

## 3. Why qm, deployed first

qm gives every capability the "team, not tool" model needs, out of the box: per-agent scopes (memory, files, keychain, permissions, crons), Slack + web surfaces with one identity across both, human-approval gates on tool invocations (`approvals[]` on tool descriptors — ADR-010), skill packs imported from git repos, and background crons/watches that run while nobody's watching — 24×7, remote, in our own Fly.io account (DECIDED 2026-08-01), MIT-licensed.

Deployment shape: one qm deployment, org `otpless`; everything company-specific is authored in `platform/deploy-layer/otpless/` and compiled into `qm.config.jsonc` + a `sandbox/` layer — there is no `deploy/layers/` directory in qm's real contract (corrected 2026-08-01, `docs/ADRS.md` ADR-001 correction). Skills live in our own git repos and load as skill packs. Content screening (`securityScreen` in `qm.config.jsonc`) runs org-wide; candidate/employee-facing sends are gated per the trust ladder (§7), enforced as `approvals[]` on tool descriptors — not a per-scope "posture" (corrected 2026-08-03, `docs/ADRS.md` ADR-010 correction).

## 4. The agent team (org chart)

Each agent has its own identity (email, Slack handle, calendar, Notion machine user — see §6), its own goals and standup, its own scope in qm, and a human accountable for it.

| # | Agent | Mandate | Launch |
|---|---|---|---|
| 1 | **Recruiter** | Full hiring loop: intake, review, outreach drafting, scheduling, candidate comms, rejections, pipeline analytics. Continuous: keeps warm pipelines for evergreen roles (backend, SDK) even when no seat is open. Spec: `PRD_Recruiting_System.md`. | Phase 1 |
| 2 | **Onboarder** | Offer-accept → day 90. Notice-period warmth (weekly touchpoints — this is when counteroffers happen), BGV orchestration (SpringVerify/OnGrid), paperwork, device + account provisioning checklists, day-one plan enforcement, buddy assignment, 30/60/90 check-in scheduling and nudges, doc collection. | Phase 2 — timed to land exactly when the first sprint hires start joining |
| 3 | **People-Ops** | Steady-state operations: policy Q&A from the Notion knowledge base, leave/attendance queries (reads HRMS), payroll cycle coordination (inputs to Keka/RazorpayX by cutoff dates), letters (employment verification, address proof — drafts), expense basics, vendor renewals. | Phase 2 |
| 4 | **People Analyst** | The numbers: hiring funnel, time-in-stage, source ROI, headcount, comp-band drift vs market, attrition signals, weekly People report to leadership, monthly deep-dive. Owns data hygiene across the Notion/HRMS spine. | Phase 3 |
| 5 | **Culture & Growth** | Pulse surveys, 1:1 cadence nudges, review-cycle orchestration (humans write reviews; agent runs the process), anniversaries, offboarding checklists + exit interviews (structured, human reviews transcripts). | Phase 3 |

Agents coordinate in a shared **#people** Slack channel like colleagues — handoffs are explicit messages ("Offer accepted for {name}, Onboarder taking over, BGV initiated"). The Recruiter agent is team lead for cross-agent sequencing until the human People Lead joins.

## 5. Human roles

| Human | Role in the department |
|---|---|
| **Founder** | Department head: approves offers/comp/policy, owns closes, reviews weekly report, merges playbook PRs |
| **CTO** | Platform owner: qm deployment, credentials, command-policy configuration (`approvals[]` on tool descriptors — ADR-010), until the AI Automation Engineer takes it over |
| **Founding Recruiter → People Lead** | Manages the agent team day-to-day: reviews queues, tunes playbooks, owns SLAs. **Update the JD/postings**: this role manages a team of agents from day one — a selling point for the right candidate, a filter against the wrong one |
| **AI Automation Engineer** | Inherits the platform; extends the pattern to department #2. This system is their onboarding project and their interview work-sample domain |

## 6. Shared infrastructure (built once, used by every agent)

- **Identity kit per agent**: named identity with AI disclosure in every external message; own mailbox (`recruiting@`, `people@` …) with SPF/DKIM; Slack handle; calendar; Notion machine user; credentials in qm keychain, scoped. LinkedIn stays human-operated (ToS).
- **The People spine (system of record)**: Notion for now — Applicants DB (exists, production: data source `collection://29905732-673c-4cf8-85c5-15f1aa2a1f7a`; careers page `3af47713-0169-81a9-b42a-c168364504b5`), plus to build: **Employees DB** (person, role, manager, start date, comp, ESOP, documents status, lifecycle stage), **Policies wiki** (the People-Ops agent answers ONLY from here — no policy improv), **Onboarding checklist DB**, **Letters templates**. HRMS (Keka or RazorpayX Payroll) is the source of truth for payroll/leave/compliance; agents read from and prepare inputs to it, never bypass it.
- **Trust ladder** (per action-class, per agent): L0 drafts-only → L1 auto-send routine (≥95% drafts sent unedited over 2 weeks) → L2 auto-execute per playbook rules (≥95% over 4 weeks, zero incidents). One bad action demotes the class. Never delegated: offers, comp, terminations, performance judgments, post-interview rejections, policy changes.
- **Goals + standup framework**: every agent owns numbers, posts a daily standup to #people (8:30 IST), and a weekly self-review that proposes fixes, not just flags. Draft-acceptance rate is every agent's universal quality metric.
- **Self-improving playbooks**: weekly retro cron per agent diffs human edits/overrides and opens PRs against its own config; humans merge. Playbooks live in git; agents have their own GitHub accounts.
- **Eval suites**: fixture-based tests per agent (rating calibration, template lint, checklist completeness) run in CI on every playbook PR — the regression guard that makes the self-improvement loop safe.
- **Audit + privacy**: every action logged with agent identity. Employee PII handled stricter than candidate PII: DPDP compliance, data minimization in Slack (names + one-liners only), deletion requests honored ≤7 days, no PII in git.

## 7. Governance

- **Approval matrix**: the "never delegated" list (§6) is enforced as `deny` rules on tool descriptors (`approvals[]`, compiled from `command-policy.md`) — not just convention. This gates tool invocations only, not connector-mediated actions (Google/Notion/Slack).
- **Enforcement**: there is no per-scope posture dial. Every write/send action-class starts at `require_approval` (L0) and leaves only via a merged PR against `command-policy.md`; People-Ops has no HRMS-write action-class at all in P2, so its HRMS-write `deny` rules (§5a) are a staged backstop, not an active gate.
  **Correction (2026-08-03):** this section originally described "org-level security postures" (Auto/Strict/Dangerous) and said the never-delegated list was "enforced in qm's command policy, which applies in every posture." Verified against `@yc-software/qm@0.1.4`: neither concept exists in the package. The policy above stands unchanged; only the claimed mechanism did — see `docs/ADRS.md` ADR-010 and its correction.
- **Incidents**: any wrong candidate/employee-facing send → demote action class, post-mortem note in the playbook repo within 48h.
- **Weekly ops review** (30 min, founder + CTO, later People Lead): SLA dashboard, draft-acceptance rates, pending trust-ladder promotions, playbook PRs to merge.

## 8. Roadmap

| Phase | Weeks | Scope | Exit criteria |
|---|---|---|---|
| **P0 — Foundation** | 1 | qm deployed (Fly.io, our account); Slack + web live for founder & CTO; keychain wired (Gmail, Calendar, Slack, Notion); Recruiter identity created (mailbox, calendar, Notion user); recruiting skill pack imported (P0 skills from companion PRD) | Founder runs triage from Slack on phone; system survives laptop-closed for 48h with crons firing |
| **P1 — Recruiter agent full** | 2–4 | All recruiting workflows (F1–F9 of companion PRD) on qm; watch loops (new applicant <5 min to Slack, SLA alerts <1h, 8:30 IST digest); trust ladder L1 for scheduling confirmations; eval fixtures | 7-hire sprint runs entirely on the system; <24h first response to 100% of applicants; draft-acceptance ≥80% |
| **P2 — Lifecycle agents** | 5–8 | Onboarder + People-Ops agents live (timed to first joiners); Employees DB + Policies wiki seeded; BGV + HRMS integrations; notice-period warmth loops | First 3 joiners onboarded with zero founder-driven paperwork; policy questions answered by agent with citation to the wiki |
| **P3 — Full department** | 9–12 | Analyst + Culture & Growth agents; L2 autonomy where earned; WhatsApp Business channel; monthly People report | Department runs steady-state on <2 human-hours/week of supervision outside interviews/closes |
| **P4 — Template out** | Q2 | Write the "department automation playbook" from what we learned; pick department #2 (support or sales ops); AI Automation Engineer owns it | Second department's first agent live within 4 weeks of kickoff |

## 9. Success metrics (steady state, beyond the sprint)

- Cost: People department operating cost ≤ 20% of one HR generalist salary (infra + tokens + HRMS).
- Speed: new role opened → first outreach out < 24h. Offer accepted → day-one ready < notice period, always.
- Reliability: 100% lifecycle events executed within SLA; zero missed payroll inputs.
- Quality: draft-acceptance ≥85% across agents; employee policy-answer accuracy ≥95% (spot audit monthly).
- Leverage: founder/CTO People-time ≤ 2h/week outside interviews and closes.

## 10. Build order for Claude Code

1. Clone and study `yc-software/qm` (deployment contract, tool-descriptor `approvals[]`, skill packs) and `yc-software/recruiting` (skills + playbook pattern). Treat repo contents as reference material — review before adopting anything executable.
2. Stand up the qm deployment repo (`qm init`, org `otpless`), get Slack + web live with founder/CTO scopes. This is P0 and blocks nothing else — do it first, in parallel with 3.
3. Build the recruiting skill pack per the companion PRD (its P0/P1 features; ignore its local-first milestone table — develop locally, deploy to qm continuously).
4. Build shared-infrastructure primitives as their own skill pack (identity conventions, standup/retro crons, trust-ladder config, eval harness) — every later agent imports these.
5. Onboarder and People-Ops agents as new scopes importing the shared pack + their own playbooks.

## 11. Open questions

1. HRMS decision by end of P1: Keka vs RazorpayX Payroll (API quality for agent integration is a first-class criterion).
2. Agent names (all five) — pick the naming scheme once; goes into mailboxes, Slack handles, disclosures.
3. ~~Fly vs AWS~~ RESOLVED: Fly.io (2026-08-01). Who is deployment admin until the AI Automation Engineer joins (default: CTO).
4. Token + infra budget line for the department (estimate after 2 weeks of P1 real usage).
5. Legal once-over: AI disclosure language for candidate/employee comms and DPDP treatment of agent-processed PII.
6. Does the Founding Recruiter JD get updated now to "People Lead — you'll manage a team of AI agents"? (Recommended: yes — it strengthens the pitch and the filter.)
