import { test, expect } from '@playwright/test';

test.describe('Signup form actions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/practice/signup.html');
  });

  test('a complete signup produces a confirmation', async ({ page }) => {
    await page.getByLabel('First name').fill('Ada');
    await page.getByLabel('Last name').fill('Lovelace');
    await page.getByLabel('Email').fill('ada@example.com');
    await page.getByLabel('Country').selectOption('IN');
    await page.getByRole('radio', { name: 'Pro' }).check();

    const newsletter = page.getByRole('checkbox', { name: 'Send me the newsletter' });
    await newsletter.check();
    await newsletter.uncheck();
    await newsletter.check();

    await page.getByLabel('Notes').fill('Learning Playwright, 30 minutes a day.');
    await page.getByRole('checkbox', { name: 'I accept the terms' }).check();
    await page.getByRole('button', { name: 'Create account' }).click();

    await expect(page.getByRole('heading', { name: 'Account created' })).toBeVisible();
  });

  test('submitting without accepting the terms shows an error', async ({ page }) => {
    await page.getByLabel('First name').fill('Ada');
    await page.getByLabel('Last name').fill('Lovelace');
    await page.getByLabel('Email').fill('ada@example.com');
    await page.getByLabel('Country').selectOption('IN');
    await page.getByRole('button', { name: 'Create account' }).click();

    await expect(page.getByRole('alert')).toContainText('accept the terms');
  });

  test('the confirmation echoes back what you entered', async ({ page }) => {
    await page.getByLabel('First name').fill('Grace');
    await page.getByLabel('Last name').fill('Hopper');
    await page.getByLabel('Email').fill('grace@example.com');
    await page.getByLabel('Country').selectOption('US');
    await page.getByRole('radio', { name: 'Enterprise' }).check();
    await page.getByRole('checkbox', { name: 'I accept the terms' }).check();
    await page.getByRole('button', { name: 'Create account' }).click();

    const confirmation = page.getByRole('heading', { name: 'Account created' }).locator('..');
    await expect(confirmation).toContainText('Grace Hopper');
    await expect(confirmation).toContainText('grace@example.com');
    await expect(confirmation).toContainText('United States');
    await expect(confirmation).toContainText('Enterprise');
    await expect(confirmation).toContainText('Not subscribed');
  });
});
