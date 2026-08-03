<!-- Purpose: contract between recruiting skills and Gmail — candidate email — so no skill ever assumes a connector tool name or a send capability it doesn't have. -->

# Contract: Gmail

## Purpose

Candidate email channel — reply in-thread, draft everything, send only on operator approval (PRD §6, §8 guardrail 1).

## Mechanism

Reached through qm's **Google connector** (`platform/contracts/README.md` "How a contract reaches its system") — the same connector `calendar.md` uses, registered once for Google Workspace as a whole. Confirmed registered (Admin-UI step) on the OTPLESS deployment; whether the recruiting agent's own mailbox (`recruiting@otpless.com`) has completed the second, individual connection step at `/keychain` is unverified — confirm at deploy time before assuming any read/write below is callable. Once connected, the agent is handed whatever Gmail-capability tools the connector exposes — this contract states the operations we need, not a tool name; where a name would matter it is called out as unverified rather than invented.

## What we read

- Search threads in a recent window: candidate threads (F1 triage: last 3 days).
- Fetch a thread or message: full thread content before drafting a reply, and to check for an email-address-change request (guardrail 7).
- List drafts: drafts pending across the mailbox (F1, F8).

## What we write

- Create or update a draft: every candidate-facing reply, outreach, rejection, and scheduling confirmation (F3, F4, F5, F6) — draft only, never sent by the skill itself.
- Apply a label to a message/thread, create a label: triage/categorization labels if a skill needs to mark threads (no label taxonomy defined yet — add one to `packs/recruiting/config/` before relying on this).

## Field & name mapping

Always reply using the existing `threadId` — never open a new thread for an existing candidate (PRD §6, guardrail 7). Agent's own mailbox (`recruiting@otpless.com`) per `packs/shared/identity/SKILL.md`. Candidate channel preference (WhatsApp > email) and meet link live in `user.md` (gitignored, per-deployment).

## Staleness & re-query semantics

Operators reply and act in Gmail outside the agent constantly (split-brain, PRD §8). Re-search threads fresh for every triage pass — never rely on a thread state read earlier in the session.

"Not set" vs "unknown": a thread with no candidate reply since our last message means *waiting on candidate* — reportable. A thread that fails to fetch means *unknown* — report "Gmail: couldn't check this thread," never count it as silence.

## Write verification

After creating or updating a draft, list drafts or fetch the thread to confirm the draft appears attached to the correct thread before reporting the draft as ready for operator review.

## Failure modes

| Failure | Consuming skill must |
|---|---|
| Gmail unavailable | Skip email-sourced categories in triage, state explicitly "Gmail: unreachable," never present an empty email section as "nothing pending" |
| Connector registered but not connected (mailbox hasn't completed the `/keychain` step) | Halt, report "Gmail: not connected," escalate as an onboarding/connection step — distinct from "unreachable" |
| Rate-limited | Back off, retry once; report partial results labeled incomplete |
| Permission-denied | Halt, escalate as a mailbox/OAuth grant issue — never fall back to another mailbox |
| Ambiguous result (multiple threads matching a candidate) | Surface all matches to the operator; never guess which thread to reply in |

## PII handling

A candidate email thread can contain anything a candidate chose to volunteer — health or accommodation needs, personal circumstances behind a gap or a notice-period ask, family or immigration details — none of it solicited by this platform, all of it real PII the moment it's read. Thread content is also, structurally, the least contained thing this platform touches: a full back-and-forth, not a single field.

**Thread bodies never enter git, never enter Slack (not a channel post, not a DM, not a digest), and never enter a fixture** — fixtures for this contract are synthetic threads only, never a captured real one. A skill may reference that a thread exists and its high-level status (`packs/shared/identity/SKILL.md` §8 — name + one factual one-liner: "awaiting reply," "scheduling in progress") but never quotes, paraphrases, or forwards thread content into Slack or a Notion note beyond the fields `notion.md` already defines. Anything a candidate volunteers that reads as a sensitive disclosure (health, disability accommodation, immigration status) is never summarized or acted on by the skill — draft the reply as usual, but flag the disclosure to the accountable human rather than the agent deciding how to handle it.

## Capability gaps today

**Send capability is unverified.** Whether the Google connector's Gmail integration exposes a `send` operation at all is not established — treat it as draft/label/read only until confirmed against the running deployment (`platform/scripts/verify-deployment.md`). Every "approved send" in the PRD (§6, §8) therefore still requires a human to actually send the drafted message unless and until a send operation is confirmed present and gated by approval. If none exists, the fix is a sandbox tool (declaring `egress` to Gmail's API host as intent — ADR-010 correction §1 — and gated via `approvals`, which is enforced) or a connector extension — never a raw HTTP call or a headless-browser workaround. This is the single largest gap between the PRD's stated capability and what's confirmed available today. Tracked as gate G13, `docs/gates.md`, owner CTO (ADR-007: the send capability is verified/extended at deploy time, never worked around).

## Credentials required

Two separate steps, per the connector model (`platform/contracts/README.md`):

- **Admin client registration** — the Google OAuth client id/secret entered at `/admin/connectors`. Confirmed done on the OTPLESS deployment. Provided by: CTO (Google Workspace admin) — gate G5, `docs/gates.md`.
- **User connection** — the recruiting agent's own mailbox (`recruiting@otpless.com`) completing the connection at `/keychain`. Whether this has happened is unverified — reconfirm at deploy time; a registered-but-unconnected connector does nothing. Provided by: CTO — gate G5, `docs/gates.md`.
- SPF/DKIM DNS records for the mailbox — provided by: CTO (DNS access) — gate G5, human gate per CLAUDE.md.
