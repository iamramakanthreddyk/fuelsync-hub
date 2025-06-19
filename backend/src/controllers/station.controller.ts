// src/controllers/station.controller.ts
import { Request, Response } from 'express';
import * as stationService from '../services/station.service';

export const getStations = async (req: Request, res: Response) => {
  try {
    console.log('[STATION] Getting stations for user:', req.user?.email, 'tenant:', req.user?.tenant_id);
    
    const tenantId = req.user?.tenant_id;
    const stations = await stationService.getStations(tenantId);
    
    console.log('[STATION] Found stations:', stations.length);
    
    return res.status(200).json({
      status: 'success',
      data: stations
    });
  } catch (error: any) {
    console.error('[STATION] Get stations error:', error);
    return res.status(500).json({ 
      status: 'error',
      code: 'SERVER_ERROR',
      message: error.message || 'Failed to get stations' 
    });
  }
};

export const getStationById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tenantId = req.user?.tenant_id;
    
    console.log('[STATION] Getting station by ID:', id, 'for tenant:', tenantId);
    
    const station = await stationService.getStationById(id, tenantId);
    
    if (!station) {
      return res.status(404).json({ 
        status: 'error',
        code: 'STATION_NOT_FOUND',
        message: 'Station not found' 
      });
    }
    
    return res.status(200).json({
      status: 'success',
      data: station
    });
  } catch (error: any) {
    console.error('[STATION] Get station error:', error);
    return res.status(500).json({ 
      status: 'error',
      code: 'SERVER_ERROR',
      message: error.message || 'Failed to get station' 
    });
  }
};

export const createStation = async (req: Request, res: Response) => {
  try {
    const { name, address, city, state, zip, contact_phone } = req.body;
    const tenantId = req.user?.tenant_id;
    
    if (!name) {
      return res.status(400).json({ 
        status: 'error',
        code: 'MISSING_NAME',
        message: 'Station name is required' 
      });
    }
    
    if (!tenantId) {
      return res.status(400).json({ 
        status: 'error',
        code: 'TENANT_ID_MISSING',
        message: 'Tenant ID is required' 
      });
    }
    
    console.log('[STATION] Creating station:', name, 'for tenant:', tenantId);
    
    const station = await stationService.createStation(
      name,
      address || '',
      city || '',
      state || '',
      zip || '',
      contact_phone || '',
      tenantId
    );
    
    return res.status(201).json({
      status: 'success',
      data: station
    });
  } catch (error: any) {
    console.error('[STATION] Create station error:', error);
    return res.status(500).json({ 
      status: 'error',
      code: 'SERVER_ERROR',
      message: error.message || 'Failed to create station' 
    });
  }
};

export const updateStation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const tenantId = req.user?.tenant_id;
    
    console.log('[STATION] Updating station:', id, 'for tenant:', tenantId);
    
    const station = await stationService.updateStation(id, updates, tenantId);
    
    if (!station) {
      return res.status(404).json({ 
        status: 'error',
        code: 'STATION_NOT_FOUND',
        message: 'Station not found' 
      });
    }
    
    return res.status(200).json({
      status: 'success',
      data: station
    });
  } catch (error: any) {
    console.error('[STATION] Update station error:', error);
    return res.status(500).json({ 
      status: 'error',
      code: 'SERVER_ERROR',
      message: error.message || 'Failed to update station' 
    });
  }
};

export const deleteStation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tenantId = req.user?.tenant_id;
    
    console.log('[STATION] Deleting station:', id, 'for tenant:', tenantId);
    
    const success = await stationService.deleteStation(id, tenantId);
    
    if (!success) {
      return res.status(404).json({ 
        status: 'error',
        code: 'STATION_NOT_FOUND',
        message: 'Station not found' 
      });
    }
    
    return res.status(204).send();
  } catch (error: any) {
    console.error('[STATION] Delete station error:', error);
    return res.status(500).json({ 
      status: 'error',
      code: 'SERVER_ERROR',
      message: error.message || 'Failed to delete station' 
    });
  }
};