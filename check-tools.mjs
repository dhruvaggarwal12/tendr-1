import { chromium } from 'playwright';

const BASE = 'http://localhost:5174';
const OUT  = 'C:/Users/HP/AppData/Local/Temp/claude/c--Users-HP-tendr-1/f235ea8f-0725-45a5-902f-8ea0c4d08e0c/scratchpad';

const TOOLS = [
  '/timeline-picker',
  '/budget-picker',
  '/decor-finder',
  '/fun-activities',
  '/gift-hampers-cakes',
  '/stationery',
  '/guest-list',
  '/guides',
];

const browser = await chromium.launch({ headless: true });

async function shot(page, name) {
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: false });
  console.log(`  saved: ${name}.png`);
}

// Mobile context
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await ctx.newPage();
await page.addInitScript(() => {
  sessionStorage.setItem('tendr_splash_shown', '1');
  localStorage.setItem('tendr_tour_done', 'true');
});

for (const route of TOOLS) {
  const name = route.replace(/\//g, '-').replace(/^-/, '');
  console.log(`Checking mobile: ${route}`);
  await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle' });
  // Dismiss tour if present
  const skip = page.locator('button:has-text("Skip"), button:has-text("Got it")');
  if (await skip.count() > 0) await skip.first().click().catch(() => {});
  await page.waitForTimeout(600);
  await shot(page, `tool-mobile-${name}`);

  // Also scroll down a bit to check content isn't cut
  await page.evaluate(() => window.scrollTo(0, 200));
  await page.waitForTimeout(300);
  await shot(page, `tool-mobile-${name}-scrolled`);
  await page.evaluate(() => window.scrollTo(0, 0));
}

await ctx.close();
await browser.close();
console.log('\nAll tool screenshots done.');
