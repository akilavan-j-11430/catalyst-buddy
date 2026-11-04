---
name: design
description: Catalyst Buddy's design step for an entire app, a feature or a fix - work out the request's Catalyst footprint (none, existing resources, or new), size the design to it, always offer two or three ways to build it with one recommended, and write the agreed result - a brief for an app, a plan for a feature, an approach for a fix. Used by goal and fix.
---

# Design

Input: the goal and what it is about - setup's title and description for an entire app,
the dev's request for a feature, the reproduction and cause `zcatalystai:fix` found for a
fix. Nothing changes on disk or in Catalyst in this step.

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
| Good at | | | |
| Costs (complexity, limits, price) | | | |
| How we'll know it works | | | |

The ways differ by footprint: with none, in where and how much code changes; with existing,
in how the existing resources are used; with new, in which services and resources. For an
entire app the kit's shape (its `.claude/CLAUDE.md`) is fixed; the ways differ in what they
add on top.

The dev picks one (AskUserQuestion) or asks for changes; show the table again after a
change.

## 4. Write the result

Show it in full and wait for a yes; change it and show it again if asked.

- **Entire app** -> the brief. `zcatalystai:catalyst-kit-scaffold` writes it into
  `.claude/CLAUDE.md`:

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

- **Feature** -> the plan: the Catalyst resources to create, the API routes (method and
  path, what each returns), the screens and their components, any deploy-surface change on
  its own line (it needs the dev's yes), and the check that proves it works.
  `zcatalystai:catalyst-feature-build` builds it.
- **Fix** -> the chosen approach and the check that proves it. `zcatalystai:fix` applies it.
