---
name: fix
description: Catalyst Buddy's fix loop for any Catalyst codebase - get the symptom from the dev, let the diagnose agent reproduce it and find the root cause, let infra and plan design the fix, apply the change the dev approves following the repo's own rules, and verify it with the same reproduction. Used by the Buddy agent when the dev's goal is a fix.
---

# Fix a problem

One problem per pass. Work in the codebase as it is: its `.claude/CLAUDE.md`,
`.claude/rules/*.md` and existing patterns are binding, whether or not Buddy built it.

## 1. Symptom

Get it from the dev: what they did, what they expected, what happened. Ask for the exact
error text if they have it.

## 2. Diagnose

- Start the `zcatalystai:diagnose` agent with the symptom.
- Not reproduced -> show the dev what it tried, ask its question, and send the answer to
  the same agent (SendMessage). Never fix a problem nobody has seen fail.
- Reproduced -> show the dev the failing output and the cause in one or two plain lines,
  with its `file:line` references.

## 3. Design the fix

Run `zcatalystai:infra` with the reproduction and the cause; it settles the fix's Catalyst
side. Then `zcatalystai:plan` names the code change and the check, and the dev approves it.

## 4. Fix

- Apply the change plan approved, following the repo's rules and patterns.
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
