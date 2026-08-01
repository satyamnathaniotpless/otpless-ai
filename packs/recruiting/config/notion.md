# notion.md — Notion IDs, properties, and stage/select values

Source of truth for all Notion identifiers and schema. Never hardcode these in skills — read this file instead.

## Pages

| Item | ID |
|---|---|
| Careers page | `3af47713-0169-81a9-b42a-c168364504b5` |
| Applicants data source | `collection://29905732-673c-4cf8-85c5-15f1aa2a1f7a` |

## Applicants DB — properties

| Property | Type | Notes |
|---|---|---|
| Name | Title | Candidate full name |
| Email | Email | |
| Phone / WhatsApp | Phone | Preferred candidate channel — see `user.md` |
| Role | Select | One of the 7 roles — see Role values below |
| Stage | Select | See Stage values below |
| Owner | Select | Satyam / {CTO name} / Founding Recruiter |
| Source | Select | Careers form / LinkedIn / HN / Referral / Outbound / Other |
| Referrer | Text | Name of referring person, if Source = Referral |
| Q1 Something you made (link) | URL | Highest-signal field — real artifact |
| Q2 What you built & cut | Text | Decision-making narrative |
| Q3 AI usage & limits | Text | |
| Q4 Identity/auth/fraud depth | Text | Auto-advance trigger if strong |
| Builder / OSS / Fraud flag | Multi-select | Values: Builder, OSS, Fraud-depth (0–3 may apply) |
| Notice period | Text | Drives close-sequencing |
| Comp expectation | Text | ₹ LPA, free text |
| Scorecard avg (1-4) | Number | Set during review-applicants / post-interview |
| Applied | Date | Application timestamp |
| Notes | Text | Free-form — reasons, flags, rejection notes |

## Stage values (in order)

`Applied → Pre-screen pass → Intro call → Work sample → Onsite → Offer → Hired` (or `Rejected` at any point)

## Role values

`Founding Recruiter`, `Android SDK Engineer`, `iOS SDK Engineer`, `Backend Engineer`, `Security Engineer`, `ML Engineer`, `AI Automation Engineer`

## Owner values

`Satyam`, `{CTO name}`, `Founding Recruiter` — see `user.md` for who owns which role's pipeline.

## Source values

`Careers form`, `LinkedIn`, `HN`, `Referral`, `Outbound`, `Wellfound`, `Instahyre`, `Cutshort`, `Other`

## Query conventions

- Re-query the Applicants data source fresh before every table (see playbook.md split-brain rule) — never trust a Stage/Owner value read earlier in the session.
- Filter by Stage for triage/review; filter by Role for pipeline funnel views.
- Every write (stage change, flag set, note added) must be re-read back before reporting success.
