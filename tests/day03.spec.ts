/**
 * Day 3 — Actions
 *
 * Lesson: http://localhost:4173/#day-3
 *
 * Goal: touch every action type at least once on the signup form.
 *
 * Run:  npm test -- day03
 */

import { test, expect } from '@playwright/test';

test.describe('Signup form actions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/practice/signup.html');
  });

  test('a complete signup produces a confirmation', async ({ page }) => {
    test.fixme();

    // 1.  fill()          first name, last name, email
    // 2.  selectOption()  Country -> India   (the option value is 'IN')
    // 3.  check()         the "Pro" plan radio
    // 4.  check/uncheck   the newsletter checkbox: on, off, on again
    // 5.  fill()          the Notes textarea
    // 6.  check()         "I accept the terms"
    // 7.  click()         "Create account"
    // 8.  assert the "Account created" confirmation is visible
  });

  test('submitting without accepting the terms shows an error', async ({ page }) => {
    test.fixme();

    // Fill in everything EXCEPT the terms checkbox, submit,
    // and assert the error mentions the terms.
  });

  test('the confirmation echoes back what you entered', async ({ page }) => {
    test.fixme();

    // Complete a valid signup, then assert the confirmation panel
    // shows the name, email, country, and plan you chose.
    // Hint: toContainText() on the confirmation panel is the easy way in.
  });
});
