// Author: Supreeth Kumar K (SKK)
// Project detail page tests. Walks every project card on the homepage,
// asserts each links to a real detail page, and runs an axe scan on each
// detail page (iframes excluded — see iframe-exclude rationale in fix/07).

const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

const PROJECTS = [
  { slug: 'k7',                       titlePattern: /K7/i },
  { slug: 'k5',                       titlePattern: /K5/i },
  { slug: 'fedramp',                  titlePattern: /FedRAMP/i },
  { slug: 'icm-acm',                  titlePattern: /ICM|ACM/i },
  { slug: 'charging',                 titlePattern: /Charging/i },
  { slug: 'aeb',                      titlePattern: /Braking|AEB/i },
  { slug: 'driver-monitoring',        titlePattern: /Driver|Monitoring/i },
  { slug: 'synthetic-data-detection', titlePattern: /Synthetic|Detection/i },
  { slug: 'mobile-3d-printing',       titlePattern: /3D|Printing/i },
  { slug: 'swarm-robotics',           titlePattern: /Swarm/i },
  { slug: 'pharmautomate',            titlePattern: /Pharm/i },
  { slug: 'smart-irrigation',         titlePattern: /Irrigation/i },
  { slug: 'fly-m',                    titlePattern: /F\.L\.Y\.-m|Drop/i },
  { slug: 'project-1',                titlePattern: /LFR|Line Following/i }
];

test('homepage shows 14 unique project cards', async ({ page }) => {
  await page.goto('/index.html');
  // Slick clones slides for infinite scroll. Filter clones via .slick-cloned
  // on the parent slide wrapper to count original cards only.
  const originalCards = page.locator('.slick-slide:not(.slick-cloned) .ds-project-card-link');
  await page.waitForFunction(() => {
    const el = document.querySelector('.ds-projects-slider');
    return el && el.classList.contains('slick-initialized');
  });
  await expect(originalCards).toHaveCount(14);
});

test('every project card on the homepage points to a real detail page', async ({ page }) => {
  await page.goto('/index.html');
  await page.waitForFunction(() => {
    const el = document.querySelector('.ds-projects-slider');
    return el && el.classList.contains('slick-initialized');
  });
  const originalCards = page.locator('.slick-slide:not(.slick-cloned) .ds-project-card-link');
  const count = await originalCards.count();
  for (let i = 0; i < count; i++) {
    const href = await originalCards.nth(i).getAttribute('href');
    expect(href).not.toBe('#');
    expect(href).toMatch(/^projects\/[a-z0-9-]+\.html$/);
    const response = await page.request.get(`/${href}`);
    expect(response.status(), `Project link ${href} returned ${response.status()}`).toBe(200);
  }
});

test('projects slider has prev and next arrows', async ({ page }) => {
  await page.goto('/index.html');
  await page.waitForFunction(() => {
    const el = document.querySelector('.ds-projects-slider');
    return el && el.classList.contains('slick-initialized');
  });
  await expect(page.locator('.ds-projects-slider .slick-prev')).toBeVisible();
  await expect(page.locator('.ds-projects-slider .slick-next')).toBeVisible();
});

for (const { slug, titlePattern } of PROJECTS) {
  test(`${slug} detail page renders with correct title`, async ({ page }) => {
    await page.goto(`/projects/${slug}.html`);
    const titleLocator = slug === 'project-1'
      ? page.locator('main').getByRole('heading', { level: 1 }).first()
      : page.locator('h1.ds-project-title');
    await expect(titleLocator).toBeVisible();
    await expect(titleLocator).toContainText(titlePattern);
    await expect(page.locator('footer.ds-footer')).toBeVisible();
  });

  test(`${slug} detail page has no critical a11y violations`, async ({ page }, testInfo) => {
    await page.goto(`/projects/${slug}.html`);
    await page.waitForLoadState('networkidle');
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .exclude('iframe')
      .analyze();

    await testInfo.attach('axe-violations.json', {
      body: JSON.stringify(results.violations, null, 2),
      contentType: 'application/json'
    });

    const critical = results.violations.filter(v => v.impact === 'critical');
    expect(critical, `Critical a11y on ${slug}: ${critical.map(v => v.id).join(', ')}`).toEqual([]);
  });
}

test('detail page back link returns to homepage', async ({ page }) => {
  await page.goto('/projects/k7.html');
  const backLink = page.locator('.ds-project-back');
  await expect(backLink).toBeVisible();
  await expect(backLink).toHaveAttribute('href', '../index.html');
});
