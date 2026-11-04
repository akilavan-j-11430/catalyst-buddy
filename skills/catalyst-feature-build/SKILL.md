---
name: catalyst-feature-build
description: Catalyst Buddy's build loop - in any Catalyst codebase, take one feature from idea to verified code - plan it, create its Catalyst resources over MCP, implement it to the repo's rules, design its screens with hallmark, and verify it running. Used by the Buddy agent when the dev's goal is a feature.
---

# Build one feature

One feature per pass. A feature is something a user can do end to end ("check in a pass",
"see today's visits"), not a layer ("add the tables"). If the dev asks for several, agree
the order and do them one at a time.

## 1. Know where you are

- Read `.claude/CLAUDE.md` (the `## Domain`, `## Architecture` and `## Look and feel`
  sections are the brief, when Buddy built the app), every `.claude/rules/*.md`, and
  `design.md` if it exists. No brief -> the code is the brief; read it.
- `git status --short` and `git log --oneline -5`. If there is uncommitted work you did not
  make, ask before touching those files.
- Skim what exists. In a starter-kit app: `packages/node-utils/src/catalyst/resources.ts`,
  the repositories, `apps/api/src/routes/`, `apps/web/src/app/` and
  `apps/web/src/services/`. Otherwise: `catalyst.json` and the folders it points at.

## 2. Plan

Clarify the feature until you can name every entity, field and status value - the kit says
a wrong schema is expensive to unwind, so ask rather than guess. Then show a short plan:

- **Data** - new tables or columns (name, type, who can read/write).
- **API** - routes (method + path from `ApiPath`), what each returns.
- **Web** - screens and the components on them.
- **Catalyst services** - anything beyond what the project already uses. Load each service's
  skill (`catalyst-by-zoho:<service>`) and check the plan against it before you show it.
- **Deploy-surface changes** - a new AppSail, function, Catalyst service or runtime
  dependency. Call these out on their own line; the kit requires the dev's yes.
- **How we'll know it works** - the check you will run at the end.

Wait for a yes. Change the plan if asked, and show it again.

## 3. Catalyst resources

Create the agreed tables, columns, cache segments or buckets over MCP, in the
**Development** environment only, after showing exactly what you will create. Read them
back and confirm. Anything MCP cannot do, give as exact Console steps and wait.

## 4. Implement

In a codebase that is not a starter-kit app (no `packages/node-utils`), follow its own
`.claude/CLAUDE.md`, rules and existing patterns, and skip the kit list below.

In a starter-kit app, follow the kit's `.claude/CLAUDE.md` "Adding to the repo" checklist
and its rules. The ones that matter most:

- Every `@zcatalyst/*` call goes through `packages/node-utils/src/catalyst/`; each table gets
  a handle in `resources.ts`, a domain type in `packages/types`, and a repository that is the
  only importer of the handle (`catalyst-sdk.md`, `vendor-boundaries.md`).
- Routes copy `apps/api/src/routes/ping.ts`, mount in `api-router.ts`, and name their
  Catalyst scopes with `initCatalystScopes` from `apps/api/src/middleware.ts`.
- Outbound HTTP through `HttpClient` (`outbound-http.md`); env keys through `defineEnv`
  (`environment.md`); vendor keys converted to camelCase at the edge
  (`readable-code.md`).
- Web data through `src/services/` + react-query, forms through react-hook-form, paths from
  `ApiPath` (`web-data-access.md`).
- For the zoho-token kit, Zoho API calls follow `zoho-token.md`: one `ZohoConnection`, a grant
  per execution, the token fetched per request.

Before a ZCQL query, a Data Store write, or an auth check, load
`catalyst-by-zoho:catalyst-datastore` or `catalyst-by-zoho:catalyst-authentication` - both
have behaviour that fails silently when guessed (result wrapping, booleans stored as
strings, ZAID differing between environments).

## 5. Screens

Every new or changed screen goes through `hallmark:hallmark` in redesign or component mode,
against the existing tokens in `globals.css` and the repo's `design.md`. Keep the kit's UI
rules: no font family or raw colour on a component, no hand edits in `components/ui/`, and
an empty, loading and error state for every list or form.

## 6. Verify

```bash
pnpm build && pnpm typecheck && pnpm lint
```

Then run `pnpm dev` in the background, open the `proxy:` URL with the chrome-devtools MCP
(if available), and walk the feature as a user would: do the action, check the screen, check
the row landed (`CatalystbyZoho_Get_Rows` or a ZCQL query through MCP). Take a screenshot of
the main screen. Stop the dev server when done. If anything fails, fix the cause and verify
again - never report a feature as done that you have not seen work.

## 7. Wrap up

- If the data model or architecture changed, update the brief sections in
  `.claude/CLAUDE.md` so the next session starts from the truth.
- Show `git status --short` and a one-line summary, then offer a commit with a message that
  says what a user can now do. Commit only on a yes; push only if asked.
- Suggest the next feature in one line.

## Deploying

Only when the dev asks. Load `catalyst-by-zoho:catalyst-basics` and
`catalyst-by-zoho:catalyst-authentication` first. Deploy with `pnpm run deploy` (never bare
`pnpm deploy`, which is a pnpm built-in). Before anything reaches Production, list what
differs there - the ZAID, tables that must be migrated, env values to set in the Console,
authorized domains and redirect URLs - and get an explicit yes.
