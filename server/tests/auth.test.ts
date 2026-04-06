import request from 'supertest';
import app from '../src/index';

describe('Authentication Flow', () => {
  it('should register a new user successfully', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Auth Test User',
      email: 'authtest@ieee.org',
      password: 'password123',
      role: 'Society Admin',
      societyId: 'AUTH-TEST-SOC'
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
  });

  it('should login an existing user', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'authtest@ieee.org',
      password: 'password123',
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe('Society Admin');
  });

  it('should fail login on wrong password', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'authtest@ieee.org',
      password: 'wrongpassword',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
