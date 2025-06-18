// frontend/src/pages/api/admin/dashboard.ts
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

    // For demo purposes, return mock data
    const mockDashboardData = {
      status: 'success',
      data: {
        tenantCount: 5,
        userCount: 25,
        stationCount: 12,
        recentTenants: [
          {
            id: '5d94aa95-a5dd-400f-9f3d-516c90517a1f',
            name: 'Demo Fuel Company',
            email: 'demo@fuelsync.com',
            subscription_plan: 'premium',
            status: 'active',
            created_at: '2023-01-15T10:30:00Z'
          },
          {
            id: '001f6cdd-37e3-42e6-a471-7fac1f3296a7',
            name: 'ABC Petrol',
            email: 'contact@abcpetrol.com',
            subscription_plan: 'basic',
            status: 'active',
            created_at: '2023-02-20T14:15:00Z'
          },
          {
            id: '66461a41-758b-4e06-8465-f46784393581',
            name: 'XYZ Fuels',
            email: 'info@xyzfuels.com',
            subscription_plan: 'enterprise',
            status: 'active',
            created_at: '2023-03-10T09:45:00Z'
          }
        ]
      }
    };

    return res.status(200).json(mockDashboardData);
  } catch (error) {
    console.error('Admin dashboard error:', error);
    return res.status(500).json({ 
      status: 'error',
      code: 'SERVER_ERROR',
      message: 'An unexpected error occurred' 
    });
  }
}