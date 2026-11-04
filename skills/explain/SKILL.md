---
name: explain
description: Catalyst Buddy's read-only tour of any Catalyst codebase - what the app does, how it is built, the Catalyst resources it uses and how to run it - then answers the dev's questions with file references. Changes nothing. Used by the Buddy agent when the dev's goal is to understand the app.
---

# Explain the app

Read-only: nothing changes on disk or in Catalyst. Only `List_*` and `Get_*` MCP tools.

## 1. Read

- `.claude/CLAUDE.md` with its import `infra.md` (the domain and the Catalyst design, if
  Buddy built the app), `.claude/rules/*.md`, and `design.md` (the look) if it exists.
- `catalyst.json` (the deploy surface: functions, AppSails, the client), `.catalystrc` (the
  bound project) and `zcatalystai/buddy/setup.json` if it exists.
- The layout: the root `package.json` and workspaces, then each app and package.

## 2. Show

One short overview, in this order:

1. **What it does** - the problem, who uses it, what they do first.
2. **How it is built** - each app, function and package with one line on its job, and the
   path a request takes from the browser to Catalyst and back.
3. **Catalyst resources** - what the project has, read with `List_*` and `Get_*` tools on the
   picked MCP server, and which code uses each one.
4. **How to run it** - the commands and the URL to open, from its README and scripts.

## 3. Answer

Take the dev's questions one at a time. Point at `file:line` for every claim about the
code. Explain Catalyst behaviour from the matching `catalyst-by-zoho:<service>` skill, not
from memory. If the dev asks for a change, say it needs the feature or fix goal and offer
to switch.
