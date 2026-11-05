---
name: goal
description: Catalyst Buddy's question after doctor and connect, and again after every finished task - what are we doing in this folder - build the entire app, add a feature, fix a problem, or understand the app - and route to the skill for it. Used by the Buddy agent.
---

# Goal

The dev decides what this session is for. Connect has already bound the folder to a
Catalyst project, so it has `.catalystrc`. Look at the folder first, so
one option can be marked "(Recommended)" - but never pick for the dev, except in a folder
with no app code yet.

## 1. Read the folder

| Folder | Ask? | Recommended |
|---|---|---|
| No app code yet - nothing but `.git`, `.catalystrc`, `zcatalystai/` and a `catalyst.json` that lists no functions, AppSails or client (a Catalyst CLI project with `functions/` or `client/` and no root `package.json` is app code) | no - only a new app makes sense; say so in one line | Entire app |
| Has `zcatalystai/buddy/setup.json` with a step not `done`, or not committed yet | yes | Entire app ("continue setting up the app") |
| Any other folder | yes | A feature |

## 2. Ask

In this order:

1. No git repo or no `origin` (the dev declined them in connect) -> nothing can change
   code. A folder with no app code yet -> say Buddy needs git to start an app, and stop.
   Otherwise only Understand the app is open; say so in one line and route to it.
2. `zcatalystai/buddy/plan.json` exists -> ask (AskUserQuestion) "Continue the plan: <next
   `todo` stage, or the final check when every stage is `done`>?". Yes ->
   `zcatalystai:build`, which resumes there; the route ends with it. No -> go on.
3. The folder table says don't ask -> route to its goal. Otherwise one AskUserQuestion,
   "What are we doing?":
   - **Entire app** - design and build the whole app.
   - **A feature** - add something a user can do.
   - **A fix** - something is broken.
   - **Understand the app** - a tour and answers; nothing changes.

## 3. Route

| Goal | Run |
|---|---|
| Entire app | See below. |
| A feature | `zcatalystai:infra`, then `zcatalystai:plan`, then `zcatalystai:build`. A request that doesn't fit the app's `## Domain` in `.claude/infra.md` (a new kind of user, a different problem, the other kit) -> say so and offer Entire app instead. |
| A fix | `zcatalystai:fix` (once it knows the cause it runs `zcatalystai:infra` and `zcatalystai:plan` when the fix needs them) |
| Understand the app | Start the `zcatalystai:explain` agent and show the dev its tour. Send each question the dev asks to that same agent (SendMessage) and show its answer. A change request -> offer the feature or fix goal. The route ends when the dev has no more questions. |

**Entire app** - progress is read from files only, never from git history:
- No app code yet, or `setup.json` with a step not `done` or not committed yet ->
  `zcatalystai:setup` (it resumes where it stopped), then `zcatalystai:infra`, `zcatalystai:plan` and
  `zcatalystai:build`, which runs every stage from the base on.
- `setup.json` all `done`, no `.claude/infra.md` -> `zcatalystai:infra`, then
  `zcatalystai:plan` and `zcatalystai:build`.
- `setup.json` all `done` and `.claude/infra.md` present -> ask (AskUserQuestion):
  **build from the current design** (`zcatalystai:infra` section 5 first - it creates only
  the resources that are missing, so an interrupted infra finishes - then `zcatalystai:plan`
  and `zcatalystai:build`) or
  **rewrite** (`zcatalystai:infra` again - a new design on top of the code and resources
  that exist - then `zcatalystai:plan` and `zcatalystai:build`).
- A codebase Buddy did not set up (app code, no `setup.json`) -> setup would copy the kit
  over its code. Say so, and offer to start the app in a new, empty folder instead.

When the route finishes, ask "What are we doing?" again.
