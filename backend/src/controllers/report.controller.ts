import { Request, Response } from 'express';
import * as reportService from '../services/report.service';

export const getSalesSummary = async (req: Request, res: Response) => {
  try {
    const { stationId, startDate, endDate } = req.query;
    
    // Validate required fields
    if (!stationId || !startDate || !endDate) {
      return res.status(400).json({ message: 'Station ID, start date, and end date are required' });
    }
    
    // Get schema name from middleware
    const schemaName = req.schemaName;
    if (!schemaName) {
      return res.status(500).json({ message: 'Tenant context not set' });
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
    return res.status(500).json({ message: error.message || 'Failed to get sales summary' });
  }
};

export const getSalesDetail = async (req: Request, res: Response) => {
  try {
    const { stationId, startDate, endDate } = req.query;
    
    // Validate required fields
    if (!stationId || !startDate || !endDate) {
      return res.status(400).json({ message: 'Station ID, start date, and end date are required' });
    }
    
    // Get schema name from middleware
    const schemaName = req.schemaName;
    if (!schemaName) {
      return res.status(500).json({ message: 'Tenant context not set' });
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
    return res.status(500).json({ message: error.message || 'Failed to get sales detail' });
  }
};

export const getCreditorsReport = async (req: Request, res: Response) => {
  try {
    const { stationId } = req.query;
    
    // Get schema name from middleware
    const schemaName = req.schemaName;
    if (!schemaName) {
      return res.status(500).json({ message: 'Tenant context not set' });
    }
    
    const creditors = await reportService.getCreditorsReport(
      schemaName,
      stationId as string
    );
    
    return res.status(200).json(creditors);
  } catch (error: any) {
    console.error('Get creditors report error:', error);
    return res.status(500).json({ message: error.message || 'Failed to get creditors report' });
  }
};

export const getStationPerformance = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Validate required fields
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }
    
    // Get schema name from middleware
    const schemaName = req.schemaName;
    if (!schemaName) {
      return res.status(500).json({ message: 'Tenant context not set' });
    }
    
    const performance = await reportService.getStationPerformance(
      schemaName,
      startDate as string,
      endDate as string
    );
    
    return res.status(200).json(performance);
  } catch (error: any) {
    console.error('Get station performance error:', error);
    return res.status(500).json({ message: error.message || 'Failed to get station performance' });
  }
};