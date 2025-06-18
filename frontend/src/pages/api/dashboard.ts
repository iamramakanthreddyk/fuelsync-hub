// frontend/src/pages/api/dashboard.ts
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

  // Return mock dashboard data
  res.status(200).json({
    status: 'success',
    data: {
      todaySales: {
        total: '$1,250.00',
        count: 25
      },
      fuelVolume: {
        total: '350',
        byType: {
          petrol: '200',
          diesel: '150'
        }
      },
      creditSales: {
        total: '$450.00',
        count: 5
      },
      recentActivity: [
        {
          id: '1',
          type: 'sale',
          amount: '$45.00',
          timestamp: new Date().toISOString(),
          details: 'Petrol sale'
        },
        {
          id: '2',
          type: 'payment',
          amount: '$120.00',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          details: 'Credit payment received'
        }
      ]
    }
  });
}