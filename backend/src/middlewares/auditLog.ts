// backend/src/middlewares/auditLog.ts
import { Request, Response, NextFunction } from 'express';
import pool from '../config/database';

export async function auditLog(req: Request, res: Response, next: NextFunction) {
  // Capture response status after response is sent
  const start = Date.now();
  res.on('finish', async () => {
    try {
      await pool.query(
        `INSERT INTO public.audit_logs (user_id, tenant_id, action, route, method, status_code, details, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, now())`,
        [
          req.user?.id || null,
          req.tenantId || null,
          req.method + ' ' + req.originalUrl,
          req.route?.path || req.originalUrl,
          req.method,
          res.statusCode,
          JSON.stringify({
            query: req.query,
            body: req.body,
            durationMs: Date.now() - start
          })
        ]
      );
    } catch (err) {
      // Don't block request on audit log failure
      console.error('Audit log error:', err);
    }
  });
  next();
}
