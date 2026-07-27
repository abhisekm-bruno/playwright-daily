/**
 * The 30-day curriculum.
 *
 * status: 'ready'   -> full lesson written, exercise file exists
 *         'planned' -> roadmap only; content gets written when you reach it
 *
 * Section types:
 *   { type: 'text',    title?, body }         body is HTML
 *   { type: 'code',    title?, code }         rendered verbatim, no escaping needed
 *   { type: 'callout', variant: 'tip'|'ts', title, body }
 */

export const curriculum = [
  // ─────────────────────────────── WEEK 1 ───────────────────────────────
  {
    day: 1,
    week: 1,
    weekTitle: 'Week 1 — Foundations',
    title: 'Setup and your first test',
    minutes: 30,
    status: 'ready',
    objectives: [
      'Understand what Playwright actually does when it runs a test',
      'Read and write the anatomy of a spec file',
      'Run tests from the terminal and in UI mode',
    ],
    sections: [
      {
        type: 'text',
        title: 'What Playwright is doing',
        body: `<p>Playwright launches a real browser, drives it over a debugging protocol, and asserts on what it finds. Three pieces matter today:</p>
<ul>
  <li><strong>Test runner</strong> — finds your <code>.spec.ts</code> files, runs them in parallel, reports results.</li>
  <li><strong>Browser automation</strong> — the <code>page</code> object is your handle on one browser tab.</li>
  <li><strong>Auto-waiting</strong> — before Playwright clicks anything it waits for the element to exist, be visible, be stable, and be enabled. This is why you will almost never write a <code>sleep</code>.</li>
</ul>
<p>That last point is the biggest difference from older tools. Hold onto it.</p>`,
      },
      {
        type: 'code',
        title: 'The anatomy of a test',
        code: `import { test, expect } from '@playwright/test';

test('the login page shows a sign-in form', async ({ page }) => {
  await page.goto('/practice/login.html');

  await expect(page).toHaveTitle(/Sign in/);
  await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
});`,
      },
      {
        type: 'text',
        title: 'Line by line',
        body: `<ul>
  <li><code>import { test, expect }</code> — always from <code>@playwright/test</code>, never from the bare <code>playwright</code> package.</li>
  <li><code>test('name', fn)</code> — the name is what shows up in reports. Write it as a sentence describing behaviour, not "test 1".</li>
  <li><code>async ({ page })</code> — that destructured <code>page</code> is a <em>fixture</em>. The runner creates a fresh, isolated browser context for every test and hands you a tab. Tests never leak state into each other.</li>
  <li><code>await page.goto('/practice/login.html')</code> — relative because <code>baseURL</code> is set in <code>playwright.config.ts</code>.</li>
  <li><code>await expect(...)</code> — assertions on a page or locator are <em>async</em> and must be awaited.</li>
</ul>`,
      },
      {
        type: 'callout',
        variant: 'ts',
        title: 'TypeScript note: async / await',
        body: `Almost every Playwright call returns a <code>Promise</code>. <code>await</code> pauses until it resolves. Forgetting an <code>await</code> is the single most common beginner bug — the test races ahead and passes or fails for the wrong reason. If a line touches the browser, it needs <code>await</code>.`,
      },
      {
        type: 'code',
        title: 'Running tests',
        code: `npm test                  # run everything, headless
npm run test:ui           # UI mode - watch, time-travel, pick locators
npm test -- day01         # run only files matching "day01"
npm run test:headed       # watch a real browser window
npm run test:solutions    # run the reference answers instead`,
      },
      {
        type: 'callout',
        variant: 'tip',
        title: 'Start with UI mode',
        body: `<code>npm run test:ui</code> is the best learning tool in the whole toolkit. It shows a DOM snapshot at every step, lets you hover a step to see what the page looked like, and has a locator picker. Keep it open while you work through the exercises.`,
      },
    ],
    exercise: {
      file: 'tests/day01.spec.ts',
      brief: 'Write two smoke tests against the practice login page.',
      tasks: [
        'Navigate to /practice/login.html and assert the page title contains "Sign in".',
        'Assert the "Sign in" heading is visible.',
        'Write a second test that visits /practice/index.html and asserts the heading reads "Practice App".',
      ],
    },
    docs: [
      { label: 'Writing tests', url: 'https://playwright.dev/docs/writing-tests' },
      { label: 'Running and debugging tests', url: 'https://playwright.dev/docs/running-tests' },
    ],
  },

  {
    day: 2,
    week: 1,
    weekTitle: 'Week 1 — Foundations',
    title: 'Locators: finding things the right way',
    minutes: 30,
    status: 'ready',
    objectives: [
      'Use role-based locators as your default',
      'Know when to reach for label, placeholder, text, and test id',
      'Understand that locators are lazy descriptions, not elements',
    ],
    sections: [
      {
        type: 'text',
        title: 'A locator is a recipe, not a result',
        body: `<p>This is the mental model that makes everything else click:</p>
<pre><code>const submit = page.getByRole('button', { name: 'Sign in' });</code></pre>
<p>Nothing happened yet. No DOM was searched. <code>submit</code> is a <em>description</em> of how to find the element. The search runs — and re-runs, with retries — every time you act on it or assert against it. That is why locators survive re-renders that would break a stored element reference.</p>`,
      },
      {
        type: 'text',
        title: 'The priority order',
        body: `<p>Prefer locators that resemble how a user perceives the page. Roughly in order:</p>
<ol>
  <li><code>getByRole()</code> — the default. Matches the accessibility tree, so it doubles as an a11y check.</li>
  <li><code>getByLabel()</code> — form fields with a real <code>&lt;label&gt;</code>.</li>
  <li><code>getByPlaceholder()</code> — inputs with no label (a smell, but common).</li>
  <li><code>getByText()</code> — non-interactive content.</li>
  <li><code>getByTestId()</code> — the escape hatch when nothing else is stable.</li>
</ol>
<p>CSS and XPath selectors still work, but they couple your tests to markup structure. Reach for them last.</p>`,
      },
      {
        type: 'code',
        title: 'The common ones in practice',
        code: `// Role: name is the accessible name (visible text, aria-label, or alt)
page.getByRole('button', { name: 'Sign in' });
page.getByRole('heading', { name: 'Dashboard', level: 1 });
page.getByRole('link', { name: 'Products' });
page.getByRole('textbox', { name: 'Email' });
page.getByRole('checkbox', { name: 'Remember me' });

// Label / placeholder
page.getByLabel('Password');
page.getByPlaceholder('you@example.com');

// Text - substring by default, exact opt-in
page.getByText('Invalid credentials');
page.getByText('Total', { exact: true });

// Test id - configurable attribute, defaults to data-testid
page.getByTestId('order-summary');`,
      },
      {
        type: 'callout',
        variant: 'tip',
        title: 'Strict mode is a feature',
        body: `If a locator matches more than one element, Playwright throws instead of guessing. That error is telling you the locator is ambiguous. Narrow it with <code>.filter()</code>, chain from a container, or use <code>.first()</code> only when the ambiguity is genuinely fine.`,
      },
      {
        type: 'callout',
        variant: 'ts',
        title: 'TypeScript note: the Locator type',
        body: `Every <code>getBy*</code> returns a <code>Locator</code>. You can store it in a variable, pass it to a helper, or return it from a function — that is exactly what Page Objects do later in week 3. Import the type with <code>import type { Locator, Page } from '@playwright/test';</code>.`,
      },
      {
        type: 'code',
        title: 'Let codegen teach you',
        code: `npm run codegen

# Click around the practice app. Playwright writes the locators for you.
# Read what it produces - it is a great source of "how would I target this?"`,
      },
    ],
    exercise: {
      file: 'tests/day02.spec.ts',
      brief: 'Locate every meaningful element on the login and signup pages without using a single CSS selector.',
      tasks: [
        'Locate the email field by its label and assert it is visible.',
        'Locate the password field by its label and assert it is visible.',
        'Locate the "Sign in" button by role and assert it is enabled.',
        'On /practice/signup.html, locate the "Country" dropdown by label and the "I accept the terms" checkbox by role.',
        'Locate the newsletter checkbox and assert it is NOT checked initially.',
      ],
    },
    docs: [
      { label: 'Locators', url: 'https://playwright.dev/docs/locators' },
      { label: 'Other locators', url: 'https://playwright.dev/docs/other-locators' },
    ],
  },

  {
    day: 3,
    week: 1,
    weekTitle: 'Week 1 — Foundations',
    title: 'Actions and actionability',
    minutes: 30,
    status: 'ready',
    objectives: [
      'Drive inputs, checkboxes, dropdowns, and the keyboard',
      'Understand the actionability checks that run before every action',
      'Know why explicit sleeps are almost always the wrong fix',
    ],
    sections: [
      {
        type: 'code',
        title: 'The action vocabulary',
        code: `await page.getByLabel('Email').fill('ada@example.com');   // clears, then types
await page.getByLabel('Email').clear();
await page.getByRole('button', { name: 'Sign in' }).click();
await page.getByRole('checkbox', { name: 'Remember me' }).check();
await page.getByRole('checkbox', { name: 'Remember me' }).uncheck();
await page.getByLabel('Country').selectOption('IN');
await page.getByLabel('Search').press('Enter');
await page.getByRole('button', { name: 'Row menu' }).hover();
await page.getByRole('link', { name: 'Docs' }).dblclick();`,
      },
      {
        type: 'text',
        title: 'What happens before a click',
        body: `<p>Playwright will not click blindly. Before the action it waits, retrying until timeout, for the element to be:</p>
<ul>
  <li><strong>Attached</strong> to the DOM</li>
  <li><strong>Visible</strong> — non-empty box, no <code>visibility: hidden</code></li>
  <li><strong>Stable</strong> — not moving between two animation frames</li>
  <li><strong>Enabled</strong> — no <code>disabled</code> attribute</li>
  <li><strong>Receiving events</strong> — actually the topmost element at that point, not covered by an overlay</li>
</ul>
<p>When a click fails, the error names the check that never passed. Read it: "element is not stable" and "element intercepts pointer events" point at completely different bugs.</p>`,
      },
      {
        type: 'callout',
        variant: 'tip',
        title: 'fill() vs pressSequentially()',
        body: `<code>fill()</code> sets the value in one shot and fires one <code>input</code> event — fast and right for 95% of cases. Use <code>pressSequentially()</code> only when the field genuinely reacts per-keystroke (autocomplete, input masks, character counters).`,
      },
      {
        type: 'callout',
        variant: 'ts',
        title: 'TypeScript note: the return of an action',
        body: `Actions return <code>Promise&lt;void&gt;</code> — they give you nothing back. To read state you use assertions (tomorrow) or getters like <code>await locator.inputValue()</code> and <code>await locator.textContent()</code>. If you find yourself writing <code>const x = await page.click(...)</code>, <code>x</code> is <code>undefined</code>.`,
      },
      {
        type: 'text',
        title: 'Never reach for a sleep first',
        body: `<p><code>await page.waitForTimeout(2000)</code> exists for debugging and nothing else. It makes suites slow when the app is fast and flaky when the app is slow. If something is not ready, express <em>what</em> you are waiting for — a visible element, a settled network call, a URL change. We cover that properly on day 8.</p>`,
      },
    ],
    exercise: {
      file: 'tests/day03.spec.ts',
      brief: 'Fill out the signup form completely using every action type.',
      tasks: [
        'Fill first name, last name, and email.',
        'Select "India" from the Country dropdown.',
        'Choose the "Pro" plan radio button.',
        'Check the newsletter checkbox, then uncheck it, then check it again.',
        'Type a message into the "Notes" textarea.',
        'Check "I accept the terms" and click Create account.',
        'Assert the confirmation panel becomes visible.',
      ],
    },
    docs: [
      { label: 'Actions', url: 'https://playwright.dev/docs/input' },
      { label: 'Auto-waiting / actionability', url: 'https://playwright.dev/docs/actionability' },
    ],
  },

  {
    day: 4,
    week: 1,
    weekTitle: 'Week 1 — Foundations',
    title: 'Assertions that wait for you',
    minutes: 30,
    status: 'ready',
    objectives: [
      'Use web-first assertions and understand their retry loop',
      'Tell the difference between asserting on a locator and asserting on a value',
      'Pick the assertion that produces the most useful failure message',
    ],
    sections: [
      {
        type: 'text',
        title: 'Two kinds of expect',
        body: `<p>This distinction causes more flaky tests than anything else.</p>
<p><strong>Web-first assertions</strong> take a <em>locator</em> and retry until they pass or time out:</p>
<pre><code>await expect(page.getByText('Saved')).toBeVisible();</code></pre>
<p><strong>Generic assertions</strong> take a <em>value</em> that was already resolved. No retry — it is a one-shot check on a snapshot:</p>
<pre><code>expect(await page.getByText('Saved').isVisible()).toBe(true);  // fragile</code></pre>
<p>Both compile. The first waits up to 5 seconds for the app to catch up; the second checks once, right now, and fails if the render is 10ms late. Prefer the first, always. Notice the tell: in the good version <code>await</code> sits in front of <code>expect</code>, not inside it.</p>`,
      },
      {
        type: 'code',
        title: 'The ones you will use constantly',
        code: `// Visibility and existence
await expect(locator).toBeVisible();
await expect(locator).toBeHidden();
await expect(locator).toHaveCount(3);

// Content
await expect(locator).toHaveText('Order confirmed');      // full string
await expect(locator).toContainText('confirmed');          // substring
await expect(locator).toHaveValue('ada@example.com');      // inputs
await expect(locator).toHaveAttribute('href', '/pricing');

// State
await expect(locator).toBeEnabled();
await expect(locator).toBeDisabled();
await expect(locator).toBeChecked();
await expect(locator).toBeFocused();

// Page level
await expect(page).toHaveURL(/\\/dashboard/);
await expect(page).toHaveTitle('Dashboard');`,
      },
      {
        type: 'callout',
        variant: 'tip',
        title: 'toHaveText on a multi-element locator',
        body: `Pass an array and it asserts the whole list at once: <code>await expect(page.getByRole('listitem')).toHaveText(['Alpha', 'Beta', 'Gamma'])</code>. That single line replaces a loop and gives a far better diff when it fails.`,
      },
      {
        type: 'text',
        title: 'Negation and timeouts',
        body: `<p>Every assertion has a <code>.not</code> form, which retries until the condition stops being true:</p>
<pre><code>await expect(page.getByRole('progressbar')).not.toBeVisible();</code></pre>
<p>And any single assertion can override the retry budget when you genuinely expect something slow:</p>
<pre><code>await expect(page.getByText('Report ready')).toBeVisible({ timeout: 30_000 });</code></pre>`,
      },
      {
        type: 'callout',
        variant: 'ts',
        title: 'TypeScript note: numeric separators',
        body: `<code>30_000</code> is just <code>30000</code> — the underscore is a readability feature in modern JS/TS. You will see it a lot in timeout values.`,
      },
    ],
    exercise: {
      file: 'tests/day04.spec.ts',
      brief: 'Assert your way through a failed login and a successful one.',
      tasks: [
        'Submit the login form with a wrong password and assert the error message is visible and contains "Invalid".',
        'Assert the error element has the role "alert".',
        'Assert you are still on the login URL.',
        'Log in with ada@example.com / playwright123 and assert the URL changes to the dashboard.',
        'Assert the welcome heading contains "Ada" and the error message is no longer visible.',
      ],
    },
    docs: [
      { label: 'Assertions', url: 'https://playwright.dev/docs/test-assertions' },
      { label: 'Auto-retrying assertions', url: 'https://playwright.dev/docs/test-assertions#auto-retrying-assertions' },
    ],
  },

  {
    day: 5,
    week: 1,
    weekTitle: 'Week 1 — Foundations',
    title: 'Your first real end-to-end flow',
    minutes: 30,
    status: 'ready',
    objectives: [
      'Compose locators, actions, and assertions into a believable user journey',
      'Organise tests with describe blocks and beforeEach hooks',
      'Use test.step to make reports readable',
    ],
    sections: [
      {
        type: 'text',
        title: 'Structure comes before cleverness',
        body: `<p>A test file that reads like a story is worth more than a clever one. Three tools do most of the work:</p>
<ul>
  <li><code>test.describe()</code> groups related tests and scopes hooks to them.</li>
  <li><code>test.beforeEach()</code> runs setup before each test in scope — usually navigation and login.</li>
  <li><code>test.step()</code> labels a chunk of a test so the HTML report and trace viewer show meaningful phases instead of 40 raw actions.</li>
</ul>`,
      },
      {
        type: 'code',
        title: 'The shape to copy',
        code: `import { test, expect } from '@playwright/test';

test.describe('Checkout', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/practice/login.html');
    await page.getByLabel('Email').fill('ada@example.com');
    await page.getByLabel('Password').fill('playwright123');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page).toHaveURL(/dashboard/);
  });

  test('a signed-in user can submit an order', async ({ page }) => {
    await test.step('open the order form', async () => {
      await page.getByRole('link', { name: 'New order' }).click();
    });

    await test.step('fill in the details', async () => {
      await page.getByLabel('Product').selectOption('Widget');
      await page.getByLabel('Quantity').fill('3');
    });

    await test.step('submit and confirm', async () => {
      await page.getByRole('button', { name: 'Place order' }).click();
      await expect(page.getByRole('status')).toContainText('Order placed');
    });
  });
});`,
      },
      {
        type: 'callout',
        variant: 'tip',
        title: 'One behaviour per test',
        body: `Resist the 200-line mega-test. When it fails you learn only "checkout is broken". Several focused tests that each assert one outcome will tell you <em>which</em> part broke, and they run in parallel.`,
      },
      {
        type: 'text',
        title: 'Assert in your setup',
        body: `<p>Notice the <code>await expect(page).toHaveURL(/dashboard/)</code> at the end of <code>beforeEach</code>. Setup that silently half-succeeds produces confusing failures deep inside the test body. A closing assertion in the hook turns "mystery failure on line 40" into "login is broken", which is a much better bug report.</p>`,
      },
      {
        type: 'callout',
        variant: 'ts',
        title: 'TypeScript note: the callbacks are typed for you',
        body: `You never annotate <code>page</code> yourself. <code>test()</code>, <code>beforeEach()</code>, and friends are generic over the fixture object, so <code>{ page }</code> is inferred as <code>Page</code>. Hover it in the editor and you get full autocomplete on every method — use that instead of memorising the API.`,
      },
    ],
    exercise: {
      file: 'tests/day05.spec.ts',
      brief: 'Build a complete signed-in journey with proper structure.',
      tasks: [
        'Create a describe block called "Signed-in experience".',
        'In beforeEach, log in as ada@example.com and assert you land on the dashboard.',
        'Test 1: assert the dashboard greets "Ada" and shows the stats panel.',
        'Test 2: navigate to the orders table and assert it has rows.',
        'Test 3: log out and assert you are returned to the login page.',
        'Wrap at least one test in two or more test.step() calls, then open the HTML report and look at the difference.',
      ],
    },
    docs: [
      { label: 'Test hooks and grouping', url: 'https://playwright.dev/docs/api/class-test' },
      { label: 'Test steps', url: 'https://playwright.dev/docs/api/class-test#test-step' },
    ],
  },

  // ─────────────────────────────── WEEK 2 ───────────────────────────────
  {
    day: 6, week: 2, weekTitle: 'Week 2 — Real-world pages', status: 'planned', minutes: 30,
    title: 'Filtering and chaining locators',
    objectives: ['Scope a locator to a container', 'Use .filter({ hasText }) and .filter({ has })', 'Use nth, first, last responsibly'],
  },
  {
    day: 7, week: 2, weekTitle: 'Week 2 — Real-world pages', status: 'planned', minutes: 30,
    title: 'Tables, lists, and looping over elements',
    objectives: ['Assert on a row found by its content', 'Use .all() to iterate', 'Extract and compare column values'],
  },
  {
    day: 8, week: 2, weekTitle: 'Week 2 — Real-world pages', status: 'planned', minutes: 30,
    title: 'Waiting properly and killing flakiness',
    objectives: ['waitForURL, waitForResponse, waitFor state', 'Why waitForTimeout is a code smell', 'Diagnose a genuinely flaky test'],
  },
  {
    day: 9, week: 2, weekTitle: 'Week 2 — Real-world pages', status: 'planned', minutes: 30,
    title: 'Debugging: trace viewer, UI mode, codegen',
    objectives: ['Read a trace end to end', 'Use the locator picker', 'Pause execution with page.pause()'],
  },
  {
    day: 10, week: 2, weekTitle: 'Week 2 — Real-world pages', status: 'planned', minutes: 30,
    title: 'Frames, dialogs, tabs, and downloads',
    objectives: ['frameLocator for iframes', 'Handle native dialogs', 'Capture a popup and a file download'],
  },

  // ─────────────────────────────── WEEK 3 ───────────────────────────────
  {
    day: 11, week: 3, weekTitle: 'Week 3 — Structure that scales', status: 'planned', minutes: 30,
    title: 'Page Object Model, part 1',
    objectives: ['Move locators out of specs', 'Write a LoginPage class', 'Keep assertions out of page objects (mostly)'],
  },
  {
    day: 12, week: 3, weekTitle: 'Week 3 — Structure that scales', status: 'planned', minutes: 30,
    title: 'Page Object Model, part 2: components',
    objectives: ['Model reusable widgets, not just pages', 'Compose components into pages', 'Avoid the god-object trap'],
  },
  {
    day: 13, week: 3, weekTitle: 'Week 3 — Structure that scales', status: 'planned', minutes: 30,
    title: 'Custom fixtures',
    objectives: ['Extend base test with your own fixtures', 'Inject page objects automatically', 'Fixture scopes and teardown'],
  },
  {
    day: 14, week: 3, weekTitle: 'Week 3 — Structure that scales', status: 'planned', minutes: 30,
    title: 'Authentication with storageState',
    objectives: ['Log in once in a setup project', 'Reuse auth across the whole suite', 'Handle multiple user roles'],
  },
  {
    day: 15, week: 3, weekTitle: 'Week 3 — Structure that scales', status: 'planned', minutes: 30,
    title: 'Config, projects, and environments',
    objectives: ['Multiple browser projects', 'Per-environment baseURL', 'Dependencies between projects'],
  },

  // ─────────────────────────────── WEEK 4 ───────────────────────────────
  {
    day: 16, week: 4, weekTitle: 'Week 4 — Beyond the UI', status: 'planned', minutes: 30,
    title: 'Network interception and mocking',
    objectives: ['page.route to stub an endpoint', 'Force error and empty states', 'Assert on outgoing requests'],
  },
  {
    day: 17, week: 4, weekTitle: 'Week 4 — Beyond the UI', status: 'planned', minutes: 30,
    title: 'API testing with the request fixture',
    objectives: ['Call APIs directly from a test', 'Seed data via API, verify in UI', 'Assert status codes and bodies'],
  },
  {
    day: 18, week: 4, weekTitle: 'Week 4 — Beyond the UI', status: 'planned', minutes: 30,
    title: 'File uploads and downloads',
    objectives: ['setInputFiles including in-memory files', 'Capture and inspect a download', 'Drag-and-drop upload zones'],
  },
  {
    day: 19, week: 4, weekTitle: 'Week 4 — Beyond the UI', status: 'planned', minutes: 30,
    title: 'Visual and snapshot testing',
    objectives: ['toHaveScreenshot and baselines', 'Mask dynamic regions', 'When visual tests earn their keep'],
  },
  {
    day: 20, week: 4, weekTitle: 'Week 4 — Beyond the UI', status: 'planned', minutes: 30,
    title: 'Accessibility checks in your suite',
    objectives: ['Wire up axe-core', 'Fail a build on a11y violations', 'Read and triage the results'],
  },

  // ─────────────────────────────── WEEK 5 ───────────────────────────────
  {
    day: 21, week: 5, weekTitle: 'Week 5 — Production readiness', status: 'planned', minutes: 30,
    title: 'Parallelism, workers, and sharding',
    objectives: ['How the runner distributes work', 'serial and parallel modes', 'Shard across CI machines'],
  },
  {
    day: 22, week: 5, weekTitle: 'Week 5 — Production readiness', status: 'planned', minutes: 30,
    title: 'Test data strategy',
    objectives: ['Unique data per test run', 'Factories over fixtures files', 'Cleanup that actually runs'],
  },
  {
    day: 23, week: 5, weekTitle: 'Week 5 — Production readiness', status: 'planned', minutes: 30,
    title: 'CI with GitHub Actions',
    objectives: ['A working workflow file', 'Cache browsers', 'Publish the HTML report as an artifact'],
  },
  {
    day: 24, week: 5, weekTitle: 'Week 5 — Production readiness', status: 'planned', minutes: 30,
    title: 'Retries, flake detection, and quarantine',
    objectives: ['Retry semantics and what they hide', 'Annotate and quarantine known-flaky tests', 'Track flake rate over time'],
  },
  {
    day: 25, week: 5, weekTitle: 'Week 5 — Production readiness', status: 'planned', minutes: 30,
    title: 'Reporters and failure triage',
    objectives: ['Built-in reporters', 'Attachments and custom annotations', 'Make a failure diagnosable in 30 seconds'],
  },

  // ─────────────────────────────── WEEK 6 ───────────────────────────────
  {
    day: 26, week: 6, weekTitle: 'Week 6 — Applying it at work', status: 'planned', minutes: 30,
    title: 'Mobile emulation and responsive testing',
    objectives: ['Device descriptors', 'Viewport-specific projects', 'Touch interactions'],
  },
  {
    day: 27, week: 6, weekTitle: 'Week 6 — Applying it at work', status: 'planned', minutes: 30,
    title: 'Soft assertions, tags, and custom matchers',
    objectives: ['expect.soft for multi-check tests', 'Tag and grep your suite', 'Write expect.extend matchers'],
  },
  {
    day: 28, week: 6, weekTitle: 'Week 6 — Applying it at work', status: 'planned', minutes: 30,
    title: 'Choosing what to automate',
    objectives: ['Risk-based test selection', 'The testing trophy in practice', 'What NOT to put in an E2E suite'],
  },
  {
    day: 29, week: 6, weekTitle: 'Week 6 — Applying it at work', status: 'planned', minutes: 30,
    title: 'Capstone part 1: design your real suite',
    objectives: ['Map your product\u2019s critical journeys', 'Draft the page object layer', 'Set up the repo skeleton'],
  },
  {
    day: 30, week: 6, weekTitle: 'Week 6 — Applying it at work', status: 'planned', minutes: 30,
    title: 'Capstone part 2: ship it to CI',
    objectives: ['Implement two real journeys', 'Green run in CI', 'A plan for growing the suite'],
  },
];
