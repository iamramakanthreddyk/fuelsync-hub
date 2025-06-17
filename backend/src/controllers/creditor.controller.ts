import { Request, Response } from 'express';
import * as creditorService from '../services/creditor.service';

interface CreditorRequestBody {
  partyName: string;
  contactPerson?: string;
  contactPhone?: string;
  email?: string;
  address?: string;
  creditLimit?: number;
  notes?: string;
}

interface PaymentRequestBody {
  amount: number;
  paymentMethod: 'cash' | 'bank_transfer' | 'check' | 'upi' | 'credit_card' | 'debit_card';
  referenceNumber?: string;
  notes?: string;
}

export const createCreditor = async (req: Request, res: Response) => {
  try {
    const {
      partyName,
      contactPerson,
      contactPhone,
      email,
      address,
      creditLimit,
      notes
    } = req.body as CreditorRequestBody;
    
    if (!partyName) {
      return res.status(400).json({ 
        status: 'error',
        code: 'MISSING_REQUIRED_FIELDS',
        message: 'Party name is required' 
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
    
    const creditor = await creditorService.createCreditor(
      schemaName,
      partyName,
      contactPerson,
      contactPhone,
      email,
      address,
      creditLimit,
      notes
    );
    
    return res.status(201).json({
      status: 'success',
      data: creditor
    });
  } catch (error) {
    console.error('Create creditor error:', error);
    const message = error instanceof Error ? error.message : 'Failed to create creditor';
    return res.status(500).json({ 
      status: 'error',
      code: 'SERVER_ERROR',
      message 
    });
  }
};

export const getCreditors = async (req: Request, res: Response) => {
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
    
    const creditors = await creditorService.getCreditors(schemaName);
    
    return res.status(200).json({
      status: 'success',
      data: creditors
    });
  } catch (error) {
    console.error('Get creditors error:', error);
    const message = error instanceof Error ? error.message : 'Failed to get creditors';
    return res.status(500).json({ 
      status: 'error',
      code: 'SERVER_ERROR',
      message 
    });
  }
};

export const getCreditorById = async (req: Request, res: Response) => {
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
    
    const creditor = await creditorService.getCreditorById(schemaName, id);
    
    if (!creditor) {
      return res.status(404).json({ 
        status: 'error',
        code: 'CREDITOR_NOT_FOUND',
        message: 'Creditor not found' 
      });
    }
    
    return res.status(200).json({
      status: 'success',
      data: creditor
    });
  } catch (error) {
    console.error('Get creditor error:', error);
    const message = error instanceof Error ? error.message : 'Failed to get creditor';
    return res.status(500).json({ 
      status: 'error',
      code: 'SERVER_ERROR',
      message 
    });
  }
};

export const updateCreditor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body as Partial<CreditorRequestBody>;
    
    // Get schema name from middleware
    const schemaName = req.schemaName;
    if (!schemaName) {
      return res.status(500).json({ 
        status: 'error',
        code: 'TENANT_CONTEXT_MISSING',
        message: 'Tenant context not set' 
      });
    }
    
    const creditor = await creditorService.updateCreditor(schemaName, id, updates);
    
    if (!creditor) {
      return res.status(404).json({ 
        status: 'error',
        code: 'CREDITOR_NOT_FOUND',
        message: 'Creditor not found' 
      });
    }
    
    return res.status(200).json({
      status: 'success',
      data: creditor
    });
  } catch (error) {
    console.error('Update creditor error:', error);
    const message = error instanceof Error ? error.message : 'Failed to update creditor';
    return res.status(500).json({ 
      status: 'error',
      code: 'SERVER_ERROR',
      message 
    });
  }
};

export const recordPayment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { amount, paymentMethod, referenceNumber, notes } = req.body as PaymentRequestBody;
    
    if (amount === undefined || amount <= 0) {
      return res.status(400).json({ 
        status: 'error',
        code: 'INVALID_AMOUNT',
        message: 'Valid payment amount is required' 
      });
    }
    
    if (!paymentMethod) {
      return res.status(400).json({ 
        status: 'error',
        code: 'MISSING_PAYMENT_METHOD',
        message: 'Payment method is required' 
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
    
    const payment = await creditorService.recordPayment(
      schemaName,
      id,
      amount,
      paymentMethod,
      userId,
      referenceNumber,
      notes
    );
    
    return res.status(201).json({
      status: 'success',
      data: payment
    });
  } catch (error) {
    console.error('Record payment error:', error);
    const message = error instanceof Error ? error.message : 'Failed to record payment';
    return res.status(500).json({ 
      status: 'error',
      code: 'SERVER_ERROR',
      message 
    });
  }
};

export const getPaymentHistory = async (req: Request, res: Response) => {
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
    
    const payments = await creditorService.getPaymentHistory(schemaName, id);
    
    return res.status(200).json({
      status: 'success',
      data: payments
    });
  } catch (error) {
    console.error('Get payment history error:', error);
    const message = error instanceof Error ? error.message : 'Failed to get payment history';
    return res.status(500).json({ 
      status: 'error',
      code: 'SERVER_ERROR',
      message 
    });
  }
};