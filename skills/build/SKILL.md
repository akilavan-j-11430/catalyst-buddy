---
name: build
description: Catalyst Buddy's build step - build what the dev approved in infra, in any Catalyst codebase - the base of a new app (env values, hallmark UI, verify, first commit) or one feature (code to the repo's rules, hallmark screens, verify), against the Catalyst resources infra created - and see it running. Used by goal after infra.
---

# Build

Builds what the dev approved in `zcatalystai:infra`, one pass at a time:

- **A new app** - git has no commit yet, or the dev chose to rewrite the app: the base app
  from the brief. Title, description and kit are in `zcatalystai/buddy/setup.json`.
- **A feature** - something a user can do end to end ("check in a pass", "see today's
  visits"), not a layer ("add the tables").

No approved brief or plan yet -> run `zcatalystai:infra` first. Infra has already
created the Catalyst resources; build writes the code that uses them.

## 1. Know where you are

- Read `.claude/CLAUDE.md` (the `## Domain`, `## Architecture` and `## Look and feel`
  sections are the brief, when Buddy built the app), every `.claude/rules/*.md`, and
  `design.md` if it exists. No brief -> the code is the brief; read it.
- `git status --short` and `git log --oneline -5`. If there is uncommitted work you did not
  make, ask before touching those files.
- Skim what exists. In a starter-kit app: `packages/node-utils/src/catalyst/resources.ts`,
  the repositories, `apps/api/src/routes/`, `apps/web/src/app/` and
  `apps/web/src/services/`. Otherwise: `catalyst.json` and the folders it points at.

## 2. Implement

### New app

No domain code yet - no repository classes or `resources.ts` entries; they come with the
first feature that uses a resource. Walk the dev through the env values the README's "First run" section
lists; values that are secrets, the dev types in themselves.

zoho-token kit: walk the dev through registering a **Server-based client** at the Zoho API
Console for their data centre, with the Authorized Redirect URI
`<ZOHO_TOKEN_CALLBACK_ORIGIN>/api/v1/zoho-token/callback` (locally, the origin
`catalyst serve` prints, usually `http://localhost:3001`). The dev fills
`ZOHO_TOKEN_CLIENT_ID`, `ZOHO_TOKEN_CLIENT_SECRET`, `ZOHO_TOKEN_SCOPES`,
`ZOHO_TOKEN_ACCOUNTS_URL`, `ZOHO_TOKEN_CALLBACK_ORIGIN` and `WEB_APP_ORIGIN` in
`apps/api/.env`. Agree the scopes from the brief (least privilege).

### Feature

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

## 3. Screens

### New app

Invoke `hallmark:hallmark` on `apps/web` with the brief's "Look and feel" answers, and these
constraints from the kit, which are not negotiable:

- Fonts and colours exist only as tokens in `apps/web/src/app/globals.css` (and the font
  loading in `apps/web/src/app/layout.tsx`). Never set a font family or a raw colour on a
  component - `.claude/rules/typography.md`.
- `apps/web/src/components/ui/` is vendored shadcn. Never hand-edit it; restyle it through
  the tokens. Add a shadcn component with the shadcn CLI, not by hand.
- `apps/web/public/catalyst-signin.css` styles the cross-origin Catalyst sign-in iframe.
  Bring it in line with the new typeface and colours by hand, as `typography.md` explains.
- Data access in pages goes through `src/services/` and react-query -
  `.claude/rules/web-data-access.md`.
- Scope: the layout, the home page and the sign-in screen. Domain screens come feature by
  feature.

Let hallmark write its `design.md` at the repo root so later screens reuse the same system.

### Feature

Every new or changed screen goes through `hallmark:hallmark` in redesign or component mode,
against the existing tokens in `globals.css` and the repo's `design.md`. Keep the kit's UI
rules: no font family or raw colour on a component, no hand edits in `components/ui/`, and
an empty, loading and error state for every list or form.

## 4. Verify

```bash
pnpm build && pnpm typecheck && pnpm lint      # a new app: pnpm install first
```

Every step must pass. On a failure, show the output, fix the cause, and rerun from that step.
New app: run `pnpm dev` in the background, open the `proxy:` URL it prints with the
chrome-devtools MCP (if available), take a screenshot of the home page, check
`<url>/api/v1/ping` returns `pong`, and stop the dev server.

Feature: run `pnpm dev` in the background, open the `proxy:` URL with the chrome-devtools MCP
(if available), and walk the feature as a user would: do the action, check the screen, check
the row landed (`CatalystbyZoho_Get_Rows` or a ZCQL query through MCP). Take a screenshot of
the main screen. Stop the dev server when done. If anything fails, fix the cause and verify
again - never report a feature as done that you have not seen work.

## 5. Wrap up

### New app

1. Ask where the code goes: the URL of an existing empty repo; create one (GitHub with
   `gh`, or zrepository with `zr`) - ask once more right before running
   `gh repo create <owner>/<repo-name> --private` or `zr repo create`; or none for now. Add
   it as `origin`.
2. Show `git status --short`, then ask. On a yes:

   ```bash
   git add -A
   git commit -m "Start <title> from <kit>"
   ```

   Push only if the dev asks.
3. Tell the dev, in a short list: `pnpm dev`, then open the `proxy:` URL it prints (usually
   `http://localhost:3001`, not :3000 or :4000); `claude --agent buddy` from this folder to
   keep building; and anything still open (Console steps, env values, the remote).

### Feature

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
