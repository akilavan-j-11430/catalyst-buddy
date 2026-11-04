---
name: connect
description: Catalyst Buddy's every-session check, in any folder, that it is bound to a Catalyst project (catalyst init done - the dev runs it if not), which connected MCP server reaches that project (recorded in a gitignored zcatalystai/buddy/connect.json), and that the folder is a git repo with an origin remote - both mandatory. Used by the Buddy agent after doctor; a dev can rerun it with /zcatalystai:connect.
---

# Connect

Runs every session, after doctor, in any folder - a new empty one, a fresh clone, or a
codebase Buddy did not set up. `.catalystrc` is the proof that `catalyst init` ran; init
writes `catalyst.json` and feature folders only when the dev picks features. The MCP server that reaches the project is recorded in
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
app's `.gitignore` lists `zcatalystai/buddy/connect.json` and `zcatalystai/buddy/plan.json`
(plan's working file, also per checkout) - add the lines if not.

## 1. catalyst init

Read `.catalystrc`. The active project (`actives.project` points at an `idx` in
`projects`) gives the project ID (`id`) and name; the `id` of its Development entry in
`env` is the org ID.

- **Present** -> go to section 2.
- **Missing** (a new folder, a fresh clone, or a codebase never bound) -> the dev runs
  `catalyst init`; it is interactive, so Buddy starts nothing itself:
  1. `catalyst whoami`. Not logged in -> the dev runs `! catalyst login`.
  2. Say what init will ask - the org, the project (create it in the Catalyst Console first
     if it doesn't exist; MCP cannot create projects), and which features to set up. In a
     new folder for a starter-kit app, pick no features: the kit brings its own.
  3. The dev runs `! catalyst init` and answers the prompts.
  4. Read `.catalystrc` again. Still missing -> show what happened and ask.

Then copy each `.env.example` that has no `.env` beside it, and tell the dev which files
need values. Values that are secrets, the dev types in themselves.

## 2. MCP server

**`connect.json` already exists** and its `projectId` is the project in `.catalystrc` ->
check only its `mcpServer` with the `Get_Project_By_Id` call below.
- It returns the project, and the dev did not run `/zcatalystai:connect` themselves to
  switch -> don't ask. Load the server's tools if deferred and tell the
  dev: "Connected (from connect.json): <projectName> (<projectId>) on <mcpServer>
  (<dataCentre>). Run /zcatalystai:connect to switch." Go to section 3.
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

## 3. Git

Mandatory for any goal that changes code: every change Buddy makes is a commit the dev
reviews or rolls back, and the remote keeps it safe. Nothing about git goes in `connect.json` - git itself is the record.

1. **Repo.** `git rev-parse --is-inside-work-tree`. Not a repo -> ask, then
   `git init -b main`. A folder with code already in it -> also offer a baseline commit of
   what is there, so later diffs show only Buddy's changes; first make sure `.gitignore`
   keeps out `node_modules`, `.env` files and build output, and show `git status --short`.
2. **Remote.** `git remote get-url origin`. Missing -> ask (AskUserQuestion) where the
   code goes: the URL of an existing empty repo; a new repo on GitHub (`gh`); or a new repo
   on zrepository (`zr`). For a new one, check `gh auth status` or `zr auth status` first,
   name it after the folder, and ask once more right before running
   `gh repo create <owner>/<repo-name> --private` or `zr repo create`. Then
   `git remote add origin <url>`. Never push here.
3. **Declined.** The dev says no to either -> say in one line that Buddy needs git and a
   remote to change code, so this session can only explain the app.

## 4. Record and report

Write `connect.json` when anything in it changed. If the server's `CatalystbyZoho_*` tools
are deferred in this session, load them now (ToolSearch, `+<mcpServer> CatalystbyZoho`).

One line: "Connected: <project name> (<projectId>) on <mcpServer> (<data centre>); git
<origin url>". Every
Catalyst MCP call in this session goes to the `mcpServer` in `connect.json`.
