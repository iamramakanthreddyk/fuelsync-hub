// src/middlewares/tenant.ts
import { Request, Response, NextFunction } from 'express';
import pool from '../config/database';

export const setTenantContext = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({ 
      status: 'error',
      code: 'AUTHENTICATION_REQUIRED',
      message: 'Authentication required' 
    });
  }

  try {
    // Skip tenant context for admin users
    if (req.user.role === 'admin' || req.user.role === 'superadmin') {
      return next();
    }

    if (!req.user.tenant_id) {
      return res.status(403).json({ 
        status: 'error',
        code: 'NO_TENANT_CONTEXT',
        message: 'No tenant context available' 
      });
    }

    // Set tenant context
    req.tenantId = req.user.tenant_id;
    req.tenantName = req.user.tenant_name;
    
    // Set schema name for database operations
    // For this environment we store all data in the public schema
    req.schemaName = 'public';
    
    // Log tenant context for debugging
    console.log(`Tenant context set: ${req.schemaName}`);

    next();
  } catch (error) {
    console.error('Tenant middleware error:', error);
    res.status(500).json({ 
      status: 'error',
      code: 'TENANT_CONTEXT_ERROR',
      message: 'Error setting tenant context' 
    });
  }
};