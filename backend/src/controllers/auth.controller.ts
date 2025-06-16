// src/controllers/auth.controller.ts
import { Request, Response } from 'express';
import * as userService from '../services/user.service';
import * as tenantService from '../services/tenant.service';

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    const authData = await userService.authenticateUser(email, password);
    
    return res.status(200).json(authData);
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(401).json({ message: error.message || 'Authentication failed' });
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, planType } = req.body;
    
    if (!name || !email || !password || !planType) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    // Validate plan type
    if (!['basic', 'premium', 'enterprise'].includes(planType)) {
      return res.status(400).json({ message: 'Invalid plan type' });
    }
    
    // Create tenant and owner user
    const tenant = await tenantService.createTenant(name, planType, email, password);
    
    return res.status(201).json({
      message: 'Tenant created successfully',
      tenant: {
        id: tenant.tenantId,
        name,
        planType
      }
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: error.message || 'Registration failed' });
  }
};