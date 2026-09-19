import { test, expect } from '@playwright/test';

// `page` is the fixture: Selenium's driver, already created and closed for you.
// A locator is not findElement. Nothing is queried until expect (or an action),
// and expect retries — that replaces WebDriverWait + ExpectedConditions.
test('playwright.dev homepage is ready to explore', async ({ page }) => {
  await page.goto('/');

  await expect(
    page.getByRole('heading', { level: 1, name: /reliable web automation/ }),
  ).toBeVisible();

  await expect(page.getByRole('link', { name: 'Get started' })).toBeVisible();

  // Closest everyday stand-in for a partial text / link-text check.
  await expect(page.getByText('Resilient locators')).toBeVisible();
});
