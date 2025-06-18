// src/controllers/admin-settings.controller.ts
import { Request, Response } from 'express';
import * as adminSettingsService from '../services/admin-settings.service';

/**
 * Get admin settings
 */
export const getSettings = async (req: Request, res: Response) => {
  try {
    const settings = await adminSettingsService.getSettings();
    
    return res.status(200).json({
      status: 'success',
      data: settings
    });
  } catch (error: any) {
    console.error('Get settings error:', error);
    return res.status(500).json({
      status: 'error',
      code: 'SERVER_ERROR',
      message: error.message || 'An unexpected error occurred'
    });
  }
};

/**
 * Update admin settings
 */
export const updateSettings = async (req: Request, res: Response) => {
  try {
    const { tenantLimits, systemMaintenance } = req.body;
    
    if (!tenantLimits || !systemMaintenance) {
      return res.status(400).json({
        status: 'error',
        code: 'INVALID_REQUEST',
        message: 'Missing required fields'
      });
    }
    
    const settings = await adminSettingsService.updateSettings({
      tenantLimits,
      systemMaintenance
    });
    
    return res.status(200).json({
      status: 'success',
      data: settings
    });
  } catch (error: any) {
    console.error('Update settings error:', error);
    return res.status(500).json({
      status: 'error',
      code: 'SERVER_ERROR',
      message: error.message || 'An unexpected error occurred'
    });
  }
};