import { beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import { Role } from '@prisma/client';

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({ auth: { getUser: vi.fn() } })),
}));

vi.mock('../middleware/verifyToken', () => {
  return {
    verifyToken: (req: any, res: any, next: () => void) => {
      const authorization = req.headers.authorization;
      if (!authorization?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing or invalid authorization header' });
      }
      const token = authorization.slice('Bearer '.length).trim().toUpperCase();
      const roleByToken: Record<string, Role> = {
        SB_FACULTY: Role.SB_FACULTY,
        SB_OB: Role.SB_OB,
        SOCIETY_FACULTY: Role.SOCIETY_FACULTY,
        SOCIETY_CHAIR: Role.SOCIETY_CHAIR,
        SOCIETY_OB: Role.SOCIETY_OB,
        MEMBER: Role.MEMBER,
      };
      const resolvedRole = roleByToken[token];
      if (!resolvedRole) return res.status(401).json({ error: 'Unauthorized' });
      req.user = { id: 'test-user-id', email: `${token.toLowerCase()}@ieee.org`, role: resolvedRole, societyId: 'test-society-id' };
      next();
    },
    SUPER_ADMIN_ROLES: [Role.SB_FACULTY, Role.SB_OB],
    APPROVER_ROLES: [Role.SB_FACULTY, Role.SB_OB, Role.SOCIETY_FACULTY],
    TRANSACTION_CREATE_ROLES: [Role.SB_FACULTY, Role.SB_OB, Role.SOCIETY_FACULTY, Role.SOCIETY_CHAIR],
    SOCIETY_OPS_ROLES: [Role.SB_FACULTY, Role.SB_OB, Role.SOCIETY_FACULTY, Role.SOCIETY_CHAIR, Role.SOCIETY_OB],
    USER_MGMT_ROLES: [Role.SB_FACULTY],
  };
});

const { mockSociety } = vi.hoisted(() => ({
  mockSociety: {
    id: 'test-society-id', societyKey: 'TEST_SOC', name: 'Test Society', shortName: 'TS',
    type: 'TECHNICAL_SOCIETY', budget: '1000.00', balance: '500.00', transactions: [],
  }
}));

vi.mock('../repositories/societyRepository', () => ({
  societyRepository: {
    findAll: vi.fn().mockResolvedValue([mockSociety]),
    findById: vi.fn().mockResolvedValue(mockSociety),
    create: vi.fn(), update: vi.fn(), delete: vi.fn(),
  },
}));

import app from '../index';

describe('GET /api/societies RBAC isolation', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('allows SB_FACULTY to see full society details including budget', async () => {
    const response = await request(app).get('/api/societies').set('Authorization', 'Bearer SB_FACULTY');
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data[0]).toHaveProperty('budget');
    expect(response.body.data[0].budget.toString()).toBe('1000.00');
  });

  it('filters out budget and transactions for SOCIETY_FACULTY', async () => {
    const response = await request(app).get('/api/societies').set('Authorization', 'Bearer SOCIETY_FACULTY');
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data[0]).not.toHaveProperty('budget');
    expect(response.body.data[0]).not.toHaveProperty('transactions');
    expect(response.body.data[0]).toHaveProperty('balance');
  });

  it('filters out budget and transactions for SOCIETY_OB', async () => {
    const response = await request(app).get('/api/societies').set('Authorization', 'Bearer SOCIETY_OB');
    expect(response.status).toBe(200);
    expect(response.body.data[0]).not.toHaveProperty('budget');
    expect(response.body.data[0]).not.toHaveProperty('transactions');
    expect(response.body.data[0]).toHaveProperty('balance');
  });

  it('blocks MEMBER from accessing financial data', async () => {
    const response = await request(app).get('/api/societies').set('Authorization', 'Bearer MEMBER');
    expect(response.status).toBe(403);
  });
});

describe('GET /api/societies/:id RBAC isolation', () => {
  it('filters out budget for SOCIETY_FACULTY on single record', async () => {
    const response = await request(app).get('/api/societies/test-society-id').set('Authorization', 'Bearer SOCIETY_FACULTY');
    expect(response.status).toBe(200);
    expect(response.body.data).not.toHaveProperty('budget');
    expect(response.body.data).toHaveProperty('balance');
  });
});
