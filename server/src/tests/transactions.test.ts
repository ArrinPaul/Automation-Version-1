import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { Role } from '@prisma/client';

let mockRole: Role = Role.SOCIETY_FACULTY;

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: { getUser: vi.fn(), signInWithPassword: vi.fn() },
    storage: { from: vi.fn(() => ({ upload: vi.fn(), getPublicUrl: vi.fn(() => ({ data: { publicUrl: 'http://test.com' } })) })) },
  })),
}));

vi.mock('../middleware/verifyToken', () => ({
  verifyToken: (req: any, _res: any, next: any) => {
    req.user = {
      id: 'user-1',
      email: 'user@example.com',
      role: mockRole,
      societyId: (mockRole === Role.SB_FACULTY || mockRole === Role.SB_OB) ? null : 'society-1',
    };
    next();
  },
  SUPER_ADMIN_ROLES: [Role.SB_FACULTY, Role.SB_OB],
  APPROVER_ROLES: [Role.SB_FACULTY, Role.SB_OB, Role.SOCIETY_FACULTY],
  TRANSACTION_CREATE_ROLES: [Role.SB_FACULTY, Role.SB_OB, Role.SOCIETY_FACULTY, Role.SOCIETY_CHAIR],
  SOCIETY_OPS_ROLES: [Role.SB_FACULTY, Role.SB_OB, Role.SOCIETY_FACULTY, Role.SOCIETY_CHAIR, Role.SOCIETY_OB],
  USER_MGMT_ROLES: [Role.SB_FACULTY],
}));

vi.mock('../repositories/transactionRepository', () => ({
  transactionRepository: {
    findAll: vi.fn().mockResolvedValue([]),
    getBalanceBySociety: vi.fn().mockResolvedValue(null),
    create: vi.fn(), update: vi.fn(), delete: vi.fn(), approve: vi.fn(),
  },
}));

const appPromise = import('../index');

describe('Transaction access control', () => {
  beforeEach(() => { mockRole = Role.SOCIETY_FACULTY; });

  it('blocks society-scoped roles from viewing transaction line items', async () => {
    const { default: app } = await appPromise;
    const response = await request(app).get('/api/transactions');
    expect(response.status).toBe(403);
  });

  it('allows SB_FACULTY to view transaction line items', async () => {
    mockRole = Role.SB_FACULTY;
    const { default: app } = await appPromise;
    const response = await request(app).get('/api/transactions');
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toEqual([]);
  });
});
