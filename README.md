# Playwright Daily

A 30-day, 30-minutes-a-day course for learning Playwright with TypeScript from scratch, aimed at applying it to a real product at work.

It has three parts:

- **A lesson site** — the curriculum, with explanations, code samples, and progress tracking.
- **A practice app** — a small, deliberately ordinary web app to automate against.
- **Exercise files** — one spec per day, with reference solutions to check yourself against.

## Getting started

```bash
npm install
npx playwright install chromium
```

Then start the lesson site:

```bash
npm run learn
```

Open <http://localhost:4173> and begin with Day 1. The sidebar tracks which days you have completed (stored in your browser, so it survives restarts).

## The daily routine

Roughly 30 minutes, in three parts:

1. **Read** (~10 min) — the day's lesson on the site.
2. **Write** (~15 min) — open `tests/dayNN.spec.ts` and complete the exercise. Each test starts with a `test.fixme()` line that skips it; delete that line when you start.
3. **Check** (~5 min) — run your version, then compare against the reference solution.

```bash
npm test -- day03              # run just today's exercise
npm run test:ui                # UI mode - the best way to learn
npm run test:solutions -- day03  # see the reference answer run
```

Then mark the day complete on the lesson site.

## Commands

| Command | What it does |
| --- | --- |
| `npm run learn` | Serve the lesson site and practice app on port 4173 |
| `npm test` | Run your exercises in `tests/` |
| `npm run test:ui` | UI mode: watch, time-travel, and pick locators |
| `npm run test:headed` | Run with a visible browser window |
| `npm run test:debug` | Step through tests in the inspector |
| `npm run test:solutions` | Run the reference solutions in `solutions/` |
| `npm run report` | Open the HTML report from the last run |
| `npm run codegen` | Record actions and have Playwright write the locators |
| `npm run typecheck` | Type-check without running anything |

You do not need to start the server yourself before running tests — the Playwright config starts it automatically and reuses one if it is already running.

## The practice app

Reachable at <http://localhost:4173/practice/index.html>.

| Page | What it exercises |
| --- | --- |
| `login.html` | Validation, error alerts, async submit, redirect on success |
| `signup.html` | Text inputs, select, radios, checkboxes, textarea, confirmation panel |
| `dashboard.html` | Auth-gated page, stats, navigation |
| `orders.html` | Table with search, status filter, sortable columns, empty state |
| `dynamic.html` | Delayed loads, spinners, toasts, native dialogs, iframes, new tabs |

Sign in with **ada@example.com** / **playwright123**.

## Installing it on your phone

The site is a PWA, so you can install it as an app and read lessons offline.

**Android / Chrome:** open the site, then menu → "Add to Home screen" (or tap the install prompt).

**iPhone / Safari:** open the site, tap Share → "Add to Home Screen". iOS only offers this from Safari, not Chrome.

Once installed it opens without browser chrome, and every lesson plus the whole practice app is cached for offline reading. Content refreshes automatically whenever you open it online, so new days appear without reinstalling.

### Daily reminders (iOS)

Open **Daily reminder** in the sidebar (or `/#reminders`). On iPhone, notifications only work from the **installed Home Screen app**, not a Safari tab — the page will tell you if you are still in the browser.

Tap **Enable reminders**, then **Send a test notification**. On iPhone the banner appears when the app is in the background, so swipe home after tapping.

A scheduled 9:00 PM sender is not wired yet. Enabling today proves permission and delivery on your phone; scheduling comes next.

To regenerate the icons after editing `app/icons/icon.svg`:

```bash
npm run icons
```

To regenerate push keys (invalidates existing subscriptions):

```bash
node scripts/generate-vapid-keys.mjs --force
```

## Deploying to Vercel

The `app/` folder is plain static HTML/CSS/JS, so it deploys with no build step. `vercel.json` already points Vercel at it.

One-time login (interactive, opens your browser):

```bash
npx vercel login
```

Then:

```bash
npm run deploy:preview   # throwaway preview URL
npm run deploy           # production URL
```

Two things to know about the hosted copy:

- **Progress is stored in `localStorage`**, so it is per-browser. Your laptop and your phone will each track their own completed days.
- **Only the site is hosted.** Tests still run on your machine. But you can point them at the deployed practice app:

```bash
BASE_URL=https://your-app.vercel.app npm test
```

When `BASE_URL` is set, Playwright skips starting the local server and hits the remote one instead.

## Layout

```
app/            The lesson site and the practice app (plain HTML/CSS/JS)
  data/         curriculum.js - all 30 days of content
  practice/     the app you automate against
tests/          Your exercises. This is where you work.
solutions/      Reference answers. Peek after you have tried.
scripts/        Static file server
```

## Curriculum

Days 1–5 are written in full. Days 6–30 exist as a roadmap and get authored a week at a time, so later lessons can build on whatever actually turned out to be difficult.

- **Week 1 — Foundations:** first test, locators, actions, assertions, first end-to-end flow
- **Week 2 — Real-world pages:** filtering and chaining, tables, waiting properly, debugging, frames and dialogs
- **Week 3 — Structure that scales:** Page Object Model, custom fixtures, auth reuse, config and projects
- **Week 4 — Beyond the UI:** network mocking, API testing, uploads/downloads, visual testing, accessibility
- **Week 5 — Production readiness:** parallelism, test data, CI, flake management, reporters
- **Week 6 — Applying it at work:** mobile, tags and soft assertions, what to automate, capstone on your real product
