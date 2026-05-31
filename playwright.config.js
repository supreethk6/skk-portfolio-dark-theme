// Author: Supreeth Kumar K (SKK)
// Playwright E2E config for skk-portfolio-dark-theme.
// Spins up a local static server, runs tests across desktop + mobile viewports.

const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: process.env.PW_BASE_URL || 'http://localhost:8080',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  projects: [
    { name: 'desktop-chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'desktop-firefox',  use: { ...devices['Desktop Firefox'],  viewport: { width: 1440, height: 900 } } },
    { name: 'mobile-iphone',    use: { ...devices['iPhone 13'] } },
    { name: 'tablet-ipad',      use: { ...devices['iPad Pro 11'] } }
  ],
  webServer: {
    command: 'npm run serve',
    url: 'http://localhost:8080',
    reuseExistingServer: !process.env.CI,
    timeout: 30000
  }
});
