import { Request, Response } from 'express';
import * as tenantService from '../services/tenant.service';
import { sendErrorResponse } from '../utils/errorResponse';

export const createTenant = async (req: Request, res: Response) => {
  try {
    const { name, email, password, subscriptionPlan } = req.body;

    if (!name || !email || !password || !subscriptionPlan) {
      return sendErrorResponse(res, 'MISSING_REQUIRED_FIELDS', 'All fields are required');
    }

    // Validate plan type
    if (!['basic', 'premium', 'enterprise'].includes(subscriptionPlan)) {
      return sendErrorResponse(res, 'INVALID_PLAN', 'Invalid plan type');
    }

    // Create tenant and owner user
    const tenant = await tenantService.createTenant(
      name,
      subscriptionPlan,
      email,
      password
    );
    
    return res.status(201).json({
      message: 'Tenant created successfully',
      tenant: {
        id: tenant.tenantId,
        name,
        subscriptionPlan,
        schemaName: tenant.schemaName
      }
    });
  } catch (error: any) {
    console.error('Tenant creation error:', error);
    return sendErrorResponse(res, 'SERVER_ERROR', error.message || 'Failed to create tenant', 500);
  }
};

export const getTenants = async (req: Request, res: Response) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return sendErrorResponse(res, 'UNAUTHORIZED', 'Unauthorized access', 403);
    }
    
    const tenants = await tenantService.getAllTenants();
    return res.status(200).json(tenants);
  } catch (error: any) {
    console.error('Get tenants error:', error);
    return sendErrorResponse(res, 'SERVER_ERROR', error.message || 'Failed to get tenants', 500);
  }
};