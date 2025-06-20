// src/middlewares/auditLog.ts
import { Request, Response, NextFunction } from 'express';
import pool from '../config/database';
import { generateUUID } from '../utils/uuid';

export const auditLog = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Store original end method
  const originalEnd = res.end;
  
  // Override end method
  res.end = function (
    this: Response,
    chunk?: any,
    encoding?: BufferEncoding,
    callback?: () => void
  ): Response {
    // Call original end method
    originalEnd.call(this, chunk, encoding as any, callback);
    
    // Log activity after response is sent
    setTimeout(async () => {
      try {
        if (!req.admin) return;
        
        // Extract action from request
        let action = req.method;
        if (req.baseUrl) {
          const parts = req.baseUrl.split('/');
          const resource = parts[parts.length - 1];
          action = `${req.method}_${resource}`;
        }
        
        // Extract entity type and ID
        let entityType: string | undefined;
        let entityId: string | undefined;
        
        if (req.params.id) {
          entityId = req.params.id;
        }
        
        if (req.baseUrl) {
          const parts = req.baseUrl.split('/');
          entityType = parts[parts.length - 1];
          if (entityType.endsWith('s')) {
            entityType = entityType.slice(0, -1);
          }
        }
        
        // Log activity
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
          req.admin.id,
          action,
          entityType,
          entityId,
          JSON.stringify({
            method: req.method,
            path: req.path,
            body: req.body,
            statusCode: res.statusCode
          })
        ]);
      } catch (error) {
        console.error('Error logging admin activity:', error);
      }
    }, 0);
    
    return this as unknown as Response;
  } as any;
  
  next();
};