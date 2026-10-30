---
name: catalyst-preflight
description: Catalyst Buddy's environment check before it starts or keeps building a Catalyst app - toolchain, Catalyst CLI login, Catalyst MCP connection and data centre, and whether the catalyst-by-zoho and hallmark plugins are the latest upstream versions. Used by the catalyst-buddy agent.
---

# Catalyst preflight

Check the machine is ready before anything else. All checks are read-only; fixes are offered,
never run without a yes.

Two depths:
- **full** (start mode): every check.
- **build** (build mode, inside a project): checks 2, 3, 4 and 5 only.

## Checks

1. **Toolchain** - `node -v` (must be v24.x, the AppSail `node24` stack), `pnpm -v`,
   `git --version`. Fix: point to https://nodejs.org or `nvm install 24`, and
   `npm i -g pnpm`.
2. **Catalyst CLI** - `catalyst --version`, then `catalyst whoami`.
   - Not installed -> `npm i -g zcatalyst-cli`.
   - Not logged in -> the dev runs `! catalyst login` themselves (it opens a browser).
3. **Catalyst MCP** - is any `mcp__*__CatalystbyZoho_*` tool available in this session?
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
4. **Same account** - the CLI's `whoami` email and the MCP organisation must belong to the
   same Catalyst account, or the tables MCP creates won't be in the project the CLI deploys
   to. Fix: log the CLI in as the other account, or use the matching MCP server.
5. **Plugins current** - run `node <this skill's base directory>/plugin-freshness.mjs`. It
   compares the installed commit of `catalyst-by-zoho@catalyst-by-zoho` and `hallmark@hallmark`
   with their upstream `HEAD`.
   - `missing` -> `claude plugin install catalyst-buddy@catalyst-buddy` reinstalls the
     dependencies; if the marketplace is unknown, add it first (see the README of
     catalyst-buddy).
   - `behind` -> say what is behind, and on a yes run
     `claude plugin marketplace update catalyst-by-zoho` (or `hallmark`), then
     `claude plugin update catalyst-by-zoho@catalyst-by-zoho` (or `hallmark@hallmark`), and
     run the script again. If it is still behind, upstream changed files without bumping its
     version; say so and offer `claude plugin uninstall <id>` followed by
     `claude plugin install <id>`.
   - After any update, ask the dev to type `/reload-plugins`, then continue.
   - If `git ls-remote` fails (offline), report "unknown" and carry on.
6. **Stale skill copies** - list `~/.claude/skills/` for `catalyst-*` or `hallmark` entries.
   Those are old `npx skills` copies; they show up next to the plugin's skills under the same
   names and can be months out of date. Offer `npx skills remove <name> -g` for each (ask first).
7. **Repo host CLI** (only if the dev wants Buddy to create the remote) - `gh auth status` for
   GitHub or `zr auth status` for zrepository.

## Act on the result

- Report the failures as one table: `Check | Result | Fix`.
- Checks 2, 3 or 5 fail in start mode -> stop and fix them with the dev first. Designing an
  app on a machine that cannot deploy it wastes the interview.
- Anything else fails -> report it, continue, and remind the dev at the step that needs it.
- Everything passes -> one line, "Preflight: all green", and move on. Don't print the table.
