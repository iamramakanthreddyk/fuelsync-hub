import { test, expect } from '@playwright/test';

// Simple sanity check that a blank page opens

test('opens a blank page', async ({ page }) => {
  await page.goto('about:blank');
  await expect(page).toHaveTitle('');
});
