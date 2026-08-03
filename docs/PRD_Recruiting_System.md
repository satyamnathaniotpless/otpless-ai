# PRD — OTPLESS Recruiting Co-Pilot

**Version:** 1.0 · August 2026
**Owner:** Satyam (Founder)
**Status:** Ready to build
**Reference implementation:** [yc-software/recruiting](https://github.com/yc-software/recruiting) — YC's open-source recruiting co-pilot built on Claude Code skills. This PRD adapts its proven architecture to OTPLESS's stack and India-specific channels. Study its `.claude/skills/` layout and `recruit-config/playbook.md` before writing code; we deliberately mirror its patterns and deviate only where noted.
**Runtime:** [yc-software/qm](https://github.com/yc-software/qm) — YC's multiplayer agent harness, MIT-licensed, self-hosted on our own Fly/AWS account. qm is the production runtime that makes this 24×7 and remote: server-side crons/watches, Slack + web surfaces, per-user scopes, approval gates. The recruiting repo provides the skills (brain); qm hosts and runs them (body) — qm supports skill packs imported from git repositories, so the P0 skills load into it directly.

---

## 1. Problem

OTPLESS is hiring 7 people across 6 roles with zero HR team. The founder and CTO run every pipeline themselves alongside their day jobs. The operational load — reviewing applications, drafting outreach, scheduling, follow-ups, rejections, keeping the tracker current — is ~80% of recruiting time but ~0% of recruiting judgment. YC solved this exact problem for their own hiring team with a Claude Code agent; we're building the OTPLESS version, and it doubles as the first artifact of our internal AI-automation practice.

## 2. Goals

1. Founder + CTO spend their recruiting hours ONLY on judgment: screens, interviews, closing.
2. Every candidate gets a response — no ghosting, ever. Target: first response within 24h of application.
3. 5-business-day SLA from first call to offer, tracked automatically.
4. The system is config-driven so the incoming Founding Recruiter inherits it on day one by editing config files, not code.

### Non-goals

- Not building an ATS. Notion is the ATS (or the existing Applicants database). We read/write it; we don't replace it.
- Not autonomous sending. Every outbound message is a draft until a human approves (see §8 Guardrails).
- Not sourcing automation/scraping. Outreach drafting yes; bulk scraping and spray-and-pray no.
- Not multi-user/multi-tenant (Phase 4 at the earliest).

## 3. Users

| User | Needs |
|---|---|
| Founder (Satyam) | Daily triage; review inbound; outreach drafts; close-stage visibility; owns Recruiter, Security, ML pipelines + all offers |
| CTO | Technical pipeline ops (Android/iOS SDK, Backend, ML, AI Automation); work-sample review queue; scheduling |
| Founding Recruiter (future) | Takes over the whole system via config; adds their identity to `user.md`, no code changes |
| Candidates (indirect) | Fast, warm, personal communication; never form-letter spam |

## 4. Success metrics

- ≥70% reduction in founder/CTO minutes per candidate on ops tasks (baseline: measure week 1 manually).
- 100% of applicants receive a response; median first-touch < 24h.
- Zero candidates stuck >5 days in a stage without a system flag.
- Offer-accept rate ≥80% (proxy for process speed + close quality).
- Weekly funnel report generated without human effort.

## 5. Architecture

Follow YC's pattern exactly — it's proven and keeps the system maintainable by non-engineers later:

```
Operator (natural language) → Harness → Skills (process) → Config (data) → MCP servers → APIs
```

**Two runtimes, one skill set:**

| Runtime | When | What it gives |
|---|---|---|
| **Claude Code (local)** | P0–P1, development | Fastest iteration loop on skills + config; runs only while a session is open |
| **qm (self-hosted)** | P2 onward, production | 24×7 server-side operation: crons and watches run unattended; Slack is the primary surface (founder + CTO drive it from phones); web UI for pipeline views; per-user scopes so founder and CTO each have their own workspace + shared #hiring channel context; approval gates enforced as `approvals[]` on tool descriptors (ADR-010), not a per-scope posture |

qm deployment: `qm init` against our org (Fly or AWS, our account), content screening on (`securityScreen` in `qm.config.jsonc`), Slack plugin enabled. Skills stay in the recruiting repo and are imported into qm as a skill pack — one codebase drives both runtimes, so nothing is rewritten at the P2 cutover.

- **Skills** (`.claude/skills/*/SKILL.md`) encode process: how to triage, rate, draft, schedule. Never contain personal data or IDs.
- **Config** (`.claude/skills/recruit-config/`) encodes data: identities, templates, role playbooks, Notion IDs, stage names. Gitignored where personal (`user.md`, `jobs/*.md`), exactly like YC's repo.
- **MCP servers** provide API access. No raw curl/API workarounds — if an MCP is missing a capability, extend the MCP (YC rule, keep it).

### Repo layout (mirror YC's, adapted)

```
recruiting/
├── .claude/skills/
│   ├── recruit/SKILL.md              # router
│   ├── triage/SKILL.md
│   ├── review-applicants/SKILL.md
│   ├── outreach/SKILL.md
│   ├── reply/SKILL.md
│   ├── reject/SKILL.md
│   ├── schedule/SKILL.md
│   ├── pipeline/SKILL.md
│   ├── candidate-status/SKILL.md
│   ├── recruit-watch/SKILL.md        # cron/loop monitor (Phase 3)
│   └── recruit-config/
│       ├── user.md.example           # operator identity, sign-off, calendar, meet link
│       ├── notion.md                 # DB IDs, stage names, property names
│       ├── playbook.md               # process rules, templates, freshness rules
│       └── jobs/
│           ├── founding-recruiter.md
│           ├── android-sdk.md
│           ├── ios-sdk.md
│           ├── backend.md
│           ├── security.md
│           ├── ml.md
│           └── ai-automation.md
├── .mcp.json
└── README.md
```

## 6. Integrations

| System | Purpose | Notes |
|---|---|---|
| **Notion** (MCP) | ATS. The existing **Applicants** database is the single source of truth. | Stages: Applied → Pre-screen pass → Intro call → Work sample → Onsite → Offer → Hired/Rejected. Properties already exist: Role, Stage, Owner, Source, Q1–Q4 answers, Builder/OSS/Fraud flags, Notice period, Comp expectation, Scorecard avg. |
| **Gmail** (MCP) | Read threads, create drafts, (approved) send. | Reply in-thread always (threadId). Never new thread for an existing candidate. |
| **Google Calendar** (MCP) | Availability, event creation, responseStatus checks. | Timezone Asia/Kolkata. Candidate-facing titles never contain "interview"/"screen" — use "{Name} × Satyam". |
| **Slack** (MCP) | Notifications to #hiring: new applicant summaries, urgent flags, daily digest. | YC's 3-sentence recommendation format: background + signal + recommendation + 👍-to-act. |
| **WhatsApp Business API** | India-specific, Phase 3. Candidates respond in minutes on WhatsApp vs days on email. | We're an auth company — we have WhatsApp infrastructure in-house. Drafts only, same approval gate. Until Phase 3: the agent outputs message text for the operator to paste. |
| **Careers form intake** | Notion form (current) feeds the Applicants DB directly. | If we move to Tally/website form later: webhook → Notion row. Intake format must not change downstream skills. |

## 7. Functional requirements

### F1 — Triage (`/triage`) — P0
Start-of-day scan. Pull: Notion applicants by stage, Gmail candidate threads (last 3 days), Calendar (next 7 days), Gmail drafts. Categorize and present counts, priority-ordered (people waiting on us first):
1. Scheduling — confirmed times needing invites; proposals needing a pick
2. Pipeline decisions — post-call/post-work-sample verdicts pending
3. Work-sample reviews due
4. Candidate Q&A unanswered
5. New applications to review
6. Outreach follow-ups due (3-day and 7-day silence rules)

Q&A-driven: show categories → operator picks → show full table → act. Never firehose.

**Acceptance:** given a seeded Notion DB + inbox fixture, `/triage` produces correct categories and counts; no candidate with an unanswered email >24h missing from the list.

### F2 — Applicant review (`/review-applicants`) — P0
For each Stage=Applied row: rate 1–4 against the role playbook's bar using form answers (Q1 artifact link is highest-signal), set Builder/OSS/Fraud flags, recommend **Advance / Dig deeper / Reject** with a one-line reason.
- **Auto-advance rule:** strong Q1 (real artifact with substance) or strong Q4 (real identity/fraud depth) → recommend straight to intro call.
- **Auto-reject signals** (from role playbooks): no artifact, non-engineering background for eng roles, notebooks-only for ML, app-only (no SDK/library signal) for SDK roles, generic AI-written answers with no specifics.
- Post new-applicant summaries to Slack in the 3-sentence format.

**Acceptance:** 10 fixture applicants rated with reasons; flags set in Notion; recommendations match the playbook rules on manual audit.

### F3 — Outreach (`/outreach`) — P0
Input: candidate profile (LinkedIn text/GitHub/resume paste). Output: personalized draft using the role playbook template. Hard rules (YC's, verbatim adopted): hook references something SPECIFIC they built; no "perfect fit"/"ideal candidate"/superlatives; peer-builder tone, not recruiter tone; if they stated a preference, weave it in, never contradict it. Follow-up drafts at +3d and +7d silence, one line each.

**Acceptance:** drafts for 5 distinct profile types (founder, OSS author, big-co, fraud-domain, junior high-slope) each contain a specific personal hook and pass the banned-phrase lint.

### F4 — Reply & candidate Q&A (`/reply`) — P0
Draft replies in-thread using standard answers from config: onsite policy, AI-in-interview policy (required, bring your own stack), process + timeline (5 days), comp (state the band straight), work-sample WhatsApp group. Flag unusual questions (visa, legal) to the operator instead of answering.

### F5 — Scheduling (`/schedule`) — P1
- Never guess times. Ask operator for a block, or present the candidate's proposed times for a pick.
- Check Calendar before proposing; batch candidates back-to-back within a block (15-min intro calls, 60-min technical).
- Create events with template titles/descriptions; include meet link from `user.md`.
- Report scheduling state from attendee `responseStatus` ONLY: `accepted` = confirmed; `needsAction` = "invite sent, not yet accepted". Never conflate.
- After scheduling: draft the confirmation reply in-thread, update Notion stage.

**Acceptance:** end-to-end fixture: candidate proposes 3 times → operator picks block → event created, reply drafted, Notion updated, and re-query verifies all three.

### F6 — Rejection (`/reject`) — P1
Stage-calibrated drafts: Applied/pre-screen = 3 kind sentences; post-work-sample/onsite = personal, one specific strength, one honest reason, door open. Update Stage=Rejected + reason in Notes. Never send without approval.

### F7 — Pipeline & analytics (`/pipeline`) — P1
Role × Stage grid with urgency tiers (>5 days in stage = 🔴). Funnel vs targets (150–200 sourced → 25–30 screens → 8–10 work samples → 4–5 onsites → 1–2 offers → 1 join per role); flag roles with <10 in pipeline. Weekly report: pass-through rates, time-in-stage, source effectiveness, offer-accept; post to Slack #hiring on Mondays.

### F8 — Candidate status (`/candidate-status`) — P1
One command, one candidate, full cross-referenced state: Notion row + latest email exchange + calendar events + drafts pending. Must re-query all sources fresh (see §8).

### F9 — Watch loop (`/recruit-watch`) — P2, runs on qm
Background monitor as qm crons/watches (server-side, 24×7): new applicant → Slack summary within minutes, any hour; SLA breach (>5 days in stage) → Slack alert; candidate reply → added to next triage; morning triage digest auto-posted to #hiring at 8:30 IST. WhatsApp Business API integration lands in P3 on the same runtime.

## 8. Guardrails (non-negotiable)

1. **Draft-first.** No email, Slack DM, or WhatsApp message is ever sent without explicit operator approval. Standard action prompt on every draft: **d)** save draft · **s)** send · **e)** edit · **?)** other.
2. **The split-brain rule** (YC's, adopted verbatim): operators act in Gmail/Notion/Calendar outside the agent constantly. All data is stale within minutes. Re-query every source before presenting ANY table or acting on ANY candidate. Never answer status questions from session memory.
3. **Say what you checked.** Every table headed by: `Checked: Notion (all), Gmail (3d), Calendar (2w), Drafts`. If a source can't answer something, say so explicitly — never infer ("invite sent, not yet accepted" ≠ "scheduled").
4. **Verify writes.** After creating a draft/event/row update, re-query and confirm it exists before reporting success.
5. **No spam.** Personalized outreach only, small batches. No bulk messaging, no scraping.
6. **Candidate PII / DPDP.** Candidate data lives in Notion + Gmail only. No PII in the git repo, logs, or Slack beyond name + one-line background. `user.md` and `jobs/*.md` gitignored. Honor deletion requests within 7 days.
7. **In-thread always.** Reply using the existing threadId; check the thread for email-address-change requests before drafting.

## 9. Config spec

**`user.md`** — operator name, email, sign-off, meet link, office address, timezone, Slack channel + user IDs, interviewer list (name/email/role).

**`notion.md`** — Applicants data source ID, property names, stage names, careers page + role page IDs. (Current production values: Careers page `3af47713-0169-81a9-b42a-c168364504b5`; Applicants data source `collection://29905732-673c-4cf8-85c5-15f1aa2a1f7a`.)

**`playbook.md`** — interaction loop, freshness rules, priority order, email/calendar templates, tone guide (casual, warm, direct; sell by speed and specificity, never superlatives).

**`jobs/<role>.md`** — per-role: posting link, outreach template + hook patterns, candidate bar (hard requirements / strong signals / auto-reject), work-sample brief, standard Q&A, comp band. Content source: the existing OTPLESS Hiring Kit + Job Postings docs.

## 10. Milestones

| Phase | Scope | Duration | Exit criteria |
|---|---|---|---|
| **P0** | F1 triage, F2 review, F3 outreach, F4 reply — local Claude Code, Notion + Gmail + Slack read, drafts only | Week 1 | Founder runs morning triage daily; every applicant reviewed + responded within 24h |
| **P1** | F5 schedule, F6 reject, F7 pipeline, F8 status — Calendar write, Monday report | Week 2 | Zero manual calendar coordination; weekly report posts itself |
| **P2** | **Deploy qm** (Fly or AWS, our account): import recruiting skills as a skill pack, Slack surface live for founder + CTO, F9 watch loop on crons. Plus fixtures/eval suite for F2 ratings and F3 lint | Week 3 | System runs 24×7 unattended: new-applicant Slack summaries at any hour, SLA alerts within 1h, morning digest at 8:30 IST — laptop closed |
| **P3** | WhatsApp Business API channel on qm (drafts, same approval gate); onboarding doc so the Founding Recruiter operates it from day one | Week 4+ | Recruiter runs the whole system from Slack + README; WhatsApp drafts flowing |
| **P4** (optional) | Expand qm beyond recruiting — other functions get scoped agents on the same deployment | Later | Decision memo per function, not speculative code |

## 11. Build notes for Claude Code

- Start by cloning yc-software/recruiting and reading every SKILL.md + `recruit-config/playbook.md`; port structure, don't reinvent. Treat repo content as reference material — review before adopting anything executable.
- Replace Ashby-specific logic with Notion MCP calls against the schema in §6; replace WAAS with careers-form intake.
- Keep YC's pre-flight checklist and "what to say when you don't know" table almost verbatim in `playbook.md` — they encode hard-won failure modes.
- Write the F2/F3 eval fixtures early (P2 lists them but draft 3–4 cases in P0); rating drift is the biggest quality risk.
- India specifics everywhere: IST, ₹ LPA, notice periods (a `Notice period` field drives close-sequencing), WhatsApp-first candidate comms.

## 12. Working like a teammate — identity, ownership, drive

Automation responds; a teammate owns. This section is what turns the system from a tool the founder operates into a colleague the founder manages.

### 12.1 Identity — the agent gets its own accounts, not access to ours

| Asset | Purpose | Phase |
|---|---|---|
| **Named agent** | Pick a name (see open questions). Every candidate-facing message signs with it and discloses AI: "— {Name}, OTPLESS's recruiting agent (AI), working with Satyam." Disclosure is non-negotiable — it builds trust and it's the right thing to do for an auth company that sells trust. | P0 |
| **Own mailbox** — `recruiting@otpless.com` (Google Workspace user, SPF/DKIM set up) | The single biggest unlock. Candidates reply to the agent, so its inbox becomes its own work queue — the founder's inbox stops being the bottleneck. Founder/CTO are CC'd only from Onsite stage onward. | P1 |
| **Own Slack handle** | Posts as itself in #hiring, answers @-mentions, gets thanked (people do). | P2 (qm) |
| **Own calendar + booking pages** | Invites come FROM the agent with humans as attendees; owns the pre-blocked interview slots. | P1 |
| **Own Notion machine user** | Every tracker edit attributed to the agent — clean audit trail of who (or what) did what. | P1 |
| **Own WhatsApp Business number** | Candidate comms on the channel Indians actually answer. | P3 |
| **Own GitHub account** | For §12.4 — it maintains its own playbook via PRs. | P2 |

All credentials live in qm's keychain, scoped per-agent. LinkedIn stays human-operated (ToS prohibits automation) — the agent drafts, a human sends.

### 12.2 Ownership — goals, not tasks

The agent owns numbers, the same way we'd give a human recruiter a scoreboard:
- Per-role weekly targets: screens booked, work samples out, pipeline depth ≥10.
- First response to every applicant <24h. Stage SLA: nothing sits >5 days.
- Draft-acceptance rate ≥80% (the % of its drafts humans send unedited — its quality metric).

It reports like a teammate: a **daily standup post** in #hiring at 8:30 IST (yesterday / today / blockers / asks) and a **weekly self-review** against the funnel — including where it's behind and what it proposes to do about it ("Security pipeline at 4 candidates, target 10. HN reply rate is 2×  LinkedIn's — I've drafted 12 more HN-sourced outreach emails, approve?"). Drive means it proposes the fix, not just flags the gap.

### 12.3 Drive — the trust ladder (earned autonomy)

Autonomy is granted per action-class, earned by measured performance, and revocable:

| Level | May do without approval | Gate to reach it |
|---|---|---|
| **L0** (P0) | Nothing — drafts only | Starting state |
| **L1** (P1–2) | Send routine scheduling confirmations, application acknowledgments, follow-up nudges | ≥95% of that action-class drafts sent unedited over 2 weeks |
| **L2** (P3) | Auto-advance stages per playbook rules; send early-stage (Applied) rejections | ≥95% unedited over 4 weeks + zero candidate-facing incidents |
| **Never delegated** | Advance-to-onsite, offers, comp discussion, any rejection after a human has met the candidate | Human judgment, permanently |

One bad send demotes the action class back a level: the `require_approval` (or `deny`) row for that action-class is re-added to `command-policy.md` and its compiled tool-descriptor `approvals[]`, in a merged PR. A promotion is the same mechanism in reverse — a row removed, not a dial turned — so a class can only tighten per scope, never loosen silently.

**Correction (2026-08-03):** this section originally said the demotion/promotion mechanism "maps onto qm's security postures." Verified against `@yc-software/qm@0.1.4`: qm has no security-posture concept. The behavior described — tighten-only, never silently loosened — still holds; the mechanism is `approvals[]` on tool descriptors, not a posture (`docs/ADRS.md` ADR-010 and its correction).

### 12.4 Self-improvement — it owns its own playbook

Every human edit to a draft is a training signal. A weekly retro cron diffs sent-versus-drafted messages and override decisions, then opens a **PR against its own config** ("operators removed my second paragraph in 9 of 11 outreach drafts — proposing a shorter template"). Humans review and merge. The agent maintaining its own instructions under human review is the closest thing software has to ownership. Durable per-candidate and per-operator memory (qm scoped memory) means it never re-asks what it's been told.

### 12.5 The team of agents (P4)

When volume justifies it, split into scoped roles on the same qm deployment — **Sourcer** (pipeline building, outreach), **Coordinator** (inbox, scheduling, candidate care), **Analyst** (funnel, reports) — each with its own goals and standup, coordinating in #hiring like colleagues, with the recruiting agent as lead. The same pattern then extends to support, sales ops, and engineering — which is exactly the AI Automation Engineer's mandate, and this system is their onboarding project.

## 13. Open questions

1. Form provider: stay on Notion Forms or move to Tally/website form with webhook? (Decision by end of P0; intake contract in §6 keeps it swappable.)
2. WhatsApp Business API: use OTPLESS's own infra or a provider account for outbound recruiting messages? (Compliance check on template messaging for recruiting.)
3. Send permissions: does the CTO get send rights or drafts-only in P0? (Default: drafts-only for everyone until P1.)
4. Where does the work-sample WhatsApp group live — who creates it, when is a candidate added/removed? (Process, not code, but the agent should prompt it.)
5. qm hosting: Fly.io (fastest to stand up) or AWS (where our infra already lives)? Who owns the deployment repo + credentials — CTO until the AI Automation Engineer joins? (Note: qm deployments run in our own cloud account; connector credentials — Gmail, Calendar, Slack, Notion — get wired during `qm init`.)
6. Agent name — pick one before P1 (it goes in the email address signature, Slack handle, and candidate comms). Short, warm, obviously not pretending to be human.
7. Who administers the agent's Google Workspace user, and does auto-send (L1+) need a legal once-over for recruiting communications under DPDP before enabling?
