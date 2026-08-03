# Architecture Decision Records

## ADR-001 — Adopt qm as the harness core; own everything above it

**Decision:** Do not build a harness from scratch. Use yc-software/qm (MIT) via its documented **private-fork pattern**: a standalone private repo seeded by bare clone + mirror push (never GitHub's Fork button — fork visibility and shared object networks make forks of public repos unsafe for private customization). All OTPLESS-specific material lives in `deploy/layers/otpless/`; core stays byte-identical to upstream so merges stay small. The `update-qm` skill merges upstream monthly; `upstream-pr` sends generic fixes back.

**Why:** "Custom harness for OTPLESS" is achieved at the layer that matters — org config, command policy, sandbox image, skill packs, custom tools — not by rewriting session storage and Slack plumbing. Rebuilding qm ≈ months of undifferentiated work and a permanent maintenance tax; the fork gives 100% control (it's our repo, we can diverge core any day the trade is worth it) with ~0% of the rebuild cost.

**Consequences:** we accept qm's architecture (Node/Fastify core, Postgres, per-scope sandboxes, plugin surfaces); if upstream dies, we own a working snapshot and diverge.

**Staging (amended):** deployment does not require the fork — `qm init` from the published `@yc-software/qm` package materializes a config-only deployment repo, which is how we go live (RUNBOOK §2). The private fork is adopted lazily, at the first moment we need to customize core or read core + customizations in one tree; until then it's deferred cost. When adopted: plain bare-clone + mirror push (never GitHub's Fork button), layer in `deploy/layers/otpless/`, upstream CI runs in our account.

### ADR-001 correction (2026-08-01) — the `deploy/layers/` directory contract does not exist

**What we got wrong.** ADR-001 above, `docs/RUNBOOK_DEPLOY.md` §2–§3, and `platform/deploy-layer/otpless/README.md` all state that OTPLESS-specific material lives in the deployment repo at `deploy/layers/otpless/`, "matching qm's documented layer-directory contract." **There is no such contract.** Verified by running `qm init . --org otpless --target fly` against the published `@yc-software/qm@0.1.4` and inspecting what it actually materializes.

**The real deployment-directory contract (`"contract": 1`):**

| Real artifact | What it holds | What we had assumed |
|---|---|---|
| `qm.config.jsonc` | orgId, publicUrl, target, modelProvider, appPrefix, region, flyOrg, `services[]`, `plugins[]`, `skills[]`, per-service `env` / `secretEnv`, sandbox app | our `org-config.md` compiles here |
| `sandbox/skills/<id>/SKILL.md` | the sandbox layer — skills mounted into the agent | we expected a layer directory |
| `sandbox/tools/<id>/tool.json` | custom tools, executable alongside | not previously modelled |
| `sandbox/Dockerfile` (optional) | only for extra system packages | — |
| `skills: []` in config | **extra directories of SKILL.md mounted into the agent** — this is how our packs load | we assumed a git-URL skill-pack import |
| `.codex/skills/deploy-qm/` | the deploy agent skill qm ships | as documented |

**Two further corrections of fact:**

1. **qm requires Node ≥ 24.** The CLI refuses to run below it. Neither the runbook nor gate G1 mentioned a runtime prerequisite.
2. **qm does not build from source, so a Fly app must never be pointed at a source repo.** The CLI selects immutable runtime image digests from its release manifest and orchestrates the Fly apps itself via `qm up`. Running `flyctl launch` against this repository fails with "Could not detect runtime or Dockerfile" — correctly, because `otpless-ai` is skill packs and config, not a service. There is nothing here for Fly to build, and there never will be.

**Why this matters beyond the file paths.** This is the platform's own documentation committing the failure mode the department playbook warns about — a capability assumed rather than verified — and it survived four phases because nothing executed against the real package until now. ADR-007 exists because the Gmail connector could not do what we assumed; this correction exists for the same reason, one layer down. The lesson generalizes: an integration contract written from a README is a hypothesis until something runs.

**What does not change:** the substance of ADR-001. qm core stays unforked, our material stays separate and version-controlled here, and the private fork remains deferred. Only the mechanism by which our material reaches the deployment was wrong.

## ADR-002 — Model & token policy

**Decision:** haiku for mechanical transforms; sonnet as the default workhorse for skills/code/reviews/fixtures; top-tier model only for architecture, ambiguous judgment, and final phase reviews. Subagents receive paths not payloads; reads are batched and never repeated within a session; edits preferred over regeneration. qm scopes inherit the same policy: watch/cron loops run on the cheapest model that passes that loop's eval fixtures.

**Why:** the platform runs 24×7; token cost is an operating cost like payroll. The eval harness, not model size, is the quality guarantee.

## ADR-003 — Company brain: git canonical, Notion mirror

**Decision:** `brain/` in this repo is the single source of truth for company knowledge agents act on: policies, playbooks, decisions, org facts, templates. Notion carries a human-friendly mirror (and the operational databases: Applicants, Employees), synced from git by a librarian cron — never hand-edited as canon. Every change that alters behavior (a policy, a template, a bar) must land in `brain/` in the same commit as the code/config change.

**Why:** agents need versioned, diffable, eval-testable knowledge with attribution — that's git. Humans need browsable pages — that's Notion. One direction of sync kills the two-sources-of-truth failure mode. Structured operational data (candidates, employees) stays in Notion databases because forms, views, and human edits live there; the brain stores knowledge, not records.

## ADR-004 — Trust ladder enforced by policy, not convention

**Decision:** Autonomy levels (L0 drafts-only → L1 routine auto-send → L2 rule-based auto-execute) are encoded in qm's predeclared command policy and per-scope security posture, which apply in every posture including Dangerous. Promotions require measured evidence (≥95% unedited-draft acceptance over the window defined per action class) and a human merge of the promotion PR. Any bad send auto-demotes the action class via the same config file. Never delegated regardless of level: offers, comp, terminations, performance judgments, post-interview rejections, policy changes.

**Why:** "the agent behaves because the prompt says so" does not survive contact with 100s of agents. Enforcement must live where the tools are executed.

## ADR-005 — Generic by construction

**Decision:** Role-specific and department-specific content is always data (config/playbook files instantiated from `_template.md` files), never process (skills). Opening a new role = one file in `packs/recruiting/config/jobs/`. A new department = a new pack importing `packs/shared`. A new agent = a qm scope + identity kit + goals file.

**Why:** the 7-hire sprint is the commissioning run; the platform's product is marginal cost ≈ zero for the next role, agent, and department.

## ADR-006 — Approval happens in qm's gate, never in a channel affordance

**Decision:** Human approval of a drafted action is recorded by qm's own approval mechanism (command policy gate, surfaced in the web UI and via qm's Slack plugin). Slack is a *notification and discussion* surface, not an authorization surface. The PRD's "👍-to-act" shorthand (`PRD_Recruiting_System.md` §6) is retired as a mechanism and kept only as a description of the desired ergonomics: one gesture, in Slack, to approve.

**Why:** two independent reasons, and either alone is sufficient. (1) Capability: the Slack MCP exposes message and thread text, not reactions — an emoji approval is not observable by the agent, so a system built on it would silently never fire, or worse, invite polling hacks. (2) Security: an approval is an authorization event and belongs where enforcement lives (ADR-004). A reaction is unauthenticated relative to our policy layer — anyone in the channel can add one, there is no record of *which* draft version was approved, and the audit trail is a Slack emoji. Approvals must be attributable, versioned to the exact content approved, and replayable in an incident review.

**Consequences:** the trust ladder's evidence (ADR-004, and the rollup in `docs/plans/p1-recruiter-complete.md`) reads from qm's approval log, which is authoritative, rather than from channel scraping. Any future channel (WhatsApp, email) inherits the same rule: the channel carries the draft, qm carries the approval. If qm's Slack plugin later offers interactive buttons bound to its approval gate, that is the ergonomic win — still the gate, just a nicer button.

### ADR-006 amendment (2026-08-02) — the capability premise was wrong; the decision stands

One of the two reasons given above was that the Slack MCP cannot read reactions, so a 👍 approval would silently never fire. **That is false for qm's own Slack surface.** The app manifest `qm outputs` generates requests `reactions:read` and subscribes to `reaction_added` / `reaction_removed`. qm can see reactions.

The decision does not change, because the second reason was always the load-bearing one and is unaffected: **a reaction is not an attributable, content-versioned authorization.** Anyone in the channel can add one, there is no record of *which* draft version was approved, and an incident review would be reconstructing intent from an emoji. Approval is an authorization event and belongs where enforcement lives (ADR-004).

Recorded rather than quietly edited, because the failure is instructive: a correct conclusion was propped up by a convenient factual claim nobody checked. Had the security argument been weaker, the wrong premise would have carried the decision.

## ADR-007 — The draft is the contract boundary; send capability is verified, never worked around

**Decision:** Every skill's output contract ends at a **created draft**, in every channel, at every trust level. Whether the platform can then *send* that draft is a connector capability question answered at deploy time by `platform/scripts/verify-deployment.md`, not an assumption baked into skills. Where the connector cannot send (today: the Gmail MCP surface exposes draft/read/label operations and no send), the gap is recorded in the contract's "Capability gaps" section and closed by extending the MCP — never by a raw HTTP call, a headless browser, or a human's mailbox.

**Why:** the discovery that we can draft but not send would, in a naively-built system, surface as a mystery failure at the worst moment — the first L1 auto-send after a promotion. Making the draft the universal boundary means the system's behavior is identical at L0 and L1 up to the final step, so promotion changes one gate and nothing else. It also means a missing capability degrades to "a human clicks send," which is exactly the L0 behavior we already run, rather than to an outage.

**Consequences:** an action-class cannot be promoted to L1 until its channel's send capability is verified present and approval-gated — that verification is a precondition on the promotion PR, alongside the acceptance-rate evidence. `platform/contracts/*.md` carries the current truth per channel.

## ADR-008 — Autonomy evidence: counts in git, identities in qm, and a minimum sample

**Decision:** Draft-acceptance evidence — the number every trust-ladder promotion depends on (ADR-004) — is produced in two tiers. The **raw ledger** (which draft, which candidate, what the human changed) stays in qm scope storage and never enters git. The **weekly rollup** is counts only, lands in git under `platform/evidence/`, and is what a promotion PR cites. Outcomes are bucketed coarsely: `sent_unedited`, `sent_light_edit`, `sent_rewrite`, `discarded`. Acceptance rate is `sent_unedited / (sent_unedited + sent_light_edit + sent_rewrite + discarded)`. A promotion additionally requires a **minimum sample of 20 drafts** for that action-class within the window; below that the class is *insufficient evidence*, which is reported distinctly from a failing rate.

**Why:** three failure modes, each closed by one part of the decision. (1) *Privacy*: the useful raw signal is inherently linkable to a candidate, so it cannot be the artifact humans review in a PR — but counts can be, and counts are what the gate actually needs. (2) *Self-grading*: fine-grained edit scoring invites an agent to classify its way to a promotion; four coarse buckets, with discarded drafts in the denominator, make the number hard to flatter. A discarded draft is a failed draft, not an absent one. (3) *Small numbers*: without a floor, one accepted draft is a 100% acceptance rate and the 95% gate is theatre. Twenty is a judgment call — low enough to be reachable inside a 2-week window at our volume, high enough that a single lucky draft cannot clear it.

**Accepted consequence — the window is quantized to weekly rollup boundaries.** Because rollups are generated weekly, an action-class that clears its sample floor mid-week waits until the next rollup to become promotable; the trailing window is weekly-granular, not rolling-daily. This is deliberate, not an oversight: promotions are merged at the weekly ops review (master PRD §7), so daily recomputation would produce a number no human consumes that week. Revisit only if promotion latency ever becomes the binding constraint.

**Consequences:** promotions become arithmetic a human can audit in one table rather than a claim an agent makes in prose, and the skill refuses to open a promotion PR when the numbers do not clear rather than arguing for an exception. Every future agent and department inherits the same instrument. Revisit the sample floor once real volume exists — if the recruiting agent produces hundreds of drafts a week, 20 is too permissive.

## ADR-009 — qm has no MCP; external systems are reached by connectors, tools, or plugins

**Decision:** Skills reach external systems through qm's own mechanisms, not MCP. In order of preference: a **connector** (OAuth registered in Admin, per-user connection at `/keychain`, credentials encrypted under `CONNECTOR_SECRET_KEY`) where one exists; a **sandbox tool** (`sandbox/tools/<id>/tool.json` plus a binary in the image) where it does not; a **plugin** (a prebuilt image alongside the services) where a long-running process is genuinely required. `.mcp.json` stays in the repo for local Claude Code development and is understood to be read by nothing in the deployment.

**Why:** verified by reading `@yc-software/qm@0.1.4` — the package contains no occurrence of "mcp" or "notion". Our contracts had specified MCP tool names (`notion-fetch`, `notion-query-data-source`) that do not exist on the platform we deployed to. Because contract files are copied into the sandbox layer and read by the agent at runtime, this was not merely wrong documentation: it would have instructed a live agent to use a mechanism that isn't there. Confirmed positively as well — Google, Notion and Slack are all available as connectors and are configured on the OTPLESS deployment.

**A consequence worth taking seriously.** The sandbox-tool descriptor carries two fields that are platform-enforced versions of guardrails we currently express only as prose: `egress[]` whitelists the hosts a tool may reach, and `approvals[{command|pattern, decision}]` gates specific invocations behind a human decision. A Notion tool declaring `egress: ["api.notion.com"]` *cannot* exfiltrate elsewhere — that is enforcement, where our command policy and skill text are instruction. Where a capability is available as both a connector and a tool, prefer the connector for credential handling, but treat `egress`/`approvals` as the model to aim at: our trust ladder should end up expressed in mechanisms the runtime enforces, not in paragraphs an agent could reason around.

**This is the second mechanism we assumed and got wrong** — the first was `deploy/layers/` (see the ADR-001 correction). Both survived multiple review passes because reviewers checked our documents against each other and against the PRDs, none of which knew any better. Neither survived five minutes of running the real thing. The generalisable rule, now recorded in the department playbook: an integration contract written from a README is a hypothesis, and it stays a hypothesis until something executes against the actual system.

## ADR-010 — Enforcement re-founded: reads via connectors, writes via tools we control

**Supersedes the enforcement mechanism in ADR-004.** ADR-004's *policy* — L0/L1/L2 earned on evidence, six classes never delegated — stands unchanged. Its stated mechanism does not: it claims autonomy is "encoded in qm's predeclared command policy and per-scope security posture." Verified against `@yc-software/qm@0.1.4`: **neither a command policy nor a security posture exists.** Zero occurrences of either term. Those names came from the master PRD, written before anyone ran the software.

### What qm actually provides

| Mechanism | Where it lives | What it enforces |
|---|---|---|
| `approvals[{command\|pattern, decision, reason}]` | `sandbox/tools/<id>/tool.json` | `decision` is exactly `"require_approval"` or `"deny"`. Per-invocation, matched on an exact command or a pattern (≤256 chars). |
| `egress[host, …]` | same descriptor | Hosts a tool may reach |
| `securityScreen {backend:"proxy", provider, endpoint, rollout}` | `qm.config.jsonc` | Content screening through a proxy |
| Connector scoping | Admin UI | What an OAuth grant can touch |

**The trust ladder maps onto `decision` natively**, which is the happy part of this finding:

| Our level | Descriptor state |
|---|---|
| Never delegated | `decision: "deny"` — no human can approve it inline |
| L0, drafts-only | `decision: "require_approval"` |
| L1 / L2, promoted | the entry is **absent** for that pattern |

A promotion becomes a diff to a tool descriptor. Descriptors ship in the deployment layer, which is versioned and published — so every promotion is an auditable version bump rather than a claim in prose. That is strictly better than the file we invented.

### The constraint that drives the decision

**`approvals` are a property of tool descriptors and nothing else.** They therefore do not gate connector-mediated actions. If Scout sends mail through the Google connector, our approval rules are not in that path; whatever gate exists is inside core, configured through Admin, and unverified from the CLI.

So: **reads through connectors, writes and sends through tools we own.**

- **Reads** — query the Applicants DB, read a thread, list events. Low blast radius, nothing leaves, nothing changes. Connector convenience is worth having, and OAuth credential handling is better than anything we would build.
- **Writes and sends** — draft or send mail, write a Notion row, create an invite, post to Slack. These are exactly what the guardrails exist for, so they go through sandbox tools carrying `approvals` we author and `egress` we pin. Full control of the gate, at the cost of shipping a CLI binary per system.

Where a capability is available both ways, the split above decides it. This is a hybrid on purpose: it buys enforcement where enforcement matters and takes the free path everywhere else.

### Consequence for G27, which is now load-bearing rather than hygiene

Core logs `SANDBOX_BACKEND=sprites without SPRITES_EGRESS_PROXY_URL — sandboxes run with NO egress enforcement (fail-open)`. That means **`egress[]` declarations are advisory until the egress proxy is configured.** G27 is not a nice-to-have that improves posture; it is the switch that turns a declared host allowlist into an enforced one. A `notion` tool declaring `egress: ["api.notion.com"]` constrains nothing until G27 closes.

### Pattern constraints, learned by having qm reject a rule (2026-08-02)

A probe tool was written to verify the primitive before building on it. qm refused the first descriptor:

```
approvals[0].pattern must refer to its own tool binary by starting with
\bpolicy-probe\b and may not use a top-level alternative
```

Three constraints follow, none of them documented anywhere we had read:

1. **A pattern must be anchored to its own tool's binary name** — it begins `\b<tool-id>\b`. A tool cannot write rules about another tool's commands, which is a sensible isolation property and worth relying on.
2. **Patterns are regex with word boundaries**, not POSIX bracket expressions. `[[:space:]]` was rejected; `\s` is correct.
3. **No top-level alternation.** You cannot write one rule covering `send|delete|update`. Each action needs its own entry.

The third constraint shapes the policy document directly: **one action-class, one rule, one reason string.** That is more verbose than a combined pattern would be, and better — every rule is individually auditable, and the `reason` a human sees at the approval prompt is specific to the action rather than generic across three of them.

Recorded because it is the shape of the thing we now depend on, and because it is the first constraint in this entire build that we discovered by *asking the platform* rather than by shipping something wrong and finding out later.

### What remains unverified, and must be before anything is promoted

- Whether core offers an approval surface for connector actions at all, and how it is configured. If it does, the split above may be relaxable — but not on assumption.
- Whether `require_approval` surfaces in Slack, the web UI, or both.
- Whether `qm rollback --to <digest>` works. Untested. Nothing gains deploy rights before it is proven against a deliberately broken layer.

### Why this is recorded as a re-founding rather than an edit

Four phases of work assumed an enforcement mechanism that does not exist, and every review passed because reviewers compared our documents against each other and the documents agreed. This is the third such failure (`deploy/layers/`, then MCP, now this) and the most serious, because the other two were plumbing and this one is the safety story. The generalisable rule already in the department playbook now has a third instance: **a mechanism is a hypothesis until something executes against it.** Governance models are not exempt — they are the most important thing to test, and were the last thing we tested.

---

## ADR-010 correction (2026-08-03) — three of its premises re-checked against source, one of them wrong

ADR-010 was written from qm's error messages and core's logs. It has now been checked against `@yc-software/qm@0.1.4`'s actual source and against the live deployment's own state. Two claims are confirmed, one is wrong, and the probe result that motivated the whole re-founding turns out to have measured nothing.

### 1. `egress[]` does not enforce, and closing G27 will not make it enforce

ADR-010 said closing G27 "is the switch that turns a declared host allowlist into an enforced one." That is not supported. qm's own layer validator emits:

```
tool "<id>" declares broad egress "<host>"; egress is validated-only in contract v1
```

An audit of every reference to `egress` in the package (`grep -rn egress dist/src/`) finds exactly four: the type declaration, a shape check that it is an array of strings, a rejection of URLs and paths, and that warning. **Nothing consumes it.** There is no iptables, nftables, firewall, or proxy-allowlist code anywhere in the CLI.

So there are two distinct things, and ADR-010 conflated them:

| | What it is | Status |
|---|---|---|
| `SPRITES_EGRESS_PROXY_URL` (G27) | A blanket egress proxy for all sandbox traffic | Unset — sandboxes are fail-open |
| `egress[]` on a tool descriptor | A per-tool host allowlist | **Validated-only in contract v1.** Shipped to core, consumed by nothing we can observe |

Closing G27 buys blanket confinement. It does not make a `notion` tool's `egress: ["api.notion.com"]` mean anything, because that list is not what the proxy is configured from. **Do not write per-tool `egress[]` lists and count them as a control.** Write them as documentation of intent — which is all contract v1 offers — and get the confinement from G27's proxy. G27 stays load-bearing; the reason changes.

### 2. `approvals` reach core intact, and the trust-ladder mapping is real

Confirmed by reading the live deployment back rather than by inference. A signed `GET /v1/deployment-layer` against `otpless-core` returns `status: applied`, `runtimeContentHash == contentHash`, and the `policy-probe` descriptor **verbatim, both approval rules present** — the `deny` on `\bpolicy-probe\b\s+never` and the `require_approval` on `\bpolicy-probe\b\s+ask`.

This is worth more than it looks. It establishes that the descriptor round-trips: our authored rules are what core holds, byte for byte, and the runtime hash matches the stored hash so the runtime has them too. Two further supports:

- `compileApproval` is exported from `@yc-software/qm/contract`, the package's declared "supported programmatic surface for conformance tests." Pattern compilation is contract, not incidental — third parties are expected to compile patterns the way core matches them.
- qm validates approvals aggressively at publish time: valid regex, ≤256 chars, rejected for catastrophic backtracking, and required to be anchored to the tool's own binary. Nobody builds that much validation around a field they ignore.

The trust-ladder mapping in ADR-010 therefore stands, and the policy compiler is cleared to build on it.

### 3. The probe measured nothing — the sandbox was stale, not ungated

Scout reported `policy-probe: not found`, exit 127, and `example-tool` missing too. That was read as possibly meaning the rules never fired. It means neither of those things:

- The published image at the pinned digest `…66816a6e` **contains and runs the binary.** Pulled and executed directly: `/usr/local/bin/policy-probe` is present, and `policy-probe free` prints its expected line.
- Core is pinned to that exact image — `printenv FLY_BASE_IMAGE` on `otpless-core` returns it, with `SANDBOX_BACKEND=sprites`.
- Scout's shell reported `PATH=/home/sprite/.local/bin:/.sprite/bin:…`. The image's own PATH is `/opt/agent-venv/bin:/usr/local/sbin:/usr/local/bin:…`. **Scout was not running this image.**

`qm sandbox publish` records the pin and `flyPinSandbox` reports the app "now boots sandboxes from `<image>`" — *boots*, future tense. Publishing a new sandbox image does not retrofit a sandbox that already exists. The most likely reading is that Scout's sprite is durable and predates the pin; the alternative is that sprites in this configuration never boot our image at all. These are distinguishable by one observation: whether a freshly created sandbox has the binary.

**But the approval test does not need the binary at all, and this is the part we got wrong twice.** Reason it through from what was actually observed:

- Scout ran `policy-probe free` and the *shell* returned exit 127. No approval rule matches `free`, so executing it was the correct behaviour, and 127 is just the missing binary. That arm was never a test of gating.
- `ask` and `never` were **not attempted** — Scout skipped them, reasonably, on the grounds that the binary was missing.

A `deny` decision must refuse the invocation *before* a shell runs anything. So `policy-probe never` is informative regardless of whether the binary exists: **refused → the rule fired; exit 127 → the rule did not fire and `approvals` is gating nothing in this configuration.** The missing binary is not an obstacle to the test; it is irrelevant to it. Two rounds were spent trying to fix the sandbox when the decisive observation cost one command the whole time.

So the sandbox staleness is a real packaging defect worth fixing, but it is **not** a blocker on verifying `approvals`. Runtime behaviour — does `deny` refuse outright, does `require_approval` pause, and where does the prompt surface — remains unverified; nothing is promoted on it; and the next step is one command, not a rebuild.

Two lessons, the second more useful than the first: a null result is not evidence about the thing you were testing until you have shown the test could have produced a positive. And when a test looks blocked, re-derive what each arm actually measures before going to fix the blocker — the probe was well designed, the harness around it was not, and the diagnosis of *why* it was stuck was wrong on top of that.

### 4. A packaging trap, recorded before it bites

With **no** `sandbox/Dockerfile`, qm generates the image itself and emits `COPY tools/<dir>/<binary> /usr/local/bin/<binary>` for every tool. With a **custom** `sandbox/Dockerfile`, it uses that file verbatim and appends *only* a presence check — **it does not add the COPY lines.** Any custom Dockerfile must copy every tool binary itself.

The presence check (`command -v` for each declared binary, failing the build) means this cannot ship silently broken, which is good design on qm's part. We currently have no custom Dockerfile and should keep it that way unless a tool needs a system package.

### What this changes in practice

- The policy compiler proceeds on `approvals`. `decision` values are contract; the mapping is sound.
- `egress[]` is downgraded from control to documentation. Anywhere our docs treat it as enforcement, fix it.
- Live state is now checkable, and that check is `platform/scripts/verify-live-layer.mjs`. Comparing our documents against each other is what produced four consecutive mechanism errors; comparing them against the running system is the fix.

### 5. Addendum (same day) — the compiler's first output would have been rejected by qm

Recorded because it is the fourth mechanism error in this project, it was found the way the previous three should have been, and the fix changed a design decision.

A fresh reviewer, briefed to attack claims rather than compare documents, found that **all nine authored `deny` rules would have been refused by qm at publish time.** They were written as `match_type: pattern` with values like `--category offer`, and qm requires an explicitly-authored pattern to be anchored to its own tool's binary. Confirmed by calling qm's own `parseToolDescriptor`:

```
approvals[0].pattern must refer to its own tool binary by starting with
\bgmail-send\b and may not use a top-level alternative
```

This constraint is documented in ADR-010 above — we had written it down and then not compiled against it. The eval added earlier that day checked that the never-delegated six compile to `deny`; it did not check that the result was publishable. **A guardrail that qm refuses to load is worse than no guardrail, because the policy file reads as though it is in force.**

The naive repair — switch the rows to `match_type: command` — is a trap, and was tested rather than assumed. qm accepts it, then compiles `command: "--category offer"` to `\bgmail-send\s+--category\s+offer(?:\b|(?=\s|$))`, which matches only when the flag is the token *immediately* after the binary. A realistic `gmail-send --to alice --category offer` would not match, and the rule would be silently inert. That is strictly worse than a publish-time rejection: it looks like enforcement and is not.

**The design decision that followed.** The anchor `\b<tool-id>\b` carries no information — every rule must be anchored to its own tool, always — so it is pure boilerplate an author can only get wrong. The compiler now **synthesises** it: a row supplies the *discriminator* (`--category offer`), and the compiler emits `\b<tool>\b.*<escaped discriminator>`, using `.*` so flag order does not matter. Verified accepted by qm for all 22 rules across 6 fragments. The general form: **where a constraint is invariant, generate it rather than asking an author to remember it, and validate the generated result.**

**Where authoritative validation actually happens.** The compiler reimplements qm's two pattern constraints natively so it can run in this repo, which has no `package.json` and no qm install by design (and Node 22 locally, below qm's floor — gate G26). A reimplementation can drift from the real thing, so the layering is deliberate and worth stating:

| Layer | Runs where | Authority |
|---|---|---|
| Native checks in `build-tool-policy.mjs` + `evals/run.mjs` | This repo, every eval run | Early warning. Catches the error at authoring time. Could drift. |
| `--qm-dir <path>` on the compiler | Anywhere qm is installed | qm's real `parseToolDescriptor`. Run it from the deployment directory before publishing a tool. |
| `qm check` / `qm sandbox publish` | Deployment directory | **The backstop that cannot be bypassed.** qm refuses a bad descriptor outright. |

So a drifted native check cannot ship a broken rule to production — it can only fail to warn early. That is an acceptable trade for keeping this repo dependency-free, but it is a trade, not a free lunch.

### 6. Addendum (2026-08-03) — `qm rollback` proven, and it covers only half the surface

`qm rollback --to <digest>` was the last unproven precondition in `docs/proposals/platform-agent.md`. It is now proven, by executing it against the live deployment rather than reading the CLI help.

**Method.** Recorded the running image (A = `…66816a6e`), published a benign variant to get a second *functional* image (B = `…98c65315`) — deliberately breaking production was unnecessary — confirmed core booted B, ran `qm rollback --to sha256:<A>`, then confirmed via `printenv FLY_BASE_IMAGE` on `otpless-core` that the **running service** was back on A. It was. The config pin was rewritten to match, and `verify-live-layer.mjs` stayed green throughout.

**The limitation, which is the important part.** On the Fly target, `qm rollback` repoints the **sandbox image** and nothing else. The **deployment layer is not rolled back** — the layer stayed at v9 across both publishes and the rollback, untouched.

That matters because **our guardrails live in the layer, not the image.** Skills and tool descriptors — including every `approvals[]` rule the never-delegated list compiles into — travel in the versioned layer. So:

> `qm rollback` cannot undo a bad guardrail publish. It undoes a bad *binary*.

The recovery path for a bad layer is different and must be stated explicitly: **re-publish the previous content from git.** That works only because `command-policy.md`, the packs, and the compiler are all version-controlled here, which makes "the authored source lives in git" a recovery guarantee rather than a tidiness preference. `verify-live-layer.mjs` is what tells you the two have diverged.

**Consequence for the platform agent.** Its "never deploy without a verified rollback path" constraint needs splitting in two:

| Change | Undo mechanism | Proven |
|---|---|---|
| Sandbox image (tool binaries) | `qm rollback --to <digest>` | Yes, today |
| Deployment layer (skills, `approvals[]`) | Re-publish prior content from git, verified by `verify-live-layer.mjs` | Mechanism exists and is exercised daily by normal publishes; not yet drilled as a deliberate recovery |

So the honest status is: image rollback is proven, layer recovery is plausible-but-undrilled. An agent granted publish rights should be restricted to the image path until a layer-recovery drill is run, or held at PR-only for layer changes — which is what the proposal already recommends for other reasons.
