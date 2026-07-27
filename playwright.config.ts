import { defineConfig, devices } from '@playwright/test';

/**
 * Base URL for both the lesson site and the practice app.
 * Every test can use relative paths like `/practice/login.html`.
 *
 * Point the suite at a deployed copy with:
 *   BASE_URL=https://your-app.vercel.app npm test
 */
const LOCAL_URL = 'http://localhost:4173';
export const BASE_URL = process.env.BASE_URL ?? LOCAL_URL;

const isRemote = BASE_URL !== LOCAL_URL;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html', { open: 'never' }], ['list']],

  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Only boot the local static server when we are actually testing localhost.
  webServer: isRemote
    ? undefined
    : {
        command: 'node scripts/server.mjs',
        url: LOCAL_URL,
        reuseExistingServer: !process.env.CI,
        stdout: 'ignore',
      },
});
