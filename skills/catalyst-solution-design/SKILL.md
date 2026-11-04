---
name: catalyst-solution-design
description: Catalyst Buddy's discovery step - interview a dev about the app they want, choose the starter kit, propose two or three Catalyst solution options, suggest names, and produce a confirmed solution brief. Used by the Buddy agent before scaffolding.
---

# Solution design

Turn "I want to build X" into a confirmed **solution brief**. Setup has already cloned the
kit and bound the Catalyst project; nothing else changes on disk or in Catalyst in this step.

## 1. Interview

One question at a time. Use AskUserQuestion when the answer is one of a few known options;
otherwise ask in plain text. Keep each question short and give an example answer. If an
answer is vague, ask one follow-up, not three.

1. **The problem** - what it solves, who has the problem, and the first two or three things a
   user does in the app.
2. **Users and sign-in** - who signs in (staff, customers, the public), roughly how many, and
   whether they need Google / Microsoft / other social login or company SSO.
3. **Zoho data** (zoho-token kit only) - which Zoho apps it reads or writes as the
   signed-in user, and what. This sets the OAuth scopes.
4. **Data** - the main things it stores, how many records over a year, and whether they are
   related (orders -> line items) or loose documents.
5. **Files** - uploads or downloads (images, PDFs, CSVs), and how large.
6. **Work outside a request** - anything scheduled (nightly sync, reminders), anything slow
   (imports, reports), or anything that reacts to events from other apps.
7. **Smart features** - OCR, text or image analysis, predictions, PDF generation, scraping.
8. **Look and feel** (feeds hallmark):
   - audience and the one job the home screen does
   - tone - pick one: editorial, brutalist, soft, utilitarian, luxury, playful, technical, austere
   - brand colours, if any
   - one or two sites or apps they like the look of, and one they don't

## 2. The kit

Setup picked the kit (`clone.kit` in `zcatalystai/buddy/setup.json`). Both kits share one
shape: an Express 5 `api` AppSail, a Next.js 16 `web` app on Slate, a local-only `proxy`
AppSail, Catalyst Authentication, pnpm + Turborepo. The zoho-token kit adds a per-user Zoho
OAuth connection (a `ZohoConnection` table, Catalyst Cache, and `/api/v1/zoho-token/*`
routes).

## 3. Propose solution options

Give **two or three** options. The kit shape is fixed; the options differ in what they add on
top. Recommend one and say why.

Before you put a service in an option, load its skill and check what you claim against it -
fit, limits, data-centre availability, and cost:

| Need | Candidate services | Load |
|---|---|---|
| related records, joins, reporting | Data Store (ZCQL) | `catalyst-by-zoho:catalyst-datastore` |
| loose documents, flexible schema, key lookups | NoSQL | `catalyst-by-zoho:catalyst-nosql` |
| short-lived values, sessions, rate limits | Cache | `catalyst-by-zoho:catalyst-cache` |
| file storage, signed download links | Stratus | `catalyst-by-zoho:catalyst-stratus` |
| scheduled or background work | Cron / Job functions, Job Scheduling | `catalyst-by-zoho:catalyst-functions`, `catalyst-by-zoho:catalyst-job-scheduling` |
| reacting to events from Zoho or other apps | Signals, Event functions | `catalyst-by-zoho:catalyst-signals` |
| streaming data changes to clients | Data Streams | `catalyst-by-zoho:catalyst-datastreams` |
| OCR, text and image analysis | Zia | `catalyst-by-zoho:catalyst-zia` |
| predictions from tabular data | QuickML | `catalyst-by-zoho:catalyst-quickml` |
| PDFs, screenshots, headless browsing | SmartBrowz | `catalyst-by-zoho:catalyst-smartbrowz` |
| sign-in methods, roles | Authentication | `catalyst-by-zoho:catalyst-authentication` |
| what it will cost | - | `catalyst-by-zoho:catalyst-pricing` |

Present the options as one table:

| | Option A | Option B | Option C |
|---|---|---|---|
| Adds to the kit | | | |
| Data model (tables or collections, key fields) | | | |
| Background work | | | |
| Good at | | | |
| Costs you | (complexity, limits) | | |
| Free tier / cost note | | | |
| DC limits | | | |

Then **one** recommendation and a single sentence on why. Prefer the simplest option that
covers what the dev said they need now - not what they might need later.

## 4. Title and description

The repo name is the app's folder name. Suggest two or three display titles that fit it and
let the dev pick one or give their own.

Then propose a **one-sentence description** (it becomes the page description and the README
intro) and let the dev edit it.

## 5. Remote

One of: the URL of an existing empty repo; create one (GitHub with `gh`, or zrepository
with `zr`) after a separate yes; or none for now.

## 6. Solution brief

Write the brief out in full in the chat and ask for a yes. Change anything the dev asks and
show it again. Use exactly this shape - `catalyst-kit-scaffold` writes it into the new
project's `.claude/CLAUDE.md`:

```markdown
## Domain

<two to four sentences: the problem, who uses the app, what they do first>

## Architecture

- Kit: <basic | zoho-token> - <why, one line>
- Services beyond the kit: <list, or "none yet">
- Data model:
  - `<TableName>` - <purpose>; columns: `<COLUMN>` (<type>), ...
- Background work: <list, or "none yet">
- Chosen over: <the other options, one line each on why not>
- Catalyst: org `<orgId>`, project `<projectId>` (from `setup.json`)

## Look and feel

Audience: <...>. Tone: <...>. Brand colours: <... or "none">. Likes: <...>. Dislikes: <...>.
```

Plus, outside that block: title, description, remote.
