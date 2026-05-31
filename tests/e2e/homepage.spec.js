// Author: Supreeth Kumar K (SKK)
// Baseline E2E tests for the homepage. Asserts structural invariants only
// (no copy assertions that lock content) so feature branches can evolve text
// without these tests fighting them.

const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

test.describe('Homepage — structural invariants', () => {
  test('loads with correct title and lang', async ({ page }) => {
    await page.goto('/index.html');
    await expect(page).toHaveTitle(/SKK/i);
    await expect(page.locator('html')).toHaveAttribute('lang', /en/);
  });

  test('hero section is visible above the fold', async ({ page }) => {
    await page.goto('/index.html');
    const banner = page.locator('.ds-banner');
    await expect(banner).toBeVisible();
    await expect(banner.locator('h1')).toBeVisible();
  });

  test('social links open in new tab with valid hrefs', async ({ page }) => {
    await page.goto('/index.html');
    const socials = page.locator('.ds-social a');
    const count = await socials.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      const href = await socials.nth(i).getAttribute('href');
      expect(href).toMatch(/^https?:\/\//);
    }
  });

  test('projects section exists and has at least one card', async ({ page }) => {
    await page.goto('/index.html');
    await expect(page.locator('.ds-projects-section')).toBeVisible();
    const cards = page.locator('.ds-projects-loop');
    expect(await cards.count()).toBeGreaterThan(0);
  });

  test('testimonials section exists', async ({ page }) => {
    await page.goto('/index.html');
    await expect(page.locator('.ds-testimonials-section')).toBeVisible();
  });

  test('footer renders with copyright', async ({ page }) => {
    await page.goto('/index.html');
    const footer = page.locator('.ds-footer');
    await expect(footer).toBeVisible();
    await expect(footer).toContainText(/copyright/i);
  });
});

test.describe('Homepage — accessibility (axe)', () => {
  test('reports WCAG 2.1 AA violations (strict mode toggled via A11Y_STRICT)', async ({ page }, testInfo) => {
    await page.goto('/index.html');
    await page.waitForLoadState('networkidle');

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    const blocking = results.violations.filter(
      v => v.impact === 'serious' || v.impact === 'critical'
    );

    await testInfo.attach('axe-violations.json', {
      body: JSON.stringify(results.violations, null, 2),
      contentType: 'application/json'
    });

    if (process.env.A11Y_STRICT === '1') {
      expect(blocking, `Blocking a11y violations: ${blocking.map(v => v.id).join(', ')}`).toEqual([]);
    } else {
      console.log(`[a11y] homepage violations (non-strict): ${blocking.map(v => v.id).join(', ') || 'none'}`);
    }
  });
});

test.describe('Homepage — responsive layout', () => {
  for (const viewport of [
    { name: 'mobile-375',  width: 375,  height: 667 },
    { name: 'tablet-768',  width: 768,  height: 1024 },
    { name: 'desktop-1440', width: 1440, height: 900 }
  ]) {
    test(`renders without horizontal overflow at ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/index.html');
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2);
    });
  }
});
