# Catalyst Buddy

A Claude Code plugin that gives you a senior Zoho Catalyst developer and architect to
work with. Tell it what you want to build. It interviews you, picks the right starter kit
and architecture, names the app, scaffolds it, designs the UI with
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

Keep building an app Buddy started, or finish one whose setup was interrupted:

```bash
cd ~/Documents/Solutions/<your-app>
claude --agent buddy
```

Buddy works out which it is from the folder: setup records its progress in
`zcatalystai/buddy/setup.json`, committed with the app.

If another plugin also ships an agent named `buddy`, use the scoped name:
`claude --agent zcatalystai:buddy`.

## What it does

| Step | Skill | What happens |
|---|---|---|
| Doctor | `doctor` | Every session: Node, pnpm, git, Catalyst CLI, which Catalyst MCP server to use (helps you configure one if none), plugins up to date, stale skill copies, chrome-devtools; fixes each gap with you or for you |
| Setup | `setup` | Asks what the app is and records its title and description, asks which kit, clones it into the folder, `catalyst init` on a project both the CLI and the MCP server can see, records the org, project and data centre |
| Discovery | `catalyst-solution-design` | The interview, 2-3 Catalyst solution options with one recommended, a solution brief you confirm |
| Scaffold | `catalyst-kit-scaffold` | Rename with the kit's `adopt-kit` skill, record the brief, tables over MCP, hallmark design, `typecheck`/`lint`/`build`, first commit |
| Build | `catalyst-feature-build` | One feature at a time: plan, resources, code to the kit rules, hallmark screens, verified in the browser |

Buddy always asks before it writes to disk, creates Catalyst resources (Development only),
commits, pushes, creates a repo, or deploys. It never asks you to paste secrets into the
chat.

## Layout

```
.claude-plugin/plugin.json        plugin manifest and its dependencies
.claude-plugin/marketplace.json   this repo as a marketplace
agents/buddy.md                   the persona, ground rules, and mode routing
skills/<step>/SKILL.md            one skill per step above
```

The knowledge of where each kit names itself lives in the kit, at
`.claude/skills/adopt-kit/SKILL.md`, because it changes whenever the kit changes.

## Developing Buddy

```bash
claude plugin validate .
claude --plugin-dir . --agent buddy
```

Bump `version` in `.claude-plugin/plugin.json` for each release, or teammates won't
receive the update.
