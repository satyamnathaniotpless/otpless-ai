<!-- Purpose: contract between recruiting skills and Gmail — candidate email — so no skill ever touches the Gmail MCP or assumes a send capability it doesn't have. -->

# Contract: Gmail

## Purpose

Candidate email channel — reply in-thread, draft everything, send only on operator approval (PRD §6, §8 guardrail 1).

## What we read

- `search_threads`: candidate threads in a recent window (F1 triage: last 3 days).
- `get_thread` / `get_message`: full thread content before drafting a reply, and to check for an email-address-change request (guardrail 7).
- `list_drafts`: drafts pending across the mailbox (F1, F8).

## What we write

- `create_draft` / `update_draft`: every candidate-facing reply, outreach, rejection, and scheduling confirmation (F3, F4, F5, F6) — draft only, never sent by the skill itself.
- `label_message` / `label_thread`, `create_label`: triage/categorization labels if a skill needs to mark threads (no label taxonomy defined yet — add one to `packs/recruiting/config/` before relying on this).

## Field & name mapping

Always reply using the existing `threadId` — never open a new thread for an existing candidate (PRD §6, guardrail 7). Agent's own mailbox (`recruiting@otpless.com`) per `packs/shared/identity/SKILL.md`. Candidate channel preference (WhatsApp > email) and meet link live in `user.md` (gitignored, per-deployment).

## Staleness & re-query semantics

Operators reply and act in Gmail outside the agent constantly (split-brain, PRD §8). Re-search threads fresh for every triage pass — never rely on a thread state read earlier in the session.

"Not set" vs "unknown": a thread with no candidate reply since our last message means *waiting on candidate* — reportable. A thread that fails to fetch means *unknown* — report "Gmail: couldn't check this thread," never count it as silence.

## Write verification

After `create_draft`/`update_draft`, call `list_drafts` or `get_thread` to confirm the draft appears attached to the correct thread before reporting the draft as ready for operator review.

## Failure modes

| Failure | Consuming skill must |
|---|---|
| Gmail unavailable | Skip email-sourced categories in triage, state explicitly "Gmail: unreachable," never present an empty email section as "nothing pending" |
| Rate-limited | Back off, retry once; report partial results labeled incomplete |
| Permission-denied | Halt, escalate as a mailbox/OAuth grant issue — never fall back to another mailbox |
| Ambiguous result (multiple threads matching a candidate) | Surface all matches to the operator; never guess which thread to reply in |

## Capability gaps today

**No send tool.** The available Gmail MCP operations are draft/label/read only — there is no `send` operation. Every "approved send" in the PRD (§6, §8) therefore still requires a human to actually send the drafted message (or the MCP must be extended with an approval-gated send tool before any action-class can reach L1/L2 for sends). This is the single largest gap between the PRD's stated capability and what's available today — flag for extension, not a workaround.

## Credentials required

- OAuth token for the recruiting agent's own mailbox (`recruiting@otpless.com`) — provided by: Satyam (Google Workspace admin).
- SPF/DKIM DNS records for the mailbox — provided by: Satyam (DNS access) — human gate per CLAUDE.md.
