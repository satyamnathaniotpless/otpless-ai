<!-- Purpose: build plan for P3 — the last two People agents, the WhatsApp channel, and the third and fourth data points on ADR-005. -->

# Plan — P3 Department Complete

**Milestone:** README Status "Analyst + Culture & Growth agents (P3)". Master PRD §4 agents #4 and #5, §8 P3 row.

## Decisions

1. **The Analyst reads; it does not judge.** Funnel numbers, time-in-stage, source ROI, comp-band drift, attrition signals. "Attrition signal" is the dangerous one: a signal is a pattern in aggregate data, never a claim about a named person's intent to leave, and never anything a manager could read as a performance or loyalty assessment. That line is the phase's guardrail, equivalent to People-Ops' citation rule.
2. **Culture & Growth runs the process, humans write the content.** It orchestrates review cycles, pulse surveys, 1:1 cadence nudges, anniversaries, offboarding checklists, exit interviews. Humans write every review and every judgment. Exit interviews are structured collection only — a human reads the transcript.
3. **Pulse surveys need an anonymity contract, not a promise.** If a survey claims anonymity, small-N results deanonymize by construction (three people in a team, one dissenting answer). The agent must refuse to report below a minimum cell size rather than caveat it.
4. **WhatsApp is a channel, not an agent.** One contract, consumed by whichever pack needs it. Drafts only, same approval gate, template-message compliance is a gate.
5. **No new shared primitives unless P3 proves one is missing.** Two agents already imported `packs/shared` unchanged. If agents four and five also do, the claim is well-supported; if one of them genuinely needs something, that is the interesting result and it gets reported, not patched around.

## Build list

| Owner | Paths (disjoint) |
|---|---|
| builder A | `packs/analytics/**` |
| builder B | `packs/culture/**` |
| integrator | `platform/contracts/whatsapp.md`, `scopes/{analyst,culture}.md`, crons rows, gates |
| evaluator | small-N suppression fixture; aggregate-only assertion for analyst outputs |
| reviewer ×3 | fresh, one per pack plus platform layer |

## Evals that prove it

- Small-N suppression: a fixture where a pulse-survey cell is below threshold must be suppressed, not caveated.
- Analyst outputs are aggregate-only: no fixture path produces a named person attached to an attrition or performance signal.
- Never-delegated holds: performance judgments are Culture-adjacent and the most likely leak in the phase.
- Both packs pass every generic check with no new special-casing in the harness.

## Human gates this plan creates

- WhatsApp Business API account + template-message approval (compliance review for recruiting/HR use) — CTO + Founder.
- Comp-band market data source for drift analysis — Founder.
- Pulse-survey tool decision, or Notion-native — Founder.
