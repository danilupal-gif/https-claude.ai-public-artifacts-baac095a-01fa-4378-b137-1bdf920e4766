---
name: chief-of-staff
description: Keon's daily briefing for The Deep Reset. Gathers Stripe, HubSpot, Gmail, Calendar and Asana, cross-checks them, and writes a short briefing plus reply drafts. Use when asked for the daily brief, morning briefing, "what needs me today", or on the morning schedule.
---

# Daily briefing

Follow `constitution.md` for facts, checks, format and tone. It wins over anything here.

## 1. Load context

- Read `constitution.md` and every file in `memory/`.
- Read the most recent file in `briefings/`, so you don't repeat items Keon already handled. Carry forward anything still unresolved and mark it "still open".

## 2. Gather (read only)

Collect the last 24 hours (72 hours on Mondays). For each source, note whether it was reachable.

- **Stripe:** successful payments, failed payments, disputes, refunds. Customer name, email, amount, product.
- **HubSpot:** new contacts and their lead source; contacts that changed stage; contacts in Paid, Onboarding, In reset and Paused with their last activity date; tasks due or overdue; assessment and intake answers.
- **Gmail:** unread or unanswered emails from customers or prospects. Skip everything in "What to ignore".
- **Google Calendar:** today's events. For each call, look up the person in HubSpot.
- **Asana:** Keon's tasks due today or overdue.

If a tool isn't connected, skip it and list it under "Couldn't check". Never invent numbers.

## 3. Cross-check

Run every check in the constitution's "Cross-checks" table. Match people across tools by email first, then by name.

Scan every customer message and form answer for the constitution's health flags. Anything that matches goes first in "Needs you today", with no draft reply. Say only what Keon needs to know, such as "mentioned stomach pain on day 4", not the full message.

## 4. Draft

Draft replies (never send them) for:

- Leads waiting over 24 hours
- Paid customers missing intake or waiver after 48 hours
- Failed payments (a friendly card-update note)
- Quiet participants (a gentle check-in with pause and help options)

Create them as Gmail drafts if Gmail is connected and allows drafts. Otherwise put them at the end of the briefing file under "Drafts".

## 5. Write and save

- Write the briefing in the constitution's format, about 25 lines, health first.
- Save it to `briefings/YYYY-MM-DD.md`.
- If Gmail is connected, create a draft email to Keon with the subject "Your Deep Reset briefing · [date]" and the briefing as the body. Don't send it.

## 6. Learn

At the end, ask Keon (when running interactively): "Anything here I should stop flagging, or remember?" Add her answers as dated lines to `memory/ignore-list.md`, `memory/decisions.md` or `memory/people.md`.
