import { Request, Response } from 'express';
import * as nozzleService from '../services/nozzle.service';
import { sendErrorResponse } from '../utils/errorResponse';

export const createNozzle = async (req: Request, res: Response) => {
  try {
    const { pumpId, fuelType, initialReading } = req.body;
    
    if (!pumpId || !fuelType || initialReading === undefined) {
      return sendErrorResponse(
        res,
        'MISSING_REQUIRED_FIELDS',
        'Pump ID, fuel type, and initial reading are required'
      );
    }
    
    // Get schema name from middleware
    const schemaName = req.schemaName;
    if (!schemaName) {
      return sendErrorResponse(res, 'TENANT_CONTEXT_MISSING', 'Tenant context not set', 500);
    }
    
    const nozzle = await nozzleService.createNozzle(
      schemaName,
      pumpId,
      fuelType,
      parseFloat(initialReading.toString())
    );
    
    return res.status(201).json(nozzle);
  } catch (error: any) {
    console.error('Create nozzle error:', error);
    return sendErrorResponse(
      res,
      'SERVER_ERROR',
      error.message || 'Failed to create nozzle',
      500
    );
  }
};

export const getNozzlesByPumpId = async (req: Request, res: Response) => {
  try {
    const { pumpId } = req.params;
    
    // Get schema name from middleware
    const schemaName = req.schemaName;
    if (!schemaName) {
      return sendErrorResponse(res, 'TENANT_CONTEXT_MISSING', 'Tenant context not set', 500);
    }
    
    const nozzles = await nozzleService.getNozzlesByPumpId(schemaName, pumpId);
    
    return res.status(200).json(nozzles);
  } catch (error: any) {
    console.error('Get nozzles error:', error);
    return sendErrorResponse(res, 'SERVER_ERROR', error.message || 'Failed to get nozzles', 500);
  }
};

export const getNozzlesByStationId = async (req: Request, res: Response) => {
  try {
    const { stationId } = req.params;
    
    // Get schema name from middleware
    const schemaName = req.schemaName;
    if (!schemaName) {
      return sendErrorResponse(res, 'TENANT_CONTEXT_MISSING', 'Tenant context not set', 500);
    }
    
    const nozzles = await nozzleService.getNozzlesByStationId(schemaName, stationId);
    
    return res.status(200).json(nozzles);
  } catch (error: any) {
    console.error('Get nozzles by station error:', error);
    return sendErrorResponse(res, 'SERVER_ERROR', error.message || 'Failed to get nozzles', 500);
  }
};

export const getNozzleById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Get schema name from middleware
    const schemaName = req.schemaName;
    if (!schemaName) {
      return sendErrorResponse(res, 'TENANT_CONTEXT_MISSING', 'Tenant context not set', 500);
    }
    
    const nozzle = await nozzleService.getNozzleById(schemaName, id);
    
    if (!nozzle) {
      return sendErrorResponse(res, 'NOZZLE_NOT_FOUND', 'Nozzle not found', 404);
    }
    
    return res.status(200).json(nozzle);
  } catch (error: any) {
    console.error('Get nozzle error:', error);
    return sendErrorResponse(res, 'SERVER_ERROR', error.message || 'Failed to get nozzle', 500);
  }
};

export const updateNozzle = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Get schema name from middleware
    const schemaName = req.schemaName;
    if (!schemaName) {
      return sendErrorResponse(res, 'TENANT_CONTEXT_MISSING', 'Tenant context not set', 500);
    }
    
    const nozzle = await nozzleService.updateNozzle(schemaName, id, updates);

    if (!nozzle) {
      return sendErrorResponse(res, 'NOZZLE_NOT_FOUND', 'Nozzle not found', 404);
    }
    
    return res.status(200).json(nozzle);
  } catch (error: any) {
    console.error('Update nozzle error:', error);
    return sendErrorResponse(res, 'SERVER_ERROR', error.message || 'Failed to update nozzle', 500);
  }
};

export const recordNozzleReading = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reading, notes } = req.body;
    
    if (reading === undefined) {
      return sendErrorResponse(res, 'MISSING_REQUIRED_FIELDS', 'Reading is required');
    }
    
    // Get schema name from middleware
    const schemaName = req.schemaName;
    if (!schemaName) {
      return sendErrorResponse(res, 'TENANT_CONTEXT_MISSING', 'Tenant context not set', 500);
    }
    
    // Get user ID from authenticated request
    const userId = req.user!.id;
    
    const readingRecord = await nozzleService.recordNozzleReading(
      schemaName,
      id,
      parseFloat(reading.toString()),
      userId,
      notes
    );

    return res.status(200).json(readingRecord);
  } catch (error: any) {
    console.error('Record nozzle reading error:', error);
    if (error instanceof Error && error.message.includes('last recorded')) {
      return sendErrorResponse(res, 'INVALID_READING', error.message);
    }
    return sendErrorResponse(
      res,
      'SERVER_ERROR',
      error.message || 'Failed to record nozzle reading',
      500
    );
  }
};

export const deleteNozzle = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const schemaName = req.schemaName;
    if (!schemaName) {
      return sendErrorResponse(res, 'TENANT_CONTEXT_MISSING', 'Tenant context not set', 500);
    }

    const success = await nozzleService.deleteNozzle(schemaName, id);
    if (!success) {
      return sendErrorResponse(res, 'NOZZLE_NOT_FOUND', 'Nozzle not found', 404);
    }

    return res.status(204).send();
  } catch (error: any) {
    console.error('Delete nozzle error:', error);
    return sendErrorResponse(res, 'SERVER_ERROR', error.message || 'Failed to delete nozzle', 500);
  }
};