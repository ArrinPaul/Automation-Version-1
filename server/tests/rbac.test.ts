import request from 'supertest';
import app from '../src/index'; 
import User, { UserRole } from '../src/models/User';

describe('Auth Endpoints & RBAC Validation', () => {
  let superAdminToken: string;
  let viewerToken: string;

  beforeEach(async () => {
    // Register Super Admin directly
    await User.create({
      name: 'Super Admin User',
      email: 'sa@ieee.org',
      password: 'password123',
      role: UserRole.SUPER_ADMIN
    });

    const saRes = await request(app).post('/api/auth/login').send({
      email: 'sa@ieee.org',
      password: 'password123'
    });
    superAdminToken = saRes.body.data.token;

    // Register Viewer directly
    await User.create({
      name: 'Viewer User',
      email: 'viewer@ieee.org',
      password: 'password123',
      role: UserRole.VIEWER
    });

    const viewerRes = await request(app).post('/api/auth/login').send({
      email: 'viewer@ieee.org',
      password: 'password123'
    });
    viewerToken = viewerRes.body.data.token;
  });

  describe('RBAC Validation on /api/societies', () => {
    it('should allow Super Admin to create a society', async () => {
      const res = await request(app)
        .post('/api/societies')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          societyKey: 'TEST-SOC',
          name: 'Test Society',
          shortName: 'TSOC',
          budget: 1000,
        });
        
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.societyKey).toBe('test-soc');
    });

    it('should deny Viewer from creating a society', async () => {
      const res = await request(app)
        .post('/api/societies')
        .set('Authorization', `Bearer ${viewerToken}`)
        .send({
          societyKey: 'VI-SOC',
          name: 'Viewer Society',
          shortName: 'VSOC',
          budget: 500,
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Access denied');
    });
  });
});
