/**
 * Day 5 — Your first real end-to-end flow
 *
 * Lesson: http://localhost:4173/#day-5
 *
 * Today is about structure. The individual lines should feel familiar by now;
 * what is new is describe blocks, a beforeEach that logs in, and test.step().
 *
 * Run:  npm test -- day05
 * Then: npm run report   (look at how test.step changes the report)
 */

import { test, expect } from '@playwright/test';

test.describe('Signed-in experience', () => {
  test.beforeEach(async ({ page }) => {
    test.fixme();

    // Log in as ada@example.com / playwright123 and assert you reach the dashboard.
    // Ending a hook with an assertion turns "mystery failure" into "login is broken".
  });

  test('the dashboard greets the user and shows stats', async ({ page }) => {
    // Assert the heading contains "Ada".
    // Assert the statistics section is visible and shows four stat cards.
    // Hint: the section has aria-label="Statistics".
  });

  test('the orders table is populated', async ({ page }) => {
    // Navigate to the orders page.
    // Heads up: the dashboard links to Orders twice. An unscoped locator will
    // hit a strict mode violation - read the error, it tells you both matches.
    // Assert the table body has more than zero rows.
    // Hint: page.getByRole('row') includes the header row - think about how to
    //       scope to the body, or use toHaveCount with the number you expect.
  });

  test('logging out returns you to the login page', async ({ page }) => {
    // Wrap this in two test.step() calls: "log out" and "verify".
    // Click the "Log out" button, then assert you are back on login.html
    // and the "Sign in" heading is visible again.
  });
});
