---
name: build
description: Catalyst Buddy's build step - ask the build mode (Fully auto, Learn & Review, Review only), then run the stages in plan.json one by one in any Catalyst codebase (the base of a new app - env values, hallmark UI - then each feature stage: code to the repo's rules, hallmark screens, verified in the browser), against the Catalyst resources infra created; after a complete verification of every stage, delete plan.json. Used by goal after plan.
---

# Build

Runs the plan `zcatalystai:plan` wrote, one stage at a time. The plan file is
`zcatalystai/buddy/plan.json`. No plan file
-> run `zcatalystai:plan` first. `zcatalystai:infra` has already created the Catalyst
resources; build writes the code that uses them.

## 1. Know where you are

- Read the plan file, `.claude/CLAUDE.md` (it imports `infra.md`), every
  `.claude/rules/*.md`, and `design.md` if it exists. The kit is the `Kit` line in
  `.claude/infra.md`.
- `git status --short` and `git log --oneline -5`. Uncommitted work -> show it and ask
  whether it is the first `todo` stage half-built in an earlier session (continue from it)
  or the dev's own work (leave it, and ask before touching those files).
- **Mode.** The plan file has no `mode` -> ask once (AskUserQuestion) and write it there:

  | Mode | `mode` | The dev's part |
  |---|---|---|
  | Fully auto | `auto` | none: Buddy builds, verifies and commits every stage, and stops only when blocked |
  | Learn & Review | `learn` | writes the parts of each stage that teach something, then reviews |
  | Review only | `review` | reviews each stage; the next starts only after it is approved and committed |

  The dev can switch at any time by saying so; update `mode`. In every mode, pushing,
  deploying and anything the dev must do themselves (secrets, Console steps, hallmark's
  questions) still wait for the dev.

## 2. Each stage

Take the first stage with `"status": "todo"`. If the last commit's subject is that stage's
`name`, the session stopped after committing it: set it `done` and take the next. Say which
stage, in one line, and go:

1. **Read** the files it names. If the code shows the stage cannot work as planned, stop,
   say why, and agree the change with the dev; update the stage in the plan file.
2. **Implement** - section 3 for a base stage (`"base": true`), section 4 for
   any other stage. Only what the stage names. When it grows past ~300 changed lines or ~10
   files, stop and agree with the dev how to split it in the plan file (`auto`: split it
   yourself and say so). `learn` -> section 2a.
3. **Screens** - section 5; skip it when the stage names no screens.
4. **Verify** - section 6, with the stage's `check`.
5. **Done** - one commit for the stage, by the commit rules in
   `${CLAUDE_PLUGIN_ROOT}/rules/commits.md`, with the stage's `name` as its subject;
   push only if asked. `auto` -> commit without asking. `learn` and `review` -> the diff
   stat and the body's "Read in order" and "Look closely at" are the dev's review guide;
   wait for approval, and on a change request make it, verify again and show it again.
   Then set its `status` to `done` in the plan file. After the last base stage, also
   section 7.

Then the next `todo` stage. The dev can stop at any point; the next session resumes here.
`auto` stops only when blocked: the same failure twice, or a stage that cannot work as
planned. No `todo` stage left -> section 8.

### 2a. Learn & Review

Before writing the stage, say who writes what. Buddy: the routine parts - wiring, types,
route mounts, `ApiPath` entries, service functions, component scaffolds. The dev: one or
two parts with a decision in them - a query, a business rule, a validation, a component's
state. For each dev part, leave a stub that fails loudly until it is written, and give a
brief: what it must do, the rule or `catalyst-by-zoho` skill that applies, one hint, and
the check that proves it. Wait for the dev's "done", then review their code as a senior
would - what is right, what to change and why - and let them make the change. A stub left
in the code blocks the commit.

## 3. The base

No domain code yet - no repository classes or `resources.ts` entries; they come with the
first stage that uses a resource. In the first base stage, walk the dev through the env
values the README's "First run" section lists; values that are secrets, the dev types in themselves.

zoho-token kit: walk the dev through registering a **Server-based client** at the Zoho API
Console for their data centre, with the Authorized Redirect URI
`<ZOHO_TOKEN_CALLBACK_ORIGIN>/api/v1/zoho-token/callback` (locally, the origin
`catalyst serve` prints, usually `http://localhost:3001`). The dev fills
`ZOHO_TOKEN_CLIENT_ID`, `ZOHO_TOKEN_CLIENT_SECRET`, `ZOHO_TOKEN_SCOPES`,
`ZOHO_TOKEN_ACCOUNTS_URL`, `ZOHO_TOKEN_CALLBACK_ORIGIN` and `WEB_APP_ORIGIN` in
`apps/api/.env`. Agree the scopes from the Zoho data in `.claude/infra.md` (least
privilege).

## 4. A feature stage

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

The base: invoke `hallmark:hallmark` on `apps/web`. It asks the dev its own questions
(material, audience, use, tone); don't answer them for the dev. Give it these constraints
from the kit, which are not negotiable:

- Fonts and colours exist only as tokens in `apps/web/src/app/globals.css` (and the font
  loading in `apps/web/src/app/layout.tsx`). Never set a font family or a raw colour on a
  component - `.claude/rules/typography.md`.
- `apps/web/src/components/ui/` is vendored shadcn. Never hand-edit it; restyle it through
  the tokens. Add a shadcn component with the shadcn CLI, not by hand.
- `apps/web/public/catalyst-signin.css` styles the cross-origin Catalyst sign-in iframe.
  Bring it in line with the new typeface and colours by hand, as `typography.md` explains.
- Data access in pages goes through `src/services/` and react-query -
  `.claude/rules/web-data-access.md`.
- Scope: the layout, the home page and the sign-in screen.

Once the dev is happy with the last base stage, ask hallmark to lock the system, so it
writes `design.md` at the repo root and every later screen follows it.

A feature stage: every new or changed screen goes through `hallmark:hallmark` in redesign or
component mode, against the repo's `design.md` if it has one, and an empty, loading and
error state for every list or form. In a starter-kit app, also against the tokens in
`globals.css`, with the kit's UI rules: no font family or raw colour on a component, no
hand edits in `components/ui/`. In any other codebase, follow its own styling and
components instead.

## 6. Verify

```bash
pnpm build && pnpm typecheck && pnpm lint      # the base: pnpm install first
```

In a codebase that is not a starter-kit app, run the build, lint and test scripts in its
`package.json` instead, and start it the way its README says.

Every step must pass. On a failure, show the output, fix the cause, and rerun from that step.
Then run `pnpm dev` (or the codebase's own start command) in the background, open the
`proxy:` URL it prints (or the URL it serves on) with the
chrome-devtools MCP (if available), and run the stage's `check` as a user would: do the
action, check the screen, check what it left in Catalyst (`CatalystbyZoho_Get_Rows` or a
ZCQL query through MCP). For the base: a screenshot of the home page, and
`<url>/api/v1/ping` returns `pong`. Take a screenshot of the main screen and stop the dev
server. If anything fails, fix the cause and verify again - never mark a stage done that
you have not seen work.

## 7. After the base

Tell the dev, in a short list: `pnpm dev`, then open the `proxy:` URL it prints (usually
`http://localhost:3001`, not :3000 or :4000), and anything still open (Console steps, env
values). Then go on to the next stage.

## 8. Finish the plan

Every stage is done. Verify them all together, since a later stage can break an earlier
one: run the checks in section 6 once, then, with one dev server, every stage's `check` in
order. Something fails -> fix the cause, commit the fix by the same rules, and run the
whole verification again. All pass -> delete the plan file, and tell the dev in one line
what the app can now do.

## Deploying

Only when the dev asks. Load `catalyst-by-zoho:catalyst-basics` and
`catalyst-by-zoho:catalyst-authentication` first. Deploy with `pnpm run deploy` (never bare
`pnpm deploy`, which is a pnpm built-in). Before anything reaches Production, list what
differs there - the ZAID, tables that must be migrated, env values to set in the Console,
authorized domains and redirect URLs - and get an explicit yes.
