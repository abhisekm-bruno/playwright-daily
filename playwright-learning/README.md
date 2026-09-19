# First Playwright test

One test. It opens [https://playwright.dev](https://playwright.dev) and checks three things you can see on the page. No local app, no course server.

This folder is separate from the 30-day course. Run these commands **from `playwright-learning/`**, not from the repo root.

## Install

```bash
cd playwright-learning
npm install
npx playwright install chromium
```

## Run

```bash
npm test
```

You want one passing test in the list reporter. If it fails, the error names the locator that did not match.

## What each locator is doing

| In the test | What it finds | Selenium habit it replaces |
| --- | --- | --- |
| `getByRole('heading', { level: 1, name: /reliable web automation/ })` | The main heading, by role and accessible name | `findElement` on an `h1`, then check its text |
| `getByRole('link', { name: 'Get started' })` | The **Get started** link | `By.linkText("Get started")` |
| `getByText('Resilient locators')` | That visible phrase, wherever it sits | partial text / an XPath that contains the string |

`expect(...).toBeVisible()` waits and retries until the element is visible, or the timeout hits. You do not add `Thread.sleep` or a `WebDriverWait` for these checks.

Prefer `getByRole` when the page has a real heading, link, or button. Use `getByText` when you only have the words on screen.
