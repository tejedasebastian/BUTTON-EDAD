const { defineConfig, devices } = require('@playwright/test');

const isLive = Boolean(process.env.BASE_URL);
const baseURL = (process.env.BASE_URL || 'http://127.0.0.1:4181').replace(/\/?$/, '/');

module.exports = defineConfig({
  testDir: './tests/e2e',
  outputDir: 'test-results',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'artifacts/results.json' }],
  ],
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: isLive ? undefined : {
    command: 'npx http-server . -p 4181 -c-1 --silent',
    url: 'http://127.0.0.1:4181',
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
