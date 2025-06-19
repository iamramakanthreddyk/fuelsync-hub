// src/middlewares/adminAuth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

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
    const jwtSecret = process.env.ADMIN_JWT_SECRET || 'admin-secret';
    const decoded = jwt.verify(token, jwtSecret) as {
      id: string;
      email: string;
      role: string;
      isAdmin?: boolean;
    };

    // Verify it's an admin token
    if (!decoded.isAdmin && decoded.role !== 'superadmin') {
      return res.status(401).json({
        status: 'error',
        code: 'UNAUTHORIZED',
        message: 'Admin access required'
      });
    }

    // Set admin on request object
    req.admin = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role
    };

    console.log(`[ADMIN-AUTH] Admin authenticated: ${decoded.email}`);
    next();
  } catch (error) {
    console.error('Admin authentication error:', error);
    return res.status(401).json({
      status: 'error',
      code: 'UNAUTHORIZED',
      message: 'Invalid or expired token'
    });
  }
};