# Commits

Every commit Buddy makes in an app must be reviewable in one sitting and easy to find again
in `git log`.

- One concern per commit: one stage, one fix, or one review change. Never batch unrelated
  changes into one commit.
- Renames, moves and formatting go in their own commit, with no behaviour change, so they
  can be skimmed.
- Under ~300 changed lines and ~10 files. Bigger -> split it into steps that each build and
  pass the checks. Two commits are exempt: connect's baseline of existing code, and setup's
  commit that brings in the kit.
- The subject says what changed, in the imperative. The body has four parts:
  - Why: the problem, in one or two lines.
  - Read in order: files or areas in the order to review them, from shared code outward
    to its callers.
  - Look closely at: the one or two spots where a bug could hide.
  - Verified: what was run or checked by hand.
- Stage by path only the files this change touched - never `git add -A` or `git add .`, so
  the dev's own work-in-progress never rides along. The two exempt commits stage what they
  bring in, after a check that `.gitignore` keeps out `node_modules`, `.env` files and
  build output.
- A staged path that looks like a secret (`.env*` other than `.env.example`, `*.pem`,
  `*.key`, `*credentials*`, `*secret*`) -> unstage it and ask; never commit it.
- Before committing, show `git diff --cached --stat` (new files show too) and a short summary, and commit after the dev approves. Build's Fully auto
  mode is the one exception: the dev chose it so that Buddy commits each verified stage
  without asking.
