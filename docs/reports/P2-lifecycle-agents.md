<!-- Purpose: phase report for P2 — Onboarder and People-Ops, and what building them proved about the platform. -->

# Phase report — P2 Lifecycle Agents · 2026-08-01

**Status:** shipped. Evals green (0 failures, 11 check groups). Neither agent is live — both wait on the same deployment gates as the Recruiter, plus their own (G14–G19).

## The question this phase answered

ADR-005 claims a new agent costs a pack plus a scope file, with `packs/shared` imported unchanged. Until now that was an assertion made by the people who wrote it, tested only against the department it was designed for.

**It held.** Two independent builders, working from the PRD without coordination, each produced a working agent and each reported the same thing: nothing in `packs/shared` needed to change. Two independent reviewers verified it against the git history rather than taking the builders' word — `git diff` across every P2 commit shows zero changes under `packs/shared/`. Identity, trust ladder, metrics, standup, and retro were imported as-is by a department whose work has nothing in common with recruiting. `scopes/_template.md` was instantiated twice without bending.

That is the platform's central claim, and it survived first contact.

## What shipped

**Onboarder** (10 skills) — offer-accept through day 90: notice-period warmth, BGV, paperwork, provisioning, day-one, buddy assignment, 30/60/90 check-ins, hire-status, watch, router. Onboarding checklists are data (`config/checklists/_template.md` plus a worked engineering instantiation), so a new hire type is one file.

**People-Ops** (6 skills) — policy Q&A, HRMS reads, payroll-input preparation, letters, vendor renewals, router.

**Contracts** — `hrms.md` (read-only in P2; the vendor is undecided, so the contract specifies the capability, not the vendor), `notion-employees.md`, `bgv.md`.

**Platform** — two scope files, ten cron rows, six new gates.

## The guardrail that mattered most, and whether it holds

People-Ops answers employees' policy questions. An employee acts on those answers — takes leave they may not have, submits an expense that will not be reimbursed. So the requirement was that a policy answer is *structurally impossible* without a citation, not merely discouraged.

The builder implemented it as two mutually exclusive output shapes, where the cited-answer shape cannot be constructed without a real file, a real section heading, and `Status: Approved`. An uncited answer is not a rule violation caught after the fact; it is a shape that never gets built.

A reviewer with no builder context was asked to break it — specifically to find a path to an adjacent-but-non-matching citation, a DRAFT policy quoted as settled, a gap filled from general knowledge of Indian HR norms, or a refusal that hedges enough to read as an answer. **It could not construct one.** That is the strongest evidence available short of running the system.

## What review caught

**A real PII leak, and the pack's own rule caught it.** `hrms-query` printed literal leave balances with no channel restriction, and the router sends "how many leave days do I have left" straight there — so an employee DMing the bot would have received their balance in Slack, which the pack's own playbook forbids. Fixed in `hrms-query` and `payroll-prep`, then again in `crons.md` and `hrms.md`, where a cron row and a contract example independently licensed the same leak. Worth stating the reasoning that now appears in all four: **a Slack DM is not a private channel** — it is retained, exportable, and readable by a workspace admin, which is exactly the access-control property leave and payroll data must not lose.

**Two sources of truth for policy.** `config/notion.md` called the Notion wiki "the sole citable source," contradicting ADR-003, which makes `brain/` canonical and Notion a mirror. Settled in favour of the ADR — and the wiki got a better job: drift detector. If its status disagrees with the git index, the answer is neither, because serving policy from an inconsistent pair is how an employee gets told they have leave they do not have.

**A false claim I wrote myself.** `packs/recruiting/config/evidence.md` asserted its action-class slugs "match `command-policy.md` exactly." They do not — that file has no per-action-class rows at all. The reviewer caught it by grepping rather than trusting the sentence. Corrected in both evidence configs, and the underlying gap is now **G19**: the named rows compile into the command policy at deployment. Until then no promotion can cite a row that exists, so nothing is promotable — which is the correct state, since no evidence exists either.

**A duplicated promotion table** in the onboarding pack, alongside the scope file that also carried one. Two copies of a trust table drift the moment one class is promoted and only one is updated. The scope file is now authoritative; the never-delegated list stays duplicated on purpose, because a reader must never have to look elsewhere to learn what an agent may never do.

**Contract shape had diverged.** `bgv.md` grew a PII-handling section the other contracts lacked, despite several carrying more sensitive data. Rather than patch one file, the section went into `_template.md` so future contracts inherit it, and it is being backfilled across the existing six.

## Human gates

Six new, full detail in `docs/gates.md`:

| Gate | Owner | Blocks |
|---|---|---|
| **G14** HRMS provider (Keka vs RazorpayX) | Founder | Every real HRMS read; G15 depends on it |
| **G15** HRMS API credentials | CTO | People-Ops leave/attendance answers |
| **G16** Employees DB in Notion | Founder | Onboarder writes, People-Ops reads |
| **G17** Policies wiki + initial policy content | Founder | People-Ops answering anything at all |
| **G18** BGV vendor account | CTO | Any real background check |
| **G19** Compile action-class rows into command policy | CTO | Any trust promotion, for any agent |

**G17 deserves attention beyond its row.** People-Ops is built and correct, and it will answer almost every question with "there is no approved policy on that yet" until a human writes and approves real policy text. That is the design working — it refuses rather than improvises — but it means the agent's usefulness is gated on founder writing time, not on engineering. The policy *content* is a founder decision and no agent should produce it.

A related finding: the Onboarder's warmth-loop cadence depends on a notice-period figure that is currently a placeholder inside a DRAFT policy. The loop is built; the number it schedules against is not approved.

## Honest limitations

- Neither agent has processed a real person. Every guardrail here is verified by review and eval, not by operation.
- The HRMS contract cannot name a single real field until G14 closes. It specifies capability shape only.
- `packs/people-ops/policy-qa` reads `brain/`, not Notion. That is now the documented and ADR-correct behaviour, but the mirror-drift check it describes cannot be exercised until a wiki exists.
- The eval harness verifies structure, shape, references, and the policy-status marker. It cannot verify that a skill's *prose* will actually produce the behaviour it describes when a model executes it. That gap closes only by running the system.

## Next

P3 — People Analyst and Culture & Growth, plus the WhatsApp channel. By the ADR-005 bar, agents four and five should cost a pack and a scope file each. Two data points is not a trend; five would be.
