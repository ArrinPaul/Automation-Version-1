import { beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import { Role } from '@prisma/client';

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

vi.mock('../middleware/verifyToken', () => {
  return {
    verifyToken: (req: { headers: Record<string, string | undefined>; user?: { id: string; email: string; role: Role; societyId?: string } }, res: { status: (code: number) => { json: (payload: unknown) => unknown } }, next: () => void) => {
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
        societyId: 'f2f4b48a-6cee-4e87-a2f1-b5dc503fdb54',
      };

      next();
    },
  };
});

vi.mock('../repositories/transactionRepository', () => {
  return {
    transactionRepository: {
      findAll: vi.fn().mockResolvedValue([]),
      findById: vi.fn(),
      getBalanceBySociety: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      approve: vi.fn(),
    },
  };
});

import app from '../index';

describe('GET /api/transactions role access isolation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('allows MANAGEMENT to access transaction line items', async () => {
    const response = await request(app)
      .get('/api/transactions')
      .set('Authorization', 'Bearer MANAGEMENT');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.count).toBe(0);
  });

  it('blocks FACULTY_ADVISOR from accessing line items', async () => {
    const response = await request(app)
      .get('/api/transactions')
      .set('Authorization', 'Bearer FACULTY_ADVISOR');

    expect(response.status).toBe(403);
  });

  it('blocks SOCIETY_OB from accessing line items', async () => {
    const response = await request(app)
      .get('/api/transactions')
      .set('Authorization', 'Bearer SOCIETY_OB');

    expect(response.status).toBe(403);
  });

  it('blocks MEMBER from financial routes middleware', async () => {
    const response = await request(app)
      .get('/api/transactions')
      .set('Authorization', 'Bearer MEMBER');

    expect(response.status).toBe(403);
  });
});
