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
| No app code yet - only what `catalyst init` wrote (no `package.json`, no git commit, no `setup.json`) | no - only a new app makes sense; say so in one line | Entire app |
| Has `zcatalystai/buddy/setup.json`, with a step not `done` or no git commit yet | yes | Entire app ("continue setting up the app") |
| Has a plan file with a `todo` stage | yes | the plan's `goal` ("continue the plan: <next stage>") |
| Any other folder | yes | A feature |

The plan file is `${CLAUDE_PLUGIN_DATA}/<folder>/plan.json`, where `<folder>` is this
folder's absolute path with every character other than a letter, digit, `_` or `-`
replaced by `-`.

## 2. Ask

One AskUserQuestion, "What are we doing?":

- **Entire app** - design and build the whole app.
- **A feature** - add something a user can do.
- **A fix** - something is broken.
- **Understand the app** - a tour and answers; nothing changes.

## 3. Route

A plan file with a `todo` stage and the dev picked its goal -> `zcatalystai:build`, which
resumes at that stage. Otherwise:

| Goal | Run |
|---|---|
| Entire app | See below. |
| A feature | `zcatalystai:infra`, then `zcatalystai:plan`, then `zcatalystai:build`. A request that doesn't fit the app's `## Domain` in `.claude/infra.md` (a new kind of user, a different problem, the other kit) -> say so and offer Entire app instead. |
| A fix | `zcatalystai:fix` (it runs `zcatalystai:infra` and `zcatalystai:plan` once it knows the cause) |
| Understand the app | Start the `zcatalystai:explain` agent and show the dev its tour. Send each question the dev asks to that same agent (SendMessage) and show its answer. A change request -> offer the feature or fix goal. The route ends when the dev has no more questions. |

**Entire app:**
- No app code yet, or `setup.json` present -> `zcatalystai:setup` (it resumes at its first
  step not `done`), then:
  - no git commit yet -> `zcatalystai:infra` if there is no `.claude/infra.md` yet, then
    `zcatalystai:plan`, then `zcatalystai:build`, which runs every stage from the base on;
  - the app is already built -> the dev chose a rewrite: run `zcatalystai:infra` again
    (the new `infra.md` replaces the old), then `zcatalystai:plan` and `zcatalystai:build`.
- A codebase Buddy did not set up (app code, no `setup.json`) -> setup would copy the kit
  over its code. Say so, and offer to start the app in a new, empty folder instead.

When the route finishes, ask "What are we doing?" again.
