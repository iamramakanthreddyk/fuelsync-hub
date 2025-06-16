import { Request, Response } from 'express';
import * as reconciliationService from '../services/reconciliation.service';

export const createReconciliation = async (req: Request, res: Response) => {
  try {
    const { 
      stationId, 
      date, 
      totalSales, 
      cashTotal, 
      creditTotal, 
      cardTotal, 
      upiTotal, 
      finalized, 
      notes 
    } = req.body;
    
    // Validate required fields
    if (!stationId || !date) {
      return res.status(400).json({ message: 'Station ID and date are required' });
    }
    
    if (totalSales === undefined || cashTotal === undefined || 
        creditTotal === undefined || cardTotal === undefined || 
        upiTotal === undefined) {
      return res.status(400).json({ message: 'All payment totals are required' });
    }
    
    // Validate that totals add up
    const totalPayments = parseFloat(cashTotal) + parseFloat(creditTotal) + 
                         parseFloat(cardTotal) + parseFloat(upiTotal);
    
    if (Math.abs(totalPayments - parseFloat(totalSales)) > 0.01) {
      return res.status(400).json({ 
        message: 'Sum of payment methods does not match total sales',
        totalSales: parseFloat(totalSales),
        totalPayments: totalPayments
      });
    }
    
    // Get schema name from middleware
    const schemaName = req.schemaName;
    if (!schemaName) {
      return res.status(500).json({ message: 'Tenant context not set' });
    }
    
    // Get user ID from authenticated request
    const userId = req.user.id;
    
    const reconciliation = await reconciliationService.createReconciliation(
      schemaName,
      stationId,
      date,
      parseFloat(totalSales),
      parseFloat(cashTotal),
      parseFloat(creditTotal),
      parseFloat(cardTotal),
      parseFloat(upiTotal),
      !!finalized,
      userId,
      notes
    );
    
    return res.status(201).json(reconciliation);
  } catch (error: any) {
    console.error('Create reconciliation error:', error);
    return res.status(500).json({ message: error.message || 'Failed to create reconciliation' });
  }
};

export const getReconciliations = async (req: Request, res: Response) => {
  try {
    const { stationId, startDate, endDate } = req.query;
    
    // Get schema name from middleware
    const schemaName = req.schemaName;
    if (!schemaName) {
      return res.status(500).json({ message: 'Tenant context not set' });
    }
    
    const reconciliations = await reconciliationService.getReconciliations(
      schemaName,
      stationId as string,
      startDate as string,
      endDate as string
    );
    
    return res.status(200).json(reconciliations);
  } catch (error: any) {
    console.error('Get reconciliations error:', error);
    return res.status(500).json({ message: error.message || 'Failed to get reconciliations' });
  }
};

export const getReconciliationById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Get schema name from middleware
    const schemaName = req.schemaName;
    if (!schemaName) {
      return res.status(500).json({ message: 'Tenant context not set' });
    }
    
    const reconciliation = await reconciliationService.getReconciliationById(schemaName, id);
    
    if (!reconciliation) {
      return res.status(404).json({ message: 'Reconciliation not found' });
    }
    
    return res.status(200).json(reconciliation);
  } catch (error: any) {
    console.error('Get reconciliation error:', error);
    return res.status(500).json({ message: error.message || 'Failed to get reconciliation' });
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
    
    const totals = await reconciliationService.getDailySalesTotals(
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