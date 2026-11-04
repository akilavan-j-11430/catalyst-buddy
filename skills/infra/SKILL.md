---
name: infra
description: Catalyst Buddy's infra step for an entire app, a feature or a fix - work out the request's Catalyst footprint (none, existing resources, or new), size the design to it, always offer two or three ways to build it with their pros and cons and one recommended, write the agreed result - a brief for an app, a plan for a feature, an approach for a fix - and create its Catalyst resources once the dev approves. Used by goal and fix.
---

# Infra

Input: the goal and what it is about - setup's title and description for an entire app,
the dev's request for a feature, the reproduction and cause `zcatalystai:fix` found for a
fix. Nothing changes on disk or in Catalyst until the dev approves the result; then the
brief of an entire app is written into `.claude/CLAUDE.md` and the Catalyst resources are
created (section 5).

## 1. Understand

Read what exists first: `.claude/CLAUDE.md` (the brief, if there is one), `.claude/rules/*.md`,
`catalyst.json`, and the project's resources on the `mcpServer` in
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
  7. **Look and feel** (feeds hallmark) - the audience and the one job the home screen
     does; one tone (editorial, brutalist, soft, utilitarian, luxury, playful, technical,
     austere); brand colours, if any; one or two sites they like the look of, and one they
     don't.
- **Feature** - clarify until you can name every entity, field and status value; a wrong
  schema is expensive to unwind, so ask rather than guess. Several features in one request
  -> split them, agree the order, and design the first.
- **Fix** - take the reproduction and the cause from `fix`.

## 2. Catalyst footprint

Decide it from the request and what the project already has. Unsure -> ask the dev one
question ("Does this need to store anything new?").

| Footprint | Meaning | How deep the design goes |
|---|---|---|
| **None** | code only; Catalyst is not touched | no Catalyst skills, no MCP calls |
| **Existing** | uses resources the project already has | load the skill of each service it touches (`catalyst-by-zoho:<service>`) and read those resources with `List_*` / `Get_*` |
| **New** | needs new resources or a new service - always the case for an entire app | as Existing, plus for every candidate service check fit, limits, data-centre availability (`dataCentre` in `connect.json`) and cost against its skill and `catalyst-by-zoho:catalyst-pricing` |

Find the services that fit a need through `catalyst-by-zoho:catalyst-by-zoho`, which routes
to the rest. Tell the dev the footprint in one line, e.g. "Catalyst: none - code only" or
"Catalyst: new - <service> <resource>".

## 3. Ways to build it

Always two or three ways, in one table, with one marked recommended: the simplest way that
covers what the dev needs now, not what they might need later.

| | Way A | Way B | Way C |
|---|---|---|---|
| What changes in the code | | | |
| Catalyst resources (service, name, key settings, or "none") | | | |
| Deploy-surface changes (new AppSail, function, service, runtime dependency) | | | |
| Pros | | | |
| Cons (complexity, limits, price) | | | |
| How we'll know it works | | | |

The ways differ by footprint: with none, in where and how much code changes; with existing,
in how the existing resources are used; with new, in which services and resources. For an
entire app the kit's shape (its `.claude/CLAUDE.md`) is fixed; the ways differ in what they
add on top.

The dev picks one (AskUserQuestion) or asks for changes; show the table again after a
change.

## 4. Write the result

Show it in full and wait for a yes; change it and show it again if asked.

- **Entire app** -> the brief. Once approved, write its three sections into
  `.claude/CLAUDE.md` right after the intro paragraph (before `## Role`); on a rewrite,
  replace the old ones. Later sessions read them, so they must stay true as the app grows.
  `zcatalystai:build` builds the new app from it:

  ```markdown
  ## Domain

  <two to four sentences: the problem, who uses the app, what they do first>

  ## Architecture

  - Kit: <kit> - <why, one line>
  - Catalyst resources:
    - <service> <resource> `<name>` - <purpose>; <key settings>
  - Background work: <list, or "none yet">
  - Chosen over: <the other ways, one line each on why not>
  - Catalyst: org `<orgId>`, project `<projectId>` (from `.catalystrc`)

  ## Look and feel

  Audience: <...>. Tone: <...>. Brand colours: <... or "none">. Likes: <...>. Dislikes: <...>.
  ```

- **Feature** -> the plan: the Catalyst resources it needs (created in section 5), the API routes (method and
  path, what each returns), the screens and their components, any deploy-surface change on
  its own line (it needs the dev's yes), and the check that proves it works.
  `zcatalystai:build` builds it.
- **Fix** -> the chosen approach and the check that proves it. `zcatalystai:fix` applies it.

## 5. Create the resources

Once the dev approved the result, create its new Catalyst resources - nothing to do when the
footprint is none or existing. A new app on the zoho-token kit also needs the
`ZohoConnection` table (`REFERENCE_ID`, `REFRESH_TOKEN` encrypted, App User scope USER) and
the default Cache segment, as `.claude/rules/zoho-token.md` says. Everything goes to the
**Development** environment, on the `mcpServer` in `zcatalystai/buddy/connect.json`.

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
   the `Catalyst resources` list in `.claude/CLAUDE.md`. Then hand over: `zcatalystai:build`
   for an app or a feature, back to `zcatalystai:fix` for a fix.
