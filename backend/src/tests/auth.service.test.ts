import { authenticateTenantUser, AuthError, generateToken, verifyToken } from '../services/auth.service';
import { UserModel } from '../models/user.model';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { config } from '../config/environment';

// Mock dependencies
jest.mock('../models/user.model');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('../config/environment', () => ({
  config: {
    jwt: {
      secret: 'test-secret',
      expiresIn: '1h',
      audience: 'test-audience',
      issuer: 'test-issuer'
    }
  }
}));

describe('Auth Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('authenticateTenantUser', () => {
    it('should throw AuthError if user is not found', async () => {
      (UserModel.findByEmail as jest.Mock).mockResolvedValue(null);

      await expect(authenticateTenantUser('test@example.com', 'password'))
        .rejects
        .toThrow(new AuthError('Invalid credentials', 401, 'USER_NOT_FOUND'));
    });

    it('should throw AuthError if password is invalid', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        password_hash: 'hashed_password',
        role: 'owner',
        tenant_id: '456'
      };

      (UserModel.findByEmail as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(authenticateTenantUser('test@example.com', 'wrong_password'))
        .rejects
        .toThrow(new AuthError('Invalid credentials', 401, 'INVALID_CREDENTIALS'));
    });

    it('should throw AuthError if tenant_id is missing', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        password_hash: 'hashed_password',
        role: 'owner',
        tenant_id: null
      };

      (UserModel.findByEmail as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await expect(authenticateTenantUser('test@example.com', 'password'))
        .rejects
        .toThrow(new AuthError('Account setup is incomplete. Please contact support.', 400, 'ACCOUNT_SETUP_INCOMPLETE'));
    });

    it('should return user data and token if authentication is successful', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        password_hash: 'hashed_password',
        role: 'owner',
        tenant_id: '456',
        tenant_name: 'Test Tenant',
        first_name: 'John',
        last_name: 'Doe'
      };

      (UserModel.findByEmail as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('mock-token');

      const result = await authenticateTenantUser('test@example.com', 'password');

      expect(result).toEqual({
        status: 'success',
        data: {
          token: 'Bearer mock-token',
          user: {
            id: '123',
            email: 'test@example.com',
            role: 'owner',
            tenant_id: '456',
            tenant_name: 'Test Tenant',
            first_name: 'John',
            last_name: 'Doe'
          }
        }
      });

      expect(jwt.sign).toHaveBeenCalledWith(
        {
          id: '123',
          role: 'owner',
          tenant_id: '456',
          email: 'test@example.com'
        },
        config.jwt.secret,
        {
          expiresIn: config.jwt.expiresIn,
          algorithm: 'HS256',
          audience: config.jwt.audience,
          issuer: config.jwt.issuer
        }
      );
    });
  });

  describe('generateToken', () => {
    it('should generate a JWT token with the provided payload', () => {
      const payload = {
        id: '123',
        role: 'owner',
        tenant_id: '456'
      };

      (jwt.sign as jest.Mock).mockReturnValue('mock-token');

      const token = generateToken(payload);

      expect(token).toBe('mock-token');
      expect(jwt.sign).toHaveBeenCalledWith(
        payload,
        config.jwt.secret,
        {
          expiresIn: config.jwt.expiresIn,
          algorithm: 'HS256',
          audience: config.jwt.audience,
          issuer: config.jwt.issuer
        }
      );
    });
  });

  describe('verifyToken', () => {
    it('should verify and return the token payload', () => {
      const mockPayload = {
        id: '123',
        role: 'owner',
        tenant_id: '456'
      };

      (jwt.verify as jest.Mock).mockReturnValue(mockPayload);

      const result = verifyToken('mock-token');

      expect(result).toEqual(mockPayload);
      expect(jwt.verify).toHaveBeenCalledWith(
        'mock-token',
        config.jwt.secret,
        {
          algorithms: ['HS256'],
          audience: config.jwt.audience,
          issuer: config.jwt.issuer
        }
      );
    });

    it('should throw AuthError if token is expired', () => {
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new jwt.TokenExpiredError('Token expired', new Date());
      });

      expect(() => verifyToken('expired-token'))
        .toThrow(new AuthError('Token has expired', 401, 'TOKEN_EXPIRED'));
    });

    it('should throw AuthError if token is invalid', () => {
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new jwt.JsonWebTokenError('Invalid token');
      });

      expect(() => verifyToken('invalid-token'))
        .toThrow(new AuthError('Token validation failed: Invalid token', 401, 'INVALID_TOKEN'));
    });
  });
});