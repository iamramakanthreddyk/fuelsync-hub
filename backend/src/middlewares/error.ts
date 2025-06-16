// src/middlewares/error.ts
import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err.stack);
  
  // Handle specific errors
  if (err.code === '23514') { // Check constraint violation
    return res.status(400).json({
      message: 'Data validation error',
      details: err.detail
    });
  }
  
  // Default error response
  res.status(500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : undefined
  });
};