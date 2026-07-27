import { test, expect } from '@playwright/test';

test.describe('Login page locators', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/practice/login.html');
  });

  test('the email field can be found by its label', async ({ page }) => {
    await expect(page.getByLabel('Email')).toBeVisible();
  });

  test('the password field can be found by its label', async ({ page }) => {
    await expect(page.getByLabel('Password')).toBeVisible();
  });

  test('the submit button is enabled on load', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeEnabled();
  });
});

test.describe('Signup page locators', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/practice/signup.html');
  });

  test('the country dropdown and terms checkbox are present', async ({ page }) => {
    await expect(page.getByLabel('Country')).toBeVisible();
    await expect(page.getByRole('checkbox', { name: 'I accept the terms' })).toBeVisible();
  });

  test('the newsletter checkbox starts unchecked', async ({ page }) => {
    await expect(page.getByRole('checkbox', { name: 'Send me the newsletter' })).not.toBeChecked();
  });
});
