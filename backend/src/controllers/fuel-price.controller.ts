import { Request, Response } from 'express';
import * as fuelPriceService from '../services/fuel-price.service';

interface FuelPriceRequestBody {
  stationId: string;
  fuelType: string;
  pricePerUnit: number;
  effectiveFrom?: string;
  notes?: string;
}

export const createFuelPrice = async (req: Request, res: Response) => {
  try {
    const {
      stationId,
      fuelType,
      pricePerUnit,
      effectiveFrom,
      notes
    } = req.body as FuelPriceRequestBody;
    
    if (!stationId || !fuelType || pricePerUnit === undefined) {
      return res.status(400).json({ 
        status: 'error',
        code: 'MISSING_REQUIRED_FIELDS',
        message: 'Station ID, fuel type, and price per unit are required' 
      });
    }
    
    if (pricePerUnit <= 0) {
      return res.status(400).json({ 
        status: 'error',
        code: 'INVALID_PRICE',
        message: 'Price per unit must be greater than zero' 
      });
    }
    
    // Get schema name from middleware
    const schemaName = req.schemaName;
    if (!schemaName) {
      return res.status(500).json({ 
        status: 'error',
        code: 'TENANT_CONTEXT_MISSING',
        message: 'Tenant context not set' 
      });
    }
    
    // Get user ID from authenticated request
    const userId = req.user.id;
    
    const fuelPrice = await fuelPriceService.createFuelPrice(
      schemaName,
      stationId,
      fuelType,
      pricePerUnit,
      userId,
      effectiveFrom,
      notes
    );
    
    return res.status(201).json({
      status: 'success',
      data: fuelPrice
    });
  } catch (error) {
    console.error('Create fuel price error:', error);
    const message = error instanceof Error ? error.message : 'Failed to create fuel price';
    return res.status(500).json({ 
      status: 'error',
      code: 'SERVER_ERROR',
      message 
    });
  }
};

export const getCurrentFuelPrices = async (req: Request, res: Response) => {
  try {
    const { stationId } = req.query;
    
    if (!stationId) {
      return res.status(400).json({ 
        status: 'error',
        code: 'MISSING_REQUIRED_FIELDS',
        message: 'Station ID is required' 
      });
    }
    
    // Get schema name from middleware
    const schemaName = req.schemaName;
    if (!schemaName) {
      return res.status(500).json({ 
        status: 'error',
        code: 'TENANT_CONTEXT_MISSING',
        message: 'Tenant context not set' 
      });
    }
    
    const fuelPrices = await fuelPriceService.getCurrentFuelPrices(
      schemaName,
      stationId as string
    );
    
    return res.status(200).json({
      status: 'success',
      data: fuelPrices
    });
  } catch (error) {
    console.error('Get current fuel prices error:', error);
    const message = error instanceof Error ? error.message : 'Failed to get current fuel prices';
    return res.status(500).json({ 
      status: 'error',
      code: 'SERVER_ERROR',
      message 
    });
  }
};

export const getFuelPriceHistory = async (req: Request, res: Response) => {
  try {
    const { stationId, fuelType, startDate, endDate } = req.query;
    
    if (!stationId) {
      return res.status(400).json({ 
        status: 'error',
        code: 'MISSING_REQUIRED_FIELDS',
        message: 'Station ID is required' 
      });
    }
    
    // Get schema name from middleware
    const schemaName = req.schemaName;
    if (!schemaName) {
      return res.status(500).json({ 
        status: 'error',
        code: 'TENANT_CONTEXT_MISSING',
        message: 'Tenant context not set' 
      });
    }
    
    const fuelPrices = await fuelPriceService.getFuelPriceHistory(
      schemaName,
      stationId as string,
      fuelType as string,
      startDate as string,
      endDate as string
    );
    
    return res.status(200).json({
      status: 'success',
      data: fuelPrices
    });
  } catch (error) {
    console.error('Get fuel price history error:', error);
    const message = error instanceof Error ? error.message : 'Failed to get fuel price history';
    return res.status(500).json({ 
      status: 'error',
      code: 'SERVER_ERROR',
      message 
    });
  }
};

export const getFuelPriceById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Get schema name from middleware
    const schemaName = req.schemaName;
    if (!schemaName) {
      return res.status(500).json({ 
        status: 'error',
        code: 'TENANT_CONTEXT_MISSING',
        message: 'Tenant context not set' 
      });
    }
    
    const fuelPrice = await fuelPriceService.getFuelPriceById(schemaName, id);
    
    if (!fuelPrice) {
      return res.status(404).json({ 
        status: 'error',
        code: 'FUEL_PRICE_NOT_FOUND',
        message: 'Fuel price not found' 
      });
    }
    
    return res.status(200).json({
      status: 'success',
      data: fuelPrice
    });
  } catch (error) {
    console.error('Get fuel price error:', error);
    const message = error instanceof Error ? error.message : 'Failed to get fuel price';
    return res.status(500).json({ 
      status: 'error',
      code: 'SERVER_ERROR',
      message 
    });
  }
};

export const getFuelPriceAtDate = async (req: Request, res: Response) => {
  try {
    const { stationId, fuelType, date } = req.query;
    
    if (!stationId || !fuelType || !date) {
      return res.status(400).json({ 
        status: 'error',
        code: 'MISSING_REQUIRED_FIELDS',
        message: 'Station ID, fuel type, and date are required' 
      });
    }
    
    // Get schema name from middleware
    const schemaName = req.schemaName;
    if (!schemaName) {
      return res.status(500).json({ 
        status: 'error',
        code: 'TENANT_CONTEXT_MISSING',
        message: 'Tenant context not set' 
      });
    }
    
    const fuelPrice = await fuelPriceService.getFuelPriceAtDate(
      schemaName,
      stationId as string,
      fuelType as string,
      date as string
    );
    
    if (!fuelPrice) {
      return res.status(404).json({ 
        status: 'error',
        code: 'FUEL_PRICE_NOT_FOUND',
        message: 'No fuel price found for the specified date' 
      });
    }
    
    return res.status(200).json({
      status: 'success',
      data: fuelPrice
    });
  } catch (error) {
    console.error('Get fuel price at date error:', error);
    const message = error instanceof Error ? error.message : 'Failed to get fuel price at date';
    return res.status(500).json({ 
      status: 'error',
      code: 'SERVER_ERROR',
      message 
    });
  }
};