// frontend/src/pages/api/auth/me.ts
import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Check if this is a GET request
  if (req.method !== 'GET') {
    return res.status(405).json({ status: 'error', message: 'Method not allowed' });
  }

  // Check for authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      status: 'error', 
      code: 'INVALID_AUTH_HEADER', 
      message: 'Invalid authorization header format' 
    });
  }

  // Get token from header
  const token = authHeader.split(' ')[1];
  
  // In a real app, you would verify the token
  // For this mock version, we'll parse the token and return the user info
  
  try {
    // Simple token parsing (this is a simplified version for demo purposes)
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid token format');
    }
    
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    
    // Check if token is expired
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return res.status(401).json({ 
        status: 'error', 
        code: 'TOKEN_EXPIRED', 
        message: 'Token has expired' 
      });
    }
    
    // Return user info
    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: payload.id,
          email: payload.email,
          role: payload.role,
          name: payload.name
        }
      }
    });
  } catch (error) {
    return res.status(401).json({ 
      status: 'error', 
      code: 'INVALID_TOKEN', 
      message: 'Invalid token' 
    });
  }
}