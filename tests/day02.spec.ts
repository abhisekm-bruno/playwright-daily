/**
 * Day 2 — Locators
 *
 * Lesson: http://localhost:4173/#day-2
 *
 * Rule for today: no CSS selectors, no XPath, no page.locator('#id').
 * Everything must go through getByRole / getByLabel / getByPlaceholder / getByText.
 *
 * Run:  npm test -- day02
 */

import { test, expect } from '@playwright/test';

test.describe('Login page locators', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/practice/login.html');
  });

  test('the email field can be found by its label', async ({ page }) => {
    test.fixme();

    // Locate the email input by its label text and assert it is visible.
  });

  test('the password field can be found by its label', async ({ page }) => {
    test.fixme();

    // Same idea, for the password field.
  });

  test('the submit button is enabled on load', async ({ page }) => {
    test.fixme();

    // Locate the "Sign in" button by role and assert it is enabled.
  });
});

test.describe('Signup page locators', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/practice/signup.html');
  });

  test('the country dropdown and terms checkbox are present', async ({ page }) => {
    test.fixme();

    // 1. Locate the "Country" dropdown by label, assert it is visible.
    // 2. Locate the "I accept the terms" checkbox by role, assert it is visible.
  });

  test('the newsletter checkbox starts unchecked', async ({ page }) => {
    test.fixme();

    // Locate the newsletter checkbox and assert it is NOT checked.
    // Hint: every assertion has a .not form.
  });
});
