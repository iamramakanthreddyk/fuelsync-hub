// frontend/src/pages/api/admin/settings.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow GET and PUT methods
  if (req.method !== 'GET' && req.method !== 'PUT') {
    return res.status(405).json({ 
      status: 'error',
      code: 'METHOD_NOT_ALLOWED',
      message: 'Method not allowed' 
    });
  }

  try {
    // Get token from authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        status: 'error',
        code: 'UNAUTHORIZED',
        message: 'Unauthorized' 
      });
    }

    const token = authHeader.split(' ')[1];

    // Call backend API
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
    
    if (req.method === 'GET') {
      const response = await fetch(`${apiUrl}/admin/settings`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Non-JSON response:', await response.text());
        return res.status(500).json({ 
          status: 'error',
          code: 'INVALID_RESPONSE',
          message: 'Backend returned non-JSON response' 
        });
      }

      const data = await response.json();

      if (!response.ok) {
        return res.status(response.status).json(data);
      }

      return res.status(200).json(data);
    } else if (req.method === 'PUT') {
      const response = await fetch(`${apiUrl}/admin/settings`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(req.body),
      });

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Non-JSON response:', await response.text());
        return res.status(500).json({ 
          status: 'error',
          code: 'INVALID_RESPONSE',
          message: 'Backend returned non-JSON response' 
        });
      }

      const data = await response.json();

      if (!response.ok) {
        return res.status(response.status).json(data);
      }

      return res.status(200).json(data);
    }
  } catch (error) {
    console.error('Settings API error:', error);
    return res.status(500).json({ 
      status: 'error',
      code: 'SERVER_ERROR',
      message: 'An unexpected error occurred' 
    });
  }
}