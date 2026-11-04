---
name: connect
description: Catalyst Buddy's every-session check that this folder is bound to a Catalyst project (catalyst init done) and which connected MCP server reaches that project - binding it first if needed, and recording the server in a gitignored zcatalystai/buddy/connect.json. Works in any Catalyst codebase. Used by the Buddy agent after doctor; a dev can rerun it with /zcatalystai:connect.
---

# Connect

Runs every session in a folder with `catalyst.json`, after doctor. `.catalystrc` is the
proof that `catalyst init` ran. The MCP server that reaches the project is recorded in
`zcatalystai/buddy/connect.json`, so every skill uses the same server even after a long
session is summarised:

```json
{
  "projectId": "17627000001268015",
  "projectName": "TestProject",
  "orgId": "812470743",
  "mcpServer": "catalyst-us-solutions",
  "dataCentre": "US"
}
```

Server names differ from machine to machine, so the file is per machine: make sure the
app's `.gitignore` lists `zcatalystai/buddy/connect.json` (add the line if not).

## 1. catalyst init

Read `.catalystrc`. The active project (`actives.project` points at an `idx` in
`projects`) gives the project ID (`id`) and name; the `id` of its Development entry in
`env` is the org ID.

- **Present** -> go to section 2.
- **Missing** (a fresh clone, or a codebase never bound) -> bind it:
  1. `catalyst whoami`. Not logged in -> the dev runs `! catalyst login`.
  2. Orgs: `CatalystbyZoho_List_All_Organizations` on each connected Catalyst MCP server.
     Keep the orgs the CLI also reaches: `catalyst project:list --org <orgId> -ni` prints
     their projects; "is not valid" means the CLI is logged in to another account, and the
     error lists the CLI's own orgs. No org in common -> the dev logs the CLI in to an MCP
     server's account (`! catalyst logout`, then `! catalyst login` on the right data
     centre), or configures a server for the CLI's account (`zcatalystai:doctor` shows how).
  3. The dev picks the org and project (AskUserQuestion), or creates a new project in the
     Catalyst Console and comes back - MCP cannot create projects.
  4. Bind it, then copy each `.env.example` that has no `.env` beside it:

     ```bash
     catalyst init --org <orgId> --project <projectId> -ni
     ```

     `catalyst init` writes the gitignored `.catalystrc` and leaves `catalyst.json` alone. If
     it fails, show the output; the fallback is the dev running `! catalyst init`.

## 2. MCP server

**`connect.json` already exists** and its `projectId` is the project in `.catalystrc` ->
check only its `mcpServer` with the `Get_Project_By_Id` call below.
- It returns the project, and the dev did not run `/zcatalystai:connect` themselves to
  switch -> don't ask. Load the server's tools if deferred and tell the
  dev: "Connected (from connect.json): <projectName> (<projectId>) on <mcpServer>
  (<dataCentre>). Run /zcatalystai:connect to switch." Connect is done.
- It fails, or the file names another project -> say which ("connect.json points at
  <mcpServer>, which no longer reaches <projectName>"), then pick a server as below.

**No `connect.json`, or it no longer fits** -> pick a server:

The connected Catalyst MCP servers are the distinct `<server>` parts of the
`mcp__<server>__CatalystbyZoho_*` tools in this session, listed or deferred; a server that
needs authentication shows no tools and is not one of them.

On each of them, call `CatalystbyZoho_Get_Project_By_Id` with the
project ID as a string and the headers `Catalyst-org: <orgId>` and
`Environment: Development`. The project comes back -> that server reaches it;
`PERMISSION_NEEDED` -> it does not. Don't filter `List_All_Projects` by `ids` instead:
project IDs are larger than JSON numbers hold exactly, so the filter misses.

If every server says `PERMISSION_NEEDED`, the org ID from `.catalystrc` may be wrong: ask
each server again once per org it lists in `CatalystbyZoho_List_All_Organizations`, and use
the org that returns the project.

Then let the dev pick (AskUserQuestion), one option per connected server: its name, data
centre, and "sees <project name>" or "can't see this project". Mark a server that sees the
project "(Recommended)"; when exactly one does, put it first. If the dev picks one that
can't see the project, say MCP calls would then go to another account and ask again. More
than four servers -> show them as a table and ask for the name in plain text.

- **No server sees the project** -> say so before asking: this machine has no MCP server for
  the project's account. The dev configures one for that account (`zcatalystai:doctor`
  shows how), or binds the folder to a project a connected server reaches (`catalyst init`
  again).
- **The dev ran `/zcatalystai:connect` themselves** -> always show this list, even when
  `connect.json` is still valid, so they can switch.

The data centre is the host of the org's `url` from `CatalystbyZoho_List_All_Organizations`:
`catalyst.zoho.com` US, `catalyst.zoho.in` IN, `catalyst.zoho.eu` EU, `catalyst.zoho.com.au`
AU; any other host, name its country domain. If the `catalyst-by-zoho` plugin's bundled US
server is connected but not the one used, suggest switching it off in `/mcp`.

## 3. Record and report

Write `connect.json` when anything in it changed. If the server's `CatalystbyZoho_*` tools
are deferred in this session, load them now (ToolSearch, `+<mcpServer> CatalystbyZoho`).

One line: "Connected: <project name> (<projectId>) on <mcpServer> (<data centre>)". Every
Catalyst MCP call in this session goes to the `mcpServer` in `connect.json`.
