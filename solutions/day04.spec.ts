import { test, expect } from '@playwright/test';

test.describe('Login assertions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/practice/login.html');
  });

  test('a wrong password produces a visible error', async ({ page }) => {
    await page.getByLabel('Email').fill('ada@example.com');
    await page.getByLabel('Password').fill('wrong-password');
    await page.getByRole('button', { name: 'Sign in' }).click();

    const error = page.getByRole('alert');
    await expect(error).toBeVisible();
    await expect(error).toContainText('Invalid');
    await expect(page).toHaveURL(/login\.html/);
  });

  test('an empty form is rejected', async ({ page }) => {
    await page.getByRole('button', { name: 'Sign in' }).click();

    await expect(page.getByRole('alert')).toContainText('required');
  });

  test('valid credentials land you on the dashboard', async ({ page }) => {
    await page.getByLabel('Email').fill('ada@example.com');
    await page.getByLabel('Password').fill('playwright123');
    await page.getByRole('button', { name: 'Sign in' }).click();

    await expect(page).toHaveURL(/dashboard\.html/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Ada');
    await expect(page.getByRole('alert')).toHaveCount(0);
  });
});
