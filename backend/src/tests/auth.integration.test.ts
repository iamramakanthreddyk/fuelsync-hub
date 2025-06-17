import request from 'supertest';
import express from 'express';
import authRoutes from '../routes/auth.routes';
import { authenticateJWT } from '../middlewares/auth';
import * as authService from '../services/auth.service';
import { UserModel } from '../models/user.model';

// Mock dependencies
jest.mock('../services/auth.service');
jest.mock('../models/user.model');
jest.mock('../middlewares/validation', () => ({
  validateLoginInput: (req: express.Request, res: express.Response, next: express.NextFunction) => next()
}));
jest.mock('../middlewares/rateLimit', () => ({
  authLimiter: (req: express.Request, res: express.Response, next: express.NextFunction) => next()
}));

describe('Auth Routes Integration Tests', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/auth', authRoutes);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /auth/login', () => {
    it('should return 400 if email or password is missing', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty('code', 'MISSING_CREDENTIALS');
    });

    it('should return 401 if authentication fails', async () => {
      (authService.authenticateTenantUser as jest.Mock).mockRejectedValue(
        new authService.AuthError('Invalid credentials', 401, 'INVALID_CREDENTIALS')
      );

      const response = await request(app)
        .post('/auth/login')
        .send({ email: 'test@example.com', password: 'wrong_password' });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty('code', 'INVALID_CREDENTIALS');
    });

    it('should return 200 and token if authentication succeeds', async () => {
      const mockAuthResult = {
        status: 'success',
        data: {
          token: 'Bearer mock-token',
          user: {
            id: '123',
            email: 'test@example.com',
            role: 'owner',
            tenant_id: '456',
            tenant_name: 'Test Tenant'
          }
        }
      };

      (authService.authenticateTenantUser as jest.Mock).mockResolvedValue(mockAuthResult);

      const response = await request(app)
        .post('/auth/login')
        .send({ email: 'test@example.com', password: 'password' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockAuthResult);
      expect(authService.authenticateTenantUser).toHaveBeenCalledWith('test@example.com', 'password');
    });
  });

  describe('GET /auth/me', () => {
    it('should return 401 if not authenticated', async () => {
      const response = await request(app)
        .get('/auth/me');

      expect(response.status).toBe(401);
    });

    it('should return user data if authenticated', async () => {
      // Mock the authenticateJWT middleware
      (authenticateJWT as jest.Mock) = jest.fn((req, res, next) => {
        req.user = {
          id: '123',
          role: 'owner',
          tenant_id: '456'
        };
        next();
      });

      const mockUser = {
        id: '123',
        email: 'test@example.com',
        role: 'owner',
        tenant_id: '456',
        tenant_name: 'Test Tenant',
        first_name: 'John',
        last_name: 'Doe',
        active: true
      };

      (UserModel.findById as jest.Mock).mockResolvedValue(mockUser);

      app = express();
      app.use(express.json());
      app.use('/auth', authRoutes);

      const response = await request(app)
        .get('/auth/me')
        .set('Authorization', 'Bearer mock-token');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body.data.user).toEqual({
        id: '123',
        email: 'test@example.com',
        role: 'owner',
        tenant_id: '456',
        tenant_name: 'Test Tenant',
        first_name: 'John',
        last_name: 'Doe',
        active: true
      });
    });
  });

  describe('POST /auth/logout', () => {
    it('should return 200 and success message', async () => {
      // Mock the authenticateJWT middleware
      (authenticateJWT as jest.Mock) = jest.fn((req, res, next) => {
        req.user = {
          id: '123',
          role: 'owner',
          tenant_id: '456'
        };
        next();
      });

      app = express();
      app.use(express.json());
      app.use('/auth', authRoutes);

      const response = await request(app)
        .post('/auth/logout')
        .set('Authorization', 'Bearer mock-token');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body.data).toHaveProperty('message', 'Logged out successfully');
    });
  });
});