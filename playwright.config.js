// @ts-check
const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './e2e',
  timeout: 30000,
  retries: 1,

  use: {
    baseURL: 'http://localhost:8081',
    headless: false,      // set to true for CI
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
  ],

  // if the dev server isn't already running, start it automatically
  webServer: {
    command: 'npm run web',
    url: 'http://localhost:8081',
    reuseExistingServer: true,   // reuse if already running
    timeout: 60000,
  },
});
