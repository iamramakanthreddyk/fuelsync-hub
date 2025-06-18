// frontend/src/pages/api/stations.ts
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

  // Return mock stations data
  res.status(200).json({
    status: 'success',
    data: [
      {
        id: '1',
        name: 'Main Street Station',
        address: '123 Main St, Anytown, CA 12345',
        city: 'Anytown',
        state: 'CA',
        zip: '12345',
        contact_phone: '555-1234',
        pumps_count: 4,
        active: true
      },
      {
        id: '2',
        name: 'Downtown Station',
        address: '456 Center Ave, Anytown, CA 12345',
        city: 'Anytown',
        state: 'CA',
        zip: '12345',
        contact_phone: '555-5678',
        pumps_count: 6,
        active: true
      },
      {
        id: '3',
        name: 'Highway Station',
        address: '789 Highway 1, Anytown, CA 12345',
        city: 'Anytown',
        state: 'CA',
        zip: '12345',
        contact_phone: '555-9012',
        pumps_count: 8,
        active: true
      }
    ]
  });
}