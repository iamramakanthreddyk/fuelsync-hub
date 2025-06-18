// src/controllers/admin/station.controller.ts
import { Request, Response } from 'express';
import * as stationService from '../../services/admin/station.service';

/**
 * Get all stations
 */
export const getStations = async (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '10', search = '', tenantId = '' } = req.query;
    
    const pageNumber = parseInt(page as string, 10);
    const limitNumber = parseInt(limit as string, 10);
    
    const stations = await stationService.getStations(
      pageNumber,
      limitNumber,
      search as string,
      tenantId as string
    );
    
    return res.status(200).json({
      status: 'success',
      data: stations
    });
  } catch (error: any) {
    console.error('Get stations error:', error);
    return res.status(500).json({
      status: 'error',
      code: 'SERVER_ERROR',
      message: error.message || 'Failed to get stations'
    });
  }
};

/**
 * Get station by ID
 */
export const getStationById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const station = await stationService.getStationById(id);
    
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
    console.error('Get station error:', error);
    return res.status(500).json({
      status: 'error',
      code: 'SERVER_ERROR',
      message: error.message || 'Failed to get station'
    });
  }
};

/**
 * Create a new station
 */
export const createStation = async (req: Request, res: Response) => {
  try {
    const { 
      name, 
      address, 
      city, 
      state, 
      zip, 
      contactPhone, 
      tenantId,
      location,
      operatingHours
    } = req.body;
    
    // Validate required fields
    if (!name || !address || !city || !state || !zip || !contactPhone || !tenantId) {
      return res.status(400).json({
        status: 'error',
        code: 'MISSING_FIELDS',
        message: 'Required fields are missing'
      });
    }
    
    const station = await stationService.createStation({
      name,
      address,
      city,
      state,
      zip,
      contactPhone,
      tenantId,
      location: location || {},
      operatingHours: operatingHours || {}
    });
    
    return res.status(201).json({
      status: 'success',
      data: station
    });
  } catch (error: any) {
    console.error('Create station error:', error);
    
    return res.status(500).json({
      status: 'error',
      code: 'SERVER_ERROR',
      message: error.message || 'Failed to create station'
    });
  }
};

/**
 * Update a station
 */
export const updateStation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      address, 
      city, 
      state, 
      zip, 
      contactPhone,
      location,
      operatingHours,
      active
    } = req.body;
    
    const station = await stationService.updateStation(id, {
      name,
      address,
      city,
      state,
      zip,
      contactPhone,
      location,
      operatingHours,
      active
    });
    
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
    console.error('Update station error:', error);
    
    return res.status(500).json({
      status: 'error',
      code: 'SERVER_ERROR',
      message: error.message || 'Failed to update station'
    });
  }
};

/**
 * Delete a station
 */
export const deleteStation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const success = await stationService.deleteStation(id);
    
    if (!success) {
      return res.status(404).json({
        status: 'error',
        code: 'STATION_NOT_FOUND',
        message: 'Station not found'
      });
    }
    
    return res.status(204).send();
  } catch (error: any) {
    console.error('Delete station error:', error);
    return res.status(500).json({
      status: 'error',
      code: 'SERVER_ERROR',
      message: error.message || 'Failed to delete station'
    });
  }
};