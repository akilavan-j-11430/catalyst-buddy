---
name: doctor
description: Catalyst Buddy's machine check, run first in every session - Node, pnpm, git, Catalyst CLI, which Catalyst MCP server to use (configuring one if none is connected), whether Buddy and its catalyst-by-zoho and hallmark plugins are the latest upstream versions, stale skill copies, chrome-devtools MCP - and fixing each gap with the dev, by the dev or by Buddy. Used by the Buddy agent; a dev can rerun it with /zcatalystai:doctor.
---

# Doctor

Buddy runs this first in every session. Every check is read-only; nothing is fixed without
asking.

## 1. Checks

Run them all quietly first; don't report one at a time.

| # | Check | How | Needed for |
|---|---|---|---|
| 1 | Toolchain | `node -v` (v24.x, the AppSail `node24` stack), `pnpm -v`, `git --version` | building the app |
| 2 | Catalyst CLI | `catalyst --version` | `catalyst init`, deploy |
| 3 | Catalyst MCP | section 2 | creating and reading Catalyst resources |
| 4 | Plugins current | section 3 | Catalyst facts, hallmark |
| 5 | Stale skill copies | `~/.claude/skills/` entries named `catalyst-*` or `hallmark` | not loading outdated skills |
| 6 | chrome-devtools MCP (optional) | any `mcp__chrome-devtools__*` tool in this session | checking screens in a browser |

## 2. Catalyst MCP

The Catalyst MCP servers in this session are the distinct `<server>` parts of the
`mcp__<server>__CatalystbyZoho_*` tools.

- **None connected** -> the dev has to configure one before Buddy can go on. Load
  `catalyst-by-zoho:catalyst-zoho-mcp`; the dev creates a server for their data centre at
  https://mcp.zoho.com and adds it with
  `claude mcp add --transport http --scope user <name> <server-url>`, then restarts the
  session (MCP servers load at start-up).
- Otherwise, on each server call `CatalystbyZoho_List_All_Organizations`. Each org's `url`
  gives the data centre: `catalyst.zoho.com` US, `catalyst.zoho.in` IN, `catalyst.zoho.eu`
  EU, `catalyst.zoho.com.au` AU; any other host, name its country domain. Then:
  - **The app has an org** (`catalystInit.orgId` in `zcatalystai/buddy/setup.json`) -> pick
    the server that lists that org. Several do -> ask which (AskUserQuestion). None does ->
    this machine has no server for the app's account: the dev configures one for that
    account in the recorded `mcp.dataCentre`, as above.
  - **A new app** (no org yet) -> ask the dev which server to use (AskUserQuestion: each
    server with its data centre and org names, plus **configure another server**).

Say which server was picked in the summary line, "MCP: <server> (<data centre>)". Every
Catalyst MCP call in the session goes to it; `zcatalystai:setup` checks it sees the app's
project. If the `catalyst-by-zoho` plugin's bundled US server is connected but not picked,
suggest switching it off in `/mcp`.

## 3. Plugins current

Run `node <this skill's base directory>/plugin-freshness.mjs`. It compares the installed
commit of Buddy (`zcatalystai@buddy`) and its dependencies (`catalyst-by-zoho@catalyst-by-zoho`,
`hallmark@hallmark`) with their upstream `HEAD` and prints a status for each:

- `current` -> nothing to do.
- `behind` -> ask right before updating (AskUserQuestion), naming the plugin and its
  installed and upstream commits: **update now** (Buddy runs it), **I'll do it**, or
  **skip this session** (doctor asks again next session). The update is
  `claude plugin marketplace update <marketplace>`, then `claude plugin update <id>`; run
  the script again. Still behind -> upstream changed files without bumping its version:
  `claude plugin uninstall <id>`, then `claude plugin install <id>`.
- `unknown` -> upstream could not be reached (offline); report it and carry on.
- `missing` on `zcatalystai@buddy` -> Buddy is running from a local folder
  (`--plugin-dir`); skip it.

After an update the dev types `/reload-plugins`. If Buddy itself was updated, this session
still runs the old instructions: the dev restarts with `claude --agent buddy`.

## 4. Fix

- Everything passes -> one line, "Doctor: all green - MCP: <server> (<data centre>)", and
  move on.
- Otherwise show one table, `Check | Found | Fix`, then take the gaps one at a time. For
  each, ask who fixes it (AskUserQuestion): **Buddy runs it** - run the fix, then the check
  again - or **I'll do it** - give the exact command, wait, then run the check again.
  A command that prompts or opens a browser the dev always runs, as `! <command>`.
- Checks 1, 2 and 3 must pass before Buddy goes on. A plugin the dev chose to skip is fine.
  The rest: report, continue, and remind the dev at the step that needs them.

The fixes:

1. Node: https://nodejs.org or `nvm install 24`. pnpm: `npm i -g pnpm`.
2. `npm i -g zcatalyst-cli`.
3. Section 2.
4. Section 3.
5. `npx skills remove <name> -g` for each stale copy. They load next to the plugin's skills
   and can be months out of date.
6. `claude mcp add chrome-devtools --scope user -- npx chrome-devtools-mcp@latest`, then
   restart the session. Without it, verification checks the API with `curl` and asks the dev
   to look at the screen.
