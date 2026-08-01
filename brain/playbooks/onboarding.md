<!-- Purpose: the company's onboarding knowledge — why the notice-period warmth loop exists, what day one must accomplish, the 30/60/90 rhythm, and the buddy convention — so the Onboarder agent acts with judgment, not just ticks a checklist. -->

# Onboarding Playbook (knowledge, not checklist)

This is a one-page orientation to the *why* behind onboarding, in the same spirit as `playbooks/hiring.md`. The checklist mechanics — the actual day-one task list, BGV vendor steps, provisioning tickets, 30/60/90 templates, buddy-assignment logic — are config owned by the Onboarder agent's own pack, not this file. Duplicating that mechanics here would create two sources of truth: this file exists so the Onboarder (and any human reviewing its work) understands the intent behind the steps, not just the steps.

## The notice-period warmth loop — what it's for

Indian notice periods typically run 30–90 days depending on level and role (the exact figures live in `people/leave-policy.md`, currently DRAFT — see `people/policies-index.md` before citing a number). That window is exactly when counteroffers happen: the outgoing employer, having just learned someone is leaving, has weeks to come back with a raise, a promotion, or a guilt trip, and a candidate who goes quiet between offer-accept and join date is a candidate the counteroffer has time to work on uncontested.

The warmth loop exists to keep OTPLESS's side of that relationship warmer than the counteroffer's: regular (weekly) touchpoints from offer-accept through day one, so the candidate already feels like a colleague — looped into team news, given a real person to ask questions, made to feel expected — rather than an applicant in limbo. This is not a scheduling nicety. It is the single highest-leverage retention action available between offer and join date, precisely because it is the only period where the candidate's allegiance is genuinely contested and OTPLESS has no other lever.

## Day one — what it must include

Day one succeeds if, by the end of it, the new hire has:

- **A working identity** — accounts, device, and access already provisioned, so the day is spent working, not filing IT tickets.
- **Met their manager and their buddy** — a real conversation, not just a calendar invite or a welcome email.
- **A written first-week plan** — so "what does good look like" doesn't have to be asked; it's already answered.
- **A named person to ask** when something is unclear — the buddy, ahead of the manager, for anything that isn't a manager-shaped question.

A day one that is only paperwork and account-provisioning has failed at its actual job, which is to make someone feel like they made the right call joining.

## The 30/60/90 rhythm — what each checkpoint is for

- **30 days:** has the new hire found their footing? Do they know the team, the tools, and what's expected of them — and are there early blockers (access, unclear scope, a bad first-week plan) worth catching now, before they calcify into a bad quarter.
- **60 days:** are they contributing meaningfully, not just ramping? This is the first real feedback conversation — calibrating expectations in both directions before either side has quietly decided something without saying it.
- **90 days:** is this a fit, for the company and for them, checked explicitly rather than assumed by silence. This is also typically when probation-equivalent judgment calls get made — that judgment is human territory (never-delegated list, master PRD §6/§7); the agent's job is to make sure the conversation happens on schedule, not to render the verdict.

The rhythm exists because none of these three conversations reliably happens on its own once day-to-day work takes over — the agent's value is making sure the clock is kept, not remembered.

## The buddy convention

A buddy is a peer, not a manager: someone doing a similar job, assigned before day one, whose role is answering the questions a new hire won't want to ask their manager — "is this normal," "who do I actually ask about X," "is the culture really like the pitch said." The relationship is informal and social by design. It is not a performance channel, and a buddy is never asked to evaluate the person they're supporting.

It works when the buddy is someone the new hire will actually spend time with (same team or an adjacent one), and when the assignment happens early enough that the new hire has a friendly face lined up before they've even shown up — not scrambled together on day one itself.

## Where the mechanics live

The checklist DB, day-one task list, BGV orchestration steps, 30/60/90 templates, and buddy-assignment rules are the Onboarder agent's own pack config — built and owned there, evolving through its own retro loop (`docs/ADRS.md` ADR-004 trust ladder). This file is the constant underneath that config: if the mechanics change but stop serving the intent above, that's a bug in the mechanics, not in this file. See `docs/PRD_People_Department_Agents.md` §4 for the Onboarder's full mandate (offer-accept → day 90, BGV, provisioning, buddy assignment, 30/60/90 scheduling).
