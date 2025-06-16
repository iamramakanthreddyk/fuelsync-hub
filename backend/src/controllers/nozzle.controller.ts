import { Request, Response } from 'express';
import * as nozzleService from '../services/nozzle.service';

export const createNozzle = async (req: Request, res: Response) => {
  try {
    const { pumpId, fuelType, initialReading } = req.body;
    
    if (!pumpId || !fuelType || initialReading === undefined) {
      return res.status(400).json({ message: 'Pump ID, fuel type, and initial reading are required' });
    }
    
    // Get schema name from middleware
    const schemaName = req.schemaName;
    if (!schemaName) {
      return res.status(500).json({ message: 'Tenant context not set' });
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
    return res.status(500).json({ message: error.message || 'Failed to create nozzle' });
  }
};

export const getNozzlesByPumpId = async (req: Request, res: Response) => {
  try {
    const { pumpId } = req.params;
    
    // Get schema name from middleware
    const schemaName = req.schemaName;
    if (!schemaName) {
      return res.status(500).json({ message: 'Tenant context not set' });
    }
    
    const nozzles = await nozzleService.getNozzlesByPumpId(schemaName, pumpId);
    
    return res.status(200).json(nozzles);
  } catch (error: any) {
    console.error('Get nozzles error:', error);
    return res.status(500).json({ message: error.message || 'Failed to get nozzles' });
  }
};

export const getNozzlesByStationId = async (req: Request, res: Response) => {
  try {
    const { stationId } = req.params;
    
    // Get schema name from middleware
    const schemaName = req.schemaName;
    if (!schemaName) {
      return res.status(500).json({ message: 'Tenant context not set' });
    }
    
    const nozzles = await nozzleService.getNozzlesByStationId(schemaName, stationId);
    
    return res.status(200).json(nozzles);
  } catch (error: any) {
    console.error('Get nozzles by station error:', error);
    return res.status(500).json({ message: error.message || 'Failed to get nozzles' });
  }
};

export const getNozzleById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Get schema name from middleware
    const schemaName = req.schemaName;
    if (!schemaName) {
      return res.status(500).json({ message: 'Tenant context not set' });
    }
    
    const nozzle = await nozzleService.getNozzleById(schemaName, id);
    
    if (!nozzle) {
      return res.status(404).json({ message: 'Nozzle not found' });
    }
    
    return res.status(200).json(nozzle);
  } catch (error: any) {
    console.error('Get nozzle error:', error);
    return res.status(500).json({ message: error.message || 'Failed to get nozzle' });
  }
};

export const updateNozzle = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Get schema name from middleware
    const schemaName = req.schemaName;
    if (!schemaName) {
      return res.status(500).json({ message: 'Tenant context not set' });
    }
    
    const nozzle = await nozzleService.updateNozzle(schemaName, id, updates);
    
    if (!nozzle) {
      return res.status(404).json({ message: 'Nozzle not found' });
    }
    
    return res.status(200).json(nozzle);
  } catch (error: any) {
    console.error('Update nozzle error:', error);
    return res.status(500).json({ message: error.message || 'Failed to update nozzle' });
  }
};

export const recordNozzleReading = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reading, notes } = req.body;
    
    if (reading === undefined) {
      return res.status(400).json({ message: 'Reading is required' });
    }
    
    // Get schema name from middleware
    const schemaName = req.schemaName;
    if (!schemaName) {
      return res.status(500).json({ message: 'Tenant context not set' });
    }
    
    // Get user ID from authenticated request
    const userId = req.user.id;
    
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
    return res.status(500).json({ message: error.message || 'Failed to record nozzle reading' });
  }
};