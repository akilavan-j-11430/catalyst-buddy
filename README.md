# Catalyst Buddy

A Claude Code plugin that gives you a senior Zoho Catalyst developer and architect to
work with. Tell it what you want to build. It interviews you, picks the right starter kit
and architecture, names the app, sets it up, designs the UI with
[hallmark](https://github.com/nutlope/hallmark) so it doesn't look AI-generated, and then
keeps building it with you one feature at a time.

It builds on two starter kits:

- [catalyst-basic-mono-repo](https://github.com/akilavan-j-11430/catalyst-basic-mono-repo) -
  Express 5 API on AppSail, Next.js 16 on Slate, Catalyst Authentication.
- [catalyst-zoho-token-mono-repo](https://github.com/akilavan-j-11430/catalyst-zoho-token-mono-repo) -
  the same, plus a per-user Zoho OAuth connection for apps that call Zoho CRM, Desk, Books
  and so on.

## Prerequisites

- [Claude Code](https://code.claude.com)
- Node.js 24, pnpm, git
- Catalyst CLI: `npm i -g zcatalyst-cli`, then `catalyst login`
- A Catalyst MCP server for your data centre, added to Claude Code
  (`claude mcp add --transport http --scope user <name> <server-url>`). Create one at
  [mcp.zoho.com](https://mcp.zoho.com). Buddy checks this and walks you through it if it's missing.

## Install

Once per machine:

```bash
claude plugin marketplace add catalystbyzoho/agent-skills
claude plugin marketplace add nutlope/hallmark
claude plugin marketplace add akilavan-j-11430/catalyst-buddy
claude plugin install zcatalystai@buddy
```

Installing `zcatalystai` also installs its two dependencies: the official Catalyst
skills (`catalyst-by-zoho`) and `hallmark`.

Leave **auto-update** off for these marketplaces in `/plugin`. Buddy checks itself and both
dependencies against GitHub at the start of every session and asks before it updates
anything.

The `catalyst-by-zoho` plugin adds a US-region Catalyst MCP server. If your Catalyst
account is in another data centre, turn that server off in `/mcp` and keep your own.

If you installed the Catalyst skills or hallmark earlier with `npx skills`, remove those
copies (`npx skills remove <name> -g`) so the out-of-date skills don't sit next to the
plugin's. Buddy flags them if it finds any.

## Use

Start a new app in a new, empty folder named for the app (the folder name becomes the repo
name):

```bash
mkdir -p ~/Documents/Solutions/<your-app> && cd ~/Documents/Solutions/<your-app>
claude --agent buddy
```

Work on any existing Catalyst codebase - one Buddy started or not:

```bash
cd ~/Documents/Solutions/<your-app>
claude --agent buddy
```

Every session Buddy checks the machine and the Catalyst project, then asks what you are
doing: build the entire app, add a feature, fix something, or understand the app.

If another plugin also ships an agent named `buddy`, use the scoped name:
`claude --agent zcatalystai:buddy`.

## What it does

| Step | Skill | What happens |
|---|---|---|
| Doctor | `doctor` | Every session: Node, pnpm, git, Catalyst CLI, a Catalyst MCP server connected (helps you configure one if none), plugins up to date, stale skill copies, chrome-devtools; fixes each gap with you or for you |
| Connect | `connect` | Every session: `catalyst init` done (binds the folder if not), which MCP server reaches its project, and a git repo with an `origin` remote (required to change code; it sets them up with you) |
| Goal | `goal` | Every session: you pick entire app, a feature, a fix, or understand the app |
| Setup | `setup` | New apps only: asks what the app is and records its title and description, asks which kit, clones it into the folder, renames the kit to the app, and commits it |
| Infra | `infra` | For an app, a feature or a fix, the Catalyst side only: its footprint (none, existing, new), 2-3 ways to cover it with pros and cons and one recommended, the design you confirm written to `.claude/infra.md`, then its Catalyst resources created (dependencies first) |
| Plan | `plan` | The code: an app or a feature as ordered stages - routes, types, data access, screens and the check of each - approved once and kept in `zcatalystai/buddy/plan.json`, outside git; for a fix, the change |
| Build | `build` | Asks the mode - Fully auto, Learn & Review (you write the parts that teach something) or Review only (each stage waits for your review) - then runs the stages in `plan.json` one by one: a new app's base (env values, hallmark UI), then each feature (code to the repo's rules, hallmark screens, verified in the browser); after a full verification it deletes `plan.json` |
| Fix | `fix` | Takes the symptom from you; the `diagnose` agent reproduces it and finds the cause; infra joins only when Catalyst is involved, plan only for a change beyond one file; then fix applies it and verifies it with the same reproduction |
| Explain | `explain` (agent) | Read-only tour: what the app does, how it is built, its Catalyst resources, how to run it; then answers your questions |

Buddy always asks before it writes to disk (apart from its own state files under
`zcatalystai/buddy/`), creates Catalyst resources (Development only),
commits, pushes, creates a repo, or deploys - except that in build's Fully auto mode the
plan you approved covers writing and committing its stages. It never pushes or deploys
without asking, and never asks you to paste secrets into the chat.

## Layout

```
.claude-plugin/plugin.json        plugin manifest and its dependencies
.claude-plugin/marketplace.json   this repo as a marketplace
agents/buddy.md                   the persona, ground rules, and session start
agents/infra-way.md               designs one Catalyst way for infra; infra runs 2-3 in parallel
agents/explain.md                 the read-only tour and Q&A, started by goal
agents/diagnose.md                reproduces a problem and finds its cause, started by fix
skills/<step>/SKILL.md            one skill per step above, except explain
rules/commits.md                  the commit rules every Buddy commit follows
```

## Developing Buddy

```bash
claude plugin validate .
claude --plugin-dir . --agent buddy
```

Bump `version` in `.claude-plugin/plugin.json` for each release, or teammates won't
receive the update.
