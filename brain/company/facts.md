<!-- Purpose: the company facts agents are allowed to state as fact — everything else is either "I don't know" or a marked placeholder, never an invention. -->

# Company Facts

Status: Approved (product/location) — see per-field notes below for placeholders pending fill.

Agents may state these facts verbatim in outreach, replies, and Q&A. Agents must **never** invent a number, date, or claim not listed here or in an approved policy doc. If asked something not covered, say so and escalate rather than guess.

## Product

- **One-liner:** OTPLESS is the authentication layer — one-tap login SDKs and APIs that let apps and websites verify users without OTPs, passwords, or friction.
- **What we sell:** developer-facing auth infrastructure (SDKs + APIs) for mobile and web login, identity verification, and fraud prevention.

## Company

- **Location:** Bangalore, India (HQ).
- **Employee count:** {FILL-BEFORE-USE: current headcount — founder/CTO to confirm before any agent states a number externally}
- **Customer count:** {FILL-BEFORE-USE: current customer/integration count — founder/CTO to confirm before any agent states a number externally}
- **Founded:** {FILL-BEFORE-USE: founding date/year}
- **Funding stage:** {FILL-BEFORE-USE: current stage, if agents are ever asked and a public answer exists}

## Rules for use

- Placeholders marked `{FILL-BEFORE-USE: ...}` are not facts — an agent encountering one must not answer the underlying question with an invented figure. It should say it doesn't have a confirmed number and offer to escalate to a human, or simply omit the claim if it isn't essential to the message.
- Once a founder/CTO fills a placeholder, update this file in the same commit as any playbook/template change that started relying on the new fact (ADR-003 discipline).
- These are company-level facts only. Role-specific facts (comp bands, team structure per role) live in the relevant job playbook (`packs/recruiting/config/jobs/<role>.md`), not here.
