// src/controllers/admin-report.controller.ts
import { Request, Response } from 'express';
import * as adminReportService from '../services/admin-report.service';

/**
 * Get sales report
 */
export const getSalesReport = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, tenantId, stationId } = req.query;
    
    const result = await adminReportService.getSalesReport({
      startDate: startDate as string,
      endDate: endDate as string,
      tenantId: tenantId as string,
      stationId: stationId as string
    });
    
    return res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error: any) {
    console.error('Get sales report error:', error);
    return res.status(500).json({
      status: 'error',
      code: 'SERVER_ERROR',
      message: error.message || 'An unexpected error occurred'
    });
  }
};

/**
 * Get credit report
 */
export const getCreditReport = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, tenantId, stationId } = req.query;
    
    const result = await adminReportService.getCreditReport({
      startDate: startDate as string,
      endDate: endDate as string,
      tenantId: tenantId as string,
      stationId: stationId as string
    });
    
    return res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error: any) {
    console.error('Get credit report error:', error);
    return res.status(500).json({
      status: 'error',
      code: 'SERVER_ERROR',
      message: error.message || 'An unexpected error occurred'
    });
  }
};

/**
 * Get compliance report
 */
export const getComplianceReport = async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.query;
    
    const result = await adminReportService.getComplianceReport({
      tenantId: tenantId as string
    });
    
    return res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error: any) {
    console.error('Get compliance report error:', error);
    return res.status(500).json({
      status: 'error',
      code: 'SERVER_ERROR',
      message: error.message || 'An unexpected error occurred'
    });
  }
};