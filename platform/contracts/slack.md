<!-- Purpose: contract between recruiting skills and Slack — notifications and digests — so no skill posts externally-visible content without the same draft-first gate as email. -->

# Contract: Slack

## Purpose

Internal notifications to #hiring: new-applicant summaries, urgent flags, digests, weekly reports (PRD §6).

## Mechanism

Reached through qm's **Slack connector** (`platform/contracts/README.md` "How a contract reaches its system"). Confirmed registered (Admin-UI step) on the OTPLESS deployment; whether the recruiting agent's own identity has completed the second, individual connection step at `/keychain` is unverified — confirm at deploy time before assuming any read/write below is callable. Once connected, the agent is handed whatever tools the connector's Slack integration exposes — this contract states the operations we need, not a tool name; where a name would matter it is called out as unverified rather than invented.

## What we read

- Read a channel or thread: check whether a scheduled post (e.g. morning digest) already went out this run before posting again.
- Search/look up users: resolve an interviewer or operator by name.
- Read a canvas: existing pipeline-report canvas content, if one exists, before updating it.

## What we write

- Draft a message: the default for any new-applicant summary, urgent flag, or digest — draft, not posted, pending the same approval gate as email (guardrail 1). Whether the connector exposes a distinct "draft" vs. "send" operation, or only a single send-capable one gated by our own approval step, is unverified — confirm before assuming a message can be queued without posting.
- Send or schedule a message: only for an action-class that has earned L1+ per `command-policy.md` §3; today every Slack post to a human channel starts at L0 (§2 — "Slack DM/post to a human outside the agent team" requires explicit approval).
- Create or update a canvas: the weekly pipeline report (F7).

## Field & name mapping

Channels: `#hiring` (recruiter scope), `#people` (cross-agent) — per `org-config.md` Surfaces table. Format: YC's 3-sentence recommendation (background + signal + recommendation + 👍-to-act), PII-minimized per `packs/shared/identity/SKILL.md` §8 (name + one factual one-liner only — no phone, comp, or full application content).

## Staleness & re-query semantics

Before posting a scheduled digest, re-read the channel's recent history to check it wasn't already posted this run (e.g. a cron retry after a partial failure) — a stale "not yet posted" assumption produces a duplicate.

"Not set" vs "unknown": if reading the channel fails, that is *unknown* whether the digest already went out — do not assume "not yet posted" and re-post; escalate instead of risking a duplicate.

## Write verification

After a send/schedule operation fires (i.e. once an action-class is L1+ and actually sends), re-read the channel/thread to confirm the message landed before marking that task complete.

## Failure modes

| Failure | Consuming skill must |
|---|---|
| Slack unavailable | Do not retry-post blindly once it recovers (risk of duplicate); log and escalate |
| Connector registered but not connected (agent's identity hasn't completed the `/keychain` step) | Halt, report "Slack: not connected," escalate as an onboarding/connection step — distinct from "unreachable" |
| Rate-limited | Back off, retry once |
| Permission-denied (bot/connection missing from channel/scope) | Halt, escalate as a Slack app/scope grant issue |
| Ambiguous result (a user search/lookup returns multiple name matches) | Surface all matches to the operator; never guess which person |

## PII handling

Slack is the surface every other contract in this index restricts against, not a system with its own PII store — so this section is the canonical statement the others point back to. Every message posted to a human — channel post, DM, canvas, or scheduled digest — that references a specific candidate or employee carries **at most a name plus one factual one-liner** (role applied for / current stage / lifecycle checkpoint), per `packs/shared/identity/SKILL.md` §8. It never carries a field value from a source system: no comp figure, no ESOP number, no leave balance, no LOP amount, no BGV/documents-status detail, no phone number, no government ID, no health information, no full application or thread text, no attachment or document. If a message would need any of those to make sense, the message is wrong, not the rule — shorten it to the one-liner and point the reader to the system of record instead.

**A DM is not a private channel.** It is retained, exportable by a workspace admin, and held to the same minimization rule as a public post in `#hiring` or `#people` — nothing is said in a DM that wouldn't be said in the open channel. The same applies to a cron digest: aggregate counts and urgency ("3 leave requests pending," "1 candidate flagged for review") are fine; a named figure or a named flag is not, regardless of how the digest is delivered.

## Capability gaps today

No confirmed reaction-read capability — the PRD's "👍-to-act" pattern (F2) implies detecting an operator's emoji reaction as an approval signal, but whether the Slack connector's tools expose message/thread reactions (as opposed to only text) is unverified; per ADR-006, an approval belongs in qm's own gate regardless, so this is a secondary concern. Until a reactions read is confirmed present and the approval model still calls for it, "👍-to-act" cannot be relied on programmatically — the agent must fall back to reading an explicit reply instead.

**Exact connector tool surface unverified.** This contract states the operations needed (read/search a channel, thread, canvas, user; draft/send/schedule a message; create/update a canvas) — the qm Slack connector's actual tool names, and whether draft and send are genuinely separate operations, are unconfirmed until checked against the running deployment (`platform/scripts/verify-deployment.md`). The previous concern about a deprecated npm package (`@modelcontextprotocol/server-slack`, pinned in `.mcp.json`) does not apply here: `.mcp.json` is local-dev tooling only and plays no role in what qm's Slack connector actually exposes (see `platform/contracts/README.md`).

## Credentials required

Two separate steps, per the connector model (`platform/contracts/README.md`):

- **Admin client registration** — the Slack OAuth client id/secret entered at `/admin/connectors`, with the app installed/added to `#hiring` (and `#people`). Confirmed done on the OTPLESS deployment. Provided by: CTO (Slack workspace admin) — gate G6, `docs/gates.md`.
- **User connection** — the recruiting agent's own identity completing the connection at `/keychain`. Whether this has happened is unverified — reconfirm at deploy time; a registered-but-unconnected connector does nothing. Provided by: CTO — gate G6, `docs/gates.md`.
