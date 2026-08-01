<!-- Purpose: one-page pointer summary of the hiring system for any agent/human orienting quickly — the detail lives in packs/recruiting/config. -->

# Hiring Playbook (pointer)

This is a one-page orientation, not the source of truth. Full detail — templates, per-role bars, Q&A scripts, comp bands — lives in `packs/recruiting/config/` and `docs/PRD_Recruiting_System.md`. Update this pointer whenever the underlying system's shape changes; keep the detail out of here.

## The bar (what "yes" looks like, every role)

Evaluated primarily from a work sample / artifact, not a resume:

1. **Ownership evidence** — did they actually drive something to done, not just participate.
2. **Slope** — rate of improvement/learning, not absolute level at this moment.
3. **AI leverage** — do they use AI tools to multiply their own output, thoughtfully.
4. **Quality taste** — do they know the difference between shipped-and-fine and actually good, and reach for the latter.

Full rubric with the 1–4 scoring scale and decision rule: `evals/rubric.md`.

## Process (5-business-day SLA, application to offer)

```
Application form → 15-minute intro call → work sample (async) → half-day onsite → offer within 48h of onsite
```

Every stage is time-boxed; the recruiting agent tracks time-in-stage and flags anything sitting idle. Nothing waits on a human remembering — the agent surfaces it.

## Where the detail lives

| Need | Location |
|---|---|
| Per-role bar, comp band, outreach template | `packs/recruiting/config/jobs/<role>.md` |
| Process rules, tone guide, standard Q&A | `packs/recruiting/config/playbook.md` |
| Notion DB IDs, stage names | `packs/recruiting/config/notion.md` |
| Operator identity, calendar, sign-off | `packs/recruiting/config/user.md` (from `user.md.example`) |
| Rating rubric + fixtures | `evals/rubric.md`, `evals/fixtures/applicants.json` |
| Full system spec | `docs/PRD_Recruiting_System.md` |

## Non-negotiables (see `packs/shared/trust-ladder/SKILL.md` for the general form)

Offers, comp, and any rejection after a human has met the candidate are never delegated to the agent — draft only, human sends. Every outbound candidate message discloses AI per `packs/shared/identity/SKILL.md`.
