import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../index';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Setup Endpoint Integration Tests', () => {
  beforeEach(async () => {
    // Clear all users before each test
    try {
      await prisma.user.deleteMany({});
    } catch {
      // Table might not exist in test environment
    }
  });

  describe('GET /api/auth/setup/test', () => {
    it('should return setup route status', async () => {
      const res = await request(app).get('/api/auth/setup/test');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('setup route reachable');
      expect(res.body).toHaveProperty('setupKeyConfigured');
      expect(res.body).toHaveProperty('nodeEnv');
    });
  });

  describe('POST /api/auth/setup with correct SETUP_KEY', () => {
    it('should create first admin user and return session when setup key is correct', async () => {
      const correctSetupKey = process.env.SETUP_KEY || 'YourInitialSetupKeyHere123';

      const res = await request(app)
        .post('/api/auth/setup')
        .send({
          email: 'admin@ieee.org',
          password: 'securePassword123',
          name: 'Admin User',
          setupKey: correctSetupKey,
        });

      console.log('[TEST] Response status:', res.status);
      console.log('[TEST] Response body:', res.body);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('message');
      expect(res.body).toHaveProperty('user');
      expect(res.body).toHaveProperty('session');
      expect(res.body.user.email).toBe('admin@ieee.org');
      expect(res.body.user.role).toBe('MANAGEMENT');
      expect(res.body.session).toHaveProperty('access_token');
      expect(res.body.session).toHaveProperty('refresh_token');
    });
  });

  describe('POST /api/auth/setup with incorrect SETUP_KEY', () => {
    it('should return 401 when setup key is incorrect', async () => {
      const res = await request(app)
        .post('/api/auth/setup')
        .send({
          email: 'admin@ieee.org',
          password: 'securePassword123',
          name: 'Admin User',
          setupKey: 'wrongSetupKey',
        });

      console.log('[TEST] Invalid key response status:', res.status);
      console.log('[TEST] Invalid key response body:', res.body);

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('message');
      expect(res.body.message).toContain('Invalid setup key');
    });
  });

  describe('POST /api/auth/setup when users already exist', () => {
    it('should return 403 and prevent re-initialization', async () => {
      const correctSetupKey = process.env.SETUP_KEY || 'YourInitialSetupKeyHere123';

      // Create first admin
      const firstRes = await request(app)
        .post('/api/auth/setup')
        .send({
          email: 'admin1@ieee.org',
          password: 'securePassword123',
          name: 'Admin User 1',
          setupKey: correctSetupKey,
        });

      expect(firstRes.status).toBe(201);

      // Try to create another admin (should fail)
      const secondRes = await request(app)
        .post('/api/auth/setup')
        .send({
          email: 'admin2@ieee.org',
          password: 'securePassword123',
          name: 'Admin User 2',
          setupKey: correctSetupKey,
        });

      console.log('[TEST] Re-initialization attempt status:', secondRes.status);
      console.log('[TEST] Re-initialization attempt body:', secondRes.body);

      expect(secondRes.status).toBe(403);
      expect(secondRes.body.message).toContain('already initialized');
    });
  });

  describe('POST /api/auth/setup with invalid payload', () => {
    it('should return 400 when email is missing', async () => {
      const correctSetupKey = process.env.SETUP_KEY || 'YourInitialSetupKeyHere123';

      const res = await request(app)
        .post('/api/auth/setup')
        .send({
          password: 'securePassword123',
          name: 'Admin User',
          setupKey: correctSetupKey,
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Invalid setup payload');
    });

    it('should return 400 when password is too short', async () => {
      const correctSetupKey = process.env.SETUP_KEY || 'YourInitialSetupKeyHere123';

      const res = await request(app)
        .post('/api/auth/setup')
        .send({
          email: 'admin@ieee.org',
          password: 'short',
          name: 'Admin User',
          setupKey: correctSetupKey,
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Invalid setup payload');
    });

    it('should return 400 when setupKey is missing', async () => {
      const res = await request(app)
        .post('/api/auth/setup')
        .send({
          email: 'admin@ieee.org',
          password: 'securePassword123',
          name: 'Admin User',
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Invalid setup payload');
    });
  });
});
