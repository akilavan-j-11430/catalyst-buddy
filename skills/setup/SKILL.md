---
name: setup
description: Catalyst Buddy's app setup, run after doctor inside the app's folder - clone the starter kit into it, bind it to a Catalyst project with catalyst init, and confirm the picked MCP server sees that project. Tracks its steps in zcatalystai/buddy/setup.json so an interrupted setup resumes. Used by the Buddy agent; a dev can rerun it with /zcatalystai:setup.
---

# Setup

Runs in the app's own folder: an empty folder when a new app starts, named for the app
(the folder name is the repo name). Doctor has already checked the machine and picked the
Catalyst MCP server.

## Progress

`zcatalystai/buddy/setup.json` records each step. Create it with every step `todo` when
setup starts in an empty folder; it is committed with the app.

```json
{
  "clone": { "status": "done", "kit": "catalyst-basic-mono-repo" },
  "catalystInit": { "status": "done", "orgId": "773793963", "projectId": "12130000066000719" },
  "mcp": { "status": "done", "dataCentre": "US" }
}
```

Run the steps in order, starting at the first one that is not `done`. Mark a step `done`
only after you have seen it work; if it fails, it stays `todo`.

## 1. clone

1. Ask (AskUserQuestion): will the app read or write Zoho CRM, Desk, Books, People or another
   Zoho app *as the signed-in user*? Yes -> the zoho-token kit
   (https://github.com/akilavan-j-11430/catalyst-zoho-token-mono-repo); no -> the basic kit
   (https://github.com/akilavan-j-11430/catalyst-basic-mono-repo). Say which and why in one
   line.
2. Clone it next to the app, then move it in - `git clone` refuses a non-empty folder:

   ```bash
   git clone --depth 1 <kitUrl> ../.<folder>-kit
   rm -rf ../.<folder>-kit/.git
   cp -R ../.<folder>-kit/. ./
   rm -rf ../.<folder>-kit
   git init -b main
   ```

The kit's `.git` is deleted before the copy, so the app starts with its own empty history.
Record `kit` (the kit's repo name).

## 2. catalystInit

1. `catalyst whoami`. Not logged in -> the dev runs `! catalyst login`.
2. Orgs: the picked MCP server's `CatalystbyZoho_List_All_Organizations`. Keep the ones the
   CLI also reaches: `catalyst project:list --org <orgId> -ni` prints its projects. "is not
   valid" means the CLI is logged in to another account; the error lists the CLI's own orgs.
   No org in common -> the dev logs the CLI in to the MCP server's account
   (`! catalyst logout`, then `! catalyst login` on the right data centre), or goes back to
   doctor to pick another server.
3. The dev picks the org and project (AskUserQuestion), or creates a new project in the
   Catalyst Console and comes back - MCP cannot create projects.
4. Bind and copy the env templates:

   ```bash
   catalyst init --org <orgId> --project <projectId> -ni
   cp .env.example .env && cp apps/api/.env.example apps/api/.env   # and any other apps/*/.env.example
   ```

   `catalyst init` writes the gitignored `.catalystrc` and leaves the kit's `catalyst.json`
   alone. If it fails, show the output; the fallback is the dev running `! catalyst init`.

Record `orgId` and `projectId`.

## 3. mcp

`CatalystbyZoho_List_All_Projects` on the server doctor picked must list `projectId`. If it
does not, the server is on another account: go back to doctor to pick another server, or log
the CLI in to the server's account and redo `catalystInit`. Record the server's
`dataCentre`. The server itself is not recorded - names differ per machine, so doctor picks
it each session by `orgId`.

## Later sessions

When every step is `done`, only check:
- `.catalystrc` exists - a fresh clone of the app does not have it (it is gitignored), so
  run `catalystInit` again with the recorded IDs, then copy the env templates if `.env` is
  missing.
- The server doctor picked lists `projectId`.

Then one line, "Setup: <project> on <server> (<data centre>)".
