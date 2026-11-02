# Deep Reset Chief of Staff: setup guide

A Claude Code agent that writes Keon a short morning briefing of what needs her, using her own tools. It reads and drafts; it never sends, charges or changes anything on its own.

## What's in the folder

```
deep-reset-chief-of-staff/
├── CLAUDE.md                          hard rules, loaded automatically
├── constitution.md                    business facts, priorities, checks, briefing format
├── .claude/skills/
│   ├── chief-of-staff/SKILL.md        /chief-of-staff — daily briefing
│   └── weekly-scorecard/SKILL.md      /weekly-scorecard — Monday numbers
├── memory/
│   ├── decisions.md                   what Keon has decided
│   ├── ignore-list.md                 what not to flag
│   ├── people.md                      who's who
│   └── baseline.md                    week-1 numbers for the scorecard
└── briefings/                         one file per day
```

## Setup (about an hour, done together with Keon)

The agent should run under **Keon's** accounts, so the setup happens on her computer or her Claude account.

### 1. Install and open the project

1. Install Claude Code (see https://code.claude.com/docs).
2. Copy this folder to Keon's computer, open a terminal in it, and run `claude`.

### 2. Connect her tools

Connect only what the briefing reads. Use read-only access wherever the tool offers it.

| Tool | How to connect |
| --- | --- |
| Gmail, Google Calendar | Claude connectors in claude.ai settings, or a Google MCP server |
| HubSpot | HubSpot's official MCP server (see HubSpot's developer docs). Use a private app or token scoped to read contacts, deals and tasks |
| Stripe | Stripe's official MCP server (see Stripe's docs). Use a **restricted, read-only** API key, never the secret key |
| Asana | Asana's official MCP server |

Add a server with `claude mcp add` (run `claude mcp add --help` for options), then check with `/mcp`. Follow each vendor's current instructions, because their setup steps change.

WhatsApp check-ins become visible once the messaging inbox tool from the pilot syncs to HubSpot. Until then, the briefing lists WhatsApp under "Couldn't check".

### 3. Fill in the constitution

Open `constitution.md` with Keon and complete the brackets: time zone, cohort dates, and the program list. Read the health flags and the cross-checks together and adjust anything that doesn't fit.

### 4. Test by hand for a week

Run `/chief-of-staff` each morning. Ask:

- Was anything important missing?
- Was anything flagged that didn't matter? Add it to `memory/ignore-list.md`.
- Were the drafts something Keon would actually send?

Adjust the constitution until a briefing takes Keon under 5 minutes to read and act on.

### 5. Schedule it

Once a week of manual runs looks right:

- **Cloud:** create a scheduled task in Claude Code on the web that runs `/chief-of-staff` every day at 6:00 in Keon's time zone. Nothing needs to stay on.
- **Local:** use cron (Linux) or launchd (Mac) to run `claude -p "/chief-of-staff"` from this folder at 6:00. The computer must be awake.

### 6. Upgrade over time

- **Memory:** after each run, tell it what to ignore or remember.
- **Weekly scorecard:** run `/weekly-scorecard` on Mondays from week 2.
- **Auto-send:** only after a draft type has been right for several weeks, and only with Keon's say-so, allow that one type to send. Update `CLAUDE.md` to say exactly which type.

## Privacy

`briefings/` and `memory/` hold customer information. Keep this folder on Keon's computer or a private location. Don't commit it to a public repository.
