import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.clear());
});

async function seriousViolations(page) {
  const { violations } = await new AxeBuilder({ page }).analyze();
  return violations
    .filter((v) => v.impact === 'serious' || v.impact === 'critical')
    .map((v) => `${v.id} (${v.impact}): ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`);
}

test('cover has no serious or critical axe violations', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Start the tour' })).toBeEnabled({ timeout: 30_000 });
  expect(await seriousViolations(page)).toEqual([]);
});

test('?webgl=0 list has no serious or critical axe violations', async ({ page }) => {
  await page.goto('/?webgl=0');
  await expect(page.locator('#list-featured > li').first()).toBeVisible();
  expect(await seriousViolations(page)).toEqual([]);
});

test('tour HUD with an open card has no serious or critical axe violations', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Start the tour' }).click({ timeout: 30_000 });
  await expect
    .poll(async () => {
      await page.evaluate(() => window.__game.advance(1));
      return page.locator('#card').isVisible();
    })
    .toBe(true);
  expect(await seriousViolations(page)).toEqual([]);
});
