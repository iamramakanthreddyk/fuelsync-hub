import { Request, Response } from 'express';
import * as reportService from '../services/report.service';
import { sendErrorResponse } from '../utils/errorResponse';

export const getSalesSummary = async (req: Request, res: Response) => {
  try {
    const { stationId, startDate, endDate } = req.query;
    
    // Validate required fields
    if (!stationId || !startDate || !endDate) {
      return sendErrorResponse(
        res,
        'MISSING_REQUIRED_FIELDS',
        'Station ID, start date, and end date are required'
      );
    }
    
    // Get schema name from middleware
    const schemaName = req.schemaName;
    if (!schemaName) {
      return sendErrorResponse(res, 'TENANT_CONTEXT_MISSING', 'Tenant context not set', 500);
    }
    
    const summary = await reportService.getSalesSummary(
      schemaName,
      stationId as string,
      startDate as string,
      endDate as string
    );
    
    return res.status(200).json(summary);
  } catch (error: any) {
    console.error('Get sales summary error:', error);
    return sendErrorResponse(
      res,
      'SERVER_ERROR',
      error.message || 'Failed to get sales summary',
      500
    );
  }
};

export const getSalesDetail = async (req: Request, res: Response) => {
  try {
    const { stationId, startDate, endDate } = req.query;
    
    // Validate required fields
    if (!stationId || !startDate || !endDate) {
      return sendErrorResponse(
        res,
        'MISSING_REQUIRED_FIELDS',
        'Station ID, start date, and end date are required'
      );
    }
    
    // Get schema name from middleware
    const schemaName = req.schemaName;
    if (!schemaName) {
      return sendErrorResponse(res, 'TENANT_CONTEXT_MISSING', 'Tenant context not set', 500);
    }
    
    const salesDetails = await reportService.getSalesDetail(
      schemaName,
      stationId as string,
      startDate as string,
      endDate as string
    );
    
    return res.status(200).json(salesDetails);
  } catch (error: any) {
    console.error('Get sales detail error:', error);
    return sendErrorResponse(res, 'SERVER_ERROR', error.message || 'Failed to get sales detail', 500);
  }
};

export const getCreditorsReport = async (req: Request, res: Response) => {
  try {
    const { stationId } = req.query;
    
    // Get schema name from middleware
    const schemaName = req.schemaName;
    if (!schemaName) {
      return sendErrorResponse(res, 'TENANT_CONTEXT_MISSING', 'Tenant context not set', 500);
    }
    
    const creditors = await reportService.getCreditorsReport(
      schemaName,
      stationId as string
    );
    
    return res.status(200).json(creditors);
  } catch (error: any) {
    console.error('Get creditors report error:', error);
    return sendErrorResponse(res, 'SERVER_ERROR', error.message || 'Failed to get creditors report', 500);
  }
};

export const getStationPerformance = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Validate required fields
    if (!startDate || !endDate) {
      return sendErrorResponse(res, 'MISSING_REQUIRED_FIELDS', 'Start date and end date are required');
    }
    
    // Get schema name from middleware
    const schemaName = req.schemaName;
    if (!schemaName) {
      return sendErrorResponse(res, 'TENANT_CONTEXT_MISSING', 'Tenant context not set', 500);
    }
    
    const performance = await reportService.getStationPerformance(
      schemaName,
      startDate as string,
      endDate as string
    );
    
    return res.status(200).json(performance);
  } catch (error: any) {
    console.error('Get station performance error:', error);
    return sendErrorResponse(res, 'SERVER_ERROR', error.message || 'Failed to get station performance', 500);
  }
};