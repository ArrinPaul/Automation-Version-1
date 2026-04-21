import request from 'supertest';
import app from '../src/index'; 
import User, { UserRole } from '../src/models/User';

describe('Authentication Flow', () => {
  let superAdminToken: string;

  beforeEach(async () => {
    // 1. Manually create a SUPER_ADMIN in the DB
    await User.create({
      name: 'Super Admin',
      email: 'admin_auth@ieee.org',
      password: 'password123',
      role: UserRole.SUPER_ADMIN
    });

    // 2. Login to get token
    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'admin_auth@ieee.org',
      password: 'password123'
    });
    superAdminToken = loginRes.body.data.token;

    // 3. Manually create a SOCIETY_ADMIN in the DB for login tests
    await User.create({
      name: 'Society Admin User',
      email: 'socadmin@ieee.org',
      password: 'password123',
      role: UserRole.SOCIETY_ADMIN,
      societyId: 'AUTH-TEST-SOC'
    });
  });

  it('should register a new user successfully when authorized as Super Admin', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({
        name: 'New Registered User',
        email: 'newbie@ieee.org',
        password: 'password123',
        role: UserRole.SOCIETY_ADMIN,
        societyId: 'NEWBIE-SOC'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should login an existing user', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'socadmin@ieee.org',
      password: 'password123',
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.role).toBe(UserRole.SOCIETY_ADMIN);
  });

  it('should fail login on wrong password', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'socadmin@ieee.org',
      password: 'wrongpassword',
    });

    expect(res.status).toBe(401); // Wait! My assert had 400 but authController logic: 'Invalid credentials' --> 401
    expect(res.body.success).toBe(false);
  });
});
