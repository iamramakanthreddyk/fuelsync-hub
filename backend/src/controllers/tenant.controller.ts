import { Request, Response } from 'express';
import * as tenantService from '../services/tenant.service';

export const createTenant = async (req: Request, res: Response) => {
  try {
    const { name, email, password, subscriptionPlan } = req.body;

    if (!name || !email || !password || !subscriptionPlan) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Validate plan type
    if (!['basic', 'premium', 'enterprise'].includes(subscriptionPlan)) {
      return res.status(400).json({ message: 'Invalid plan type' });
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
    return res.status(500).json({ message: error.message || 'Failed to create tenant' });
  }
};

export const getTenants = async (req: Request, res: Response) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }
    
    const tenants = await tenantService.getAllTenants();
    return res.status(200).json(tenants);
  } catch (error: any) {
    console.error('Get tenants error:', error);
    return res.status(500).json({ message: error.message || 'Failed to get tenants' });
  }
};