# Commits

Every commit Buddy makes in an app must be reviewable in one sitting and easy to find again
in `git log`.

- One concern per commit: one stage, one fix, or one review change. Never batch unrelated
  changes into one commit.
- Renames, moves and formatting go in their own commit, with no behaviour change, so they
  can be skimmed.
- Under ~300 changed lines and ~10 files. Bigger -> split it into steps that each build and
  pass the checks. Two commits are exempt: connect's baseline of existing code, and the
  first commit that brings in the kit.
- The subject says what changed, in the imperative. The body has four parts:
  - Why: the problem, in one or two lines.
  - Read in order: files or areas in the order to review them, from shared code outward
    to its callers.
  - Look closely at: the one or two spots where a bug could hide.
  - Verified: what was run or checked by hand.
- Before committing, show `git diff --stat` and a short summary, and commit after the dev
  approves.
