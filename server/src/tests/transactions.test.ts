import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';

let mockRole = 'FACULTY_ADVISOR';

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn(),
      signInWithPassword: vi.fn(),
    },
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(),
        getPublicUrl: vi.fn(() => ({ data: { publicUrl: 'http://test.com' } })),
      })),
    },
  })),
}));

vi.mock('../middleware/verifyToken', () => ({
  verifyToken: (req: any, _res: any, next: any) => {
    req.user = {
      id: 'user-1',
      email: 'user@example.com',
      role: mockRole,
      societyId: mockRole === 'MANAGEMENT' ? null : 'society-1',
    };

    next();
  },
}));

vi.mock('../repositories/transactionRepository', () => ({
  transactionRepository: {
    findAll: vi.fn().mockResolvedValue([]),
    getBalanceBySociety: vi.fn().mockResolvedValue(null),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    approve: vi.fn(),
  },
}));

const appPromise = import('../index');

describe('Transaction access control', () => {
  beforeEach(() => {
    mockRole = 'FACULTY_ADVISOR';
  });

  it('blocks society-scoped leaders from viewing transaction line items', async () => {
    const { default: app } = await appPromise;
    const response = await request(app).get('/api/transactions');

    expect(response.status).toBe(403);
    expect(response.body.error).toMatch(/restricted to Management users/i);
  });

  it('allows management to view transaction line items', async () => {
    mockRole = 'MANAGEMENT';

    const { default: app } = await appPromise;
    const response = await request(app).get('/api/transactions');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toEqual([]);
  });
});