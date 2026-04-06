import request from 'supertest';
import app from '../src/index'; // Warning: requires index.ts export default app
import mongoose from 'mongoose';
import User from '../src/models/User';

describe('Auth Endpoints & RBAC Validation', () => {
  let superAdminToken: string;
  let viewerToken: string;

  beforeEach(async () => {
    // Register Super Admin
    const saRes = await request(app).post('/api/auth/register').send({
      name: 'Super Admin User',
      email: 'sa@ieee.org',
      password: 'password123',
      role: 'Super Admin',
    });
    superAdminToken = saRes.body.token;

    // Register Viewer
    const viewerRes = await request(app).post('/api/auth/register').send({
      name: 'Viewer User',
      email: 'viewer@ieee.org',
      password: 'password123',
      role: 'Viewer',
    });
    viewerToken = viewerRes.body.token;
  });

  describe('RBAC Validation on /api/societies', () => {
    it('should allow Super Admin to create a society', async () => {
      const res = await request(app)
        .post('/api/societies')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          societyKey: 'TEST-SOC',
          name: 'Test Society',
          budget: 1000,
        });
        
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.societyKey).toBe('TEST-SOC');
    });

    it('should deny Viewer from creating a society', async () => {
      const res = await request(app)
        .post('/api/societies')
        .set('Authorization', `Bearer ${viewerToken}`)
        .send({
          societyKey: 'VI-SOC',
          name: 'Viewer Society',
          budget: 500,
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('do not have permission');
    });
  });
});
