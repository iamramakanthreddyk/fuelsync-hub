import { Request, Response } from 'express';
import * as pumpService from '../services/pump.service';
import * as stationService from '../services/station.service';

export const createPump = async (req: Request, res: Response) => {
  try {
    const { stationId, name, serialNumber, installationDate, nozzles } = req.body;

    if (!stationId || !name || !serialNumber || !installationDate || !Array.isArray(nozzles) || nozzles.length < 2) {
      return res.status(400).json({ message: 'Station ID, name, serial number, installation date and at least two nozzles are required' });
    }
    
    // Get schema name and tenant ID from middleware
    const schemaName = req.schemaName;
    const tenantId = req.user?.tenant_id;
    if (!schemaName || !tenantId) {
      return res.status(500).json({ message: 'Tenant context not set' });
    }

    // Verify station belongs to tenant
    const station = await stationService.getStationById(stationId, tenantId);
    if (!station) {
      return res.status(404).json({ message: 'Station not found' });
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
    return res.status(500).json({ message: error.message || 'Failed to create pump' });
  }
};

export const getPumpsByStationId = async (req: Request, res: Response) => {
  try {
    const { stationId } = req.params;
    
    // Get schema name from middleware
    const schemaName = req.schemaName;
    if (!schemaName) {
      return res.status(500).json({ message: 'Tenant context not set' });
    }
    
    const pumps = await pumpService.getPumpsByStationId(schemaName, stationId);
    
    return res.status(200).json(pumps);
  } catch (error: any) {
    console.error('Get pumps error:', error);
    return res.status(500).json({ message: error.message || 'Failed to get pumps' });
  }
};

export const getPumpById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Get schema name from middleware
    const schemaName = req.schemaName;
    if (!schemaName) {
      return res.status(500).json({ message: 'Tenant context not set' });
    }
    
    const pump = await pumpService.getPumpById(schemaName, id);
    
    if (!pump) {
      return res.status(404).json({ message: 'Pump not found' });
    }
    
    return res.status(200).json(pump);
  } catch (error: any) {
    console.error('Get pump error:', error);
    return res.status(500).json({ message: error.message || 'Failed to get pump' });
  }
};

export const updatePump = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Get schema name from middleware
    const schemaName = req.schemaName;
    if (!schemaName) {
      return res.status(500).json({ message: 'Tenant context not set' });
    }
    
    const pump = await pumpService.updatePump(schemaName, id, updates);
    
    if (!pump) {
      return res.status(404).json({ message: 'Pump not found' });
    }
    
    return res.status(200).json(pump);
  } catch (error: any) {
    console.error('Update pump error:', error);
    return res.status(500).json({ message: error.message || 'Failed to update pump' });
  }
};

export const deletePump = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Get schema name from middleware
    const schemaName = req.schemaName;
    if (!schemaName) {
      return res.status(500).json({ message: 'Tenant context not set' });
    }
    
    const success = await pumpService.deletePump(schemaName, id);
    
    if (!success) {
      return res.status(404).json({ message: 'Pump not found' });
    }
    
    return res.status(204).send();
  } catch (error: any) {
    console.error('Delete pump error:', error);
    return res.status(500).json({ message: error.message || 'Failed to delete pump' });
  }
};