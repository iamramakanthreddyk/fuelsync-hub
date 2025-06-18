// src/middlewares/adminAuth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/environment';
import pool from '../config/database';

// Extend Express Request type to include admin
declare global {
  namespace Express {
    interface Request {
      admin?: {
        id: string;
        email: string;
        role: string;
      };
    }
  }
}

/**
 * Middleware to authenticate admin users
 */
export const authenticateAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get token from authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        code: 'UNAUTHORIZED',
        message: 'Authentication required'
      });
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    try {
      const decoded = jwt.verify(token, config.admin.jwtSecret) as {
        id: string;
        email: string;
        role: string;
      };

      // Check if token is in admin_sessions table
      const sessionQuery = `
        SELECT * FROM admin_sessions
        WHERE admin_id = $1 AND token = $2 AND expires_at > NOW()
      `;

      const sessionResult = await pool.query(sessionQuery, [decoded.id, token]);

      if (sessionResult.rows.length === 0) {
        return res.status(401).json({
          status: 'error',
          code: 'INVALID_TOKEN',
          message: 'Invalid or expired token'
        });
      }

      // Update last_used_at
      await pool.query(
        'UPDATE admin_sessions SET last_used_at = NOW() WHERE admin_id = $1 AND token = $2',
        [decoded.id, token]
      );

      // Set admin in request
      req.admin = decoded;

      next();
    } catch (error) {
      return res.status(401).json({
        status: 'error',
        code: 'INVALID_TOKEN',
        message: 'Invalid or expired token'
      });
    }
  } catch (error) {
    console.error('Admin authentication error:', error);
    return res.status(500).json({
      status: 'error',
      code: 'SERVER_ERROR',
      message: 'An unexpected error occurred'
    });
  }
};