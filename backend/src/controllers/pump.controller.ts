import { Request, Response } from 'express';
import * as pumpService from '../services/pump.service';
import * as stationService from '../services/station.service';
import { sendErrorResponse } from '../utils/errorResponse';

export const createPump = async (req: Request, res: Response) => {
  try {
    const { stationId, name, serialNumber, installationDate, nozzles } = req.body;

    if (!stationId || !name || !serialNumber || !installationDate || !Array.isArray(nozzles) || nozzles.length < 2) {
      return sendErrorResponse(
        res,
        'MISSING_REQUIRED_FIELDS',
        'Station ID, name, serial number, installation date and at least two nozzles are required'
      );
    }
    
    // Get schema name and tenant ID from middleware
    const schemaName = req.schemaName;
    const tenantId = req.user?.tenant_id;
    if (!schemaName || !tenantId) {
      return sendErrorResponse(res, 'TENANT_CONTEXT_MISSING', 'Tenant context not set', 500);
    }

    // Verify station belongs to tenant
    const station = await stationService.getStationById(stationId, tenantId);
    if (!station) {
      return sendErrorResponse(res, 'STATION_NOT_FOUND', 'Station not found', 404);
    }

    const pump = await pumpService.createPump(
      schemaName,
      stationId,
      name,
      serialNumber,
      installationDate,
      Array.isArray(nozzles) ? nozzles : []
    );
    
    return res.status(201).json(pump);
  } catch (error: any) {
    console.error('Create pump error:', error);
    return sendErrorResponse(res, 'SERVER_ERROR', error.message || 'Failed to create pump', 500);
  }
};

export const getPumpsByStationId = async (req: Request, res: Response) => {
  try {
    const { stationId } = req.params;
    
    // Get schema name from middleware
    const schemaName = req.schemaName;
    if (!schemaName) {
      return sendErrorResponse(res, 'TENANT_CONTEXT_MISSING', 'Tenant context not set', 500);
    }
    
    const pumps = await pumpService.getPumpsByStationId(schemaName, stationId);

    return res.status(200).json(pumps);
  } catch (error: any) {
    console.error('Get pumps error:', error);
    return sendErrorResponse(res, 'SERVER_ERROR', error.message || 'Failed to get pumps', 500);
  }
};

export const getPumpById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Get schema name from middleware
    const schemaName = req.schemaName;
    if (!schemaName) {
      return sendErrorResponse(res, 'TENANT_CONTEXT_MISSING', 'Tenant context not set', 500);
    }
    
    const pump = await pumpService.getPumpById(schemaName, id);
    
    if (!pump) {
      return sendErrorResponse(res, 'PUMP_NOT_FOUND', 'Pump not found', 404);
    }
    
    return res.status(200).json(pump);
  } catch (error: any) {
    console.error('Get pump error:', error);
    return sendErrorResponse(res, 'SERVER_ERROR', error.message || 'Failed to get pump', 500);
  }
};

export const updatePump = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Get schema name from middleware
    const schemaName = req.schemaName;
    if (!schemaName) {
      return sendErrorResponse(res, 'TENANT_CONTEXT_MISSING', 'Tenant context not set', 500);
    }
    
    const pump = await pumpService.updatePump(schemaName, id, updates);

    if (!pump) {
      return sendErrorResponse(res, 'PUMP_NOT_FOUND', 'Pump not found', 404);
    }
    
    return res.status(200).json(pump);
  } catch (error: any) {
    console.error('Update pump error:', error);
    return sendErrorResponse(res, 'SERVER_ERROR', error.message || 'Failed to update pump', 500);
  }
};

export const deletePump = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Get schema name from middleware
    const schemaName = req.schemaName;
    if (!schemaName) {
      return sendErrorResponse(res, 'TENANT_CONTEXT_MISSING', 'Tenant context not set', 500);
    }
    
    const success = await pumpService.deletePump(schemaName, id);

    if (!success) {
      return sendErrorResponse(res, 'PUMP_NOT_FOUND', 'Pump not found', 404);
    }
    
    return res.status(204).send();
  } catch (error: any) {
    console.error('Delete pump error:', error);
    return sendErrorResponse(res, 'SERVER_ERROR', error.message || 'Failed to delete pump', 500);
  }
};