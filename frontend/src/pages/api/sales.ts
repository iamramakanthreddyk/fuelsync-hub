// frontend/src/pages/api/sales.ts
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

  // Return mock sales data
  res.status(200).json({
    status: 'success',
    data: [
      {
        id: '1',
        recorded_at: new Date().toISOString(),
        sale_volume: 25.5,
        fuel_price: 4.50,
        amount: 114.75,
        payment_method: 'cash',
        status: 'posted'
      },
      {
        id: '2',
        recorded_at: new Date(Date.now() - 3600000).toISOString(),
        sale_volume: 30.0,
        fuel_price: 4.50,
        amount: 135.00,
        payment_method: 'card',
        status: 'posted'
      },
      {
        id: '3',
        recorded_at: new Date(Date.now() - 7200000).toISOString(),
        sale_volume: 15.0,
        fuel_price: 4.50,
        amount: 67.50,
        payment_method: 'credit',
        status: 'posted'
      },
      {
        id: '4',
        recorded_at: new Date(Date.now() - 10800000).toISOString(),
        sale_volume: 10.0,
        fuel_price: 4.50,
        amount: 45.00,
        payment_method: 'upi',
        status: 'posted'
      },
      {
        id: '5',
        recorded_at: new Date(Date.now() - 14400000).toISOString(),
        sale_volume: 20.0,
        fuel_price: 4.50,
        amount: 90.00,
        payment_method: 'cash',
        status: 'voided'
      }
    ]
  });
}