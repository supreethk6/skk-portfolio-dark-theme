// Author: Supreeth Kumar K (SKK)
// Integration tests — exercise the site like a real visitor: nav, scroll, slider, deep-link.

const { test, expect } = require('@playwright/test');

test('project detail navigation works (URL-based, robust to overlay)', async ({ page }) => {
  await page.goto('/index.html');
  const firstProjectLink = page.locator('.ds-projects-loop a.ds-link-button').first();
  const href = await firstProjectLink.getAttribute('href');
  if (!href || href === '#' || href.startsWith('http')) {
    test.skip(true, 'No internal project link to follow');
    return;
  }
  await page.goto(`/${href}`);
  await page.waitForLoadState('domcontentloaded');
  await expect(page.locator('main').first()).toBeVisible();
  await page.goBack();
  await expect(page.locator('.ds-banner')).toBeVisible();
});

test('logo links back to homepage from project page', async ({ page }) => {
  await page.goto('/projects/project-1.html');
  const logo = page.locator('.ds-logo a');
  const href = await logo.getAttribute('href');
  expect(href).toMatch(/index\.html$/);
});

test('testimonials slider has navigation controls after init', async ({ page }) => {
  await page.goto('/index.html');
  await page.waitForFunction(() => {
    const el = document.querySelector('.ds-testimonials-slider');
    return el && el.classList.contains('slick-initialized');
  }, { timeout: 10000 });
  await expect(page.locator('.ds-testimonials-slider .slick-arrow').first()).toBeVisible();
});

test('no JavaScript errors on page load', async ({ page }) => {
  const errors = [];
  page.on('pageerror', err => errors.push(err.message));
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  await page.goto('/index.html');
  await page.waitForLoadState('networkidle');
  const blocking = errors.filter(e =>
    !e.includes('favicon') && !e.toLowerCase().includes('aos')
  );
  expect(blocking, `Console errors: ${blocking.join('; ')}`).toEqual([]);
});
