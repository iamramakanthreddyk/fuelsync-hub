import { test, expect } from '@playwright/test';

test.describe.serial('Owner CRUD flow', () => {
  const timestamp = Date.now();
  const stationName = `Playwright Station ${timestamp}`;
  const stationNameUpdated = `${stationName} Updated`;
  const pumpName = `Pump ${timestamp}`;
  const pumpNameUpdated = `${pumpName} Updated`;

  let stationId: string;
  let pumpId: string;
  let nozzleId: string;

  test('full owner journey', async ({ page }) => {
    // Login as owner
    await page.goto('/login');
    await page.fill('input[name="email"]', 'owner@demofuel.com');
    await page.fill('input[name="password"]', 'password123');
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForURL(/dashboard|stations/);

    // ===== Stations =====
    await page.goto('/stations');
    await page.click('text=Add Station');
    await page.fill('input[name="name"]', stationName);
    const [createStation] = await Promise.all([
      page.waitForResponse(r => r.url().includes('/stations') && r.request().method() === 'POST'),
      page.click('button:has-text("Create Station")')
    ]);
    const stationData = await createStation.json();
    stationId = stationData.data?.id || stationData.id?.toString();
    await expect(page).toHaveURL(/\/stations$/);
    await expect(page.locator(`text=${stationName}`)).toBeVisible();

    // Edit station
    await page.locator(`tr:has-text("${stationName}") >> text=Edit`).click();
    await expect(page).toHaveURL(/\/stations\/\d+\/edit/);
    await page.fill('input[name="name"]', stationNameUpdated);
    await Promise.all([
      page.waitForResponse(r => r.url().match(/\/stations\/\d+/) && r.request().method() === 'PUT'),
      page.click('button:has-text("Save Changes")')
    ]);
    await expect(page).toHaveURL(/\/stations\/\d+/);
    await page.goto('/stations');
    await expect(page.locator(`text=${stationNameUpdated}`)).toBeVisible();

    // ===== Pumps =====
    await page.goto(`/stations/${stationId}/pumps`);
    await page.click('text=Add Pump');
    await page.fill('input[name="name"]', pumpName);
    const [createPump] = await Promise.all([
      page.waitForResponse(r => r.url().includes('/pumps') && r.request().method() === 'POST'),
      page.click('button:has-text("Add Pump")')
    ]);
    const pumpData = await createPump.json();
    pumpId = pumpData.data?.id || pumpData.id?.toString();
    await expect(page).toHaveURL(`/stations/${stationId}/pumps`);
    await expect(page.locator(`text=${pumpName}`)).toBeVisible();

    // Edit pump
    await page.locator(`text=${pumpName}`).locator('..').locator('text=Edit').click();
    await expect(page).toHaveURL(new RegExp(`/stations/${stationId}/pumps/\\d+/edit`));
    await page.fill('input[name="name"]', pumpNameUpdated);
    await Promise.all([
      page.waitForResponse(r => r.url().includes(`/pumps/${pumpId}`) && r.request().method() === 'PATCH'),
      page.click('button:has-text("Update Pump")')
    ]);
    await expect(page).toHaveURL(`/stations/${stationId}/pumps`);
    await expect(page.locator(`text=${pumpNameUpdated}`)).toBeVisible();

    // ===== Nozzles =====
    await page.locator(`text=${pumpNameUpdated}`).locator('..').locator('text=Add Nozzle').click();
    await expect(page).toHaveURL(new RegExp(`/stations/${stationId}/pumps/${pumpId}/nozzles/new`));
    await page.selectOption('select[name="fuelType"]', 'diesel');
    await page.fill('input[name="initialReading"]', '0');
    const [createNozzle] = await Promise.all([
      page.waitForResponse(r => r.url().includes('/nozzles') && r.request().method() === 'POST'),
      page.click('button:has-text("Add Nozzle")')
    ]);
    const nozzleData = await createNozzle.json();
    nozzleId = nozzleData.data?.id || nozzleData.id?.toString();
    await expect(page).toHaveURL(new RegExp(`/stations/${stationId}/pumps/${pumpId}/nozzles`));
    await expect(page.locator('text=DIESEL')).toBeVisible();

    // Edit nozzle
    await page.locator('text=DIESEL').locator('..').locator('text=Edit').click();
    await expect(page).toHaveURL(new RegExp(`/stations/${stationId}/pumps/${pumpId}/nozzles/\\d+/edit`));
    await page.selectOption('select[name="fuelType"]', 'petrol');
    await Promise.all([
      page.waitForResponse(r => r.url().includes(`/nozzles/${nozzleId}`) && r.request().method() === 'PATCH'),
      page.click('button:has-text("Update Nozzle")')
    ]);
    await expect(page).toHaveURL(new RegExp(`/stations/${stationId}/pumps/${pumpId}/nozzles`));
    await expect(page.locator('text=PETROL')).toBeVisible();

    // ===== Sales =====
    await page.goto('/sales/new');
    await page.selectOption('#station-select', stationId);
    await page.selectOption('#pump-select', pumpId);
    await page.selectOption('#nozzle-select', nozzleId);
    await page.fill('input[name="sale_volume"]', '5');
    await page.fill('input[name="fuel_price"]', '3');
    await Promise.all([
      page.waitForResponse(r => r.url().includes('/sales') && r.request().method() === 'POST'),
      page.click('button:has-text("Record Sale")')
    ]);
    await expect(page).toHaveURL('/sales');
    await expect(page.locator('text=Record Sale')).not.toBeVisible();

    // ===== Clean up pump and station =====
    await page.goto(`/stations/${stationId}/pumps`);
    page.once('dialog', d => d.accept());
    await Promise.all([
      page.waitForResponse(r => r.url().includes(`/pumps/${pumpId}`) && r.request().method() === 'DELETE'),
      page.locator(`text=${pumpNameUpdated}`).locator('..').locator('text=Delete').click()
    ]);
    await expect(page.locator(`text=${pumpNameUpdated}`)).not.toBeVisible();

    await page.goto(`/stations/${stationId}`);
    page.once('dialog', d => d.accept());
    await Promise.all([
      page.waitForResponse(r => r.url().includes(`/stations/${stationId}`) && r.request().method() === 'DELETE'),
      page.locator('button:has-text("Delete")').click()
    ]);
    await expect(page).toHaveURL('/stations');
    await expect(page.locator(`text=${stationNameUpdated}`)).not.toBeVisible();
  });
});

test('superadmin tenants page', async ({ page }) => {
  await page.goto('/admin/login');
  await page.fill('input[name="email"]', 'superadmin@fuelsync.com');
  await page.fill('input[name="password"]', 'password123');
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL(/admin\/dashboard/);
  await page.goto('/admin/tenants');
  await expect(page.locator('text=Tenant Management')).toBeVisible();
});
