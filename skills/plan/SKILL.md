---
name: plan
description: Catalyst Buddy's code plan, after infra - turn an entire app or a feature into ordered stages (the routes, types, data access and screens of each, and the check that proves it), agreed with the dev in one pass and written to zcatalystai/buddy/plan.json (kept out of git) for build to run one by one; for a fix, the code change. Never adds a Catalyst resource. Used by goal and fix.
---

# Plan

Decides the code: the routes, types, data access, web services, pages and components to
write, against the Catalyst resources `zcatalystai:infra` decided. Plan never adds a
Catalyst resource; a plan that needs one the design doesn't have -> back to
`zcatalystai:infra`. Nothing changes on disk until the dev approves the plan.

The plan file is `zcatalystai/buddy/plan.json`, kept out of git by connect: it is the working state of one
checkout, and lives only until `zcatalystai:build` has built and verified every stage.

## 1. Read

- The plan file, for an entire app or a feature. It exists -> goal already asked to
  continue it and the dev said no, so the new plan replaces it. A fix never touches it.
- `.claude/infra.md`, `.claude/CLAUDE.md`, every `.claude/rules/*.md`, and `design.md` if
  it exists. No `infra.md` -> the code is the design; read it.
- The code the plan touches. In a starter-kit app:
  `packages/node-utils/src/catalyst/resources.ts`, the repositories, `apps/api/src/routes/`,
  `apps/web/src/app/` and `apps/web/src/services/`. Otherwise: `catalyst.json` and the
  folders it points at.

## 2. Stages

A stage is the smallest thing a user can do end to end ("check in a pass"), not a layer
("add the tables"). Each stage is one commit the dev can review in one sitting:

- one concern - no unrelated change rides along;
- under ~300 changed lines and ~10 files; bigger -> split it into smaller stages that each
  still work end to end ("list passes" before "filter passes");
- a rename, move or reformat it needs is its own stage, with no behaviour change;
- it builds, passes its checks and can be verified on its own.

Order the stages so each builds only on the ones before it.

- **Entire app** - the first stage is the base: the layout, the home page and the sign-in
  screen, their look hallmark's at build time. Too big for the size limit -> two base
  stages: the tokens and layout, then the pages. When the base is already built
  (`design.md` exists - build locks it in the last base stage), there is no base stage. Then one
  stage per thing the `## Domain` in `infra.md` says users do, starting with what they do
  first. Leave out what the code already does - read its routes and pages first - and say
  in one line which you left out. Every resource in `infra.md` is used by at least one
  stage or by code that exists; one that isn't -> raise it with the dev.
- **Feature** - as many stages as it takes to keep each one that small. Every resource
  infra added for it is used by a stage; one that isn't -> raise it with the dev.

For each stage name:

| Part | What to name |
|---|---|
| Routes | method and path, request, response, Catalyst scopes |
| Data | the domain types in `packages/types`, and the `resources.ts` handle and repository for each table it touches, with their methods |
| Screens | the `src/services/` functions and `ApiPath` entries, the pages and components, and the empty, loading and error state of every list or form |
| Catalyst | a `waits for` resource in `infra.md` that this stage's code unblocks, if any |
| Check | the user action that proves it works, and what it leaves in Catalyst |

In a codebase that is not a starter-kit app (no `packages/node-utils`), name the parts in
its own layout and patterns. When a stage has a real code choice - where the screen lives,
one page or two, done in the request or in the background - offer two or three ways with
pros and cons and one recommended.

## 3. Write the plan

Show every stage and wait for one yes; change it and show it again if asked. Then write the
plan file:

```json
{
  "stages": [
    {
      "name": "Let staff check in a visitor pass",
      "status": "todo",
      "routes": ["POST /api/v1/passes - { visitorName, hostId } -> Pass; scope: user"],
      "data": ["Pass type", "VisitorPass handle", "PassRepository.create"],
      "screens": ["check-in form on /check-in, with empty, loading and error states"],
      "check": "submit the form -> a row in VisitorPass"
    }
  ]
}
```

- `catalyst` - only on a stage that unblocks a `waits for` resource: that resource's name.
- `base` - `true` on a base stage only (omit it otherwise); build runs its base steps for it.
- `name` - also the stage's commit subject, in the imperative: what a user can now do, or for
  a rename or move stage, what it renames or moves.
- `status` - `todo` or `done`; build sets it, so a stopped build resumes at the first `todo`.
- `mode` - not written by plan; build asks the dev and adds `auto`, `learn` or `review`
  before stage 1, so a resumed build keeps it.

Hand over to `zcatalystai:build`.

## 4. Fix

No plan file. From the cause `zcatalystai:fix` found and the Catalyst side
`zcatalystai:infra` agreed: the files the fix changes and what changes in each, and the
reproduction that proves it. Two or three ways when there is a real choice. Wait for a yes,
then hand back to `zcatalystai:fix`.
