<!-- Purpose: how to stand up department #2 (and every department after it) on this platform, using what departments #1–3 (Recruiting, Onboarding, People-Ops, Analytics, Culture) actually proved and actually broke. -->

# Department Automation Playbook

For a competent engineer who has never seen this repo. Five agents across three departments (Recruiter, Onboarder, People-Ops, People Analyst, Culture & Growth) are built and evaluated but **none has run against a real person** — every claim below is grounded in a file in this repo or a phase report (`docs/reports/P0-deployment-ready.md`, `P1-measurement-layer.md`, `P2-lifecycle-agents.md`, `P3-department-complete.md`), never in operational experience that doesn't exist yet.

## 1. The model, in one page

```
Department → Agent(s) → Skills (packs/<dept>/<skill>/SKILL.md) → Config (packs/<dept>/config/*.md) → Contracts (platform/contracts/*.md) → qm scope (platform/deploy-layer/otpless/scopes/<agent>.md)
```

**The one rule (ADR-005): process is code, everything specific is data.** A skill's `SKILL.md` never contains a role name, a comp number, a Notion ID, a vendor name, or a department name in its logic — it contains a trigger, inputs, a process, an output contract, and a failure behavior, written generically enough that recruiting's `outreach` skill and a future support department's `ticket-reply` skill could share the same shape. Anything specific — which role, which comp band, which Notion database, which vendor — lives in a `config/*.md` file instantiated from a `_template.md`. The test for whether you've drawn the line correctly: **if a role, department, or agent name appears inside a skill's prose, the design is wrong** — move it to config.

Five agents proved this holds, not just for job-specific detail (recruiting's `packs/recruiting/config/jobs/_template.md`) but for the *platform layer itself*: scopes, contracts, and evidence configs are all `_template.md` + instance, the same pattern applied one level up. `packs/shared/` — identity, trust ladder, metrics, standup, retro — is the fixed point every department imports and none has ever needed to change (§3).

A contract (`platform/contracts/<system>.md`) is the third leg: it is what a skill knows about an external system (Notion, Gmail, HRMS, WhatsApp...) instead of the skill knowing the API. Skills consume contracts; they never talk to a system directly in prose.

## 2. The build sequence

The actual order five agents were built in, with what blocks what:

1. **qm deployment** (`platform/scripts/bootstrap-qm.sh`, `docs/RUNBOOK_DEPLOY.md`) — credential-gated (G1–G9 in `docs/gates.md`), blocks nothing else. Run it in parallel with everything below; do not wait on it.
2. **Contracts** for every system the department touches (`platform/contracts/_template.md` → `<system>.md`) — write these before or alongside the first skill that consumes one. A contract can be written fully against a *capability* before a vendor is chosen (see `platform/contracts/hrms.md`, written before the Keka-vs-RazorpayX decision, G14).
3. **The pack's skills**, built by parallel Builder subagents on disjoint skill directories.
4. **The pack's config instantiations** (`agent.md`, `goals.md`, `evidence.md`, `playbook.md`, and any department-specific templates like `packs/recruiting/config/jobs/_template.md` or `packs/onboarding/config/checklists/_template.md`) — can proceed in parallel with skills, since skills reference config paths, not config content.
5. **The scope file** (`platform/deploy-layer/otpless/scopes/<agent>.md` from `platform/deploy-layer/otpless/scopes/_template.md`) — written last, because it's the file that ties skills + config + contracts + cron ids + trust-ladder rows together; it needs the others to exist first to reference correctly.
6. **Cron rows** (`platform/deploy-layer/otpless/crons.md`) — one row per watch/standup/retro/rollup loop the scope needs.
7. **Fresh-context review**, **eval**, **ship**, **report** — §7.

**Credential-gated vs. genuinely blocking**: the qm deployment, real OAuth grants, real vendor accounts (G1–G9, G14–G25) are workarounds-available — every phase report shows the pattern: build and eval against synthetic fixtures, gate the real thing, keep moving. What genuinely blocks is sequencing *within* the repo: a scope file can't cite a cron id that doesn't exist yet, and a promotion can't cite an evidence row that isn't compiled into `command-policy.md` (G19) — that's an ordering dependency, not a credential one, and it's why the scope file is written last.

## 3. What you get for free

Everything in `packs/shared/` — imported unchanged by all five existing agents, verified by reviewers against `git diff` across every phase's commits, not builder self-report (`docs/reports/P2-lifecycle-agents.md`, `P3-department-complete.md`):

- **`packs/shared/identity/`** — AI disclosure, signature format, mailbox/Slack/calendar/Notion attribution, Slack PII minimization.
- **`packs/shared/trust-ladder/`** — the L0→L1→L2 autonomy model, enforced as `approvals[]` on tool descriptors compiled from `command-policy.md`, not convention (ADR-004; mechanism corrected by ADR-010).
- **`packs/shared/metrics/`** — the draft-acceptance ledger and weekly rollup that the trust ladder promotes on (ADR-008).
- **`packs/shared/standup/`** — daily standup + weekly self-review format.
- **`packs/shared/retro/`** — the weekly playbook self-improvement loop (diff human edits → open a PR → human merges).

Import all five via `packs/shared/config/agent.md.example`, `evidence.md.example`, `goals.md.example` instantiated once per new agent. **If department #2 needs a change to anything in `packs/shared/`, treat that as a signal to investigate — five agents across three departments needed zero changes here. A sixth agent needing one is either a genuinely new requirement worth a platform-wide ADR, or a sign the new department is being modeled wrong (department-specific logic leaking into what should stay generic).**

## 4. What you must write

Per department, using the exact template files that exist today:

| # | Item | Template | Real instance example |
|---|---|---|---|
| 1 | The pack | new `packs/<dept>/` directory, one subdirectory per skill, each with `SKILL.md` | `packs/people-ops/` |
| 2 | Contracts | `platform/contracts/_template.md` | `platform/contracts/hrms.md`, `platform/contracts/notion-employees.md` |
| 3 | Agent identity + goals | `packs/shared/config/agent.md.example` | `packs/recruiting/config/agent.md` |
| 4 | Evidence config | `packs/shared/config/evidence.md.example` | `packs/onboarding/config/evidence.md` |
| 5 | Goals config | `packs/shared/config/goals.md.example` | `packs/analytics/config/goals.md` |
| 6 | Department playbook | (freeform `packs/<dept>/config/playbook.md`, department-specific process notes) | `packs/culture/config/playbook.md` |
| 7 | Per-role/per-item template (if the department has one) | e.g. `packs/recruiting/config/jobs/_template.md`, `packs/onboarding/config/checklists/_template.md` | `packs/recruiting/config/jobs/backend.md` |
| 8 | Scope file | `platform/deploy-layer/otpless/scopes/_template.md` | `platform/deploy-layer/otpless/scopes/recruiter.md` |
| 9 | Cron rows | append to `platform/deploy-layer/otpless/crons.md` | (no template — one row per loop) |
| 10 | Gate ledger rows | append to `docs/gates.md` following existing row shape | G14–G25 |

**Checklist for a new department:**

- [ ] Read the department's PRD section (or write a one-page brief if none exists yet).
- [ ] Write every system contract the department touches, even before a vendor is picked — specify capability shape, leave the vendor a `TODO(gate)`.
- [ ] Write skills as pure process — no department/role names in `SKILL.md` prose (grep your own draft for the department's name and agent's name; both should return zero hits inside `SKILL.md` files).
- [ ] Instantiate `agent.md`, `evidence.md`, `goals.md` from the three shared templates.
- [ ] If the department has a "one new X = one file" axis (a role, a checklist, a report type), write that `_template.md` first — it's the generalization test for the whole pack.
- [ ] Write the scope file last, once skills/config/contracts/crons exist to reference.
- [ ] Add every action-class to the scope file's slug table (must match the pack's `evidence.md` slugs exactly) and to `command-policy.md` — never-delegated rows get `n/a`, never a level.
- [ ] Add gate rows for every credential/vendor/decision the department needs, following `docs/gates.md`'s row shape (one accountable human, a workaround, an unblock action).
- [ ] Run `node evals/run.mjs`. Add a fixture for every new behavior — an assertion that has never gone red by breaking the thing it guards is not a check (`docs/reports/P0-deployment-ready.md`).
- [ ] Fresh-context reviewer, never the builder, checks against `.claude/agents/reviewer.md`.
- [ ] Ship: commit, update README Status, write a phase report.

## 5. The failure modes we actually hit

Each of these happened during the build of this platform, not hypothetically. Draw the general lesson, not just the specific fix.

**Drift between independently-written files (the dominant failure under parallel work).** Hit repeatedly, escalating in subtlety:
- P0: three files attributed Gmail/Calendar/Slack credential ownership to the Founder while the ledger and runbook said CTO — a reader would have escalated to the wrong human.
- P1: a builder correctly wrote "no cron exists for the reply-watch leg," another commit added the cron an hour later without updating the sibling file — the contradiction sat live until a fresh reviewer caught it.
- P2: `packs/recruiting/config/evidence.md` asserted its slugs "match `command-policy.md` exactly" when that file had no per-action-class rows at all.
- P3: scope files named action-classes in prose, evidence configs named them in slugs, and nothing compared them — the recruiter's own two files had drifted three slugs in each direction.
- **General lesson**: when N files independently claim ownership of the same fact (a gate owner, an action-class slug, "who owns this boundary"), they will drift the moment work runs in parallel, and no single builder catches it because each one is locally correct. **The prevention that now exists**: fresh-context review as a non-negotiable gate (§7), plus — once a fact is duplicated three times — an eval that mechanically checks agreement rather than trusting prose (`PACK / SCOPE ACTION-CLASS AGREEMENT` in `evals/run.mjs`).

**Guardrails correct individually, broken in combination.** P3's canonical case: Culture's survey suppression was correct per-cut (any cell below threshold reports no number) — and still broke, because publishing nine of ten team cuts plus the company total makes the tenth recoverable by subtraction. This is a differencing attack: every individual rule was right, the hole was in the *interaction*. **General lesson**: checklist review (does each rule work?) does not catch this; only adversarial review (can I combine correct outputs to defeat the intent?) does. **The prevention**: the fix became a mechanical algorithm — complementary suppression, no partition published alongside a total that closes it, pairwise checks between overlapping cuts, residual risk stated explicitly (`packs/culture/config/playbook.md`).

**A capability assumed rather than verified.** The Gmail MCP surface has no send operation — draft/read/label only. Discovered at the Slack-reaction-approval design stage too: the Slack MCP exposes message/thread text, not reactions, which would have made the PRD's "👍-to-act" shorthand silently never fire (ADR-006). **General lesson**: check what an MCP surface actually exposes before designing a mechanism on top of it, especially a governance mechanism like approval. **The prevention**: ADR-007 makes the draft the universal contract boundary at every trust level — a missing send capability degrades to "a human clicks send" (already the L0 behavior) instead of an outage or a silent no-op at the exact moment of a promotion.

**Instrumentation that doesn't exist for a policy that depends on it.** ADR-004 gates every autonomy promotion on "≥95% unedited-draft-acceptance." Through P0, nothing in the platform produced that number — the trust ladder was unpromotable by construction, which reads as governance while doing nothing. **General lesson**: a policy stated in prose with no measurement behind it is not a policy, it's an aspiration with a threshold attached. **The prevention**: P1 built the measurement layer *before* any agent needed to promote — four coarse outcome buckets, a 20-draft minimum sample, counts-in-git/identities-in-qm split (ADR-008) — as `packs/shared/`, so every future agent inherits an instrument, not a gap.

**A false-negative in the test harness itself.** The cross-reference checker paired backticks sequentially; a triple-backtick code fence desynchronized the pairing, so every path reference *after* a fence in that file was silently skipped. Found by a builder working around it, not a reviewer. **General lesson**: a check that stops looking and reports green is worse than no check — it actively launders the gap. **The prevention**: the harness is code and needs the same suspicion as anything it guards; this bug was fixed and then proven fixed by planting a dead reference after a fence and watching it get caught (coverage went from partial to 613 references across 121 files).

**Duplicated tables that drift.** The onboarding pack carried its own promotion table alongside the scope file that also carried one — two copies of a trust-ladder table drift the moment one class is promoted and only one copy gets updated. Similarly, `funnel-source` and the recruiter's F7 skill each computed pass-through rate and time-in-stage independently while each file's prose claimed the other owned it. **General lesson**: any fact that could be computed or stated in exactly one place, stated in two, will disagree eventually — the question isn't if, it's which reader trusts the stale one. **The prevention**: one owner per metric/fact, cited by number and window from everywhere else (`packs/analytics/config/metrics.md` now owns funnel numbers once; F7 cites them or says plainly none exists); the scope file is authoritative for trust levels, and the never-delegated list is the one deliberate exception — duplicated on purpose so a reader never has to look elsewhere to learn what an agent may never do.

## 6. Guardrail patterns that worked

Transferable patterns, each with the example that produced it:

- **Make the wrong output structurally impossible, don't just instruct against it.** People-Ops's policy-Q&A skill has two mutually exclusive output shapes; the cited-answer shape cannot be constructed without a real file, a real section heading, and `Status: Approved`. A reviewer tasked with finding a path to an adjacent-but-non-matching citation, a DRAFT policy quoted as settled, or a hedged non-answer **could not construct one** (`docs/reports/P2-lifecycle-agents.md`). Culture's review-tracking schema has no free-text field at all — there is nothing to summarize into an assessment even under pressure, because the guardrail is the data model, not an instruction.
- **Suppress rather than caveat.** Analytics' `attrition-signals` and `comp-drift` collapse to aggregate *before* any variable that could hold an individual identifier is composed into output — there is no third shape a prompt could coax into existing that names one person.
- **The draft is the universal contract boundary.** Every skill's output contract ends at a created draft regardless of channel or trust level (ADR-007); this is what makes a missing send capability (Gmail) or an unmeasured trust class degrade safely instead of surfacing as a mystery failure at the worst moment.
- **One owner per metric/fact.** See §5's "duplicated tables" lesson — the fix pattern generalizes: define once, cite everywhere, say "no figure exists" rather than compute a second, unauditable version.
- **Refuse rather than improvise when a citation is missing.** People-Ops answers "there is no approved policy on that yet" rather than filling a gap from general HR knowledge — this makes the agent's usefulness visibly gated on the founder writing real policy content, which is correct: policy content is a human decision, never an agent one (`docs/reports/P2-lifecycle-agents.md`).

## 7. How to run the build

Roles are canonical in `agents/` (generated into `.claude/agents/` by `platform/scripts/sync-agents.mjs` — never hand-edit the copy): **architect** (opus, architecture-significant decisions and ADRs only), **builder** (sonnet, writes to a tight brief, never reviews its own work), **reviewer** (sonnet, fresh-context, never given the builder's brief or reasoning), **evaluator** (sonnet, owns and extends the eval harness), **integrator** (sonnet, owns external-system contracts and the deploy layer), **librarian** (haiku, mechanical — brain/changelog/README/cross-references), **deployer** (sonnet, executes the deploy runbook as far as credentials allow).

The loop: plan (inline, or an architect subagent for architecture-significant work) → build in parallel on disjoint paths (independent builders, each scoped to files the others don't touch) → fresh-context review → eval (`node evals/run.mjs`; red blocks everything else) → ship (commit + changelog + README status) → report (`docs/reports/<phase>.md`: what shipped, decisions made, what review caught, human gates pending).

**Why the reviewer must never have builder context**: every drift bug in §5 was locally invisible to the person who wrote the file with the stale claim — they believed their own file because they wrote it in isolation. A reviewer who inherited the builder's reasoning would inherit the same blind spot. A reviewer starting cold, reading only the artifacts, is what catches an assumption two builders each made independently and differently.

**What parallelism costs, concretely**: every drift failure in §5 happened *because* work ran in parallel — that is not a coincidence, it is the mechanism. Parallel builders each hold a locally consistent but mutually inconsistent picture of a shared fact (a gate owner, a slug, "who owns this boundary"). The fresh-context review is the cost you pay to get the parallelism's speed back safely; skipping it to go faster is how P0/P1/P2/P3's actual bugs would have shipped.

## 8. Choosing department #2

The criteria People/HR (department #1) satisfied, per the master PRD (§1): **greenfield** (nothing to migrate, no legacy process to unwind), **high-volume structured work** (many similar cases — applicants, onboarding checklists — not one-off judgment calls), **urgent need** (the company needed hiring running immediately), and **tolerant of a draft-first mode** (every action can sit as an unsent draft awaiting a human without breaking the business).

Applying the same four criteria:

| Criterion | Support | Sales ops |
|---|---|---|
| Greenfield | Likely yes if no dedicated support team/tooling exists yet | Depends heavily on whether a CRM/process already runs informally — likely less greenfield than support |
| High-volume structured work | Strong fit — tickets are naturally high-volume and follow a small number of shapes (like applicants) | Weaker fit unless outbound/pipeline volume is already high; qualification and follow-up can be structured, but the work is often more judgment-heavy per deal |
| Urgent need | Depends on current ticket backlog/response-time pain — a business fact this repo cannot supply | Depends on current pipeline health — same caveat |
| Tolerant of draft-first | Strong fit — a drafted ticket reply awaiting approval is a natural L0 mode, directly analogous to a drafted candidate email | Workable, but sales replies are often more time-sensitive and higher-stakes per message (a mispriced or over-committed draft costs more per-incident than a recruiting email) |

**Recommendation for the founder to decide, not to be taken as decided here: support is the stronger structural fit**, because its failure mode (a wrong drafted reply, caught before send) mirrors recruiting's own risk profile almost exactly, and ticket volume/shape gives the same "many similar cases" leverage that made HR generalize well. Sales ops likely needs a CRM/system-of-record contract written first (this platform's contract pattern, §4, handles that) and probably carries a higher stakes-per-message profile that argues for a longer L0 dwell time before any promotion.

**What would change this answer**: if support ticket volume today is actually low (no urgency), or if sales ops already has a CRM with clean structured data and a backlog of repetitive, low-stakes replies (quote follow-ups, meeting scheduling) that looks more like recruiting's outreach shape than expected. Both are business facts this repo cannot supply — they are the founder's call, informed by current ticket/pipeline volume, not an engineering one.

## 9. What we still do not know

- **Nothing has run against a real person.** Zero of the five built agents have processed a real candidate, employee, or draft. Every guardrail claim above (§6) is verified by fresh-context review and eval fixtures, never by production behavior.
- **The eval harness cannot verify that a skill's prose produces its described behavior when a model actually executes it.** It verifies structure, shape, cross-references, slug agreement, and policy-status markers — every phase report states this limitation explicitly (most recently `docs/reports/P3-department-complete.md`). Whether, say, `policy-qa`'s two-shape output contract actually holds up against a model under real pressure (ambiguous questions, adversarial phrasing) is unknown until it runs.
- **The trust ladder has never promoted anything.** G11 (first L1 promotion) is "not yet applicable" — the arithmetic exists (ADR-008), but no evidence window has ever elapsed against real drafts.
- **The 20-draft minimum sample and the light-edit threshold are estimates**, not calibrated numbers — `docs/reports/P1-measurement-layer.md` flags both as the most likely to need revision once real volume exists.
- **The PII guard on the evidence rollup has only ever run against templates and schema docs**, never a generated rollup from real drafts, and it catches person-identifying *shapes* (email/phone/UUID) and unauthorized columns — a bare name typed into prose would pass uncaught.
- **Two of five agents (Analyst, Culture) have core functions with no data source at all** pending founder decisions (G23 comp-benchmark source, G25 Notion tracker object) — built against capability, not against a live feed.
