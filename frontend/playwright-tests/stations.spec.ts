import { test, expect } from '@playwright/test';

test.describe('Stations CRUD', () => {
  test('login and manage station', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    await page.fill('input[name="email"]', 'owner@demofuel.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    // wait for dashboard redirect then navigate to stations page
    await page.waitForURL('**/dashboard');
    await page.goto('http://localhost:3000/stations');

    // create station
    await page.click('text=Add Station');
    await page.fill('input[name="name"]', 'Test Station');
    await page.click('text=Create Station');

    await expect(page.locator('text=Stations')).toBeVisible();
    await expect(page.locator('text=Test Station')).toBeVisible();

    // edit station
    const row = page.locator('tr', { hasText: 'Test Station' });
    await row.locator('text=Edit').click();
    await page.fill('input[name="name"]', 'Updated Station');
    await page.click('text=Update Station');

    // redirected to station detail page
    await page.waitForURL(/\/stations\/\d+/);
    await expect(page.locator('text=Updated Station')).toBeVisible();

    // delete station
    page.once('dialog', dialog => dialog.accept());
    await page.click('text=Delete');

    await page.waitForURL('**/stations');
    await expect(page.locator('text=Updated Station')).not.toBeVisible();
  });
});
