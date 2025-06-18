// frontend/src/pages/api/auth/logout.ts
import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Check if this is a POST request
  if (req.method !== 'POST') {
    return res.status(405).json({ status: 'error', message: 'Method not allowed' });
  }

  // In a real app, you might want to invalidate the token on the server side
  // For this mock version, we'll just return success since the frontend will
  // remove the token from localStorage

  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully'
  });
}