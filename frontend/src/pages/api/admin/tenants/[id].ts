// frontend/src/pages/api/admin/tenants/[id].ts
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

  const { id } = req.query;

  // Mock tenant data
  const mockTenants = {
    '5d94aa95-a5dd-400f-9f3d-516c90517a1f': {
      id: '5d94aa95-a5dd-400f-9f3d-516c90517a1f',
      name: 'Demo Fuel Company',
      email: 'demo@fuelsync.com',
      contact_person: 'Demo Admin',
      contact_phone: '555-1234',
      subscription_plan: 'premium',
      status: 'active',
      created_at: '2023-01-15T10:30:00Z'
    },
    '001f6cdd-37e3-42e6-a471-7fac1f3296a7': {
      id: '001f6cdd-37e3-42e6-a471-7fac1f3296a7',
      name: 'ABC Petrol',
      email: 'contact@abcpetrol.com',
      contact_person: 'John Smith',
      contact_phone: '555-5678',
      subscription_plan: 'basic',
      status: 'active',
      created_at: '2023-02-20T14:15:00Z'
    },
    '66461a41-758b-4e06-8465-f46784393581': {
      id: '66461a41-758b-4e06-8465-f46784393581',
      name: 'XYZ Fuels',
      email: 'info@xyzfuels.com',
      contact_person: 'Jane Doe',
      contact_phone: '555-9012',
      subscription_plan: 'enterprise',
      status: 'active',
      created_at: '2023-03-10T09:45:00Z'
    }
  };

  try {
    if (req.method === 'GET') {
      // Get tenant by ID
      const tenant = mockTenants[id as string];
      
      if (!tenant) {
        return res.status(404).json({
          status: 'error',
          code: 'TENANT_NOT_FOUND',
          message: 'Tenant not found'
        });
      }

      return res.status(200).json({
        status: 'success',
        data: tenant
      });
    } else if (req.method === 'PUT') {
      // Update tenant
      const { name, email, contactPerson, contactPhone, subscriptionPlan } = req.body;
      
      // Check if tenant exists
      if (!mockTenants[id as string]) {
        return res.status(404).json({
          status: 'error',
          code: 'TENANT_NOT_FOUND',
          message: 'Tenant not found'
        });
      }

      // Return updated tenant
      const updatedTenant = {
        ...mockTenants[id as string],
        name: name || mockTenants[id as string].name,
        email: email || mockTenants[id as string].email,
        contact_person: contactPerson || mockTenants[id as string].contact_person,
        contact_phone: contactPhone || mockTenants[id as string].contact_phone,
        subscription_plan: subscriptionPlan || mockTenants[id as string].subscription_plan,
        updated_at: new Date().toISOString()
      };

      return res.status(200).json({
        status: 'success',
        data: updatedTenant
      });
    } else if (req.method === 'DELETE') {
      // Delete tenant
      if (!mockTenants[id as string]) {
        return res.status(404).json({
          status: 'error',
          code: 'TENANT_NOT_FOUND',
          message: 'Tenant not found'
        });
      }

      return res.status(204).end();
    } else {
      return res.status(405).json({ 
        status: 'error',
        code: 'METHOD_NOT_ALLOWED',
        message: 'Method not allowed' 
      });
    }
  } catch (error) {
    console.error('Admin tenant error:', error);
    return res.status(500).json({ 
      status: 'error',
      code: 'SERVER_ERROR',
      message: 'An unexpected error occurred' 
    });
  }
}