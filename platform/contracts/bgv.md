<!-- Purpose: contract between Onboarder's BGV skill and background-verification vendors — written against the capability (initiate, check status, receive a result), not a vendor, because the provider (SpringVerify vs OnGrid) is undecided and no account exists. -->

# Contract: BGV (Background Verification)

## Purpose

Background verification for new hires — identity documents, employment history, and (for some roles) criminal-record checks, run by a third-party vendor, never by the platform itself. Provider is **undecided** (SpringVerify vs OnGrid — `packs/onboarding/config/vendors.md`, gate G18, `docs/gates.md`) and no vendor account exists. This contract states the capability — initiate a check, read its status, receive a completion result — so `packs/onboarding/bgv/SKILL.md` has something real to point at instead of inventing a vendor's API shape.

## Mechanism

**Undecided**, and blocked behind the vendor decision itself (gate G18) — neither SpringVerify nor OnGrid is one of qm's OAuth-provider connectors (confirmed live today: Google, Notion, Slack — `platform/contracts/README.md`). The two real candidates, per qm's actual mechanism set:

1. **A sandbox tool** — `sandbox/tools/<id>/tool.json` plus an executable in the sandbox image, with `egress` pinned to the chosen vendor's API host only, and `approvals` encoding the platform-enforced gate on any initiate-check invocation.
2. **A plugin** — a prebuilt image running alongside the qm services, declared in `qm.config.jsonc`, if the chosen vendor's integration needs its own long-running service (e.g. a webhook receiver for status-change callbacks) rather than a callable tool.

Neither is chosen, and the choice cannot even be made until the vendor itself is chosen (gate G18).

## What we read

- Check status (per hire): `Not started / In progress / Clear / Flagged / Waived-pending` — read by `packs/onboarding/bgv/SKILL.md` on the status-check cron and on ad hoc "is {hire}'s check clear?" queries, cross-referenced against the Employees DB's `BGV status` property (`platform/contracts/notion-employees.md`, `packs/onboarding/config/notion.md`).
- Completion result: a status word only (`Clear` / `Flagged`), never the underlying report. See "PII handling" below — this contract does not authorize reading, storing, or restating the documents or findings behind that status.
- Checks required per role: not a vendor read — comes from `packs/onboarding/config/checklists/{role}.md`.

## What we write

**None, today — no vendor account, no mechanism, nothing to call.** The capability this contract describes for the future (once G18 closes and a mechanism exists for the chosen vendor — see "Mechanism") is: **initiate a check** for a named hire, submitting the documents/consent the vendor's intake requires. Per ADR-007 (the draft is the contract boundary, never worked around), initiation is a **drafted request**, in every case, at every trust level — today that draft is handed to the accountable human to submit through the vendor's own portal by hand; once a mechanism exists for the chosen vendor, the draft still exists and still requires human approval before submission, the same as any other outbound action-class on the trust ladder (`command-policy.md`). No skill ever calls a vendor's initiate-check endpoint directly, and no future L1/L2 promotion changes that — a BGV initiation touches a real person's identity documents, which is exactly the class of action ADR-007 exists to gate.

## Field & name mapping

No vendor field names exist to map — provider undecided (gate G18). Vendor identity, account status, and per-role check lists live in `packs/onboarding/config/vendors.md` (pack-level config, per ADR-005) — this contract states the capability shape only; no vendor name, endpoint, or field is invented here. Status values used today (`Not started / In progress / Clear / Flagged / Waived-pending`) are this platform's own Employees DB vocabulary (`packs/onboarding/config/notion.md`), not a vendor's — once a vendor is chosen, `packs/onboarding/config/vendors.md` is amended to map the vendor's own status vocabulary onto (or alongside) this list; this contract file changes only if the chosen vendor's actual capability differs from initiate/status-read/result described above.

## Staleness & re-query semantics

Same split-brain discipline as every other contract (PRD §8): a BGV case can change status at the vendor at any time, outside this platform's knowledge. Re-query the hire's BGV status fresh every time `packs/onboarding/bgv/SKILL.md` runs — never reuse a status read earlier in the session, and never assume "no change reported" means "still the last-read status."

"Not set" vs "unknown": `Not started` is a real, reportable state — the check hasn't been initiated yet. A query that fails, times out, or (today, always) has no vendor connector to query at all is *unknown* — the skill must say "BGV: couldn't check" (or, pre-gate, "BGV: no vendor account yet") and never render that as `Not started` or `Clear`.

## Write verification

Not applicable today — this contract authorizes no writes yet (see "What we write"). Once a mechanism exists for the chosen vendor and an initiation draft is approved and submitted, the pattern to add here (by amendment, not a new contract) is: re-read the hire's status field after submission and confirm it moved off `Not started` before reporting "initiation confirmed" — same shape as `notion.md`'s write-verification section. This section stays empty by design until that day.

## Failure modes

| Failure | Consuming skill must |
|---|---|
| No vendor account / connector (always true today) | Report "BGV: no vendor account yet," draft the initiation for a human to submit by hand, never claim an API call happened |
| System unavailable (post-gate) | Halt that check, report "BGV: unreachable," never estimate or assume a prior-session status still holds |
| Rate-limited | Back off, retry once; report partial results explicitly labeled incomplete |
| Permission-denied | Halt, escalate to the accountable human as a credential/grant issue |
| Ambiguous result (e.g. two vendor cases matching one hire) | Present both to the accountable human; never guess which is authoritative |
| Status reads `Flagged` (or any failed/adverse result) | Never interpret, resolve, summarize, or communicate the flag to the hire — escalate to the accountable human immediately and stop; adverse action on a candidate/hire is a human judgment adjacent to the never-delegated list (`command-policy.md` §4), not an agent decision, regardless of trust-ladder level |

## Capability gaps today

No mechanism exists for either candidate vendor, and none can be built until the vendor decision (gate G18) lands (see "Mechanism"). This is the primary gap: once G18 closes, the fix is a sandbox tool (egress-pinned to the chosen vendor's API) or a plugin — never a raw HTTP call, never a scraped vendor portal, per CLAUDE.md conventions and ADR-007 (the draft is the boundary, not a workaround to route around a missing one). Until then, every BGV-touching skill runs against synthetic fixture data only and every real initiation is a manually-submitted portal request. No push/subscribe mechanism is assumed either way; treat any future BGV mechanism as poll-only until proven otherwise, with cadence set in `crons.md`.

## PII handling (hard rule, not a style preference)

BGV data is among the most sensitive PII this platform will ever touch — identity documents, employment history, sometimes criminal-record checks. A BGV **result is a status, not a dossier**: this contract authorizes reading and reporting a status word (`Clear` / `Flagged` / etc.) only.

- Underlying documents, report contents, or findings never enter git, never enter a fixture, never enter a Slack message beyond the status word itself.
- No skill stores, restates, summarizes, or paraphrases the substance of a report — not in a draft, not in a note field, not in a retro.
- A `Flagged` (or otherwise adverse) result is never an agent decision to interpret or act on — see the Failure modes row above. It routes to a human, always, every time, at every trust-ladder level.

## Credentials required

- BGV vendor decision (SpringVerify vs OnGrid) — provided by: Founder — gate G18, `docs/gates.md`. Blocks everything else in this contract.
- Vendor account + API credentials, scoped to the Onboarder agent's own machine identity where the chosen vendor's permission model supports scoping — provided by: Founder — gate G18, `docs/gates.md` (same gate covers vendor selection and account/contract setup per the gate ledger's own description).
