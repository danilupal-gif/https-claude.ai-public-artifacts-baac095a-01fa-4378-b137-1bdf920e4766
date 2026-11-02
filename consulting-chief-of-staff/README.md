# Consulting Chief of Staff: setup guide

A Claude Code agent that runs Danielle's consulting firm day to day: a morning briefing, meeting prep, weekly client updates and a Friday review. It reads and drafts; it never sends or changes anything on its own.

## What's in the folder

```
consulting-chief-of-staff/
├── CLAUDE.md                        hard rules (read-only, client separation, protect the method)
├── constitution.md                  firm, offers, fit criteria, clients, checks, briefing format
├── .claude/skills/
│   ├── chief-of-staff/SKILL.md      /chief-of-staff   daily briefing
│   ├── meeting-prep/SKILL.md        /meeting-prep     one-page call prep
│   ├── client-update/SKILL.md       /client-update    weekly client email draft
│   └── weekly-review/SKILL.md       /weekly-review    Friday review
├── memory/
│   ├── clients/deep-reset.md        one file per client
│   ├── pipeline.md                  prospects (until you set up a CRM)
│   ├── launch-plan.md               the firm's 90-day plan
│   ├── decisions.md
│   └── ignore-list.md
└── briefings/                       outputs (kept out of git)
```

## Setup

1. **Open it.** In a terminal in this folder, run `claude`.
2. **Connect tools.** Gmail, Google Calendar and Google Drive through Claude connectors or a Google MCP server. Add a CRM later (HubSpot's free CRM has an official MCP server). Check connections with `/mcp`.
3. **Fill in the constitution.** Firm name, time zone, weekly client hours.
4. **Run it by hand for a week.** Use `/chief-of-staff` each morning and `/meeting-prep` before calls. Trim anything noisy into `memory/ignore-list.md`.
5. **Schedule it.** A Claude Code scheduled task on the web that runs `/chief-of-staff` at 7:00 on weekdays and `/weekly-review` at 3:00 pm on Fridays. Or run `claude -p "/chief-of-staff"` with cron or launchd.
6. **Add each new client.** Copy `memory/clients/deep-reset.md` as a template, add a row to the constitution's client table, and record permissions as you get them.

## Keeping client work separate

- Each client gets one file in `memory/clients/`. The agent never mixes them.
- `briefings/` holds client details and is excluded from git.
- Client files also hold private details. Keep this repository private.
