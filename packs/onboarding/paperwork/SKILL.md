---
name: paperwork
description: |
  Document collection tracking and reminders for a hire's required paperwork. Use when the
  user says "paperwork", "documents", "docs", "what's missing", or on the status-check cron.
---

# Paperwork / document collection

## Trigger

On handoff receipt, on the periodic status-check cron (`../onboard-watch`), or ad hoc: "what documents are we missing for {hire}", "paperwork status", "nudge {hire} on docs".

## Inputs

- `../config/checklists/{role}.md` (the required-documents list for this role/level)
- The hire's documents-status field (Employees DB once it exists — `../config/notion.md` — or interim checklist doc)
- The hire's message thread (email/WhatsApp)
- `../config/playbook.md` (reminder template, tone, escalation rules)

## Process

1. Re-query fresh which documents from the role's required list are received vs. outstanding. Never assume completeness from an earlier session.
2. For each outstanding document, check whether a reminder was already sent and how long ago. Draft a reminder (template in `../config/playbook.md`) only for documents genuinely overdue or approaching the start-date deadline — don't nag daily.
3. If the hire's reply raises a comp/offer/policy question while discussing paperwork (e.g. "can you send the paperwork explaining my comp structure"), do not answer — follow `../config/playbook.md` § Escalation.
4. If documents remain outstanding within 3 business days of the start date, escalate to `../day-one` and the accountable human as a readiness-gate risk, not routine follow-up.
5. Present drafts via the standard `d) draft  s) send  e) edit  ?) something else` prompt. Update the tracking record after every action, re-read to confirm.

## Output contract

One line stating what was checked (required list, received vs. outstanding, days since last reminder), then either a drafted reminder awaiting approval, an escalation note, or a plain "all documents received" statement.

## Failure behavior

- Role checklist doesn't specify a document list (new/unfilled role file) → say so explicitly and ask the operator to fill `../config/checklists/{role}.md` rather than guessing a generic list.
- Document status unclear (received but not logged, or logged but not verified) → state the ambiguity rather than rounding to "received."
- Never draft a message that discusses comp, ESOP, or offer terms even if the document itself concerns them (e.g. an appointment letter) — content review for those documents is the accountable human's, not this skill's.
