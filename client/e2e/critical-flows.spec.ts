import { expect, test, type Page } from '@playwright/test';

type Role = 'MANAGEMENT' | 'FACULTY_ADVISOR' | 'SOCIETY_OB' | 'MEMBER';

const supabaseStorageKey = 'sb-localhost-auth-token';

const seedAuth = async (page: Page, role: Role, email: string, profileOverrides: Record<string, unknown> = {}) => {
  await page.context().addInitScript(
    ({ authState }) => {
      const state = authState as Record<string, unknown>;
      (globalThis as typeof globalThis & { __E2E_AUTH_STATE__?: Record<string, unknown> }).__E2E_AUTH_STATE__ = state;
    },
    {
      authState: {
        user: {
          id: `user-${role.toLowerCase()}`,
          aud: 'authenticated',
          role: 'authenticated',
          email,
          app_metadata: {},
          user_metadata: { role },
          created_at: new Date().toISOString(),
        },
        profile: {
          id: `profile-${role.toLowerCase()}`,
          email,
          name: `${role} User`,
          role,
          societyId: role === 'MANAGEMENT' ? null : 'soc-1',
          ...profileOverrides,
        },
      },
    }
  );
};

const mockTransactions = async (page: Page, transactions: Array<Record<string, unknown>>) => {
  await page.route('**/api/transactions', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(transactions),
    });
  });
};

const mockAuthMe = async (page: Page, profile: Record<string, unknown>) => {
  await page.route('**/api/auth/me', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(profile),
    });
  });
};

const mockEvents = async (page: Page, events: Array<Record<string, unknown>>) => {
  await page.route('**/api/events', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(events),
    });
  });
};

const mockFinancialCsv = async (page: Page, csv: string) => {
  await page.route('**/api/reports/financial-csv', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'text/csv',
      body: csv,
    });
  });
};

test('redirects non-management users away from transactions', async ({ page }) => {
  const browser = page.context().browser();
  const context = await browser.newContext();
  await context.addInitScript(
    ({ authState }) => {
      const state = authState as Record<string, unknown>;
      (globalThis as typeof globalThis & { __E2E_AUTH_STATE__?: Record<string, unknown> }).__E2E_AUTH_STATE__ = state;
    },
    {
      authState: {
        user: {
          id: `user-member`,
          aud: 'authenticated',
          role: 'authenticated',
          email: 'member@ieee.test',
          app_metadata: {},
          user_metadata: { role: 'MEMBER' },
          created_at: new Date().toISOString(),
        },
        profile: {
          id: `profile-member`,
          email: 'member@ieee.test',
          name: `MEMBER User`,
          role: 'MEMBER',
          societyId: 'soc-1',
        },
      },
    }
  );

  const newPage = await context.newPage();
  await mockAuthMe(newPage, {
    id: 'profile-member',
    email: 'member@ieee.test',
    name: 'MEMBER User',
    role: 'MEMBER',
    societyId: 'soc-1',
  });
  await mockEvents(newPage, []);

  await newPage.goto('/transactions');
  await expect(newPage).toHaveURL(/\/events$/);
  await expect(newPage.getByText('Events_Module')).toBeVisible();
  await context.close();
});

test('lets management users view the transaction ledger', async ({ page }) => {
  const browser = page.context().browser();
  const context = await browser.newContext();
  await context.addInitScript(
    ({ authState }) => {
      const state = authState as Record<string, unknown>;
      (globalThis as typeof globalThis & { __E2E_AUTH_STATE__?: Record<string, unknown> }).__E2E_AUTH_STATE__ = state;
    },
    {
      authState: {
        user: {
          id: `user-management`,
          aud: 'authenticated',
          role: 'authenticated',
          email: 'management@ieee.test',
          app_metadata: {},
          user_metadata: { role: 'MANAGEMENT' },
          created_at: new Date().toISOString(),
        },
        profile: {
          id: `profile-management`,
          email: 'management@ieee.test',
          name: `MANAGEMENT User`,
          role: 'MANAGEMENT',
          societyId: null,
        },
      },
    }
  );

  const newPage = await context.newPage();

  const managementTransactions = [
    {
      id: 'tx-1',
      date: '2026-04-12T10:00:00.000Z',
      description: 'Sponsorship grant',
      category: 'Grant',
      type: 'INCOME',
      amount: '15000',
      society: { shortName: 'IEEE' },
    },
  ];

  await mockAuthMe(newPage, {
    id: 'profile-management',
    email: 'management@ieee.test',
    name: 'MANAGEMENT User',
    role: 'MANAGEMENT',
    societyId: null,
  });
  await mockTransactions(newPage, managementTransactions);

  await newPage.goto('/transactions');
  await expect(newPage.getByRole('heading', { name: 'Financial_Ledger' })).toBeVisible();
  await expect(newPage.getByText('Sponsorship grant')).toBeVisible();
  await context.close();
});

test('downloads event and financial reports, and prints quarterly statement', async ({ page }) => {
  const browser = page.context().browser();
  const context = await browser.newContext();
  await context.addInitScript(
    ({ authState }) => {
      const state = authState as Record<string, unknown>;
      (globalThis as typeof globalThis & { __E2E_AUTH_STATE__?: Record<string, unknown> }).__E2E_AUTH_STATE__ = state;
    },
    {
      authState: {
        user: {
          id: `user-management`,
          aud: 'authenticated',
          role: 'authenticated',
          email: 'management@ieee.test',
          app_metadata: {},
          user_metadata: { role: 'MANAGEMENT' },
          created_at: new Date().toISOString(),
        },
        profile: {
          id: `profile-management`,
          email: 'management@ieee.test',
          name: `MANAGEMENT User`,
          role: 'MANAGEMENT',
          societyId: null,
        },
      },
    }
  );

  const newPage = await context.newPage();

  const transactions = [
    {
      id: 'tx-1',
      date: '2026-04-12T10:00:00.000Z',
      description: 'Annual sponsorship',
      category: 'Grant',
      type: 'INCOME',
      amount: '15000',
      status: 'APPROVED',
      society: { shortName: 'IEEE' },
    },
    {
      id: 'tx-2',
      date: '2026-04-14T10:00:00.000Z',
      description: 'Event logistics',
      category: 'Operations',
      type: 'EXPENSE',
      amount: '2500',
      status: 'APPROVED',
      society: { shortName: 'IEEE' },
    },
  ];

  const events = [
    {
      id: 'event-1',
      title: 'Audit Night 2026',
      date: '2026-04-12T10:00:00.000Z',
      time: '18:00',
      venue: 'Main Hall',
      type: 'TECH_TALK',
      participants: 120,
      description: 'A reporting walkthrough with speakers and archived visuals.',
      society: { shortName: 'IEEE', name: 'IEEE Student Branch' },
      speakers: [{ id: 'sp-1', name: 'Dr. Example', designation: 'Advisor', organization: 'IEEE' }],
      imageUrls: [],
    },
  ];

  await mockAuthMe(newPage, {
    id: 'profile-management',
    email: 'management@ieee.test',
    name: 'MANAGEMENT User',
    role: 'MANAGEMENT',
    societyId: null,
  });
  await mockTransactions(newPage, transactions);
  await mockEvents(newPage, events);
  await mockFinancialCsv(newPage, 'date,amount\n2026-04-12,15000\n2026-04-14,-2500\n');

  await newPage.goto('/events');
  await expect(newPage.getByText('Events_Module')).toBeVisible();
  const pdfDownload = newPage.waitForEvent('download');
  await newPage.getByRole('button', { name: 'Export Event PDF' }).click();
  const eventDownload = await pdfDownload;
  expect(eventDownload.suggestedFilename()).toContain('event-report-audit-night-2026-2026-04-12.pdf');

  await newPage.goto('/reports/financial');
  const csvDownload = newPage.waitForEvent('download');
  await newPage.getByRole('button', { name: 'Export Financial CSV' }).click();
  const financialDownload = await csvDownload;
  expect(financialDownload.suggestedFilename()).toMatch(/financial-export-\d{4}-\d{2}-\d{2}\.csv/);
  await expect(newPage.getByText('Total Income')).toBeVisible();
  await expect(newPage.getByText('₹15,000.00').first()).toBeVisible();

  await newPage.context().addInitScript(() => {
    (globalThis as typeof globalThis & { __printCalled?: boolean }).__printCalled = false;
    globalThis.print = () => {
      (globalThis as typeof globalThis & { __printCalled?: boolean }).__printCalled = true;
    };
  });

  await newPage.goto('/reports/quarterly-print');
  await newPage.getByRole('button', { name: 'Print Statement' }).click();
  await expect.poll(async () => newPage.evaluate(() => (globalThis as typeof globalThis & { __printCalled?: boolean }).__printCalled)).toBeTruthy();
  await context.close();
});

test('accepts e2e upload requests through the server upload route', async ({ request }) => {
  const response = await request.post('http://127.0.0.1:5000/api/upload', {
    headers: {
      authorization: 'Bearer e2e-token',
      'x-e2e-user-role': 'MANAGEMENT',
      'x-e2e-user-id': 'management-upload-user',
      'x-e2e-user-email': 'management@ieee.test',
    },
    multipart: {
      file: {
        name: 'logo.png',
        mimeType: 'image/png',
        buffer: Buffer.from('fake-png-content'),
      },
      type: 'logo',
      societyId: 'soc-1',
    },
  });

  expect(response.ok()).toBeTruthy();
  const payload = await response.json();
  expect(payload.url).toContain('/supabase/branding/societies/soc-1/logo-');
});