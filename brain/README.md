<!-- Purpose: explains what brain/ is, why it exists, and the editing rules every agent and human must follow before touching it. -->

# Company Brain

The canonical, agent-readable knowledge base for OTPLESS's AI Workforce: company facts, people policies, playbooks, and the decision log. If an agent needs to know something to act correctly and consistently, it should be able to find it here.

## Purpose (ADR-003)

Git is the source of truth; Notion is a human-friendly mirror synced from git by a librarian cron. Never hand-edit the Notion mirror as if it were canon — edits there get overwritten on next sync. Structured operational records (candidates, employees) live in Notion databases instead, because forms/views/human edits belong there; `brain/` holds knowledge, not records.

## Structure

```
brain/
├── README.md                    # this file
├── company/
│   └── facts.md                 # company facts agents may state (product, location, headcounts — many are placeholders)
├── people/
│   ├── policies-index.md        # index of all people policies + their approval status
│   ├── policy-_template.md      # template for a new policy doc
│   ├── leave-policy.md          # DRAFT until founder approves
│   └── expense-policy.md        # DRAFT until founder approves
├── playbooks/
│   ├── hiring.md                 # one-page pointer into packs/recruiting for the hiring system
│   └── onboarding.md             # onboarding knowledge/intent (warmth loop, day one, 30/60/90, buddy) — mechanics live in the Onboarder's own pack
└── decisions/
    └── log.md                   # running decision log (ADR-001..005 + future decisions)
```

## Editing rules

1. **Behavior changes land here in the same commit** as the code/config change that causes them. A new policy, a changed bar, a new playbook rule — if it changes what an agent does, it is not "shipped" until `brain/` reflects it.
2. **Every doc starts with a one-line purpose** at the top (as an HTML comment or the first sentence), so a skimming agent or human knows what a file is for before reading further.
3. **No PII, ever.** Company facts, policies, and playbooks are knowledge and process — never candidate/employee personal data. Personal data lives in Notion databases (Applicants, Employees) or HRMS, governed separately.
4. **Status matters.** Any policy not explicitly marked `Status: Approved` is `Status: DRAFT` and agents must not answer questions or take actions based on it as if it were live policy — see `people/policies-index.md`. Every draft policy carries the same machine-checkable marker (`<!-- POLICY-STATUS: DRAFT -->` plus a visible banner) at the top of the file, ahead of the title, so an eval or a skimming agent can't miss it.
5. **Placeholders are marked, never invented.** A fact an agent doesn't actually know (headcount, customer count, etc.) is written as `{FILL-BEFORE-USE: description}` — agents must never fabricate a plausible-sounding number to fill the gap.
6. Changes to `brain/` follow the same PR/review discipline as code where they affect agent behavior (see `packs/shared/retro/SKILL.md` for how an agent proposes such a change to its own config, and the trust ladder / command policy for anything an agent is not allowed to change unilaterally).
