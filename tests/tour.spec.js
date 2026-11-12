import { test, expect } from '@playwright/test';

// Expected values come from src/space/route.js (STOPS, LIST_ONLY) and src/data.js.
const TOUR_TITLES = [
  "Hi, I'm Sebastian",
  'Minoscreto',
  'Ingresos App',
  'Formato Médico',
  'Data Science Portfolio',
  'Email Uplift Test',
  'GB Demand Forecast',
  'NYC 311 Delays',
  'Whisker Gacha',
  'Say hi',
];
const LIST_FEATURED = 8; // STOPS without the welcome and Whisker Gacha stops
const LIST_EARLIER = 8; // LIST_ONLY

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.clear());
});

test('cover shows Start, list button, resume and contact', async ({ page }) => {
  await page.goto('/');
  const start = page.getByRole('button', { name: 'Start the tour' });
  await expect(start).toBeEnabled({ timeout: 30_000 });
  await expect(page.locator('.cover').getByRole('button', { name: 'Just show me the projects' })).toBeVisible();
  await expect(page.locator('.cover').getByRole('link', { name: 'Resume' })).toBeVisible();
  await expect(page.locator('.cover').getByRole('link', { name: 'Contact' })).toBeVisible();
  const tested = page.locator('.cover').getByRole('link', { name: 'How this site is tested' });
  await expect(tested).toHaveAttribute('href', 'https://github.com/soushiki/portfolio-3d#how-this-site-is-tested');
  await expect(tested).toHaveAttribute('rel', /noopener/);
});

test('the tour shows each card title in order', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Start the tour' })).toBeEnabled({ timeout: 30_000 });
  await page.getByRole('button', { name: 'Start the tour' }).click();
  const title = page.locator('#card-title');
  for (let i = 0; i < TOUR_TITLES.length; i++) {
    if (i > 0) await page.evaluate(() => window.__game.next(1));
    // Let the walk or the flight finish, then the card opens.
    await expect
      .poll(
        async () => {
          await page.evaluate(() => window.__game.advance(1));
          return (await page.locator('#card').isVisible()) ? await title.textContent() : '';
        },
        { timeout: 20_000, message: `stop ${i}` },
      )
      .toBe(TOUR_TITLES[i]);
  }
});

test('?webgl=0 shows the plain list', async ({ page }) => {
  await page.goto('/?webgl=0');
  await expect(page.getByRole('heading', { name: 'Projects', level: 2 })).toBeVisible();
  await expect(page.locator('#list-featured > li')).toHaveCount(LIST_FEATURED);
  await expect(page.locator('#list-earlier > li')).toHaveCount(LIST_EARLIER);
  await expect(page.getByRole('heading', { name: 'Minoscreto' })).toBeVisible();
});

test('?lang=es shows the Spanish Start label', async ({ page }) => {
  await page.goto('/?lang=es');
  await expect(page.getByRole('button', { name: 'Empezar el recorrido' })).toBeVisible();
  await expect(page.locator('.cover').getByRole('link', { name: 'Cómo se prueba este sitio' })).toBeVisible();
});
