---
name: catalyst-kit-scaffold
description: Catalyst Buddy's build-out step - in the app folder setup prepared, rename the kit with the kit's adopt-kit skill, record the brief, create the agreed Data Store tables over MCP, design the UI with hallmark, verify, and make the first commit. Needs setup done and a confirmed solution brief from catalyst-solution-design.
---

# Scaffold the solution

Runs in the app folder, after `zcatalystai:setup` is done. Inputs: the confirmed solution
brief from `zcatalystai:catalyst-solution-design` (title, description, remote choice), and
`kit` from `zcatalystai/buddy/setup.json`. The repo name is the folder name. If
any input is missing, go back and ask - never fill one in yourself.

If scaffold is resumed, skip a step whose result is already there.

## 1. Remote

If the dev gave a remote URL: `git remote add origin <url>`.
If they asked Buddy to create the remote, ask once more right before running
`gh repo create <owner>/<repo-name> --private` or `zr repo create`, then add it as `origin`.

## 2. Rename

Read `.claude/skills/adopt-kit/SKILL.md` and do exactly what it says, with `repoName`,
`title` and `description`. It ends by deleting itself.

## 3. Record the brief

In `.claude/CLAUDE.md`, insert the brief's `## Domain`, `## Architecture` and
`## Look and feel` sections right after the intro paragraph (before `## Role`). Build mode
reads them on every later session, so keep them true as the app grows.

## 4. Env values

Setup copied the env templates. Walk the dev through the values the README's "First run"
section lists. Values that are secrets, the dev types in themselves.

## 5. Create the tables

For each table in the brief's data model, and only in the **Development** environment:
load `catalyst-by-zoho:catalyst-datastore`, show the dev the exact tables and columns you
will create, and on a yes create them with the `CatalystbyZoho_Create_Table` and
`CatalystbyZoho_Create_Column` tools on the MCP server doctor picked. Read them back with
`CatalystbyZoho_List_All_Columns` and report what exists.

Set table permissions/scopes the way the brief and the kit's `vendor-boundaries.md` say.
If an MCP tool cannot set something (for example an encrypted column), give the dev the
exact Console steps instead and wait for them to say it's done.

Do not add repository classes or `resources.ts` entries yet - those come with the first
feature that uses the table, in build mode.

### Extra steps for the zoho-token kit

Follow `.claude/rules/zoho-token.md` and `apps/api/.env.example`:
1. Create the `ZohoConnection` table: `REFERENCE_ID`, `REFRESH_TOKEN` (encrypted), App User
   scope USER.
2. Make sure the default Cache segment exists (`CatalystbyZoho_List_All_Segments`).
3. Walk the dev through registering a **Server-based client** at the Zoho API Console for
   their data centre, with the Authorized Redirect URI
   `<ZOHO_TOKEN_CALLBACK_ORIGIN>/api/v1/zoho-token/callback` (locally, the origin
   `catalyst serve` prints, usually `http://localhost:3001`).
4. The dev fills `ZOHO_TOKEN_CLIENT_ID`, `ZOHO_TOKEN_CLIENT_SECRET`, `ZOHO_TOKEN_SCOPES`,
   `ZOHO_TOKEN_ACCOUNTS_URL`, `ZOHO_TOKEN_CALLBACK_ORIGIN` and `WEB_APP_ORIGIN` in
   `apps/api/.env`. Agree the scopes with them from the brief (least privilege).

## 6. Design

Invoke `hallmark:hallmark` on `apps/web` with the brief's "Look and feel" answers
(audience, use case, tone, brand colours, likes and dislikes), and these constraints, which
come from the kit and are not negotiable:

- Fonts and colours exist only as tokens in `apps/web/src/app/globals.css` (and the font
  loading in `apps/web/src/app/layout.tsx`). Never set a font family or a raw colour on a
  component - `.claude/rules/typography.md`.
- `apps/web/src/components/ui/` is vendored shadcn. Never hand-edit it; restyle it through
  the tokens. Add a shadcn component with the shadcn CLI, not by hand.
- `apps/web/public/catalyst-signin.css` styles the cross-origin Catalyst sign-in iframe.
  Bring it in line with the new typeface and colours by hand, as `typography.md` explains.
- Data access in pages goes through `src/services/` and react-query -
  `.claude/rules/web-data-access.md`.
- Scope: the layout, the home page and the sign-in screen. No domain screens yet; those come
  feature by feature in build mode.

Let hallmark write its `design.md` at the repo root so later screens reuse the same system.

## 7. Verify

```bash
pnpm install && pnpm build && pnpm typecheck && pnpm lint
```

Every step must pass. On a failure, show the output, fix the cause, and rerun from that step.
Then run `pnpm dev` in the background, open the `proxy:` URL it prints with the
chrome-devtools MCP (if available), take a screenshot of the home page, check
`<url>/api/v1/ping` returns `pong`, and stop the dev server.

## 8. First commit

Show `git status --short`, then ask. On a yes:

```bash
git add -A
git commit -m "Start <title> from <kit>"
```

Push only if the dev asks.

## 9. Hand-off

Tell the dev, in a short list:
- `pnpm dev`, then open the `proxy:` URL it prints (usually
  `http://localhost:3001`, not :3000 or :4000).
- To keep building: `claude --agent buddy` from this folder. Buddy reads the brief
  in `.claude/CLAUDE.md` and picks up from there.
- Anything still open (Console steps, env values, the remote).
