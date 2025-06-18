// frontend/src/pages/api/admin/auth/login.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      status: 'error',
      code: 'METHOD_NOT_ALLOWED',
      message: 'Method not allowed' 
    });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        status: 'error',
        code: 'MISSING_CREDENTIALS',
        message: 'Email and password are required' 
      });
    }

    // For demo purposes, hardcode the superadmin credentials
    if (email === 'admin@fuelsync.com' && password === 'admin123') {
      // Create a mock response
      const mockResponse = {
        status: 'success',
        data: {
          token: 'mock-admin-token-12345',
          user: {
            id: '00000000-0000-0000-0000-000000000000',
            email: 'admin@fuelsync.com',
            firstName: 'Super',
            lastName: 'Admin',
            role: 'superadmin'
          }
        }
      };

      return res.status(200).json(mockResponse);
    }

    // If credentials don't match, return error
    return res.status(401).json({
      status: 'error',
      code: 'INVALID_CREDENTIALS',
      message: 'Invalid email or password'
    });
  } catch (error) {
    console.error('Admin login error:', error);
    return res.status(500).json({ 
      status: 'error',
      code: 'SERVER_ERROR',
      message: 'An unexpected error occurred' 
    });
  }
}