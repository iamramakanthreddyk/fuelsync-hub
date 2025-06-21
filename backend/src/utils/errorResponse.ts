import { Response } from 'express';

export function sendErrorResponse(
  res: Response,
  code: string,
  message: string,
  statusCode = 400
) {
  return res.status(statusCode).json({
    status: 'error',
    code,
    message
  });
}
