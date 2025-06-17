import { Request, Response } from 'express';
import { authenticateJWT, requireRole } from '../middlewares/auth';
import jwt from 'jsonwebtoken';
import { config } from '../config/environment';
import { JWTPayload } from '../types/jwt-payload';

// Mock jwt module
jest.mock('jsonwebtoken');

describe('Auth Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock;

  beforeEach(() => {
    mockRequest = {
      headers: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    nextFunction = jest.fn();
  });

  describe('authenticateJWT', () => {
    it('should return 401 if no authorization header is provided', async () => {
      await authenticateJWT(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        code: 'INVALID_AUTH_HEADER',
        message: 'Invalid authorization header format'
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should return 401 if authorization header does not start with Bearer', async () => {
      mockRequest.headers = { authorization: 'Token xyz' };

      await authenticateJWT(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        code: 'INVALID_AUTH_HEADER',
        message: 'Invalid authorization header format'
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should return 401 if token is not provided', async () => {
      mockRequest.headers = { authorization: 'Bearer ' };

      await authenticateJWT(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        code: 'NO_TOKEN',
        message: 'No token provided'
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should return 401 if token verification fails', async () => {
      mockRequest.headers = { authorization: 'Bearer invalid-token' };
      
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new jwt.JsonWebTokenError('Invalid token');
      });

      await authenticateJWT(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        code: 'INVALID_TOKEN',
        message: 'Token validation failed: Invalid token'
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should return 401 if token is expired', async () => {
      mockRequest.headers = { authorization: 'Bearer expired-token' };
      
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new jwt.TokenExpiredError('Token expired', new Date());
      });

      await authenticateJWT(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        code: 'TOKEN_EXPIRED',
        message: 'Token has expired'
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should return 401 if token is missing required claims', async () => {
      mockRequest.headers = { authorization: 'Bearer valid-token' };
      
      (jwt.verify as jest.Mock).mockReturnValue({
        id: '123',
        // Missing role and tenant_id
      });

      await authenticateJWT(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        code: 'INVALID_TOKEN_CLAIMS',
        message: 'Invalid token: missing required claims'
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should call next() if token is valid', async () => {
      mockRequest.headers = { authorization: 'Bearer valid-token' };
      
      const mockPayload: JWTPayload = {
        id: '123',
        role: 'owner',
        tenant_id: '456',
        email: 'test@example.com'
      };
      
      (jwt.verify as jest.Mock).mockReturnValue(mockPayload);

      await authenticateJWT(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockRequest.user).toEqual(mockPayload);
      expect(nextFunction).toHaveBeenCalled();
    });
  });

  describe('requireRole', () => {
    it('should return 401 if user is not authenticated', () => {
      mockRequest = {};
      
      const middleware = requireRole('owner');
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        code: 'NOT_AUTHENTICATED',
        message: 'Authentication required'
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should return 403 if user does not have required role', () => {
      mockRequest = {
        user: {
          id: '123',
          role: 'employee',
          tenant_id: '456'
        }
      };
      
      const middleware = requireRole('owner');
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        code: 'INSUFFICIENT_PERMISSIONS',
        message: 'You do not have permission to access this resource'
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should call next() if user has required role', () => {
      mockRequest = {
        user: {
          id: '123',
          role: 'owner',
          tenant_id: '456'
        }
      };
      
      const middleware = requireRole('owner');
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
    });

    it('should call next() if user has one of the required roles', () => {
      mockRequest = {
        user: {
          id: '123',
          role: 'manager',
          tenant_id: '456'
        }
      };
      
      const middleware = requireRole(['owner', 'manager']);
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
    });
  });
});