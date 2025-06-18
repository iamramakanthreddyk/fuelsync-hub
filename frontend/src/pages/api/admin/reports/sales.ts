// frontend/src/pages/api/admin/reports/sales.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
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

    // Get query parameters
    const { startDate, endDate, tenantId, stationId } = req.query;

    // Build query string
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate as string);
    if (endDate) params.append('endDate', endDate as string);
    if (tenantId) params.append('tenantId', tenantId as string);
    if (stationId) params.append('stationId', stationId as string);

    // Call backend API
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
    const response = await fetch(`${apiUrl}/admin/reports/sales?${params.toString()}`, {
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
  } catch (error) {
    console.error('Get sales report error:', error);
    return res.status(500).json({ 
      status: 'error',
      code: 'SERVER_ERROR',
      message: 'An unexpected error occurred' 
    });
  }
}