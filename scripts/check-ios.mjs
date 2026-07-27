/**
 * Renders the lesson site in WebKit with an iPhone profile and reports whether
 * the PWA pieces iOS cares about are present and the layout holds up.
 *
 * WebKit is the same engine Safari uses, so this catches engine-level problems.
 * It cannot verify Add to Home Screen, which is a Safari UI feature.
 *
 *   node scripts/check-ios.mjs
 */

import { webkit, devices } from '@playwright/test';

const BASE = process.env.BASE_URL ?? 'http://localhost:4173';

const browser = await webkit.launch();
const context = await browser.newContext(devices['iPhone 14']);
const page = await context.newPage();

const consoleErrors = [];
page.on('console', (m) => m.type() === 'error' && consoleErrors.push(m.text()));
page.on('pageerror', (e) => consoleErrors.push(String(e)));

await page.goto(`${BASE}/#day-2`, { waitUntil: 'load' });

const report = await page.evaluate(async () => {
  const manifestHref = document.querySelector('link[rel=manifest]')?.href;
  const manifest = manifestHref ? await fetch(manifestHref).then((r) => r.json()) : null;

  const bar = document.querySelector('.mobile-bar');
  const sidebar = document.getElementById('sidebar');
  const toggle = document.getElementById('nav-toggle');

  const supports = (prop, value) => CSS.supports(prop, value);

  return {
    viewport: `${innerWidth}x${innerHeight}`,
    // iOS reads these for the home-screen app.
    appleTouchIcon: !!document.querySelector('link[rel=apple-touch-icon]'),
    appleCapable: document.querySelector('meta[name=apple-mobile-web-app-capable]')?.content,
    appleTitle: document.querySelector('meta[name=apple-mobile-web-app-title]')?.content,
    themeColor: document.querySelector('meta[name=theme-color]')?.content,
    viewportFit: document.querySelector('meta[name=viewport]')?.content.includes('viewport-fit=cover'),
    manifestName: manifest?.name ?? null,
    manifestDisplay: manifest?.display ?? null,
    maskableIcon: manifest?.icons?.some((i) => i.purpose === 'maskable') ?? false,
    // Engine feature support that the layout depends on.
    supportsWebkitBackdrop: supports('-webkit-backdrop-filter', 'blur(10px)'),
    supportsSafeArea: supports('padding-top', 'env(safe-area-inset-top)'),
    serviceWorkerApi: 'serviceWorker' in navigator,
    swRegistrations: (await navigator.serviceWorker.getRegistrations()).length,
    // Layout sanity on a 390px-wide screen.
    mobileBarVisible: bar ? getComputedStyle(bar).display !== 'none' : false,
    drawerHiddenInitially: sidebar ? getComputedStyle(sidebar).transform !== 'none' : false,
    toggleVisible: toggle ? getComputedStyle(toggle).display !== 'none' : false,
    horizontalOverflow: document.documentElement.scrollWidth > innerWidth + 1,
  };
});

// Open the drawer and confirm it actually slides in under WebKit.
await page.getByRole('button', { name: 'Days' }).click();
await page.waitForTimeout(400);
const drawerOpen = await page
  .locator('#sidebar')
  .evaluate((el) => new DOMMatrixReadOnly(getComputedStyle(el).transform).m41 === 0);

await page.screenshot({ path: 'test-results/ios-drawer.png' });
await page.getByRole('button', { name: 'Days' }).click();
await page.waitForTimeout(400);
await page.screenshot({ path: 'test-results/ios-lesson.png', fullPage: false });

console.log(JSON.stringify({ ...report, drawerOpensOnTap: drawerOpen, consoleErrors }, null, 2));

await browser.close();
