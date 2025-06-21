import { Request, Response } from 'express';
import * as salesService from '.././services/sales.service';
import { sendErrorResponse } from '../utils/errorResponse';

export const createSale = async (req: Request, res: Response) => {
  try {
    const { 
      stationId, 
      nozzleId, 
      cumulativeReading, 
      saleVolume, 
      cashReceived, 
      creditGiven,
      creditPartyId,
      notes
    } = req.body;
    
    // Validate required fields
    if (!stationId || !nozzleId || cumulativeReading === undefined) {
      return sendErrorResponse(
        res,
        'MISSING_REQUIRED_FIELDS',
        'Station ID, nozzle ID, and cumulative reading are required'
      );
    }
    
    if ((cashReceived === undefined || cashReceived === null) &&
        (creditGiven === undefined || creditGiven === null)) {
      return sendErrorResponse(
        res,
        'MISSING_REQUIRED_FIELDS',
        'Either cash received or credit given must be specified'
      );
    }

    if (creditGiven && creditGiven > 0 && !creditPartyId) {
      return sendErrorResponse(
        res,
        'MISSING_REQUIRED_FIELDS',
        'Credit party ID is required for credit transactions'
      );
    }
    
    // Get schema name from middleware
    const schemaName = req.schemaName;
    if (!schemaName) {
      return sendErrorResponse(res, 'TENANT_CONTEXT_MISSING', 'Tenant context not set', 500);
    }
    
    // Get user ID from authenticated request
    const userId = req.user.id;
    
    const sale = await salesService.createSale(
      schemaName,
      stationId,
      nozzleId,
      userId,
      parseFloat(cumulativeReading.toString()),
      saleVolume ? parseFloat(saleVolume.toString()) : null,
      cashReceived ? parseFloat(cashReceived.toString()) : 0,
      creditGiven ? parseFloat(creditGiven.toString()) : 0,
      creditGiven && creditGiven > 0 ? creditPartyId || null : null,
      notes || null
    );
    
    return res.status(201).json(sale);
  } catch (error: any) {
    console.error('Create sale error:', error);
    return sendErrorResponse(res, 'SERVER_ERROR', error.message || 'Failed to create sale', 500);
  }
};

export const getSales = async (req: Request, res: Response) => {
  try {
    const { stationId, startDate, endDate, userId } = req.query;
    
    // Get schema name from middleware
    const schemaName = req.schemaName;
    if (!schemaName) {
      return sendErrorResponse(res, 'TENANT_CONTEXT_MISSING', 'Tenant context not set', 500);
    }
    
    const sales = await salesService.getSales(
      schemaName,
      stationId as string,
      startDate as string,
      endDate as string,
      userId as string
    );
    
    return res.status(200).json(sales);
  } catch (error: any) {
    console.error('Get sales error:', error);
    return sendErrorResponse(res, 'SERVER_ERROR', error.message || 'Failed to get sales', 500);
  }
};

export const getDailySalesTotals = async (req: Request, res: Response) => {
  try {
    const { stationId, date } = req.query;
    
    if (!stationId || !date) {
      return sendErrorResponse(res, 'MISSING_REQUIRED_FIELDS', 'Station ID and date are required');
    }
    
    // Get schema name from middleware
    const schemaName = req.schemaName;
    if (!schemaName) {
      return sendErrorResponse(res, 'TENANT_CONTEXT_MISSING', 'Tenant context not set', 500);
    }
    
    const totals = await salesService.getDailySalesTotals(
      schemaName,
      stationId as string,
      date as string
    );
    
    return res.status(200).json(totals);
  } catch (error: any) {
    console.error('Get daily sales totals error:', error);
    return sendErrorResponse(res, 'SERVER_ERROR', error.message || 'Failed to get daily sales totals', 500);
  }
};

export const voidSale = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    if (!reason) {
      return sendErrorResponse(res, 'MISSING_REQUIRED_FIELDS', 'Reason for voiding is required');
    }
    
    // Get schema name from middleware
    const schemaName = req.schemaName;
    if (!schemaName) {
      return sendErrorResponse(res, 'TENANT_CONTEXT_MISSING', 'Tenant context not set', 500);
    }
    
    // Get user ID from authenticated request
    const userId = req.user.id;
    
    const updated = await salesService.voidSale(
      schemaName,
      id,
      userId,
      reason
    );
    
    if (!updated) {
      return sendErrorResponse(res, 'SALE_NOT_FOUND', 'Sale not found or already voided', 404);
    }
    
    return res.status(200).json({ message: 'Sale voided successfully' });
  } catch (error: any) {
    console.error('Void sale error:', error);
    return sendErrorResponse(res, 'SERVER_ERROR', error.message || 'Failed to void sale', 500);
  }
};