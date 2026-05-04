import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';

const mocked = vi.hoisted(() => {
  const state = {
    user: {
      id: 'user-1',
      email: 'admin@ieee.org',
      name: 'Admin User',
      role: 'SB_FACULTY' as const,
      societyId: null,
      society: null,
    },
  };

  const userRepository = {
    findByIdWithSociety: vi.fn(async () => state.user),
  };

  const auditLogRepository = {
    create: vi.fn(() => new Promise(() => { /* intentionally never resolves */ })),
  };

  const supabase = {
    auth: {
      signInWithPassword: vi.fn(async () => ({
        data: {
          user: { id: state.user.id },
          session: {
            access_token: 'access-token',
            refresh_token: 'refresh-token',
          },
        },
        error: null,
      })),
      admin: {
        updateUserById: vi.fn(() => new Promise(() => { /* intentionally never resolves */ })),
      },
      getUser: vi.fn(),
      onAuthStateChange: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn(),
    },
  };

  return { state, userRepository, auditLogRepository, supabase };
});

vi.mock('../repositories/userRepository', () => ({
  userRepository: mocked.userRepository,
}));

vi.mock('../repositories/auditLogRepository', () => ({
  auditLogRepository: mocked.auditLogRepository,
}));

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => mocked.supabase),
}));

const appPromise = import('../index');

describe('Auth login endpoint', () => {
  beforeEach(() => {
    mocked.userRepository.findByIdWithSociety.mockClear();
    mocked.auditLogRepository.create.mockClear();
    mocked.supabase.auth.signInWithPassword.mockClear();
    mocked.supabase.auth.admin.updateUserById.mockClear();
  });

  it('returns the login response without waiting for metadata sync side effects', async () => {
    const { default: app } = await appPromise;

    const response = await request(app).post('/api/auth/login').send({
      email: 'admin@ieee.org',
      password: 'password123',
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('session');
    expect(response.body).toHaveProperty('user');
    expect(mocked.supabase.auth.admin.updateUserById).toHaveBeenCalledWith('user-1', {
      user_metadata: {
        role: 'SB_FACULTY',
        societyId: null,
        name: 'Admin User',
      },
    });
    expect(mocked.auditLogRepository.create).toHaveBeenCalledWith({
      userId: 'user-1',
      action: 'LOGIN',
      resource: 'AUTH',
      details: { email: 'admin@ieee.org' },
    });
  });
});