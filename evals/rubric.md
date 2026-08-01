<!-- Purpose: the human-graded hiring dimensions that cannot be automated, the decision rule for turning scores into a hire/no-hire, and how evaluator agents should relate this to the automated fixtures. -->

# Evaluation Rubric — Human-Graded Dimensions

The automated rules in `run.mjs` (`RATING FIXTURES` check) triage applications into **advance / dig / reject** using mechanical signals (artifact link, fraud-check depth, notebook-only ML work, SDK-app-only work). That triage decides who gets a call — it is not the hiring bar itself. The actual hire/no-hire call is a human judgment made after the work sample and onsite, scored on the dimensions below. No agent scores these dimensions or makes the hire decision.

## Dimensions (1–4 scale each)

| Dimension | 1 (reject signal) | 2 | 3 | 4 (strong yes signal) |
|---|---|---|---|---|
| **Judgment** | Made a call that was clearly wrong and didn't notice | Followed instructions but didn't reason about tradeoffs | Reasoned about tradeoffs, made a defensible call | Made a call a strong senior person would make, could defend it crisply |
| **Ownership** | Described only their piece, no visibility into outcome | Owned their piece, aware of but didn't touch the rest | Drove something end-to-end, including the unglamorous parts | Drove something end-to-end AND changed the plan when it wasn't working |
| **Depth** | Surface-level, couldn't go one level deeper under questioning | Reasonable depth on the happy path | Understood edge cases and failure modes | Anticipated failure modes nobody asked about |
| **AI leverage** | Used AI as a search engine/autocomplete only, no judgment applied to output | Used AI tools but couldn't explain what they'd verify/change | Used AI tools deliberately to multiply real output, verified results | Used AI tools to attempt/verify things they couldn't have done manually, with clear judgment on what to trust |
| **Slope** | Flat or declining — same level of work over time | Slow, steady improvement | Clear acceleration in scope/quality over time | Rate of improvement itself is increasing — learning how to learn faster |

## Decision rule

- **Any dimension scored 1 → reject.** No averaging around a 1; it is disqualifying regardless of the other four scores.
- **Hire requires: average ≥ 3 across all five dimensions, AND no dimension below 2.**
- **"Weak yes" (average ≥3 but with hesitation, or a 2 the panel debates) = no.** This is a startup hiring under real risk — a debated maybe is a no, not a hire with a note. Re-run the loop on the next candidate rather than take a maybe.

## How evaluator agents should use this rubric and the fixtures

- Evaluator/reviewer agents (e.g. the Recruiter agent's `review-applicants` skill) apply the **automated rules** in `run.mjs` against application-stage signals only (Q1 artifact, Q4 fraud-depth answer, role-specific auto-reject patterns) to produce the advance/dig/reject recommendation posted to Slack. That is the full extent of what an agent scores.
- `fixtures/applicants.json` exists to regression-test that automated triage stays deterministic and correct as the rules or role playbooks change — it is not a set of "correctly scored" candidates on the 1–4 rubric above, and none of the five dimensions in this file are inferable from the fixture fields.
- No agent assigns a 1–4 score on any of the five dimensions above, ever — those require a live work sample and onsite conversation and are recorded by the human interviewer only. An agent summarizing an onsite for the tracker reports what the humans scored; it does not generate the scores.
- If asked to "rate a candidate" beyond the mechanical triage, an agent should decline and point to this rubric — rating is where automation stops and judgment begins.
