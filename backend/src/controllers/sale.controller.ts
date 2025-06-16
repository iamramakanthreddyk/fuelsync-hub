import { Request, Response } from 'express';
import * as salesService from '../services/sales.service';

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
      return res.status(400).json({ message: 'Station ID, nozzle ID, and cumulative reading are required' });
    }
    
    if ((cashReceived === undefined || cashReceived === null) && 
        (creditGiven === undefined || creditGiven === null)) {
      return res.status(400).json({ message: 'Either cash received or credit given must be specified' });
    }
    
    // Get schema name from middleware
    const schemaName = req.schemaName;
    if (!schemaName) {
      return res.status(500).json({ message: 'Tenant context not set' });
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
      creditPartyId || null,
      notes || null
    );
    
    return res.status(201).json(sale);
  } catch (error: any) {
    console.error('Create sale error:', error);
    return res.status(500).json({ message: error.message || 'Failed to create sale' });
  }
};

export const getSales = async (req: Request, res: Response) => {
  try {
    const { stationId, startDate, endDate, userId } = req.query;
    
    // Get schema name from middleware
    const schemaName = req.schemaName;
    if (!schemaName) {
      return res.status(500).json({ message: 'Tenant context not set' });
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
    return res.status(500).json({ message: error.message || 'Failed to get sales' });
  }
};

export const getDailySalesTotals = async (req: Request, res: Response) => {
  try {
    const { stationId, date } = req.query;
    
    if (!stationId || !date) {
      return res.status(400).json({ message: 'Station ID and date are required' });
    }
    
    // Get schema name from middleware
    const schemaName = req.schemaName;
    if (!schemaName) {
      return res.status(500).json({ message: 'Tenant context not set' });
    }
    
    const totals = await salesService.getDailySalesTotals(
      schemaName,
      stationId as string,
      date as string
    );
    
    return res.status(200).json(totals);
  } catch (error: any) {
    console.error('Get daily sales totals error:', error);
    return res.status(500).json({ message: error.message || 'Failed to get daily sales totals' });
  }
};

export const voidSale = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    if (!reason) {
      return res.status(400).json({ message: 'Reason for voiding is required' });
    }
    
    // Get schema name from middleware
    const schemaName = req.schemaName;
    if (!schemaName) {
      return res.status(500).json({ message: 'Tenant context not set' });
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
      return res.status(404).json({ message: 'Sale not found or already voided' });
    }
    
    return res.status(200).json({ message: 'Sale voided successfully' });
  } catch (error: any) {
    console.error('Void sale error:', error);
    return res.status(500).json({ message: error.message || 'Failed to void sale' });
  }
};