import { expect, test } from '@playwright/test';

test('login shell renders and protected routes redirect to login', async ({ page, request }) => {
  const healthResponse = await request.get('http://127.0.0.1:5000/api/health');

  expect(healthResponse.ok()).toBeTruthy();
  const healthPayload = await healthResponse.json();
  expect(healthPayload.status).toBe('ok');

  await page.goto('/login');

  await expect(page.getByText('Access_Terminal')).toBeVisible();
  await expect(page.getByLabel('Email_Address')).toBeVisible();
  await expect(page.getByLabel('Security_Key')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Establish_Connection' })).toBeVisible();

  await page.goto('/transactions');
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByText('Access_Terminal')).toBeVisible();
});