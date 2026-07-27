/**
 * Day 4 — Assertions
 *
 * Lesson: http://localhost:4173/#day-4
 *
 * Rule for today: every assertion must be web-first.
 * `await expect(locator).toBeVisible()`  — yes
 * `expect(await locator.isVisible()).toBe(true)`  — no
 *
 * Credentials: ada@example.com / playwright123
 *
 * Run:  npm test -- day04
 */

import { test, expect } from '@playwright/test';

test.describe('Login assertions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/practice/login.html');
  });

  test('a wrong password produces a visible error', async ({ page }) => {
    test.fixme();

    // 1. Fill the email correctly and the password incorrectly, then submit.
    // 2. Assert the error message is visible and contains "Invalid".
    // 3. Assert the error element has the role "alert".
    // 4. Assert you are still on the login URL.
  });

  test('an empty form is rejected', async ({ page }) => {
    test.fixme();

    // Submit with both fields empty and assert the error mentions "required".
  });

  test('valid credentials land you on the dashboard', async ({ page }) => {
    test.fixme();

    // 1. Log in with the real credentials.
    // 2. Assert the URL now matches /dashboard/.
    // 3. Assert the welcome heading contains "Ada".
    // 4. Assert no error message is visible anymore.
  });
});
