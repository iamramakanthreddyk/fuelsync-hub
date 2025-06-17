import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/environment';
import pool from '../config/database';
import { JWTPayload } from '../types/jwt-payload';

/**
 * Middleware to authenticate admin JWT tokens
 */
export const adminAuth = async (
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
    const decoded = jwt.verify(
      token, 
      config.adminJwt.secret,
      {
        algorithms: ['HS256'],
        audience: config.adminJwt.audience,
        issuer: config.adminJwt.issuer
      }
    ) as JWTPayload;
    
    // Validate required claims
    if (!decoded.id || !decoded.role) {
      return res.status(401).json({
        status: 'error',
        code: 'INVALID_TOKEN_CLAIMS',
        message: 'Invalid token: missing required claims' 
      });
    }

    // Verify admin exists in database
    const admin = await pool.query(
      'SELECT id, email, role FROM admin_users WHERE id = $1 AND active = true',
      [decoded.id]
    );

    if (!admin.rows[0]) {
      return res.status(401).json({ 
        status: 'error',
        code: 'INVALID_ADMIN',
        message: 'Invalid admin token' 
      });
    }

    // Assign admin data to request
    req.admin = admin.rows[0];
    return next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ 
        status: 'error',
        code: 'TOKEN_EXPIRED',
        message: 'Token has expired'
      });
    }
    
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ 
        status: 'error',
        code: 'INVALID_TOKEN',
        message: `Token validation failed: ${error.message}`
      });
    }
    
    console.error('[ADMIN-AUTH] Authentication error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return res.status(500).json({ 
      status: 'error',
      code: 'AUTH_ERROR',
      message: 'Authentication error occurred'
    });
  }
};

/**
 * Middleware to require specific admin roles
 */
export const requireAdminRole = (roles: string | string[]) => {
  const allowedRoles = Array.isArray(roles) ? roles : [roles];
  
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.admin) {
      return res.status(401).json({
        status: 'error',
        code: 'NOT_AUTHENTICATED',
        message: 'Admin authentication required'
      });
    }

    if (!allowedRoles.includes(req.admin.role)) {
      return res.status(403).json({
        status: 'error',
        code: 'INSUFFICIENT_PERMISSIONS',
        message: 'You do not have permission to access this resource'
      });
    }

    return next();
  };
};