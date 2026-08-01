<!-- Purpose: the trust-ladder expressed as enforceable policy statements — what qm's command policy actually denies/allows, independent of any agent's own reasoning. -->

# Command Policy — OTPLESS org

Source of truth for the rules; compile into qm's native policy schema when installed (see `README.md` load order — this must be active before any scope is created). Encodes `packs/shared/trust-ladder/SKILL.md` as enforcement, not just guidance: an agent that "forgets" the rule is still stopped here.

## 1. Default posture

- **Org-wide default: Auto** (content screening on).
- **Per-scope override: `people-ops` scope runs Strict** on any HRMS write until that action-class reaches L1 evidence (§3). Strict requires human approval on every write regardless of content screening result. Posture may only tighten per scope from here, never loosen silently — any loosening is itself a policy change requiring human merge.

## 2. Deny-by-default for external sends at L0

Every action-class starts at **L0** for every agent, every scope, with no exception on day one. At L0:

```
DENY: any send/execute to an external recipient (email send, Slack DM/post to a human outside the agent team, calendar invite to an external attendee, Notion/HRMS write that becomes visible to a human, WhatsApp send) UNLESS a human has explicitly approved this specific instance.
ALLOW: draft creation, internal notes, reads, and anything reversible with no external visibility.
```

This is the floor. An action-class only moves off L0 via a merged PR against this file citing the evidence required in §3.

## 3. Promotion gates (enforced, not aspirational)

| Level | Requirement to enter | Policy effect |
|---|---|---|
| L1 | ≥95% of that action-class's drafts sent unedited over a trailing 2-week window | `DENY` on that action-class relaxes to `ALLOW-AUTO` for routine sends matching the exact template/pattern approved in the PR; anything outside that pattern still requires approval |
| L2 | ≥95% unedited over a trailing 4-week window AND zero incidents in that window | `ALLOW-AUTO` extends to rule-based execution per the agent's own playbook criteria (e.g. stage advance, templated early-stage rejection) |

Promotion PRs must cite the exact window and rate; this policy file itself only changes on a merged PR (human approval), never a runtime decision.

## 4. Never-delegated list — hard denials, every posture, every level

These are `DENY` unconditionally, in every security posture including Dangerous, regardless of any L0/L1/L2 state:

```
HARD DENY, always, all scopes:
  - offers (extending, revising, or communicating an offer)
  - compensation (discussing, negotiating, or disclosing beyond an approved published band)
  - terminations (initiating or communicating)
  - performance judgments (ratings, review content, calibration decisions)
  - post-interview rejections (any rejection after a human has met the candidate/employee)
  - policy changes (creating or modifying an approved people policy)
```

No PR against this file may remove or weaken this section. A PR that attempts to is itself a policy violation and must be rejected on review.

## 5. Destructive-operation denials

```
HARD DENY, requires explicit human approval regardless of level:
  - deleting a Notion database row/page that represents a candidate, employee, or policy doc
  - deleting or overwriting an HRMS record
  - force-pushing or merging its own PR (see packs/shared/retro/SKILL.md — an agent never self-merges)
  - modifying this command-policy file or org-config.md directly (must go through PR + human merge)
  - granting itself or another scope a new credential/scope permission
```

## 6. Incident handling

One bad send (a send later judged wrong — wrong recipient, wrong content, violated a never-delegated rule, etc.) **demotes the triggering action-class one level immediately**, applied as an update to this file. The evidence clock for re-promotion restarts from zero. Post-mortem note lands in the playbook repo within 48h (PRD §7).

## 7. Per-scope posture summary

| Scope | Default posture | Notes |
|---|---|---|
| `recruiter` | Auto | Candidate-facing sends still gated per trust ladder above; Auto affects content screening, not the trust ladder |
| `people-ops` | **Strict** until L1 | Any HRMS write requires human approval regardless of content screening until the relevant action-class earns L1 |
| `onboarder`, `analyst`, `culture` | Auto | Inherit org default; own action-class rows added to this file as they launch (P2/P3) |
