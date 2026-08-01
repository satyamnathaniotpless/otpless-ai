<!-- Purpose: contract between any skill and the WhatsApp Business API — India's highest-leverage, highest-risk candidate/employee channel — so no skill ever sends outside the draft-first gate or an unapproved template. -->

# Contract: WhatsApp Business API

## Purpose

India-specific candidate and employee messaging channel: candidates and employees answer WhatsApp in minutes where email takes days (master PRD §4 row 4/5 context; `PRD_Recruiting_System.md` §6 WhatsApp row). That speed is exactly why this channel carries the tightest rules in the platform, not the loosest — a fast channel that goes wrong is a fast-moving incident.

## What we read

**None today.** No MCP server exists for the WhatsApp Business API in any form — not even the draft/read/label-only shape Gmail has (`gmail.md`). This is a capability gap, not a data-shape decision (see "Capability gaps today"). Once an MCP exists, this section covers: inbound message text per conversation, and delivery/read-receipt status — the WhatsApp analogue of Gmail's `search_threads`/`get_thread`.

## What we write

**None today**, for the same reason. The capability this contract describes for the day an MCP exists: a draft-equivalent operation — compose message text against a specific pre-approved template and recipient — never a `send` operation callable by a skill directly. **Drafts only, same approval gate as every other channel, at every trust level** (ADR-007: the draft is the contract boundary; no channel earns a send capability by assumption, only by verification). No auto-send at any trust level until both (a) the relevant action-class has earned it on this channel specifically — WhatsApp does not inherit Gmail's or Slack's evidence — and (b) this channel's send capability is verified present per `platform/scripts/verify-deployment.md`.

Until an MCP exists, every skill's WhatsApp output is message text only, handed to the accountable human to send by hand from the WhatsApp Business app/console — the same "manual paste" bridge already named in the recruiting and onboarding scope files' Connectors-required sections.

## Field & name mapping

No template name, sender number, WhatsApp Business Account (WABA) ID, or phone-number ID exists yet — TODO(gate): all four, see "Credentials required" below. Once provisioned, the real values live in pack-level config (ADR-005: config is data, never inline in a skill or in this contract) — this file states the capability shape only (template message, session message, delivery/read status), never a real identifier.

## Staleness & re-query semantics

Same split-brain discipline as every other candidate/employee channel (PRD §8): the recipient can reply on WhatsApp outside the agent's knowledge at any moment — more so here than email, since answer speed is the entire reason this channel exists. Re-query the conversation fresh before triage or drafting any follow-up; never rely on a conversation state read earlier in the session.

"Not set" vs "unknown": no reply since our last message means *waiting on the recipient* — reportable. A conversation or delivery status that fails to fetch means *unknown* — report "WhatsApp: couldn't check," never count it as silence (same shape as `gmail.md`'s canonical rule).

## Write verification

Not applicable today — no write capability exists (see "What we write"). Once an MCP with a draft-equivalent operation lands, the pattern to add here, by amendment: re-fetch the queued draft and confirm it is attached to the correct conversation and the correct approved template before reporting it ready for operator review — same shape as `gmail.md`'s `create_draft`/`list_drafts` verification step.

## Failure modes

| Failure | Consuming skill must |
|---|---|
| No MCP / connector (true today, always) | Report "WhatsApp: no connector yet," output message text only for manual send, never claim an API call happened |
| System unavailable (post-gate) | Halt that section, report "WhatsApp: unreachable," never estimate a conversation state from a prior session |
| Rate-limited | Back off, retry once; report partial results explicitly labeled incomplete |
| Permission-denied | Halt, escalate to the accountable human as a credential/grant issue |
| Ambiguous result (e.g. two numbers matching one candidate/employee) | Present both to the accountable human; never guess which is authoritative |
| Template not yet approved for the intended content | Refuse to draft against that template; report which template is missing approval, never substitute an approved template whose category doesn't match the content |

## PII handling

A WhatsApp thread lives on a personal device, and very often a personal (not company-issued) phone number — structurally the least contained surface this platform touches: it sits inside the recipient's own messaging app, next to their family and personal life, not a work inbox or a company Slack workspace. The following never travel over this channel, regardless of trust-ladder level or how the equivalent content is handled on another channel:

- **No comp figures or negotiation content.** Comp/offers are never-delegated regardless of channel (`command-policy.md` §4); WhatsApp does not get email's latitude to "state the band straight" (`PRD_Recruiting_System.md` F4) — that answer stays on a channel with a proper record and access control.
- **No documents or attachments** — BGV documents, letters, offer paperwork, contracts. Those go through the system already built for them (Gmail attachment, Notion, the vendor's own portal), never a chat attachment.
- **No policy content beyond what is already published and approved** in the Policies wiki, and only as a direct citation — no policy improv, the same rule People-Ops's policy-Q&A skill already follows for every other channel.
- **Everything the identity skill's Slack-minimization rule already forbids** (`packs/shared/identity/SKILL.md` §8, restated here because it is the floor, not the ceiling, for this channel): no other person's phone number, no government ID, no health information, no leave balance/LOP/exit-date figure, no BGV status beyond a bare status word if ever appropriate, no full application or thread content forwarded from another system.

If a draft would need any of the above to make sense, the draft is wrong, not the rule — shorten it and point the recipient to the proper channel (a scheduled call, an email reply, a Notion/HRMS-backed answer) instead.

## Capability gaps today

**No MCP server exists at all** — not draft/read/label like Gmail, nothing. This is the largest capability gap of any contract in this index: extending or building an MCP server for the WhatsApp Business (Cloud) API, once an account exists, is the fix — never a raw HTTP call, never a headless-browser workaround, per CLAUDE.md's MCP-only rule and ADR-007. Until it exists, every skill that would use this channel outputs message text only, for a human to paste and send manually — the bridge already named in `PRD_Recruiting_System.md` §6 and the recruiter/onboarder scope files.

Two further gaps sit on top of "build the MCP," each its own human gate, and neither is closed by the MCP existing:

1. **Template-message compliance is a hard constraint, not a nicety.** WhatsApp Business requires a pre-approved message template for any business-initiated message sent outside an open customer-service window, and a recipient's reply does not retroactively approve the template that opened the thread. Recruiting/HR outreach on this channel has real compliance exposure — using it for candidate or employee messaging is a decision with its own review, not a default extension of "we already have WhatsApp." **No message goes out on a template that has not cleared this compliance review, at any trust level, regardless of MCP readiness.**
2. **Whose infrastructure.** OTPLESS is an auth company with WhatsApp Business infrastructure already built for its own product — but reusing that infrastructure for HR/recruiting outreach is a separate decision with its own compliance and separation questions (mixing HR traffic into a product WABA's quality/category rating; whether a candidate or employee receiving a message from the company's own product number blurs the AI-disclosure and trust line for a company whose product *is* trust). It is not an automatic yes because the capability happens to exist in-house, and it is gated distinctly from the MCP-build decision above.

## Credentials required

- WhatsApp Business API account + sender number (WABA ID, phone-number ID) — provided by: CTO (provisioning/credential, platform wiring) — gate G20, `docs/gates.md`.
- Template-message approval + compliance review for HR/recruiting use — provided by: Founder (compliance/content decision) — gate G21, `docs/gates.md`. No send against an unapproved template, ever, at any level.
- Decision: OTPLESS's own in-house WhatsApp infrastructure vs a separate provider/account for HR outreach — provided by: Founder (compliance/separation/vendor decision) — gate G22, `docs/gates.md`.
