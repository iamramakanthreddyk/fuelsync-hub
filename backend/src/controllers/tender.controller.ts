import { Request, Response } from 'express';
import * as tenderService from '../services/tender.service';

interface ShiftRequestBody {
  stationId: string;
  openingCash: number;
  notes?: string;
}

interface CloseShiftRequestBody {
  closingCash: number;
  notes?: string;
}

interface TenderEntryRequestBody {
  shiftId: string;
  tenderType: 'cash' | 'card' | 'upi' | 'credit';
  amount: number;
  referenceNumber?: string;
  notes?: string;
}

export const openShift = async (req: Request, res: Response) => {
  try {
    const { stationId, openingCash, notes } = req.body as ShiftRequestBody;
    
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
    
    // Get user ID from authenticated request
    const userId = req.user.id;
    
    // Check if user already has an open shift
    const activeShift = await tenderService.getActiveShiftByUser(schemaName, userId);
    if (activeShift) {
      return res.status(400).json({
        status: 'error',
        code: 'ACTIVE_SHIFT_EXISTS',
        message: 'You already have an active shift',
        data: { shiftId: activeShift.id }
      });
    }
    
    const shift = await tenderService.openShift(
      schemaName,
      stationId,
      userId,
      openingCash || 0,
      notes
    );
    
    return res.status(201).json({
      status: 'success',
      data: shift
    });
  } catch (error) {
    console.error('Open shift error:', error);
    const message = error instanceof Error ? error.message : 'Failed to open shift';
    return res.status(500).json({ 
      status: 'error',
      code: 'SERVER_ERROR',
      message 
    });
  }
};

export const closeShift = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { closingCash, notes } = req.body as CloseShiftRequestBody;
    
    if (closingCash === undefined) {
      return res.status(400).json({ 
        status: 'error',
        code: 'MISSING_REQUIRED_FIELDS',
        message: 'Closing cash amount is required' 
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
    
    // Check if shift exists and belongs to the user
    const shift = await tenderService.getShiftById(schemaName, id);
    if (!shift) {
      return res.status(404).json({
        status: 'error',
        code: 'SHIFT_NOT_FOUND',
        message: 'Shift not found'
      });
    }
    
    if (shift.user_id !== userId) {
      return res.status(403).json({
        status: 'error',
        code: 'UNAUTHORIZED',
        message: 'You can only close your own shifts'
      });
    }
    
    if (shift.status !== 'open') {
      return res.status(400).json({
        status: 'error',
        code: 'SHIFT_ALREADY_CLOSED',
        message: 'Shift is already closed'
      });
    }
    
    const closedShift = await tenderService.closeShift(
      schemaName,
      id,
      closingCash,
      notes
    );
    
    return res.status(200).json({
      status: 'success',
      data: closedShift
    });
  } catch (error) {
    console.error('Close shift error:', error);
    const message = error instanceof Error ? error.message : 'Failed to close shift';
    return res.status(500).json({ 
      status: 'error',
      code: 'SERVER_ERROR',
      message 
    });
  }
};

export const getActiveShift = async (req: Request, res: Response) => {
  try {
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
    
    const shift = await tenderService.getActiveShiftByUser(schemaName, userId);
    
    if (!shift) {
      return res.status(404).json({
        status: 'error',
        code: 'NO_ACTIVE_SHIFT',
        message: 'No active shift found'
      });
    }
    
    return res.status(200).json({
      status: 'success',
      data: shift
    });
  } catch (error) {
    console.error('Get active shift error:', error);
    const message = error instanceof Error ? error.message : 'Failed to get active shift';
    return res.status(500).json({ 
      status: 'error',
      code: 'SERVER_ERROR',
      message 
    });
  }
};

export const getShiftById = async (req: Request, res: Response) => {
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
    
    const shift = await tenderService.getShiftById(schemaName, id);
    
    if (!shift) {
      return res.status(404).json({
        status: 'error',
        code: 'SHIFT_NOT_FOUND',
        message: 'Shift not found'
      });
    }
    
    return res.status(200).json({
      status: 'success',
      data: shift
    });
  } catch (error) {
    console.error('Get shift error:', error);
    const message = error instanceof Error ? error.message : 'Failed to get shift';
    return res.status(500).json({ 
      status: 'error',
      code: 'SERVER_ERROR',
      message 
    });
  }
};

export const getShifts = async (req: Request, res: Response) => {
  try {
    const { stationId, status, startDate, endDate } = req.query;
    
    // Get schema name from middleware
    const schemaName = req.schemaName;
    if (!schemaName) {
      return res.status(500).json({ 
        status: 'error',
        code: 'TENANT_CONTEXT_MISSING',
        message: 'Tenant context not set' 
      });
    }
    
    const shifts = await tenderService.getShifts(
      schemaName,
      stationId as string,
      status as string,
      startDate as string,
      endDate as string
    );
    
    return res.status(200).json({
      status: 'success',
      data: shifts
    });
  } catch (error) {
    console.error('Get shifts error:', error);
    const message = error instanceof Error ? error.message : 'Failed to get shifts';
    return res.status(500).json({ 
      status: 'error',
      code: 'SERVER_ERROR',
      message 
    });
  }
};

export const recordTenderEntry = async (req: Request, res: Response) => {
  try {
    const { shiftId, tenderType, amount, referenceNumber, notes } = req.body as TenderEntryRequestBody;
    
    if (!shiftId) {
      return res.status(400).json({ 
        status: 'error',
        code: 'MISSING_REQUIRED_FIELDS',
        message: 'Shift ID is required' 
      });
    }
    
    if (!tenderType) {
      return res.status(400).json({ 
        status: 'error',
        code: 'MISSING_REQUIRED_FIELDS',
        message: 'Tender type is required' 
      });
    }
    
    if (amount === undefined || amount <= 0) {
      return res.status(400).json({ 
        status: 'error',
        code: 'INVALID_AMOUNT',
        message: 'Valid amount is required' 
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
    
    // Check if shift exists and is open
    const shift = await tenderService.getShiftById(schemaName, shiftId);
    if (!shift) {
      return res.status(404).json({
        status: 'error',
        code: 'SHIFT_NOT_FOUND',
        message: 'Shift not found'
      });
    }
    
    if (shift.status !== 'open') {
      return res.status(400).json({
        status: 'error',
        code: 'SHIFT_CLOSED',
        message: 'Cannot record tender entries for a closed shift'
      });
    }
    
    const tenderEntry = await tenderService.recordTenderEntry(
      schemaName,
      shiftId,
      shift.station_id,
      userId,
      tenderType,
      amount,
      referenceNumber,
      notes
    );
    
    return res.status(201).json({
      status: 'success',
      data: tenderEntry
    });
  } catch (error) {
    console.error('Record tender entry error:', error);
    const message = error instanceof Error ? error.message : 'Failed to record tender entry';
    return res.status(500).json({ 
      status: 'error',
      code: 'SERVER_ERROR',
      message 
    });
  }
};

export const getTenderEntries = async (req: Request, res: Response) => {
  try {
    const { shiftId } = req.params;
    
    // Get schema name from middleware
    const schemaName = req.schemaName;
    if (!schemaName) {
      return res.status(500).json({ 
        status: 'error',
        code: 'TENANT_CONTEXT_MISSING',
        message: 'Tenant context not set' 
      });
    }
    
    const tenderEntries = await tenderService.getTenderEntriesByShift(schemaName, shiftId);
    
    return res.status(200).json({
      status: 'success',
      data: tenderEntries
    });
  } catch (error) {
    console.error('Get tender entries error:', error);
    const message = error instanceof Error ? error.message : 'Failed to get tender entries';
    return res.status(500).json({ 
      status: 'error',
      code: 'SERVER_ERROR',
      message 
    });
  }
};

export const getShiftSummary = async (req: Request, res: Response) => {
  try {
    const { shiftId } = req.params;
    
    // Get schema name from middleware
    const schemaName = req.schemaName;
    if (!schemaName) {
      return res.status(500).json({ 
        status: 'error',
        code: 'TENANT_CONTEXT_MISSING',
        message: 'Tenant context not set' 
      });
    }
    
    const summary = await tenderService.getShiftSummary(schemaName, shiftId);
    
    return res.status(200).json({
      status: 'success',
      data: summary
    });
  } catch (error) {
    console.error('Get shift summary error:', error);
    const message = error instanceof Error ? error.message : 'Failed to get shift summary';
    return res.status(500).json({ 
      status: 'error',
      code: 'SERVER_ERROR',
      message 
    });
  }
};