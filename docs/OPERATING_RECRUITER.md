# Operating the Recruiter agent

Purpose: the one document a human operator (Founder, CTO, or the incoming Founding Recruiter) reads to run the OTPLESS recruiting agent day to day — what it can do, how to invoke it, how to approve its work, and how to change it without touching code.

This is a guide to what already exists elsewhere in the repo. Where a rule could drift if restated here, this document points at the file that actually governs it instead of copying the rule.

## 1. What the agent is, and is not, allowed to do

The recruiting agent is a named identity (mailbox `recruiting@otpless.com`, own Slack handle, own calendar, own Notion machine user — `packs/recruiting/config/agent.md`) that drafts recruiting work. It does not act unsupervised on anything candidate-facing.

Three rules govern everything it does. Read them at the source, not the summary below, because the source is what actually gets enforced:

- **Draft-first, always.** Every candidate/employee-facing action ends at a created draft — never a send — until a human approves it. This is the contract boundary, not a convention: `docs/ADRS.md` ADR-007, and every skill's own "Output contract" section (e.g. `packs/recruiting/outreach/SKILL.md`, `packs/recruiting/reply/SKILL.md`).
- **The never-delegated six.** Offers, compensation, terminations, performance judgments, post-interview rejections, and policy changes are never delegated at any trust level, in any posture — enforced as a hard deny in `platform/deploy-layer/otpless/command-policy.md` §4, restated in `packs/shared/trust-ladder/SKILL.md` step 4.
- **AI disclosure on every candidate-facing message**, no exceptions, in the exact signature format the agent's identity config defines — `packs/shared/identity/SKILL.md` §1–2, signature source `packs/recruiting/config/user.md` (or `config/agent.md` until the agent's public name lands — see §7 below).

Everything else the agent may or may not do for a given action right now is a function of its **trust ladder level** for that specific action-class — see `packs/shared/trust-ladder/SKILL.md` for how the ladder works, and `platform/deploy-layer/otpless/scopes/recruiter.md` § "Action-classes with current trust level" for what level each action-class is at today (as of this writing: everything is L0, drafts-only).

## 2. The daily loop

**Morning triage.** Say "triage" (or "what's in my queue," "start of day") and the agent re-queries Notion, Gmail, and Calendar fresh, then presents six priority-ordered categories with counts — scheduling, pipeline decisions, work-sample reviews, candidate Q&A, new applications, outreach follow-ups. It asks which category you want to work first; it never dumps a full table unprompted. Full process: `packs/recruiting/triage/SKILL.md`.

**The 08:30 IST digest.** A scheduled job (`recruit-triage-digest`, `platform/deploy-layer/otpless/crons.md`) runs the same triage logic automatically every morning and posts the summary to `#hiring`. Until the Slack-digest action-class earns a trust-ladder promotion, that post itself is a *draft* awaiting your approval, not a live message — see the crons table's note on output surface, and `platform/contracts/slack.md`.

**Acting on a draft.** Every skill that produces candidate-facing content ends with the same prompt:

```
d) draft   s) send   e) edit — tell me what to change   ?) something else
```

Pick `d` to leave it queued for later, `e` to redirect it, `s` only when you mean to approve it now. This prompt appears identically in `packs/recruiting/outreach/SKILL.md`, `reply/SKILL.md`, `reject/SKILL.md`, `schedule/SKILL.md`, and `review-applicants/SKILL.md` — it is not skill-specific phrasing, it is the approval gate.

**Where approval actually happens.** Answering `s` is not the approval mechanism itself — the authorization event is recorded by qm's own command-policy gate, not by anything in Slack. `docs/ADRS.md` ADR-006 is explicit that Slack is a notification and discussion surface only: a Slack emoji reaction is not observable by the agent and is not an audit trail. If you see a "👍-to-act" shorthand anywhere in the PRDs, that describes the desired ergonomics (one gesture, in Slack), not how approval is currently wired — today, approval is the explicit `s`/`e` reply qm's gate captures, full stop.

## 3. Command surface

Every skill lives under `packs/recruiting/`. Say roughly what's in the "say" column — the router (`packs/recruiting/recruit/SKILL.md`) also matches these phrases and will ask you to disambiguate if it can't tell which one you mean.

| Skill (file) | Say | What it returns |
|---|---|---|
| `recruit/SKILL.md` | "recruit", "candidates", "hiring", or anything that doesn't clearly name one skill below | A one-line statement of which sub-skill it routed to, then that skill's own output — it never fabricates a table itself |
| `triage/SKILL.md` | "triage", "what's in my inbox", "what do I need to deal with today", "start of day" | The six-category priority summary with counts, headed by what was checked (Notion/Gmail/Calendar/Drafts); on your pick, hands off to the matching skill below |
| `review-applicants/SKILL.md` | "review applicants", "who applied", "new inbound", "review the queue for {role}" | A rated table (1–4) of every Stage=Applied candidate against that role's bar, with Advance/Dig deeper/Reject and a one-line reason each, gated by `d/s/e/?` before any Notion write |
| `outreach/SKILL.md` | "reach out to X", "outreach to X", "email X" (no existing thread) | A personalized cold-outreach draft with a specific hook, gated by `d/s/e/?` |
| `reply/SKILL.md` | "reply to X", "draft for X", "email X" (existing thread) | An in-thread reply drafted from the standard Q&A table or the role playbook, or a flag to you if the question isn't covered, gated by `d/s/e/?` |
| `schedule/SKILL.md` | "schedule", "find me a block", "book calls" | A calendar event proposal/confirmation plus an in-thread confirmation draft, reporting confirmation state from attendee `responseStatus` only, gated by `d/s/e/?` |
| `reject/SKILL.md` | "reject X", "pass on X" | A stage-calibrated rejection draft (short for Applied/Pre-screen, personal for post-work-sample/onsite), gated by `d/s/e/?`; anything past Onsite is flagged as never-delegated, draft only |
| `pipeline/SKILL.md` | "pipeline", "funnel", "priorities", "weekly report" | A Role × Stage grid with urgency flags (🔴 >5 days) plus funnel-vs-target comparison; posts to `#hiring` Mondays via `recruit-pipeline-report` (`crons.md`) |
| `candidate-status/SKILL.md` | "status on {candidate}", "where's {candidate}", "what's happening with {candidate}" | One candidate's full cross-referenced state — Notion, Gmail, Calendar, drafts, re-queried fresh every time, never merged or inferred across sources |
| `recruit-watch/SKILL.md` | Not conversational — runs as scheduled crons (`crons.md`); invoke manually only to test | New-applicant/SLA/reply/digest monitoring; posts internal Slack drafts and folds candidate replies into the next triage, never drafts or sends candidate-facing content itself |

## 4. Shadow-mode cutover

Per `docs/RUNBOOK_DEPLOY.md` §5:

- **Day 1–2:** the agent drafts everything in parallel while you keep working the pipeline exactly as you do today. Nothing the agent produces replaces your own actions yet — this is a side-by-side comparison, not a handover.
- **Day 3:** the agent's drafts become the actual workflow — you review and approve through the `d/s/e/?` gate instead of writing from scratch.
- **Week 2:** the first trust-ladder promotion review happens, per the evidence windows in `docs/ADRS.md` ADR-004 (≥95% of an action-class's drafts sent unedited over a trailing 2-week window moves that action-class to L1). This is a review, not an automatic promotion — a human merges the promotion PR against `platform/deploy-layer/otpless/command-policy.md`; see gate G11 in `docs/gates.md`.

## 5. How to change the system without touching code

Everything below is a config edit, never a skill edit. This is deliberate — see `docs/ADRS.md` ADR-005.

| To do this | Edit this file |
|---|---|
| Open a new role | Copy `packs/recruiting/config/jobs/_template.md` to `packs/recruiting/config/jobs/{role-slug}.md`, fill every `{brace}`. It's live across triage/review/outreach/reply/schedule/reject/pipeline with no skill changes. |
| Change tone, templates, or the standard Q&A answers | `packs/recruiting/config/playbook.md` |
| Change the operator's identity, sign-off, meet link, or the agent's own name/mailbox/handle | `packs/recruiting/config/user.md` (copy from `user.md.example`, gitignored — never commit the real file) |
| Change the bar (hard requirements, strong signals, auto-advance/auto-reject rules) for a specific role | That role's file, e.g. `packs/recruiting/config/jobs/backend.md` |
| Change Notion property/stage/ID mappings | `packs/recruiting/config/notion.md` |
| Change owned numbers / SLA targets | `packs/recruiting/config/goals.md` |

An existing example of a filled role file (for reference when writing a new one): `packs/recruiting/config/jobs/backend.md`, `packs/recruiting/config/jobs/ai-automation.md`, and the other five under the same directory.

## 6. What to do when it is wrong

**A bad draft (wrong tone, wrong fact, wrong recommendation):** pick `e` at the prompt and say what to change — that correction is itself useful signal. Every week, a retro job (`packs/shared/retro/SKILL.md`, cron `recruit-retro` in `platform/deploy-layer/otpless/crons.md`) diffs your edits against what the agent drafted; once a pattern repeats ≥3 times in a cycle, it opens a PR against the agent's own config proposing the fix. You (or whoever holds merge rights per `docs/PRD_People_Department_Agents.md` §5) review and merge — the agent never merges its own PR.

**A bad send** (something went out wrong — wrong recipient, wrong content, or it crossed a never-delegated line): the triggering action-class is demoted one trust-ladder level immediately, and the evidence clock for re-promotion restarts from zero — `platform/deploy-layer/otpless/command-policy.md` §6. This happens as a policy-file change, not a runtime judgment call, so it holds regardless of who's watching.

**Where it gets recorded:** a post-mortem note is expected within 48h per `docs/PRD_People_Department_Agents.md` §7 (Governance). Company-facing decisions and policy-level changes are logged in `brain/decisions/log.md` (append-only, per `docs/ADRS.md` ADR-003) in the same commit as any resulting config change; the demotion itself lands as the command-policy edit described above.

## 7. Known limitations today

State these plainly to anyone new to the system — none of them are hidden, and none should be assumed fixed without checking `docs/gates.md`:

- **The deployment is not live.** qm hasn't been stood up yet — nine human-gated prerequisites (G1–G9) are still open, tracked in `docs/gates.md`. Until they close, this system runs only in a local Claude Code session, not 24×7 on qm.
- **The Gmail connector can draft, not send.** The available Gmail MCP surface is draft/label/read only — there is no send operation. Every "approved send" today still means a human clicks send in Gmail. This is gate G13 in `docs/gates.md`, and the underlying policy is `docs/ADRS.md` ADR-007: the fix is extending the MCP with a real send capability, never a workaround (raw HTTP, headless browser, or sending from a human's own mailbox).
- **Slack reactions are not an approval mechanism.** Covered in §2 above — restated here because it is the single most common wrong assumption a new operator makes. See `docs/ADRS.md` ADR-006.
- **WhatsApp is Phase 3.** Candidate channel preference is WhatsApp over email (`packs/recruiting/config/user.md`), but the WhatsApp Business API isn't wired yet. Until it is, the agent drafts the message text and a human copies/pastes it manually — same `d/s/e/?` gate as email.
- **The agent's public name isn't finalized.** Every reference to it is a placeholder token pending a Founder decision — gate G8, `docs/gates.md`; see `packs/recruiting/config/agent.md`.
