// Author: Supreeth Kumar K (SKK)
// Project detail page tests. Walks every project link from the homepage and
// verifies each target loads with a header and footer. New project detail pages
// (added in feat/03) inherit this coverage automatically.

const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

test('every project card links to a page that loads', async ({ page }) => {
  await page.goto('/index.html');
  const links = page.locator('.ds-projects-loop a.ds-link-button');
  const count = await links.count();
  expect(count).toBeGreaterThan(0);

  for (let i = 0; i < count; i++) {
    const href = await links.nth(i).getAttribute('href');
    if (!href || href === '#' || href.startsWith('http')) continue;
    const response = await page.request.get(href.startsWith('/') ? href : `/${href}`);
    expect(response.status(), `Project link ${href} returned ${response.status()}`).toBe(200);
  }
});

test('project-1 detail page renders correctly', async ({ page }) => {
  await page.goto('/projects/project-1.html');
  await expect(page).toHaveTitle(/SKK/i);
  await expect(page.locator('.ds-header')).toBeVisible();
  await expect(page.locator('.ds-footer')).toBeVisible();
  await expect(page.locator('main')).toBeVisible();
});

test('project-1 has no critical a11y violations', async ({ page }, testInfo) => {
  await page.goto('/projects/project-1.html');
  await page.waitForLoadState('networkidle');
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();

  await testInfo.attach('axe-violations.json', {
    body: JSON.stringify(results.violations, null, 2),
    contentType: 'application/json'
  });

  const critical = results.violations.filter(v => v.impact === 'critical');
  expect(critical, `Critical a11y on project-1: ${critical.map(v => v.id).join(', ')}`).toEqual([]);
});
