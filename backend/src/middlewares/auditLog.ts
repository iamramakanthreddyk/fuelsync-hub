// src/middlewares/auditLog.ts
import { Request, Response, NextFunction } from 'express';
import pool from '../config/database';
import { generateUUID } from '../utils/uuid';

/**
 * Middleware to log admin actions
 */
export const auditLog = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Store the original end function
  const originalEnd = res.end;
  
  // Override the end function
  res.end = function(chunk?: any, encoding?: any, callback?: any) {
    // Restore the original end function
    res.end = originalEnd;
    
    // Call the original end function
    res.end(chunk, encoding, callback);
    
    // Log the action if it's a successful write operation
    if (req.admin && (req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE') && res.statusCode >= 200 && res.statusCode < 300) {
      logAction(req);
    }
  };
  
  next();
};

/**
 * Log an admin action
 */
async function logAction(req: Request) {
  try {
    // Determine action type
    let action = '';
    let entityType = '';
    let entityId: string | null = null;
    
    // Extract path parts
    const pathParts = req.path.split('/').filter(Boolean);
    
    if (pathParts.length > 0) {
      entityType = pathParts[0];
    }
    
    if (pathParts.length > 1) {
      entityId = pathParts[1];
    }
    
    // Determine action based on HTTP method
    switch (req.method) {
      case 'POST':
        action = 'create';
        break;
      case 'PUT':
        action = 'update';
        break;
      case 'DELETE':
        action = 'delete';
        break;
      default:
        action = 'other';
    }
    
    // Create log entry
    const query = `
      INSERT INTO admin_activity_logs (
        id,
        admin_id,
        action,
        entity_type,
        entity_id,
        details
      ) VALUES ($1, $2, $3, $4, $5, $6)
    `;
    
    await pool.query(query, [
      generateUUID(),
      req.admin!.id,
      action,
      entityType,
      entityId,
      JSON.stringify({
        method: req.method,
        path: req.path,
        body: req.body,
        ip: req.ip,
        userAgent: req.headers['user-agent']
      })
    ]);
  } catch (error) {
    console.error('Error logging admin action:', error);
    // Don't throw error, just log it
  }
}