---
name: setup
description: Catalyst Buddy's new-app setup, run inside the app's empty folder - ask what the app is and record its title and description, then clone the starter kit into it. zcatalystai:connect binds it to a Catalyst project next. Tracks its steps in zcatalystai/buddy/setup.json so an interrupted setup resumes. Used by the Buddy agent; a dev can rerun it with /zcatalystai:setup.
---

# Setup

Runs in the app's own folder: an empty folder when a new app starts, named for the app
(the folder name is the repo name). Doctor has already checked the machine; after setup,
`zcatalystai:connect` binds the folder to a Catalyst project.

## Progress

`zcatalystai/buddy/setup.json` records each step. Create it with every step `todo` when
setup starts in an empty folder; it is committed with the app.

```json
{
  "app": { "status": "done", "title": "Fest Check-in", "description": "Gate check-in for college fest passes." },
  "clone": { "status": "done", "kit": "catalyst-basic-mono-repo" }
}
```

Run the steps in order, starting at the first one that is not `done`. Mark a step `done`
only after you have seen it work; if it fails, it stays `todo`.

## 1. app

Find out what the app is, in one AskUserQuestion call with these four questions. Each offers
its predefined answers; the dev can always type their own.

| Question | Answers |
|---|---|
| What kind of app is it? | Internal tool for staff / Portal for customers or partners / Public site or form / Automation with little or no UI |
| What is the main thing it does? | Track and update records / Requests and approvals / Bookings and scheduling / Reports and dashboards |
| Who signs in? | Staff of one company / Customers or partners / Anyone, with a social login / No one |
| How big in the first year? | Under 50 users / 50 to 1,000 / 1,000 to 50,000 / More |

Then ask the dev, in plain text, for one or two sentences on what it is for, with an
example ("Gate staff scan fest passes and see who is inside").

From the answers, propose three title and description pairs (AskUserQuestion). The title
fits the folder name; the description is one sentence that ends with a full stop and
becomes the page description and the README intro. The dev picks one or writes their own.

Record `title` and `description`. The other answers are not recorded; they feed the next
steps of this session.

## 2. clone

1. Ask (AskUserQuestion): will the app read or write Zoho CRM, Desk, Books, People or another
   Zoho app *as the signed-in user*? Yes -> the zoho-token kit
   (https://github.com/akilavan-j-11430/catalyst-zoho-token-mono-repo); no -> the basic kit
   (https://github.com/akilavan-j-11430/catalyst-basic-mono-repo). Say which and why in one
   line.
2. Clone it next to the app, then move it in - `git clone` refuses a non-empty folder:

   ```bash
   git clone --depth 1 <kitUrl> ../.<folder>-kit
   rm -rf ../.<folder>-kit/.git
   cp -R ../.<folder>-kit/. ./
   rm -rf ../.<folder>-kit
   git init -b main
   ```

The kit's `.git` is deleted before the copy, so the app starts with its own empty history.
Record `kit` (the kit's repo name).
