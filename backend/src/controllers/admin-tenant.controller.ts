// src/controllers/admin-tenant.controller.ts
import { Request, Response } from 'express';
import * as adminTenantService from '../services/admin-tenant.service';

/**
 * Get all tenants
 */
export const getAllTenants = async (req: Request, res: Response) => {
  try {
    const tenants = await adminTenantService.getAllTenants();
    
    return res.status(200).json({
      status: 'success',
      data: tenants
    });
  } catch (error: any) {
    console.error('Get all tenants error:', error);
    return res.status(500).json({
      status: 'error',
      code: 'SERVER_ERROR',
      message: error.message || 'An unexpected error occurred'
    });
  }
};

/**
 * Get tenant by ID
 */
export const getTenantById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        status: 'error',
        code: 'MISSING_ID',
        message: 'Tenant ID is required'
      });
    }
    
    const tenant = await adminTenantService.getTenantById(id);
    
    if (!tenant) {
      return res.status(404).json({
        status: 'error',
        code: 'TENANT_NOT_FOUND',
        message: 'Tenant not found'
      });
    }
    
    return res.status(200).json({
      status: 'success',
      data: tenant
    });
  } catch (error: any) {
    console.error('Get tenant by ID error:', error);
    return res.status(500).json({
      status: 'error',
      code: 'SERVER_ERROR',
      message: error.message || 'An unexpected error occurred'
    });
  }
};

/**
 * Create tenant
 */
export const createTenant = async (req: Request, res: Response) => {
  try {
    const { name, email, contactPerson, contactPhone, subscriptionPlan } = req.body;
    
    if (!name || !email || !contactPerson || !contactPhone || !subscriptionPlan) {
      return res.status(400).json({
        status: 'error',
        code: 'MISSING_REQUIRED_FIELDS',
        message: 'Missing required fields'
      });
    }
    
    const tenant = await adminTenantService.createTenant({
      name,
      email,
      contactPerson,
      contactPhone,
      subscriptionPlan
    });
    
    return res.status(201).json({
      status: 'success',
      data: tenant
    });
  } catch (error: any) {
    console.error('Create tenant error:', error);
    
    if (error.code === 'DUPLICATE_EMAIL') {
      return res.status(400).json({
        status: 'error',
        code: 'DUPLICATE_EMAIL',
        message: 'Email already in use'
      });
    }
    
    return res.status(500).json({
      status: 'error',
      code: 'SERVER_ERROR',
      message: error.message || 'An unexpected error occurred'
    });
  }
};

/**
 * Update tenant
 */
export const updateTenant = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, contactPerson, contactPhone, subscriptionPlan, status } = req.body;
    
    if (!id) {
      return res.status(400).json({
        status: 'error',
        code: 'MISSING_ID',
        message: 'Tenant ID is required'
      });
    }
    
    // Check if tenant exists
    const existingTenant = await adminTenantService.getTenantById(id);
    
    if (!existingTenant) {
      return res.status(404).json({
        status: 'error',
        code: 'TENANT_NOT_FOUND',
        message: 'Tenant not found'
      });
    }
    
    const tenant = await adminTenantService.updateTenant(id, {
      name,
      email,
      contactPerson,
      contactPhone,
      subscriptionPlan,
      status
    });
    
    return res.status(200).json({
      status: 'success',
      data: tenant
    });
  } catch (error: any) {
    console.error('Update tenant error:', error);
    
    if (error.code === 'DUPLICATE_EMAIL') {
      return res.status(400).json({
        status: 'error',
        code: 'DUPLICATE_EMAIL',
        message: 'Email already in use'
      });
    }
    
    return res.status(500).json({
      status: 'error',
      code: 'SERVER_ERROR',
      message: error.message || 'An unexpected error occurred'
    });
  }
};

/**
 * Delete tenant
 */
export const deleteTenant = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        status: 'error',
        code: 'MISSING_ID',
        message: 'Tenant ID is required'
      });
    }
    
    // Check if tenant exists
    const existingTenant = await adminTenantService.getTenantById(id);
    
    if (!existingTenant) {
      return res.status(404).json({
        status: 'error',
        code: 'TENANT_NOT_FOUND',
        message: 'Tenant not found'
      });
    }
    
    await adminTenantService.deleteTenant(id);
    
    return res.status(200).json({
      status: 'success',
      message: 'Tenant deleted successfully'
    });
  } catch (error: any) {
    console.error('Delete tenant error:', error);
    return res.status(500).json({
      status: 'error',
      code: 'SERVER_ERROR',
      message: error.message || 'An unexpected error occurred'
    });
  }
};