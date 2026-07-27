/**
 * Rasterises the SVG app icons into the PNG sizes the PWA manifest and iOS need.
 *
 * Uses the Chromium that Playwright already installed, so there is no image
 * library to add. Run it again whenever you edit the source SVGs:
 *
 *   node scripts/generate-icons.mjs
 */

import { chromium } from '@playwright/test';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ICONS_DIR = resolve(fileURLToPath(new URL('../app/icons', import.meta.url)));

const TARGETS = [
  { source: 'icon.svg', out: 'icon-192.png', size: 192 },
  { source: 'icon.svg', out: 'icon-512.png', size: 512 },
  { source: 'icon.svg', out: 'apple-touch-icon.png', size: 180 },
  { source: 'icon-maskable.svg', out: 'icon-maskable-512.png', size: 512 },
];

const browser = await chromium.launch();
const page = await browser.newPage();

for (const { source, out, size } of TARGETS) {
  const svg = await readFile(resolve(ICONS_DIR, source), 'utf8');

  await page.setViewportSize({ width: size, height: size });
  await page.setContent(
    `<!doctype html><html><body style="margin:0;width:${size}px;height:${size}px">
       <div style="width:${size}px;height:${size}px">${svg.replace(/width="512" height="512"/, `width="${size}" height="${size}"`)}</div>
     </body></html>`
  );

  const png = await page.screenshot({ clip: { x: 0, y: 0, width: size, height: size } });
  await writeFile(resolve(ICONS_DIR, out), png);
  console.log(`  ${out}  ${size}x${size}`);
}

await browser.close();
