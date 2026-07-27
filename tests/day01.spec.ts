/**
 * Day 1 — Setup and your first test
 *
 * Read the lesson at http://localhost:4173/#day-1 first.
 *
 * Each test below starts with `test.fixme()`, which tells the runner to skip it.
 * Delete that line when you start working on the test.
 *
 * Run:  npm test -- day01
 */

import { test, expect } from '@playwright/test';

test('the login page has the right title', async ({ page }) => {
  test.fixme();

  // 1. Go to /practice/login.html
  // 2. Assert the page title contains "Sign in"
  //    Hint: await expect(page).toHaveTitle(/Sign in/);
});

test('the login page shows a sign-in heading', async ({ page }) => {
  test.fixme();

  // 1. Go to /practice/login.html
  // 2. Assert the heading "Sign in" is visible
  //    Hint: page.getByRole('heading', { name: 'Sign in' })
});

test('the practice home page introduces itself', async ({ page }) => {
  test.fixme();

  // 1. Go to /practice/index.html
  // 2. Assert the main heading reads exactly "Practice App"
});
