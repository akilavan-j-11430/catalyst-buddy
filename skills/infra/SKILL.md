---
name: infra
description: Catalyst Buddy's Catalyst design for an entire app, a feature or a fix - work out the request's Catalyst footprint (none, existing resources, or new), always offer two or three ways to cover it on Catalyst with their pros and cons and one recommended (for a new footprint each way designed in parallel by its own infra-way agent, no two alike), write the agreed design to .claude/infra.md (imported by .claude/CLAUDE.md), and create its Catalyst resources once the dev approves. The code - routes and screens - is zcatalystai:plan's. Used by goal and fix.
---

# Infra

Decides what the app keeps and runs on Catalyst, and nothing else: the services, the
resources and their settings, and the deploy surface. Routes, types, components and screens
are `zcatalystai:plan`'s.

Input: the goal and what it is about - setup's title and description for an entire app,
the dev's request for a feature, the reproduction and cause `zcatalystai:fix` found for a
fix. Nothing changes on disk or in Catalyst until the dev approves the design; then it is
written to `.claude/infra.md` (section 4), its resources are created (section 5), and the
design is committed (section 6).

## 1. Understand

Read what exists first: `.claude/infra.md` if there is one, `.claude/CLAUDE.md`,
`.claude/rules/*.md`, `catalyst.json`, and the project's resources on the `mcpServer` in
`zcatalystai/buddy/connect.json` (`List_*` tools).

- **Entire app** - interview the dev, one question at a time. Use AskUserQuestion when the
  answer is one of a few known options, give an example answer, and ask one follow-up when
  an answer is vague, not three:
  1. **Users and sign-in** - who signs in (staff, customers, the public), roughly how many,
     and whether they need a social login or company SSO.
  2. **Zoho data** (zoho-token kit only) - which Zoho apps it reads or writes as the
     signed-in user, and what. This sets the OAuth scopes.
  3. **Data** - the main things it stores, how many records over a year, and whether they
     are related or loose documents.
  4. **Files** - uploads or downloads, and how large.
  5. **Work outside a request** - anything scheduled, anything slow, anything that reacts to
     events from other apps.
  6. **Smart features** - text, image or document analysis, predictions, PDFs, scraping.
- **Feature** - clarify until you can name every entity, field and status value; a wrong
  schema is expensive to unwind, so ask rather than guess. Several features in one request
  -> design them together; `zcatalystai:plan` turns them into stages.
- **Fix** - take the reproduction and the cause from `fix`.

Then list the **needs**: one line for each thing the request asks of Catalyst - store,
serve, sign in, keep files, run later, analyse - with its size (users, records a year, file
size). The ways in section 3 are compared need by need.

## 2. Catalyst footprint

Decide it from the needs and what the project already has. Unsure -> ask the dev one
question ("Does this need to store anything new?").

| Footprint | Meaning | How deep the design goes |
|---|---|---|
| **None** | code only; Catalyst is not touched | no Catalyst skills, no MCP calls |
| **Existing** | uses resources the project already has | load the skill of each service it touches (`catalyst-by-zoho:<service>`) and read those resources with `List_*` / `Get_*` |
| **New** | needs new resources or a new service - always the case for an entire app | as Existing, plus for every candidate service check fit, limits, data-centre availability (`dataCentre` in `connect.json`) and cost against its skill and `catalyst-by-zoho:catalyst-pricing` |

Find the services that fit a need through `catalyst-by-zoho:catalyst-by-zoho`, which routes
to the rest. Tell the dev the footprint in one line, e.g. "Catalyst: none - code only" or
"Catalyst: new - <service> <resource>". None -> nothing more to decide here; hand back as
section 6's last line says.

## 3. Ways to cover it

Two or three ways, in one table, with one marked recommended - one way only when no need has
a second service that fits, and then say why: the simplest way that
covers what the dev needs now, not what they might need later. The ways differ in which
services and resources cover the needs, or for an existing footprint in how the existing
resources are used. Two ways that cover every need with the same service and resource kind
are one way. For an entire app the kit's shape (its `.claude/CLAUDE.md`) is fixed; the ways
differ in what they add on top.

An existing footprint -> design the ways yourself. A new footprint -> each way is designed
by its own agent, so each brings its own idea:

1. **Anchors.** Take the need with the most services that fit it (per the
   `catalyst-by-zoho` skills). Give each way a different anchor - the service and resource
   kind it must use for that need - with way A's anchor the simplest fit. No need has two
   fits -> one way; tell the dev why there is no second.
2. **Fan out.** Start one `zcatalystai:infra-way` agent per anchor, all in one message so
   they run in parallel. Give each: the needs, the footprint, the existing resources, the
   kit, the whole `connect.json` (server, data centre, org and project), its own anchor,
   and the other ways' anchors, which it must not use for that need.
3. **Check the anchor.** Each agent's first line is the anchor it kept. Distinct anchors make
   distinct ways; an agent that dropped its anchor -> start it once more, then drop that way
   if it drops it again.
4. **Merge.** Put the ways into the table below, pick the recommended one and say why in
   one line. Ask the dev the agents' open questions before the table if an answer changes
   a way.

| | Way A | Way B | Way C |
|---|---|---|---|
| Catalyst resources (service, name, key settings) | | | |
| Deploy-surface changes (new AppSail, function, service, runtime dependency) | | | |
| Pros | | | |
| Cons (complexity, limits, price) | | | |
| How we'll know it works | | | |

The dev picks one (AskUserQuestion) or asks for changes; make the change yourself, keep the
way distinct from the others, and show the table again.

## 4. Write the design

Show it in full and wait for a yes; change it and show it again if asked.

- **Entire app** -> write `.claude/infra.md`; on a rewrite, replace it, still listing every
  resource the project has - infra never deletes one:

  ```markdown
  # Infra

  ## Domain

  <two to four sentences: the problem, who uses the app, what they do first>

  ## Catalyst

  - Kit: <kit> - <why, one line>
  - Resources:
    - <service> <resource> `<name>` - <purpose>; <key settings>
      - for a table, each column: `<name>` <type>, mandatory or unique if set
  - Background work: <list, or "none yet">
  - Chosen over: <the other ways, one line each on why not>
  ```

  Then attach it: put the line `@infra.md` in `.claude/CLAUDE.md` right after the intro
  paragraph (before `## Role`), once - after the first paragraph when there is no
  `## Role`, and in a new `.claude/CLAUDE.md` holding only that line when there is none. The import is relative to `.claude/CLAUDE.md`, so
  every session loads it. Later sessions trust it, so it must stay true as the app grows.
- **Feature or fix** with new resources -> add them to the `Resources` list in
  `.claude/infra.md`. No `infra.md` yet (a codebase Buddy did not set up) -> create it with
  the sections the code and this request can fill, and attach it as above. An existing
  footprint changes nothing here.

## 5. Create the resources

Once the dev approved the design, create its new Catalyst resources - nothing to do when
the footprint is existing. A new app on the zoho-token kit also needs the `ZohoConnection`
table (`REFERENCE_ID`, `REFRESH_TOKEN` encrypted, App User scope USER) and the default Cache
segment, as `.claude/rules/zoho-token.md` says. Everything goes to the **Development**
environment, on the `mcpServer` in `zcatalystai/buddy/connect.json`.

1. **What each one needs.** Find its tool on that server - a `CatalystbyZoho_Create_*`,
   `Configure_*`, `Enable_*` or `Update_*` tool - and read its parameters; don't guess them.
   Every parameter that points at another resource (an `*_id`, or a name that must already
   exist) is a dependency: look it up with the matching `List_*` or `Get_*` tool, use its ID
   if it exists, otherwise add it to the list and work out its own dependencies the same
   way. A dependency that is code - deployed from the repo, not created by a tool - is built
   and deployed first; mark it as a pause. No tool, or a setting the tool doesn't take ->
   exact Console or CLI steps from the service's skill.
2. **Show the order.** One numbered list, dependencies first: the resource, how it gets made
   (MCP tool, dev deploys, or Console/CLI steps) and its key settings, including Data Store
   permissions and scopes the way the kit's `vendor-boundaries.md` says. Wait for a yes.
3. **Create.** Go down the list. MCP tool -> call it, read it back, keep its ID for later
   lines. Deploy, Console or CLI step -> give the exact steps, wait for the dev, then read
   it back where a tool can. A call fails -> show the real error, fix the cause and call it
   again; the same failure twice -> stop and ask. Never call a `Delete_*`, `Truncate_*` or
   `Rollback_*` tool to clean up unless the dev asks for that exact action.
4. **Report.** One table, `Resource | ID | Made by | Status`, and make sure each resource is in
   the `Resources` list in `.claude/infra.md`.

## 6. Commit the design

`.claude/infra.md` or the `@infra.md` line in `.claude/CLAUDE.md` changed -> one commit for
the design by `${CLAUDE_PLUGIN_ROOT}/rules/commits.md`, before any code is written, so
build never meets it as uncommitted work. Then hand back to whoever ran infra: goal's route
goes on to `zcatalystai:plan`; `zcatalystai:fix` goes on with its own section 3.
