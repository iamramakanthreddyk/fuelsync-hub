// src/controllers/admin/dashboard.controller.ts
import { Request, Response } from 'express';
import * as dashboardService from '../../services/admin/dashboard.service';

/**
 * Get dashboard statistics
 */
export const getDashboard = async (req: Request, res: Response) => {
  try {
    const stats = await dashboardService.getDashboardStats();
    
    return res.status(200).json({
      status: 'success',
      data: stats
    });
  } catch (error: any) {
    console.error('Get dashboard error:', error);
    return res.status(500).json({
      status: 'error',
      code: 'SERVER_ERROR',
      message: error.message || 'Failed to get dashboard statistics'
    });
  }
};