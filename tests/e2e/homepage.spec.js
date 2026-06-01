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

  test('hero positions SKK as TPM and Chief Architect', async ({ page }) => {
    await page.goto('/index.html');
    const h1 = page.locator('.ds-banner-hed');
    await expect(h1).toContainText(/Technical Program Manager/i);
    await expect(h1).toContainText(/Chief Architect/i);
  });

  test('hero subtitle names the domain', async ({ page }) => {
    await page.goto('/index.html');
    await expect(page.locator('.ds-banner-sub')).toContainText(/Autonomy|Robotics|AI/i);
  });

  test('resume section copy is TPM / Chief Architect framing', async ({ page }) => {
    await page.goto('/index.html');
    const section = page.locator('.ds-resume-section');
    await expect(section).toContainText(/Technical Program Manager/i);
    await expect(section).toContainText(/Chief Architect/i);
    await expect(section).toContainText(/FedRAMP/i);
    await expect(section).not.toContainText(/Senior Robotics Software Engineer/i);
    await expect(section).not.toContainText(/passionate about building excellent robots/i);
  });

  test('hero tagline is visible and non-empty', async ({ page }) => {
    await page.goto('/index.html');
    const tagline = page.locator('.ds-banner-tagline');
    await expect(tagline).toBeVisible();
    const text = await tagline.textContent();
    expect(text.trim().length).toBeGreaterThan(20);
  });

  test('impact section shows 8 metrics', async ({ page }) => {
    await page.goto('/index.html');
    const grid = page.locator('.ds-impact-grid');
    await expect(grid).toBeVisible();
    const stats = grid.locator('.ds-impact-stat');
    await expect(stats).toHaveCount(8);
  });

  test('impact section sits above the resume section', async ({ page }) => {
    await page.goto('/index.html');
    const impactBox = await page.locator('.ds-impact-section').boundingBox();
    const resumeBox = await page.locator('.ds-resume-section').boundingBox();
    expect(impactBox.y).toBeLessThan(resumeBox.y);
  });

  test('impact section names FedRAMP', async ({ page }) => {
    await page.goto('/index.html');
    await expect(page.locator('.ds-impact-section')).toContainText(/FedRAMP/);
  });

  test('homepage shows 14 unique project cards in the slider', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForFunction(() => {
      const el = document.querySelector('.ds-projects-slider');
      return el && el.classList.contains('slick-initialized');
    });
    const originalCards = page.locator('.slick-slide:not(.slick-cloned) .ds-project-card-link');
    await expect(originalCards).toHaveCount(14);
  });

  test('every project card has a real (non-placeholder) link', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForFunction(() => {
      const el = document.querySelector('.ds-projects-slider');
      return el && el.classList.contains('slick-initialized');
    });
    const links = page.locator('.slick-slide:not(.slick-cloned) .ds-project-card-link');
    const count = await links.count();
    expect(count).toBe(14);
    for (let i = 0; i < count; i++) {
      const href = await links.nth(i).getAttribute('href');
      expect(href).not.toBe('#');
      expect(href).toMatch(/^projects\/[a-z0-9-]+\.html$/);
    }
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

  test('testimonials slider has all 7 entries', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForFunction(() => {
      const el = document.querySelector('.ds-testimonials-slider');
      return el && el.classList.contains('slick-initialized');
    });
    const loops = page.locator('.ds-testimonials-loop:not(.slick-cloned)');
    await expect(loops).toHaveCount(7);
  });

  test('resume link points to local PDF, not Google Drive', async ({ page }) => {
    await page.goto('/index.html');
    const link = page.locator('.ds-download-button');
    await expect(link).toBeVisible();
    const href = await link.getAttribute('href');
    expect(href).toMatch(/\.pdf$/);
    expect(href).not.toMatch(/drive\.google\.com/);
  });

  test('resume PDF returns 200 from the static server', async ({ page }) => {
    await page.goto('/index.html');
    const href = await page.locator('.ds-download-button').getAttribute('href');
    const response = await page.request.get(`/${href}`);
    expect(response.status()).toBe(200);
  });

  test('thought leadership section names CMU MRSD', async ({ page }) => {
    await page.goto('/index.html');
    const section = page.locator('.ds-leadership-section');
    await expect(section).toBeVisible();
    await expect(section).toContainText(/Carnegie Mellon/i);
    await expect(section).toContainText(/MRSD/i);
  });

  test('thought leadership section names NYU NSF', async ({ page }) => {
    await page.goto('/index.html');
    const section = page.locator('.ds-leadership-section');
    await expect(section).toContainText(/New York University|NYU/i);
    await expect(section).toContainText(/NSF/i);
  });

  test('thought leadership sits between projects and testimonials', async ({ page }) => {
    await page.goto('/index.html');
    const projectsBox = await page.locator('.ds-projects-section').boundingBox();
    const leadershipBox = await page.locator('.ds-leadership-section').boundingBox();
    const testimonialsBox = await page.locator('.ds-testimonials-section').boundingBox();
    expect(leadershipBox.y).toBeGreaterThan(projectsBox.y);
    expect(leadershipBox.y).toBeLessThan(testimonialsBox.y);
  });

  test('mission section shows 3 strategic impact cards', async ({ page }) => {
    await page.goto('/index.html');
    const section = page.locator('.ds-mission-section');
    await expect(section).toBeVisible();
    const cards = section.locator('.ds-mission-card');
    await expect(cards).toHaveCount(3);
  });

  test('mission section names FedRAMP and the Air Force', async ({ page }) => {
    await page.goto('/index.html');
    const section = page.locator('.ds-mission-section');
    await expect(section).toContainText(/FedRAMP/);
    await expect(section).toContainText(/Air Force/i);
  });

  test('recognition section shows 3 cards', async ({ page }) => {
    await page.goto('/index.html');
    const section = page.locator('.ds-recognition-section');
    await expect(section).toBeVisible();
    await expect(section.locator('.ds-recognition-card')).toHaveCount(3);
  });

  test('recognition section names ASCE and NSF', async ({ page }) => {
    await page.goto('/index.html');
    const section = page.locator('.ds-recognition-section');
    await expect(section).toContainText(/ASCE CRC2020/);
    await expect(section).toContainText(/NSF/);
  });

  test('recognition GitHub CTA opens in a new tab with noopener', async ({ page }) => {
    await page.goto('/index.html');
    const cta = page.locator('.ds-recognition-cta');
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute('target', '_blank');
    await expect(cta).toHaveAttribute('rel', /noopener/);
    await expect(cta).toHaveAttribute('href', /github\.com\/supreethk6/);
  });

  test('recognition section sits between testimonials and contact', async ({ page }) => {
    await page.goto('/index.html');
    const testimonialsBox = await page.locator('.ds-testimonials-section').boundingBox();
    const recognitionBox = await page.locator('.ds-recognition-section').boundingBox();
    const contactBox = await page.locator('.ds-contact-section').boundingBox();
    expect(recognitionBox.y).toBeGreaterThan(testimonialsBox.y);
    expect(recognitionBox.y).toBeLessThan(contactBox.y);
  });

  test('contact section shows pro email, phone, and Cal.com link', async ({ page }) => {
    await page.goto('/index.html');
    const section = page.locator('.ds-contact-section');
    await expect(section).toBeVisible();

    const emailLink = section.locator('a[href^="mailto:"]');
    await expect(emailLink).toHaveAttribute('href', 'mailto:supreethk666@gmail.com');

    const phoneLink = section.locator('a[href^="tel:"]');
    await expect(phoneLink).toHaveAttribute('href', /tel:\+16469323263/);

    const calLink = section.locator('a[href*="cal.com/supreeth-kumar-k"]');
    await expect(calLink).toBeVisible();
    await expect(calLink).toHaveAttribute('target', '_blank');
    await expect(calLink).toHaveAttribute('rel', /noopener/);
  });

  test('no NYU student email anywhere on the page', async ({ page }) => {
    await page.goto('/index.html');
    const html = await page.content();
    expect(html).not.toMatch(/supreeth\.kumar@nyu\.edu/i);
  });

  test('mission section sits after thought leadership and before testimonials', async ({ page }) => {
    await page.goto('/index.html');
    const leadershipBox = await page.locator('.ds-leadership-section').boundingBox();
    const missionBox = await page.locator('.ds-mission-section').boundingBox();
    const testimonialsBox = await page.locator('.ds-testimonials-section').boundingBox();
    expect(missionBox.y).toBeGreaterThan(leadershipBox.y);
    expect(missionBox.y).toBeLessThan(testimonialsBox.y);
  });

  test('last-updated stamp is visible and current', async ({ page }) => {
    await page.goto('/index.html');
    const stamp = page.locator('.ds-resume-updated');
    await expect(stamp).toBeVisible();
    await expect(stamp).toContainText(/last updated/i);
    await expect(stamp).toContainText(/202[5-9]|203\d/);
  });

  test('first testimonial in original DOM order is Hen-You Tan', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForFunction(() => {
      const el = document.querySelector('.ds-testimonials-slider');
      return el && el.classList.contains('slick-initialized');
    });
    const first = page.locator('.ds-testimonials-loop[data-slick-index="0"]');
    await expect(first).toContainText(/Hen-You Tan/i);
  });

  test('footer renders with copyright', async ({ page }) => {
    await page.goto('/index.html');
    const footer = page.locator('.ds-footer');
    await expect(footer).toBeVisible();
    await expect(footer).toContainText(/copyright/i);
  });
});

test.describe('Homepage — accessibility (axe)', () => {
  test('has no serious or critical WCAG 2.1 AA violations', async ({ page }, testInfo) => {
    await page.goto('/index.html');
    await page.waitForLoadState('networkidle');

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .exclude('iframe')
      .analyze();

    const blocking = results.violations.filter(
      v => v.impact === 'serious' || v.impact === 'critical'
    );

    await testInfo.attach('axe-violations.json', {
      body: JSON.stringify(results.violations, null, 2),
      contentType: 'application/json'
    });

    expect(blocking, `Blocking a11y violations: ${blocking.map(v => v.id).join(', ')}`).toEqual([]);
  });

  test('no stale _blanck typo anywhere in markup', async ({ page }) => {
    await page.goto('/index.html');
    const count = await page.locator('[target="_blanck"]').count();
    expect(count).toBe(0);
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
      // Slick's negative-margin trick can add ~2px on the gutter. Body has
      // overflow-x: hidden so this is not user-visible — small tolerance.
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 8);
    });
  }
});
