// src/middlewares/security.ts
import helmet from 'helmet';
import { Request, Response, NextFunction } from 'express';

export const securityHeaders = [
  helmet(),
  (req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    next();
  }
];