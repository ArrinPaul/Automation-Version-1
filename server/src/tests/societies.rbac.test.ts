import { beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import { Role, SocietyType } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn(),
    },
  })),
}));

vi.mock('../middleware/verifyToken', () => {
  return {
    verifyToken: (req: any, res: any, next: () => void) => {
      const authorization = req.headers.authorization;

      if (!authorization || !authorization.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing or invalid authorization header' });
      }

      const token = authorization.slice('Bearer '.length).trim().toUpperCase();
      const roleByToken: Record<string, Role> = {
        MANAGEMENT: Role.MANAGEMENT,
        FACULTY_ADVISOR: Role.FACULTY_ADVISOR,
        SOCIETY_OB: Role.SOCIETY_OB,
        MEMBER: Role.MEMBER,
      };

      const resolvedRole = roleByToken[token];
      if (!resolvedRole) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      req.user = {
        id: 'test-user-id',
        email: `${token.toLowerCase()}@ieee.org`,
        role: resolvedRole,
        societyId: 'test-society-id',
      };

      next();
    },
  };
});

const { mockSociety } = vi.hoisted(() => ({
  mockSociety: {
    id: 'test-society-id',
    societyKey: 'TEST_SOC',
    name: 'Test Society',
    shortName: 'TS',
    type: 'TECHNICAL_SOCIETY',
    budget: '1000.00',
    balance: '500.00',
    transactions: [],
  }
}));

vi.mock('../repositories/societyRepository', () => {
  return {
    societyRepository: {
      findAll: vi.fn().mockResolvedValue([mockSociety]),
      findById: vi.fn().mockResolvedValue(mockSociety),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  };
});

import app from '../index';

describe('GET /api/societies RBAC isolation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('allows MANAGEMENT to see full society details including budget', async () => {
    const response = await request(app)
      .get('/api/societies')
      .set('Authorization', 'Bearer MANAGEMENT');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data[0]).toHaveProperty('budget');
    expect(response.body.data[0].budget.toString()).toBe('1000.00');
  });

  it('filters out budget and transactions for FACULTY_ADVISOR', async () => {
    const response = await request(app)
      .get('/api/societies')
      .set('Authorization', 'Bearer FACULTY_ADVISOR');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data[0]).not.toHaveProperty('budget');
    expect(response.body.data[0]).not.toHaveProperty('transactions');
    expect(response.body.data[0]).toHaveProperty('balance');
    expect(response.body.data[0].balance.toString()).toBe('500.00');
  });

  it('filters out budget and transactions for SOCIETY_OB', async () => {
    const response = await request(app)
      .get('/api/societies')
      .set('Authorization', 'Bearer SOCIETY_OB');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data[0]).not.toHaveProperty('budget');
    expect(response.body.data[0]).not.toHaveProperty('transactions');
    expect(response.body.data[0]).toHaveProperty('balance');
  });

  it('blocks MEMBER from accessing financial data', async () => {
    const response = await request(app)
      .get('/api/societies')
      .set('Authorization', 'Bearer MEMBER');

    expect(response.status).toBe(403);
  });
});

describe('GET /api/societies/:id RBAC isolation', () => {
    it('filters out budget for FACULTY_ADVISOR on single record', async () => {
      const response = await request(app)
        .get('/api/societies/test-society-id')
        .set('Authorization', 'Bearer FACULTY_ADVISOR');
  
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).not.toHaveProperty('budget');
      expect(response.body.data).toHaveProperty('balance');
    });
});
