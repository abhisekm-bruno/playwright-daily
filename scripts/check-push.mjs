/**
 * Checks the reminders panel in both engines.
 *
 * Scope note: no local browser can complete this flow end to end. Headless
 * Chromium refuses notification permission and disables the Push API entirely,
 * and WebKit here is not a Home Screen app. So this verifies the parts that do
 * not need a push service - rendering, capability detection, disabled states,
 * and that failures are explained rather than silent. Actual delivery has to be
 * confirmed on a real iPhone.
 *
 *   node scripts/check-push.mjs
 */

import { chromium, webkit, devices } from '@playwright/test';

const BASE = process.env.BASE_URL ?? 'http://localhost:4173';

async function safariTab() {
  const browser = await webkit.launch();
  const page = await (await browser.newContext(devices['iPhone 14'])).newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));

  await page.goto(`${BASE}/#reminders`);
  await page.getByRole('heading', { name: 'Daily reminder' }).waitFor();

  const result = {
    showsHomeScreenGuidance: await page.getByText('Add this to your Home Screen first').isVisible(),
    enableButtonDisabled: await page.getByRole('button', { name: 'Enable reminders' }).isDisabled(),
    testButtonDisabled: await page.getByRole('button', { name: 'Send a test notification' }).isDisabled(),
    reportsBrowserTab: await page.getByText('no, this is a browser tab').isVisible(),
    pageErrors: errors,
  };

  await page.screenshot({ path: 'test-results/push-ios-tab.png', fullPage: true });
  await browser.close();
  return result;
}

async function desktop() {
  const browser = await chromium.launch();
  const page = await (await browser.newContext()).newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));

  await page.goto(`${BASE}/#reminders`);
  await page.getByRole('button', { name: 'Enable reminders' }).click();
  await page.waitForTimeout(2500);

  const message = await page.locator('.planned-note').textContent();

  const result = {
    // The important property: a refused permission produces a readable
    // explanation rather than a button that silently does nothing.
    explainsRefusal: !!message && message.trim().length > 0,
    message: message?.trim(),
    enableButtonRecovered: await page.getByRole('button', { name: 'Enable reminders' }).isEnabled(),
    pageErrors: errors,
  };

  await browser.close();
  return result;
}

console.log(JSON.stringify({ safariTab: await safariTab(), desktop: await desktop() }, null, 2));
