// src/controllers/station.controller.ts
import { Request, Response } from 'express';
import * as stationService from '../services/station.service';

export const createStation = async (req: Request, res: Response) => {
  try {
    const { name, address, city, state, zip, contactPhone, location, operatingHours } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Station name is required' });
    }
    
    // Get schema name from middleware
    const schemaName = req.schemaName;
    if (!schemaName) {
      return res.status(500).json({ message: 'Tenant context not set' });
    }
    
    const station = await stationService.createStation(
      schemaName,
      name,
      address || '',
      city || '',
      state || '',
      zip || '',
      contactPhone || '',
      location || {},
      operatingHours || {}
    );
    
    return res.status(201).json(station);
  } catch (error: any) {
    console.error('Create station error:', error);
    return res.status(500).json({ message: error.message || 'Failed to create station' });
  }
};

export const getStations = async (req: Request, res: Response) => {
  try {
    // Get schema name from middleware
    const schemaName = req.schemaName;
    if (!schemaName) {
      return res.status(500).json({ message: 'Tenant context not set' });
    }
    
    const stations = await stationService.getStations(schemaName);
    
    return res.status(200).json(stations);
  } catch (error: any) {
    console.error('Get stations error:', error);
    return res.status(500).json({ message: error.message || 'Failed to get stations' });
  }
};

export const getStationById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Get schema name from middleware
    const schemaName = req.schemaName;
    if (!schemaName) {
      return res.status(500).json({ message: 'Tenant context not set' });
    }
    
    const station = await stationService.getStationById(schemaName, id);
    
    if (!station) {
      return res.status(404).json({ message: 'Station not found' });
    }
    
    return res.status(200).json(station);
  } catch (error: any) {
    console.error('Get station error:', error);
    return res.status(500).json({ message: error.message || 'Failed to get station' });
  }
};

export const updateStation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Get schema name from middleware
    const schemaName = req.schemaName;
    if (!schemaName) {
      return res.status(500).json({ message: 'Tenant context not set' });
    }
    
    const station = await stationService.updateStation(schemaName, id, updates);
    
    if (!station) {
      return res.status(404).json({ message: 'Station not found' });
    }
    
    return res.status(200).json(station);
  } catch (error: any) {
    console.error('Update station error:', error);
    return res.status(500).json({ message: error.message || 'Failed to update station' });
  }
};

export const deleteStation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Get schema name from middleware
    const schemaName = req.schemaName;
    if (!schemaName) {
      return res.status(500).json({ message: 'Tenant context not set' });
    }
    
    const success = await stationService.deleteStation(schemaName, id);
    
    if (!success) {
      return res.status(404).json({ message: 'Station not found' });
    }
    
    return res.status(204).send();
  } catch (error: any) {
    console.error('Delete station error:', error);
    return res.status(500).json({ message: error.message || 'Failed to delete station' });
  }
};