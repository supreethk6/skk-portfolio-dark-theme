// Author: Supreeth Kumar K (SKK)
// Integration tests — exercise the site like a real visitor: nav, scroll, slider, deep-link.

const { test, expect } = require('@playwright/test');

test('project detail navigation works', async ({ page }) => {
  await page.goto('/index.html');
  await page.waitForFunction(() => {
    const el = document.querySelector('.ds-projects-slider');
    return el && el.classList.contains('slick-initialized');
  });
  const firstProjectLink = page.locator('.slick-slide:not(.slick-cloned) .ds-project-card-link').first();
  await firstProjectLink.click();
  await page.waitForLoadState('domcontentloaded');
  await expect(page.locator('main').first()).toBeVisible();
  await page.goBack();
  await expect(page.locator('.ds-banner')).toBeVisible();
});

test('logo links back to homepage from project page', async ({ page }) => {
  await page.goto('/projects/k7.html');
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
