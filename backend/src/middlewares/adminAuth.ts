// src/middlewares/adminAuth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/environment';
import pool from '../config/database';

// Extend Express Request type
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
        message: 'Not authenticated'
      });
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const jwtSecret = config.admin.jwtSecret;
    const decoded = jwt.verify(token, jwtSecret) as {
      id: string;
      email: string;
      role: string;
    };

    // Check if token exists in admin_sessions
    const query = `
      SELECT * FROM admin_sessions
      WHERE admin_id = $1 AND token = $2 AND expires_at > NOW()
    `;

    const result = await pool.query(query, [decoded.id, token]);

    if (result.rows.length === 0) {
      return res.status(401).json({
        status: 'error',
        code: 'INVALID_TOKEN',
        message: 'Invalid or expired token'
      });
    }

    // Set admin on request object
    req.admin = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role
    };

    // Update last_used_at
    await pool.query(
      'UPDATE admin_sessions SET last_used_at = NOW() WHERE admin_id = $1 AND token = $2',
      [decoded.id, token]
    );

    next();
  } catch (error) {
    console.error('Admin authentication error:', error);
    return res.status(401).json({
      status: 'error',
      code: 'UNAUTHORIZED',
      message: 'Not authenticated'
    });
  }
};