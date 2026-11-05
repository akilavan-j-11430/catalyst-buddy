---
name: connect
description: Catalyst Buddy's every-session check that the folder is bound to a Catalyst project, which MCP server reaches it (zcatalystai/buddy/connect.json), and that it is its own git repo with an origin. Rerun with /zcatalystai:connect.
---

# Connect

Runs every session, after doctor, in any folder - a new empty one, a fresh clone, or a
codebase Buddy did not set up. `.catalystrc` is the proof that `catalyst init` ran; init
writes `catalyst.json` and feature folders only when the dev picks features. The MCP server that reaches the project is recorded in
`zcatalystai/buddy/connect.json`, so every skill uses the same server even after a long
session is summarised:

```json
{
  "projectId": "<project id>",
  "projectName": "<project name>",
  "orgId": "<org id>",
  "mcpServer": "<mcp server name>",
  "dataCentre": "<US, IN, EU, AU, ...>"
}
```

Server names differ from machine to machine, so the file is per machine; section 3 keeps
it, and plan's working file `zcatalystai/buddy/plan.json`, out of git.

## 1. catalyst init

Read `.catalystrc`. The active project (`actives.project` points at an `idx` in
`projects`) gives the project ID (`id`) and name; the `id` of its Development entry in
`env` is the org ID.

- **Present** -> go on to the `.env` copy below.
- **Missing** (a new folder, a fresh clone, or a codebase never bound) -> the dev runs
  `catalyst init`; it is interactive, so Buddy starts nothing itself:
  1. `catalyst whoami`. Not logged in -> the dev runs `! catalyst login`.
  2. Say what init will ask - the org, the project (create it in the Catalyst Console first
     if it doesn't exist; MCP cannot create projects), and which features to set up. In a
     new folder for a starter-kit app, pick no features: the kit brings its own.
  3. The dev runs `catalyst init` in their own terminal, in this folder - its arrow-key
     prompts need a real terminal - answers them, and says "done".
  4. Read `.catalystrc` again. Still missing -> show what happened and ask.

Then, either way, copy each `.env.example` that has no `.env` beside it, and tell the dev which files
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
`Environment: Development`. The project comes back -> that server reaches it; any error
(`PERMISSION_NEEDED` or another) -> it does not; keep the error to show. Don't filter `List_All_Projects` by `ids` instead:
project IDs are larger than JSON numbers hold exactly, so the filter misses.

If no server returns the project, the org ID from `.catalystrc` may be wrong: ask
each server again once per org it lists in `CatalystbyZoho_List_All_Organizations`, and use
the org that returns the project.

Exactly one server is connected and it sees the project -> don't ask; use it and say so in
the report. Otherwise let the dev pick (AskUserQuestion), one option per connected server: its name, data
centre, and "sees <project name>" or "can't see this project". Mark a server that sees the
project "(Recommended)"; when exactly one does, put it first. If the dev picks one that
can't see the project, say MCP calls would then go to another account and ask again. More
than four servers -> show them as a table and ask for the name in plain text.

- **No server sees the project** -> say so before asking: this machine has no MCP server for
  the project's account. The dev creates one for that account at
  https://mcp.zoho.com, adds it with
  `claude mcp add --transport http --scope user <name> <server-url>` and restarts the
  session, or binds the folder to a project a connected server reaches (`catalyst init`
  again).
- **The dev ran `/zcatalystai:connect` themselves** -> always show this list, even when
  `connect.json` is still valid, so they can switch.

The data centre is the host of the org's `url` from `CatalystbyZoho_List_All_Organizations`:
`catalyst.zoho.com` US, `catalyst.zoho.in` IN, `catalyst.zoho.eu` EU, `catalyst.zoho.com.au`
AU; any other host, name its country domain. If the `catalyst-by-zoho` plugin's bundled US
server is connected but not the one used, suggest switching it off in `/mcp`.

## 3. Git

Mandatory for any goal that changes code: every change Buddy makes is a commit the dev
reviews or rolls back, and the remote keeps it safe. Nothing about git goes in
`connect.json` - git itself is the record.

1. **Repo.** `git rev-parse --show-toplevel` must print this folder. It prints a parent
   folder (the app sits inside another repo, such as a git-managed home or workspace) -> say
   so: Buddy would commit and push to that parent; the dev moves the app out, or Buddy
   runs `git init -b main` here on their yes. Not a repo -> ask, then `git init -b main`.
2. **Keep Buddy's state out.** Every session, before anything is staged: make sure
   `.git/info/exclude` lists `zcatalystai/buddy/connect.json` and
   `zcatalystai/buddy/plan.json` - add the lines if not. That file belongs to this clone, so
   it changes nothing the dev commits and survives setup's kit copy.
3. **Baseline.** Just ran `git init` in a folder with code already in it -> offer a
   baseline commit of what is there, so later diffs show only Buddy's changes; first make
   sure `.gitignore` keeps out `node_modules`, `.env` files and build output, and show
   `git status --short`.
4. **Remote.** `git remote get-url origin`. Missing -> ask (AskUserQuestion) where the
   code goes: the URL of an existing empty repo; a new repo on GitHub (`gh`); or a new repo
   on zrepository (`zr`). For a new one, check `gh auth status` or `zr auth status` first,
   name it after the folder, and ask once more right before running
   `gh repo create <owner>/<repo-name> --private` or `zr repo create <repo-name> --private` -
   `zr` makes a public repo unless told otherwise. Then `git remote add origin <url>`.
   Never push here.
5. **Declined.** The dev says no to either -> say in one line that Buddy needs git and a
   remote to change code, so this session can only explain the app.

## 4. Record and report

Write `connect.json` when anything in it changed. If the server's `CatalystbyZoho_*` tools
are deferred in this session, load them now (ToolSearch, `+<mcpServer> CatalystbyZoho`).

One line: "Connected: <project name> (<projectId>) on <mcpServer> (<data centre>); git
<origin url>". Every
Catalyst MCP call in this session goes to the `mcpServer` in `connect.json`.
