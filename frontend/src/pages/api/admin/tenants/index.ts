// frontend/src/pages/api/admin/tenants/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Get token from authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      status: 'error',
      code: 'UNAUTHORIZED',
      message: 'Unauthorized' 
    });
  }

  try {
    if (req.method === 'GET') {
      // Return mock tenants data
      const mockTenants = {
        status: 'success',
        data: [
          {
            id: '5d94aa95-a5dd-400f-9f3d-516c90517a1f',
            name: 'Demo Fuel Company',
            email: 'demo@fuelsync.com',
            contact_person: 'Demo Admin',
            contact_phone: '555-1234',
            subscription_plan: 'premium',
            status: 'active',
            created_at: '2023-01-15T10:30:00Z'
          },
          {
            id: '001f6cdd-37e3-42e6-a471-7fac1f3296a7',
            name: 'ABC Petrol',
            email: 'contact@abcpetrol.com',
            contact_person: 'John Smith',
            contact_phone: '555-5678',
            subscription_plan: 'basic',
            status: 'active',
            created_at: '2023-02-20T14:15:00Z'
          },
          {
            id: '66461a41-758b-4e06-8465-f46784393581',
            name: 'XYZ Fuels',
            email: 'info@xyzfuels.com',
            contact_person: 'Jane Doe',
            contact_phone: '555-9012',
            subscription_plan: 'enterprise',
            status: 'active',
            created_at: '2023-03-10T09:45:00Z'
          }
        ]
      };

      return res.status(200).json(mockTenants);
    } else if (req.method === 'POST') {
      // Create new tenant (mock)
      const { name, email, contactPerson, contactPhone, subscriptionPlan } = req.body;

      // Validate required fields
      if (!name || !email || !contactPerson || !subscriptionPlan) {
        return res.status(400).json({
          status: 'error',
          code: 'MISSING_FIELDS',
          message: 'Required fields are missing'
        });
      }

      // Return mock response
      const mockResponse = {
        status: 'success',
        data: {
          id: '88888888-8888-8888-8888-888888888888',
          name,
          email,
          contact_person: contactPerson,
          contact_phone: contactPhone || '',
          subscription_plan: subscriptionPlan,
          status: 'active',
          created_at: new Date().toISOString()
        }
      };

      return res.status(201).json(mockResponse);
    } else {
      return res.status(405).json({ 
        status: 'error',
        code: 'METHOD_NOT_ALLOWED',
        message: 'Method not allowed' 
      });
    }
  } catch (error) {
    console.error('Admin tenants error:', error);
    return res.status(500).json({ 
      status: 'error',
      code: 'SERVER_ERROR',
      message: 'An unexpected error occurred' 
    });
  }
}