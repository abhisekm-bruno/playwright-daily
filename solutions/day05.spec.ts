import { test, expect } from '@playwright/test';

test.describe('Signed-in experience', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/practice/login.html');
    await page.getByLabel('Email').fill('ada@example.com');
    await page.getByLabel('Password').fill('playwright123');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page).toHaveURL(/dashboard\.html/);
  });

  test('the dashboard greets the user and shows stats', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Ada');

    const stats = page.getByLabel('Statistics');
    await expect(stats).toBeVisible();
    await expect(stats.locator('.stat')).toHaveCount(4);
  });

  test('the orders table is populated', async ({ page }) => {
    // Scoped to the nav: the dashboard body also links to Orders, and an
    // unscoped locator would match both and fail strict mode.
    await page.getByRole('navigation').getByRole('link', { name: 'Orders' }).click();

    await expect(page).toHaveURL(/orders\.html/);
    await expect(page.getByRole('rowgroup').last().getByRole('row')).toHaveCount(10);
    await expect(page.getByRole('status')).toContainText('Showing 10 of 10 orders');
  });

  test('logging out returns you to the login page', async ({ page }) => {
    await test.step('log out', async () => {
      await page.getByRole('button', { name: 'Log out' }).click();
    });

    await test.step('verify we are signed out', async () => {
      await expect(page).toHaveURL(/login\.html/);
      await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
    });
  });
});
