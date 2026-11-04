---
name: fix
description: Catalyst Buddy's fix loop for any Catalyst codebase - reproduce the problem, find the root cause, let design offer ways to fix it, apply the one the dev picks following the repo's own rules, and verify it with the same reproduction. Used by the Buddy agent when the dev's goal is a fix.
---

# Fix a problem

One problem per pass. Work in the codebase as it is: its `.claude/CLAUDE.md`,
`.claude/rules/*.md` and existing patterns are binding, whether or not Buddy built it.

## 1. Reproduce

- Get the symptom and the steps from the dev: what they did, what they expected, what
  happened. Ask for the exact error text if they have it.
- Reproduce it yourself: run the app, the failing command or the failing test. For a
  server-side problem, read the Catalyst logs with the picked MCP server's `Get_Logs` tool.
- Show the real failing output. If you cannot reproduce it, say what you tried and ask -
  never fix a problem you have not seen.

## 2. Cause

- Trace the failure to its root cause, not the first line that looks wrong.
- Before blaming Catalyst behaviour, load the matching `catalyst-by-zoho:<service>` skill and
  check the claim against it.
- Tell the dev the cause in one or two plain lines.

## 3. Design the fix

Run `zcatalystai:blueprint` with the reproduction and the cause. It sizes the fix to its
Catalyst footprint and lets the dev pick one of two or three ways.

## 4. Fix

- Apply the way the dev picked, following the repo's rules and patterns.
- If uncommitted work you did not make touches the same files, ask before changing them.

## 5. Verify

- Run the reproduction again and show it now passes.
- Run the repo's checks: `pnpm build && pnpm typecheck && pnpm lint` in a starter-kit app,
  otherwise the build, lint and test scripts in its `package.json`.
- A check fails -> show the output, fix the cause, and verify again. Never report a fix you
  have not seen work.

## 6. Wrap up

Show `git status --short` and a one-line summary of what was broken and why, then offer a
commit whose message says what was broken. Commit only on a yes; push only if asked.
