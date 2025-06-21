import { Request, Response, NextFunction } from 'express';

export const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
  const methods = ['POST', 'PUT', 'PATCH', 'DELETE'];
  if (!methods.includes(req.method)) {
    return next();
  }

  if (req.path.includes('/auth/login') || req.path.includes('/admin-auth/login')) {
    return next();
  }

  const csrfCookie = req.cookies?.csrfToken;
  const csrfHeader = req.headers['x-csrf-token'];

  if (!csrfCookie || csrfCookie !== csrfHeader) {
    return res.status(403).json({
      status: 'error',
      code: 'INVALID_CSRF_TOKEN',
      message: 'Invalid CSRF token'
    });
  }

  return next();
};
