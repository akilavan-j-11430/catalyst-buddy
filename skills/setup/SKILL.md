---
name: setup
description: Catalyst Buddy's Catalyst check, run after doctor - Catalyst CLI login, Catalyst MCP connection and data centre, and the same account on both. Used by the Buddy agent.
---

# Catalyst setup

Check the Catalyst side is ready; `zcatalystai:doctor` has already checked the machine. All
checks are read-only; fixes are offered, never run without a yes.

## Checks

1. **Catalyst CLI login** - `catalyst whoami`.
   - Not logged in -> the dev runs `! catalyst login` themselves (it opens a browser).
2. **Catalyst MCP** - is any `mcp__*__CatalystbyZoho_*` tool available in this session?
   - Yes -> call `CatalystbyZoho_List_All_Organizations` on each Catalyst MCP server. Note
     each server's data centre from its URL (`zohomcp.com` = US, `.in`, `.eu`, `.com.au`,
     `.ca`, `.sa`, `.jp`, `.ae`).
   - No -> hard stop. Load `catalyst-by-zoho:catalyst-zoho-mcp` and walk the dev through
     adding a server for their data centre with
     `claude mcp add --transport http --scope user <name> <server-url>`, then tell them to
     restart the session (MCP servers load at start-up).
   - The `catalyst-by-zoho` plugin ships a US global server named `catalyst-by-zoho`. If the
     dev is not on US, tell them to switch that one off in `/mcp` so it is never picked by
     mistake.
3. **Same account** - the CLI's `whoami` email and the MCP organisation must belong to the
   same Catalyst account, or the tables MCP creates won't be in the project the CLI deploys
   to. Fix: log the CLI in as the other account, or use the matching MCP server.

## Act on the result

- Report the failures as one table: `Check | Result | Fix`.
- Checks 1 or 2 fail in start mode -> stop and fix them with the dev first. Designing an
  app on a machine that cannot deploy it wastes the interview.
- Anything else fails -> report it, continue, and remind the dev at the step that needs it.
- Everything passes -> one line, "Setup: all green", and move on. Don't print the table.
