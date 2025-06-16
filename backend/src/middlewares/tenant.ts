// src/middlewares/tenant.ts
import { Request, Response, NextFunction } from 'express';
import pool from '../config/database';

// Extend Express Request type to include tenant
declare global {
  namespace Express {
    interface Request {
      tenantId?: string;
      schemaName?: string;
    }
  }
}

export const setTenantContext = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    // For admin users, we don't set a tenant context
    if (req.user.isAdmin) {
      return next();
    }

    // For tenant users, get schema name from tenantId
    const result = await pool.query(
      'SELECT schema_name FROM tenants WHERE id = $1 AND active = true',
      [req.user.tenantId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Tenant not found or inactive' });
    }

    req.tenantId = req.user.tenantId;
    req.schemaName = result.rows[0].schema_name;
    
    // Set search path for this connection
    await pool.query(`SET search_path TO ${req.schemaName}, public`);
    
    next();
  } catch (error) {
    console.error('Error setting tenant context:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};