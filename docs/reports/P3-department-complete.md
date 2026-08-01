<!-- Purpose: phase report for P3 — the last two People agents, the WhatsApp channel, and what five agents proved that two could not. -->

# Phase report — P3 Department Complete · 2026-08-01

**Status:** shipped. Evals green (0 failures, 12 check groups). All five People agents now exist as packs. **None has run.** The deployment is still gated, and nothing in this phase changed that.

## What shipped

**People Analyst** (`packs/analytics/`, 7 skills) — weekly leadership report, monthly deep-dive, funnel and source analysis, headcount, comp-band drift, attrition signals, data hygiene. Reports are config, so a third recurring report is one file.

**Culture & Growth** (`packs/culture/`, 7 skills) — pulse surveys, 1:1 cadence nudges, review-cycle orchestration, anniversaries, offboarding, exit interviews.

**WhatsApp contract** — drafts only at every trust level, template compliance as a hard gate, no MCP today. Notably it leaves open, as a gate rather than an assumption, whether OTPLESS should use its own product infrastructure for HR outreach.

**Platform** — two scopes, 11 cron rows, gates G20–G25.

## ADR-005: five data points, not two

Both new agents imported `packs/shared` **unchanged**, verified by reviewers against git history rather than builder self-report. That is now five agents across three departments' worth of work, none of which required a change to the shared layer. The claim that a new agent costs a pack plus a scope file is no longer an assertion; it is a measurement.

## The guardrails, and whether they held

Each new agent got one guardrail that mattered more than the rest, and a reviewer whose job was to break it.

**Analyst — aggregate vs individual.** An agent that reports on people to leadership does real harm the moment it crosses into naming one. The builder closed it structurally: `attrition-signals` has a closed two-shape output contract with no third shape to coax into existing, and collapses to aggregate *before* any variable used to compose output may hold an individual identifier. `comp-drift` structurally cannot read the Employees DB comp field. The reviewer could not find a path to a named flight risk, a cohort of one, or an individual's compensation. **Held.**

**Culture — process vs judgment.** The best design decision in the phase: the review-tracking schema has *no free-text field*. There is nothing for the skill to summarize into an assessment even under pressure — the guardrail is the data model, not an instruction. **Held.**

**Culture — survey anonymity. Did not hold, and this is the finding of the phase.**

Suppression was per-cut: any cell below the threshold reports no number. That defeats a direct read and is defeated by arithmetic. Publish nine of ten team cuts plus the company total, and the suppressed team is recoverable by subtraction. On an uneven team-size split — which is every startup — a real employee is identified the first time a survey runs.

This is the classic differencing attack, and it is worth dwelling on *why* it survived a careful build: every individual rule was correct. The threshold was right, the suppression was real, the intent was right, and the prose said the right things. The hole was in the interaction between correctly-implemented rules, which is exactly the class of defect that adversarial review catches and checklist review does not. The fix is now a mechanical algorithm — complementary suppression, no partition published alongside a total that closes it, pairwise checks between overlapping cuts, and a stated residual risk for differencing across survey waves.

## Other things review caught

**A boundary claimed but not real.** `funnel-source` and the recruiter's F7 both computed pass-through rate, time-in-stage, and source effectiveness independently, while each file's prose claimed the other owned it. Leadership would have seen two different numbers for the same metric with nothing saying which was stale. Now defined once in `config/metrics.md`, computed once by the analyst, cited by F7 with source and window — and F7 says plainly when no figure exists rather than quietly substituting its own. Offer-accept rate turned out to have no definition anywhere despite being reported.

**Slug drift across five agents.** Scope files named action-classes in prose; evidence configs named them in slugs; nothing compared them. The recruiter's own two files had drifted three slugs in each direction. All five scopes now carry a canonical slug column, and an eval enforces agreement.

**An agent with no measurable promotion path.** `packs/onboarding` had no `evidence.md` at all — no declared action-classes, no light-edit threshold, no rollup destination. It survived a full phase because nothing checked that a pack has one. Now created, and now checked.

**A false-negative in the eval harness itself.** The cross-reference check pairs backticks sequentially, so a triple-backtick fence desynchronized the pairing and every path reference after a fence in that file was silently skipped. A dead-reference check that stops looking is worse than no check, because it reports green precisely where it gave up. Fixed and verified by planting a dead reference after a fence; coverage went from partial to 613 references across 121 files.

That last one deserves a note: it was found by a *builder*, not a reviewer, while working around it. Worth remembering that the harness is code like any other and needs the same suspicion.

## Human gates

Six new (G20–G25), full detail in `docs/gates.md`. The complete ledger now runs G1–G25.

| Gate | Owner | Note |
|---|---|---|
| G20 WhatsApp Business account | CTO | |
| G21 Template approval + HR-use compliance review | Founder | Content and compliance, not a credential |
| G22 Own WhatsApp infra vs separate account | Founder | Deliberately left open, not assumed |
| G23 Comp-band market-data source | Founder | Blocks comp-drift analysis entirely |
| G24 Pulse-survey tooling | Founder | |
| G25 Culture tracker Notion object | Founder | The culture agent has no write target until this lands |

The critical path has not moved: **G1–G6 and G9** stand between this repo and a running system. Everything else is downstream.

## Honest limitations

- Five agents, zero of them have processed a real person. Every guardrail is verified by review and eval, not by operation.
- The suppression algorithm is now correct on paper. It has never suppressed a real cell.
- The eval harness verifies structure, references, slugs, markers, and arithmetic. It cannot verify that a skill's prose produces the described behaviour when a model executes it. That gap closes only by running the system, and it is the largest unknown in the platform.
- G23 and G25 mean two of the analyst's and culture agent's core functions have no data source at all yet.

## Next

P4 — write the department automation playbook: what generalizes from five agents to department #2, as a document someone else can execute. That is the deliverable the master PRD's §8 P4 row asks for, and the AI Automation Engineer's onboarding project.
