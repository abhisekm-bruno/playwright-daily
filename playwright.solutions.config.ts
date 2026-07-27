import { defineConfig } from '@playwright/test';
import baseConfig from './playwright.config';

/**
 * Runs the reference solutions instead of your exercise files.
 * Use it to check "what should this look like when it passes?"
 *
 *   npm run test:solutions
 *   npm run test:solutions -- day01
 */
export default defineConfig({
  ...baseConfig,
  testDir: './solutions',
});
