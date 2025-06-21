import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'frontend/playwright-tests',
  exclude: ['**/cypress/**'],
  use: {
    baseURL: 'http://localhost:3000',
    headless: true,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
