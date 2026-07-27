import { test, expect } from '@playwright/test';

test('the login page has the right title', async ({ page }) => {
  await page.goto('/practice/login.html');

  await expect(page).toHaveTitle(/Sign in/);
});

test('the login page shows a sign-in heading', async ({ page }) => {
  await page.goto('/practice/login.html');

  await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
});

test('the practice home page introduces itself', async ({ page }) => {
  await page.goto('/practice/index.html');

  await expect(page.getByRole('heading', { name: 'Practice App' })).toHaveText('Practice App');
});
