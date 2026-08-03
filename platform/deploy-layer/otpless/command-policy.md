<!-- Purpose: the compilation source for OTPLESS's tool-descriptor enforcement — the tables platform/scripts/build-tool-policy.mjs reads to emit sandbox/tools/<id>/tool.json's approvals[] arrays. This is not prose describing enforcement; it is the authored form of the enforcement. -->

# Command Policy — OTPLESS org

**Re-founded per `docs/ADRS.md` ADR-010 — read that first.** The previous version of this file described a "command policy" and per-scope "security postures" (Auto/Strict/Dangerous). Verified against `@yc-software/qm@0.1.4`: **neither exists.** Zero occurrences of either term in the package. What actually exists, and the only thing this file compiles to, is `approvals[{command|pattern, decision, reason}]` on a **tool descriptor** (`sandbox/tools/<id>/tool.json`). `decision` is exactly `"require_approval"` or `"deny"`; a rule matches either an exact `command` or a `pattern` (≤256 chars) — never both. `egress[]` on the same descriptor is a separate field, validated-only in contract v1 regardless of G27 — it documents intent, nothing consumes it (see §8; ADR-010 correction §1). Content screening (`securityScreen` in `qm.config.jsonc`) is a third, org-level mechanism unrelated to either — it lives in `org-config.md`, not here, and this file makes no claim about it.

**ADR-004's policy stands; only its mechanism changed.** The trust ladder (L0 drafts-only → L1 routine auto-send → L2 rule-based auto-execute), the ≥95%-with-minimum-20-sample promotion bar (ADR-008), the one-bad-send-demotes rule, and the six never-delegated classes are unchanged in substance. Every rule below is that same policy, expressed as data a compiler can read instead of prose an agent could reason around.

**The trust ladder maps onto `decision` natively:**

| Our level | Descriptor state |
|---|---|
| Never delegated | `decision: "deny"` — **no human can approve it inline.** This is stronger than the old wording: a `require_approval` action is one a human can click through in the moment; a `deny` action has no such click — the descriptor makes it structurally un-runnable. |
| L0, drafts-only | `decision: "require_approval"` |
| L1 / L2, promoted | the entry is **absent** for that pattern |

## How to read the tables below

Each rule table is bracketed by a machine-readable marker so `platform/scripts/build-tool-policy.mjs` can find it without a markdown parser:

```
<!-- policy-table: id=<name> kind=rule columns=action_class,slug,tools,match_type,match_value,decision,reason -->
| Action class | Slug | Tools | Match type | Match value | Decision | Reason |
|---|---|---|---|---|---|---|
| ... rows ...
<!-- /policy-table -->
```

- **Tools** is a comma-separated list of tool ids (§1's registry) this row applies to. The compiler emits one `approvals[]` entry, in that tool's own JSON fragment, per tool listed.
- **Match type** is `command` or `pattern`, exactly. **Match value** is the string for that field — never both `command` and `pattern` on one row; the column pair enforces the XOR by construction.
- **An author writes the discriminator; the compiler guarantees the anchoring.** qm requires every `pattern` to start with `\b<its own tool's id>\b` and to carry no top-level alternation (a `|` outside a character class) — a real, verified constraint of `parseToolDescriptor`, not a stylistic preference. That anchor carries zero information (it is always the same shape for a given tool) and is pure boilerplate an author could only ever get wrong, so a `match_value` here is **never** the full anchored regex — it is just the discriminator, e.g. `--category offer`. `platform/scripts/build-tool-policy.mjs` synthesises the rest: for tool `T` and discriminator `V`, it regex-escapes each whitespace-separated token of `V`, joins them with `\s+`, and emits `\bT\b.*<joined>` — `.*` rather than `\s+` between the anchor and the discriminator so flag order and intervening arguments don't matter. Worked example: tool `gmail-send`, `match_value` `--category offer` → compiled pattern `\bgmail-send\b.*--category\s+offer`, verified accepted by a real `@yc-software/qm`'s own `parseToolDescriptor`. (A row may instead start `match_value` with the literal `\b{tool}\b` placeholder to hand-author something other than the default `.*`-join; the compiler substitutes the real tool id for `{tool}` and does not double-anchor. No row here needs this — it exists for a future case that does.)
- `command`-type rows are compiled differently and are **not** anchor-synthesised the same way: qm's own compiler turns `command: "V"` into `\b<tool>\s+V(?:\b|(?=\s|$))`, which matches only when `V` is the token(s) immediately following the binary — flag order matters. No row below uses `command`; if a future row does, `build-tool-policy.mjs` prints a warning explaining this exact-position limitation, because a `command` row that looks fine can be silently inert against a realistic invocation with other flags first.
- A `kind=tools` table (§1) instead declares `tool_id,status,purpose` — the registry the compiler validates every `Tools` cell against.
- A table with a header/separator but **zero data rows** is not an error — it is a documented gap (§2 has one, on purpose; see there for why). The compiler reports it as a gap, not a pass.

**The match values below are OTPLESS's own tool-CLI design, authored ahead of the binaries themselves** — no OTPLESS tool ships yet (only qm's scaffolded `example-tool`; see §1). Two distinct things are true of every compiled `pattern`, and they must not be blurred together: (a) whether qm will **accept** the descriptor at publish time — this is now genuinely checked, both natively (`build-tool-policy.mjs` reimplements qm's own anchor/alternation/length/regex-validity rules) and, when a real `@yc-software/qm` is resolvable, authoritatively (the compiler runs the compiled descriptor through qm's own `parseToolDescriptor`); and (b) whether the pattern will **match** a real invocation once the tool ships — still not checked by either path, and still the author's job to confirm when the binary lands (`--category offer` only fires if the shipped CLI actually emits that flag/value pair). Treat every `pattern` row here as provisional on (b) until the tool it names ships and its author confirms the match still fires.

## 1. Tool registry

The tools this policy has rules for. All six are **planned, none shipped** — this file is authored ahead of the binaries per ADR-009/010's "writes and sends go through tools we own" split. `platform/scripts/build-tool-policy.mjs` validates every id against qm's tool-id shape (`^[a-z0-9][a-z0-9-]{0,63}$`) and treats any tool referenced in a rule table but absent from this registry as an error.

<!-- policy-table: id=tools kind=tools columns=tool_id,status,purpose -->
| Tool id | Status | Purpose |
|---|---|---|
| `gmail-send` | planned — not yet shipped | Send email to a recipient outside the agent team (the Gmail connector currently exposes draft/read/label only, not send — ADR-007, gate G13; this tool is how a send, once built, carries `approvals`) |
| `notion-write` | planned — not yet shipped | Write a Notion row/page a human will see (Applicants DB, Employees DB, Policies wiki) |
| `slack-send` | planned — not yet shipped | Post or DM a human outside the agent team |
| `calendar-invite` | planned — not yet shipped | Create/send a calendar invite with an external attendee |
| `whatsapp-send` | planned — not yet shipped | Send a WhatsApp message to a candidate/employee (blocked on gates G20/G21/G22 regardless of this policy) |
| `hrms-write` | planned — not yet shipped | Write or delete an HRMS record (People-Ops has no write path at all in P2 — `platform/contracts/hrms.md` — so every rule against this tool is a standing backstop, not an active path) |
<!-- /policy-table -->

Reads (querying the Applicants DB, listing calendar events, reading a Slack thread) go through connectors per ADR-010 and are **not** in this registry — `approvals` cannot reach connector-mediated actions, so there is nothing for this file to say about them.

## 2. L0 floor — every write/send action-class starts at `require_approval`

Every action-class, every agent, every scope, starts at L0 with no exception on day one: the agent may prepare content, but every send/execute requires an explicit human approval first. An action-class only leaves L0 via a merged PR against this file citing the evidence required in §3.

**The floor is not a qm default — it is an authoring discipline this file enforces.** Read the three-state mapping in the intro again: `deny`, `require_approval`, and **absent**. A tool descriptor with no matching `approvals` entry at all is not "at L0" — it is functionally identical to a *promoted* L1/L2 action, because qm has nothing to gate it on. A write tool shipped before its `require_approval` rows are authored here is unrestricted by omission, silently. So: **no OTPLESS write tool may ship without every command/pattern it exposes already carrying a row in this section (or a `deny` in §4/§5), authored and reviewed in the same PR that ships the tool's descriptor.** This is the one rule in this file with no exception and no gate number — it is a standing precondition on every future tool, forever.

Per-scope, per-action-class rows (which recruiter/onboarder/people-ops/analyst/culture action-class gets which exact `command`/`pattern`) are compiled in from each scope's own table (`platform/deploy-layer/otpless/scopes/<name>.md`) at the point a real tool ships for that scope — tracked by gate **G19** (`docs/gates.md`), unchanged by this rewrite. Nothing is promotable and nothing needs a specific row here until then; that is the correct state, not a gap in authoring. The table below is intentionally empty today:

<!-- policy-table: id=l0-floor kind=rule columns=action_class,slug,tools,match_type,match_value,decision,reason -->
| Action class | Slug | Tools | Match type | Match value | Decision | Reason |
|---|---|---|---|---|---|---|
<!-- /policy-table -->

## 3. Promotion and demotion gates

| Level | Requirement to enter (ADR-004 / ADR-008, unchanged) | What changes in the descriptor |
|---|---|---|
| L1 | ≥95% of that action-class's drafts sent unedited over a trailing ≥14-day window, **minimum sample 20** resolved drafts (`evidence_status: sufficient`), channel send capability verified present (ADR-007) | The `require_approval` row for that class's specific `command`/`pattern` is **removed** from this file and from the compiled `approvals[]` in a merged PR — the entry becomes absent, which is what "promoted" means (see intro mapping). Anything outside that exact pattern is untouched and stays gated. |
| L2 | ≥95% over a trailing ≥28-day window, same minimum sample 20, **zero incidents in that window** | Same mechanism — a further row (or the L1 row, if the pattern was written broadly enough) is removed, extending auto-execution to the rule-based cases the agent's own playbook defines |

A promotion PR must cite the exact rollup file(s), window, sample size, and rate (`platform/evidence/<scope>/`) — never a claim in prose. **The promotion is the PR diff to this file plus the regenerated tool-descriptor fragment (`platform/scripts/build-tool-policy.mjs --out`), reviewed and merged together; a human merges it, never the agent.** This is the whole of what "promotion" now means, and it is strictly more auditable than the file this repo previously invented: a promotion is a version bump to a real artifact, not a claim about one.

## 4. Never-delegated — hard `deny`, no inline approval possible

Per the intro's mapping, `deny` is not "requires a human click" — there is no click. These six classes get a `deny` rule on every tool listed, unconditionally, at every trust level, and no promotion PR (§3) may ever touch them. **No PR against this section may remove or weaken it; a PR that attempts to is itself a policy violation and must be rejected on review**, exactly as before.

<!-- policy-table: id=never-delegated kind=rule columns=action_class,slug,tools,match_type,match_value,decision,reason -->
| Action class | Slug | Tools | Match type | Match value | Decision | Reason |
|---|---|---|---|---|---|---|
| Offers | `offer` | `gmail-send, slack-send, whatsapp-send` | pattern | `--category offer` | deny | Offers — extending, revising, or communicating one — are a human-only act at every level, every posture-that-no-longer-exists, forever — ADR-004. |
| Compensation | `compensation` | `gmail-send, slack-send, whatsapp-send, notion-write, hrms-write` | pattern | `--category compensation` | deny | Discussing, negotiating, or disclosing compensation beyond an approved published band is never delegated, on any channel or record it could reach. |
| Terminations | `termination` | `gmail-send, slack-send, whatsapp-send, hrms-write` | pattern | `--category termination` | deny | Terminations — initiating or communicating one — are never delegated. |
| Performance judgments | `performance_judgment` | `notion-write, hrms-write, gmail-send` | pattern | `--category performance_judgment` | deny | Performance judgments — ratings, review content, and calibration decisions — are never delegated, whether the record lives in Notion, the HRMS, or a sent email. |
| Post-interview rejections | `post_interview_rejection` | `gmail-send, slack-send, whatsapp-send` | pattern | `--category post_interview_rejection` | deny | Post-interview rejections — any rejection after a human has met the candidate/employee — are never delegated; pre-screen rejections are a separate, promotable class (`applied_stage_rejection`), and this row is only the post-meeting case. |
| Policy changes | `policy_change` | `notion-write` | pattern | `--category policy_change` | deny | Policy changes — creating or modifying an approved people policy — are never delegated; People-Ops may only quote an already-`APPROVED`-marked page (`brain/people/policies-index.md`), never author or edit one. |
<!-- /policy-table -->

## 5. Destructive-operation denials

Split in two, honestly, because not all of the old list is reachable by a tool descriptor.

### 5a. Enforceable via `tool.json` today

These go through tools this policy already controls (§1), so a real `deny` rule compiles now, staged ahead of the binary like §4's:

<!-- policy-table: id=destructive kind=rule columns=action_class,slug,tools,match_type,match_value,decision,reason -->
| Action class | Slug | Tools | Match type | Match value | Decision | Reason |
|---|---|---|---|---|---|---|
| Delete a Notion database row/page representing a candidate, employee, or policy doc | `record_delete` | `notion-write` | pattern | `--action delete` | deny | Irreversible loss of a record a human relied on; requires explicit human approval regardless of level — expressed here as an unconditional deny, stronger than "requires approval," because no OTPLESS skill has a legitimate reason to delete one of these at any level. |
| Delete an HRMS record | `record_delete` | `hrms-write` | pattern | `--action delete` | deny | Same reasoning; also moot in practice today since People-Ops has no HRMS write path at all in P2 (`platform/contracts/hrms.md`) — staged as a backstop for the day one exists. |
| Overwrite an HRMS record | `record_overwrite` | `hrms-write` | pattern | `--action overwrite` | deny | An overwrite destroys the prior value with no diff a human can review after the fact; same backstop reasoning as the row above. |
<!-- /policy-table -->

### 5b. Not enforceable via `tool.json` today — process-only, and said plainly

`approvals` are a property of tool descriptors and nothing else (ADR-010's constraint). These three actions are not mediated by any tool descriptor this policy authors, so there is no JSON row to write for them, and it would be dishonest to imply one exists:

| Action | Why `approvals` cannot reach it | Current enforcement |
|---|---|---|
| Force-pushing or merging its own PR | Git/GitHub operations run through the GitHub connector/MCP surface, not a sandbox tool descriptor `approvals` gates (ADR-010: "approvals... do not gate connector-mediated actions") | Process only: `packs/shared/retro/SKILL.md`'s rule that an agent never self-merges, enforced by the human review step in the build loop, not by a runtime deny |
| Modifying this file (`command-policy.md`) or `org-config.md` directly | Editing a file in this repo's working tree is a generic environment file-write, not a distinct advertised tool command — there is nothing to attach a `command`/`pattern` to | Process only: any change to either file must go through a PR a human merges (§3); the compiler (`build-tool-policy.mjs`) fails loudly if the never-delegated §4 rows are ever weakened or removed, which catches the one attack this file itself can detect |
| Granting itself or another scope a new credential/scope permission | This happens in the Admin UI, not through any connector or sandbox tool the agent invokes | Process only, and outside this file's reach entirely; whether qm offers any programmatic surface for this at all is unverified (ADR-010, "What remains unverified") |

If core turns out to offer an approval surface for connector or admin actions — the first open question in ADR-010 — this section is revisited then, not assumed now.

## 6. Incident handling

One bad send (a send later judged wrong — wrong recipient, wrong content, violated a never-delegated rule, etc.) **demotes the triggering action-class one level immediately**, applied as a PR to this file: the `require_approval` (or `deny`, if the incident reveals the class should never have left §4/§5) row for that specific pattern is **re-added**, and the compiled tool-descriptor fragment is regenerated in the same PR. The evidence clock for re-promotion restarts from zero. Post-mortem note lands in the playbook repo within 48h (master PRD §7).

## 7. Per-scope summary — no posture, no knob

There is no per-scope posture dial. What a scope's own file (`platform/deploy-layer/otpless/scopes/<name>.md`) states is which write tools (§1) it will use and, once G19 compiles its rows into §2/§4/§5, what decision each of its action-classes currently carries. Today, with zero OTPLESS tools shipped, every scope is in the same state: it can draft, and it can read via connectors, and it cannot send or write anything at all — not gated-and-approvable, simply not wired yet (ADR-007's draft-is-the-contract-boundary).

| Scope | Write tools it will use | Today | Where its specific rows will land |
|---|---|---|---|
| `recruiter` | `gmail-send`, `slack-send`, `notion-write`, `calendar-invite`, `whatsapp-send` | No write/send tool shipped; drafts only | `scopes/recruiter.md`'s action-class table, via G19, into §2 above |
| `people-ops` | `hrms-write` (no write action-class exists in P2 at all — `platform/contracts/hrms.md`), `notion-write` | Where the old file said this scope runs "Strict until L1" on HRMS writes, the real equivalent is: **its write action-classes carry `require_approval` like every other scope's, and there is no separate dial that ever made them stricter than that.** What actually distinguished this scope was never a posture — it is that it has no HRMS write action-class at all yet, so §2 has nothing to compile in for it today. | Same as above, once G14/G15 (HRMS provider + credentials) and a write path exist |
| `onboarder` | `notion-write`, `gmail-send` (per `packs/onboarding` config once built) | No write/send tool shipped; drafts only | `scopes/onboarder.md`, via G19 |
| `analyst` | none (read-only reporting agent) | Reads via connectors only | n/a — this scope has no write action-class by design |
| `culture` | `notion-write`, `slack-send` (per `packs/culture` config once built) | No write/send tool shipped; drafts only | `scopes/culture.md`, via G19 |

## 8. How this becomes real — compiled, versioned, published

A promotion, a demotion, or a new deny is now **a diff to a tool descriptor**, produced by `node platform/scripts/build-tool-policy.mjs --out <dir>` reading the tables above, and shipped as `<tool-id>.approvals.json` fragments merged into `sandbox/tools/<id>/tool.json` in the deployment layer. That layer is versioned and published like any other artifact this repo ships — so every change here is an auditable version bump, not a claim in prose, exactly as ADR-010 intends.

**No rule in this file takes effect until that compile step runs and the deployment layer is published.** Editing this markdown alone changes nothing at runtime — it is the *source*, not the *effect*. Run the compiler in dry-run (`node platform/scripts/build-tool-policy.mjs`, no args) after any edit here; it verifies and reports without writing, and `evals/run.mjs` runs the same dry-run as part of the suite so a bad edit fails the build before it fails a deployment.

`egress[]` on these same tool descriptors — which hosts a tool may reach — is a separate field this file does not compile. Per ADR-010 correction §1, **`egress` is documentation of intent only in contract v1 — validated-only, never enforced, regardless of G27.** Blanket confinement comes instead from setting `SPRITES_EGRESS_PROXY_URL` on core (gate G27, `docs/gates.md`, OPEN); closing G27 does not promote a tool's `egress` list to an enforced allowlist. Do not read any `egress` declaration on a future OTPLESS tool as a claim that traffic is actually confined to it, before or after G27 closes.
