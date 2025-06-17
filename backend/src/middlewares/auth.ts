// src/middlewares/auth.ts
import { Request, Response, NextFunction } from 'express';
import { verifyToken, AuthError } from '../services/auth.service';
import { JWTPayload } from '../types/jwt-payload';

/**
 * Middleware to authenticate JWT tokens
 */
export const authenticateJWT = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    // Check if authorization header exists and has correct format
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        status: 'error',
        code: 'INVALID_AUTH_HEADER',
        message: 'Invalid authorization header format' 
      });
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        status: 'error',
        code: 'NO_TOKEN',
        message: 'No token provided' 
      });
    }

    // Verify token
    const decoded = verifyToken(token);
    
    // Validate required claims
    if (!decoded.id || !decoded.role) {
      return res.status(401).json({
        status: 'error',
        code: 'INVALID_TOKEN_CLAIMS',
        message: 'Invalid token: missing required claims' 
      });
    }

    // For tenant users, tenant_id is required
    if (!decoded.isAdmin && !decoded.tenant_id) {
      return res.status(401).json({
        status: 'error',
        code: 'INVALID_TOKEN_CLAIMS',
        message: 'Invalid token: missing tenant ID' 
      });
    }

    // Assign decoded token to req.user
    req.user = decoded;
    return next();
  } catch (error) {
    if (error instanceof AuthError) {
      return res.status(error.statusCode).json({ 
        status: 'error',
        code: error.code,
        message: error.message
      });
    }
    
    return res.status(500).json({ 
      status: 'error',
      code: 'AUTH_ERROR',
      message: 'Authentication error occurred'
    });
  }
};

/**
 * Middleware to require specific user roles
 */
export const requireRole = (roles: string | string[]) => {
  const allowedRoles = Array.isArray(roles) ? roles : [roles];
  
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        code: 'NOT_AUTHENTICATED',
        message: 'Authentication required'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        code: 'INSUFFICIENT_PERMISSIONS',
        message: 'You do not have permission to access this resource'
      });
    }

    return next();
  };
};