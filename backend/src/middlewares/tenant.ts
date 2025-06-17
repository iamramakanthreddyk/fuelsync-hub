// src/middlewares/tenant.ts
import { Request, Response, NextFunction } from 'express';
import pool from '../config/database';

// Extend Express Request type to include tenant
declare global {
  namespace Express {
    interface Request {
      tenantId?: string;
      tenantName?: string;
    }
  }
}

export const setTenantContext = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    if (req.user.role === 'admin') {
      return next();
    }

    if (!req.user.tenant_id) {
      return res.status(403).json({ message: 'No tenant context available' });
    }

    // Set tenant context
    req.tenantId = req.user.tenant_id;
    req.tenantName = req.user.tenant_name;

    next();
  } catch (error) {
    console.error('Tenant middleware error:', error);
    res.status(500).json({ message: 'Error setting tenant context' });
  }
};