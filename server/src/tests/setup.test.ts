import { beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';

type MockUser = {
  id: string;
  email: string;
  name: string;
  role: 'MANAGEMENT';
  societyId: null;
};

const mocked = vi.hoisted(() => {
  const state = {
    users: [] as MockUser[],
  };

  const userRepository = {
    findAll: vi.fn(async () => state.users),
    createWithExternalId: vi.fn(async (data: {
      id: string;
      email: string;
      name: string;
      role: 'MANAGEMENT';
      societyId: null;
    }) => {
      const created: MockUser = {
        id: data.id,
        email: data.email,
        name: data.name,
        role: data.role,
        societyId: data.societyId,
      };
      state.users.push(created);
      return created;
    }),
  };

  const supabase = {
    auth: {
      admin: {
        createUser: vi.fn(async ({ email, password }: { email: string; password: string }) => {
          if (email === 'exists@ieee.org') {
            return {
              data: { user: null },
              error: { message: 'User already exists' },
            };
          }

          return {
            data: { user: { id: `auth-${email}`, email, password } },
            error: null,
          };
        }),
      },
      signInWithPassword: vi.fn(async ({ email, password }: { email: string; password: string }) => ({
        data: {
          session: {
            access_token: `access-${email}`,
            refresh_token: `refresh-${password}`,
          },
        },
        error: null,
      })),
      getUser: vi.fn(),
      onAuthStateChange: vi.fn(),
      signOut: vi.fn(),
    },
  };

  return { state, userRepository, supabase };
});

vi.mock('../repositories/userRepository', () => ({
  userRepository: mocked.userRepository,
}));

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => mocked.supabase),
}));

const appPromise = import('../index');

describe('Setup Endpoint Tests', () => {
  beforeEach(() => {
    mocked.state.users = [];
    mocked.userRepository.findAll.mockClear();
    mocked.userRepository.createWithExternalId.mockClear();
    mocked.supabase.auth.admin.createUser.mockClear();
    mocked.supabase.auth.signInWithPassword.mockClear();
  });

  it('returns setup route status', async () => {
    const { default: app } = await appPromise;

    const res = await request(app).get('/api/auth/setup/test');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('setup route reachable');
    expect(res.body).toHaveProperty('setupKeyConfigured');
    expect(res.body).toHaveProperty('nodeEnv');
  });

  it('creates first admin when setup key is correct', async () => {
    const { default: app } = await appPromise;
    const setupKey = process.env.SETUP_KEY || 'YourInitialSetupKeyHere123';

    const res = await request(app).post('/api/auth/setup').send({
      email: 'admin@ieee.org',
      password: 'securePassword123',
      name: 'Admin User',
      setupKey,
    });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('user');
    expect(res.body).toHaveProperty('session');
    expect(res.body.user.email).toBe('admin@ieee.org');
    expect(res.body.user.role).toBe('SB_FACULTY');
    expect(res.body.session).toHaveProperty('access_token');
    expect(res.body.session).toHaveProperty('refresh_token');
  });

  it('returns 401 when setup key is incorrect', async () => {
    const { default: app } = await appPromise;

    const res = await request(app).post('/api/auth/setup').send({
      email: 'admin@ieee.org',
      password: 'securePassword123',
      name: 'Admin User',
      setupKey: 'wrongSetupKey',
    });

    expect(res.status).toBe(401);
    expect(res.body.error).toContain('Invalid setup key');
  });

  it('returns 403 when users already exist', async () => {
    const { default: app } = await appPromise;
    const setupKey = process.env.SETUP_KEY || 'YourInitialSetupKeyHere123';

    mocked.state.users = [
      {
        id: 'existing-user',
        email: 'existing@ieee.org',
        name: 'Existing User',
        role: 'MANAGEMENT',
        societyId: null,
      },
    ];

    const res = await request(app).post('/api/auth/setup').send({
      email: 'admin2@ieee.org',
      password: 'securePassword123',
      name: 'Admin User 2',
      setupKey,
    });

    expect(res.status).toBe(403);
    expect(res.body.error).toContain('already initialized');
  });

  it('returns 400 when email is missing', async () => {
    const { default: app } = await appPromise;
    const setupKey = process.env.SETUP_KEY || 'YourInitialSetupKeyHere123';

    const res = await request(app).post('/api/auth/setup').send({
      password: 'securePassword123',
      name: 'Admin User',
      setupKey,
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('Invalid setup payload');
  });

  it('returns 400 when password is too short', async () => {
    const { default: app } = await appPromise;
    const setupKey = process.env.SETUP_KEY || 'YourInitialSetupKeyHere123';

    const res = await request(app).post('/api/auth/setup').send({
      email: 'admin@ieee.org',
      password: 'short',
      name: 'Admin User',
      setupKey,
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('Invalid setup payload');
  });

  it('returns 400 when setupKey is missing', async () => {
    const { default: app } = await appPromise;

    const res = await request(app).post('/api/auth/setup').send({
      email: 'admin@ieee.org',
      password: 'securePassword123',
      name: 'Admin User',
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('Invalid setup payload');
  });
});
