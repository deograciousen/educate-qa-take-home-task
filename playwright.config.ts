import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.PRINT_STEPS
    ? [['list', { printSteps: true }], ['html', { open: 'never' }]]
    : 'html',
  use: {
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], baseURL: 'http://127.0.0.1' },
    },
  ],
});
