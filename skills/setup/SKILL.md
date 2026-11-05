---
name: setup
description: Catalyst Buddy's new-app setup, for the Entire app goal in a folder with no app code yet - ask what the app is and record its title and description, clone the starter kit into it, rename the kit to the app, and commit it. Infra, plan and build come next. Tracks its steps in zcatalystai/buddy/setup.json so an interrupted setup resumes. Used by the Buddy agent; a dev can rerun it with /zcatalystai:setup.
---

# Setup

Runs only for the Entire app goal, in the app's own folder, named for the app (the folder
name is the repo name). The folder has no app code yet - only what `catalyst init` wrote
when `zcatalystai:connect` bound it to a Catalyst project.

Guard, even when the dev runs `/zcatalystai:setup` by hand: no `setup.json` and the folder
holds anything beyond `.git`, `.catalystrc`, `zcatalystai/` and an empty `catalyst.json`
-> stop. The kit copy would overwrite that code; offer a new, empty folder instead.

## Progress

`zcatalystai/buddy/setup.json` records each step. Create it with every step `todo` when it
does not exist; it is committed with the app.

```json
{
  "app": { "status": "done", "title": "Fest Check-in", "description": "Gate check-in for college fest passes." },
  "clone": { "status": "done", "kit": "catalyst-basic-mono-repo" },
  "rename": { "status": "done" }
}
```

Run the steps in order, starting at the first one that is not `done`. Mark a step `done`
only after you have seen it work; if it fails, it stays `todo`. Setup is finished only once
`setup.json` is committed (`git ls-files --error-unmatch zcatalystai/buddy/setup.json`):
every step `done` but not committed -> go straight to the commit at the end of section 3.

## 1. app

Ask the dev, in plain text, for one or two sentences on what the app is for, with an
example ("Gate staff scan fest passes and see who is inside"). Who uses it, its data and
its size are infra's interview, not setup's.

From that, propose three title and description pairs (AskUserQuestion). The title
fits the folder name; the description is one sentence that ends with a full stop and
becomes the page description and the README intro. The dev picks one or writes their own.

Record `title` and `description`.

## 2. clone

1. Ask (AskUserQuestion): will the app read or write Zoho CRM, Desk, Books, People or another
   Zoho app *as the signed-in user*? Yes -> the zoho-token kit
   (https://github.com/akilavan-j-11430/catalyst-zoho-token-mono-repo); no -> the basic kit
   (https://github.com/akilavan-j-11430/catalyst-basic-mono-repo). Say which and why in one
   line.
2. Clone it next to the app, then copy it in - `git clone` refuses a non-empty folder:

   ```bash
   rm -rf ../.<folder>-kit      # left over from an interrupted clone
   git clone --depth 1 <kitUrl> ../.<folder>-kit
   rm -rf ../.<folder>-kit/.git
   cp -R ../.<folder>-kit/. ./
   rm -rf ../.<folder>-kit
   ```

The kit's `.git` is deleted before the copy, so the app keeps the empty history connect
started.
The kit brings its own `catalyst.json` (replacing one `catalyst init` wrote, if any);
`.catalystrc` stays, so the folder is still bound. Then copy each `.env.example` that has no
`.env` beside it. Record `kit` (the kit's repo name).

## 3. rename

Turn the kit's description of itself into the app's, with the folder name (`repoName`),
`title`, `description` and `kit`. Kits change, so find each spot by what it says, not by
line number; a spot a kit doesn't have is fine.

| File | Change |
|---|---|
| `package.json` | `name` -> `<repoName>` |
| `.claude/CLAUDE.md` | the heading -> `# <title>`; the intro under it (what the kit is, "Clone, run `catalyst init`...") -> `<description> pnpm workspaces + Turborepo.` and a new line `Started from <kit>. Run \`catalyst init\` once per checkout to bind it to the Catalyst project.`; a paragraph that starts "This is a starter kit" -> keep only its "Extend the shape that is already here..." sentence |
| `.claude/rules/*.md` | a line saying the kit ships no resources because it is a starter kit -> "`resources.ts` arrives with the first resource; every later one is added there." |
| `README.md` | the heading -> `# <title>`; the intro paragraph -> `<description>`, a blank line, then `Started from [<kit>](<kitUrl>).`; "What you get out of the box" -> "What the stack gives you"; drop the "It is deliberately small..." paragraph; under "Make it yours" drop "This is a template..." and the "Rename the project." paragraph, and rename the heading to "Changing the shape" |
| `apps/web/README.md` | "the Catalyst monorepo starter kit" -> `<title>` |
| `apps/web/src/app/layout.tsx` | in `metadata`: "Catalyst App" -> `<title>`, "%s \| Catalyst App" -> "%s \| <title>", "A Catalyst starter app." -> `<description>` |

Leave alone: the app names in `catalyst.json` (`api`, `web`, `proxy` - the deploy surface),
the workspace names, the `@repo/*` scope, `.catalystrc`, and "Catalyst app" in code comments
(it means an SDK app instance, not the kit).

Then sweep:

```bash
rg -n -i --hidden -g '!node_modules' -g '!pnpm-lock.yaml' -g '!.git' \
  '<kit>|starter kit|starter app|Catalyst App"|this is a template'
```

The only hits allowed are the two "Started from" lines. Fix any other the same way.

Mark `rename` done, then commit the kit, the rename and `setup.json` together by
`${CLAUDE_PLUGIN_ROOT}/rules/commits.md`, as `Start <title> from <kit>` - the one commit
exempt from its size limit. Declined -> setup is not finished, and the next session offers
the commit again. Push only if the dev asks.
