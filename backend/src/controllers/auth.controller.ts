// src/controllers/auth.controller.ts
import { Request, Response } from 'express';
import crypto from 'crypto';
import * as authService from '../services/auth.service';
import * as tenantService from '../services/tenant.service';
import { validateEmail } from '../utils/validators';
import { UserModel } from '../models/user.model';
import pool from '../config/database';

type Plan = 'basic' | 'premium' | 'enterprise';

interface LoginBody {
  email: string;
  password: string;
}

interface RegisterBody {
  name: string;
  email: string;
  password: string;
  subscriptionPlan: Plan;
}

/**
 * Handle user login
 */
export const login = async (
  req: Request<{}, {}, LoginBody>,
  res: Response
) => {
  const requestId = crypto.randomUUID();
  console.log('[AUTH] Login attempt:', { 
    requestId,
    email: req.body.email, 
    timestamp: new Date().toISOString() 
  });
  
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        status: 'error',
        code: 'MISSING_CREDENTIALS',
        message: 'Email and password are required' 
      });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ 
        status: 'error',
        code: 'INVALID_EMAIL',
        message: 'Invalid email format' 
      });
    }

    // Authenticate user
    const result = await authService.authenticateTenantUser(email, password);
    
    // Set secure cookie with token
    const token = result.data.token.split(' ')[1];
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    const csrfToken = crypto.randomBytes(20).toString('hex');
    res.cookie('csrfToken', csrfToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000
    });

    console.log('[AUTH] Login successful:', { 
      requestId,
      userId: result.data.user.id,
      role: result.data.user.role,
      tenantId: result.data.user.tenant_id,
      timestamp: new Date().toISOString()
    });

    return res.json({ ...result, csrfToken });
  } catch (error) {
    console.error('[AUTH] Login error:', {
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      email: req.body.email,
      timestamp: new Date().toISOString()
    });
    
    if (error instanceof authService.AuthError) {
      return res.status(error.statusCode).json({
        status: 'error',
        code: error.code,
        message: error.message
      });
    }
    
    return res.status(500).json({
      status: 'error',
      code: 'SERVER_ERROR',
      message: 'An unexpected error occurred during login. Please try again later.'
    });
  }
};

/**
 * Register a new tenant and owner
 */
export const register = async (
  req: Request<{}, {}, RegisterBody>,
  res: Response
) => {
  const requestId = crypto.randomUUID();
  console.log('[AUTH] Registration attempt:', { 
    requestId,
    email: req.body.email, 
    timestamp: new Date().toISOString() 
  });
  
  try {
    const { name, email, password, subscriptionPlan } = req.body;

    if (!name || !email || !password || !subscriptionPlan) {
      return res.status(400).json({
        status: 'error',
        code: 'MISSING_FIELDS',
        message: 'All fields are required'
      });
    }
    
    if (!validateEmail(email)) {
      return res.status(400).json({ 
        status: 'error',
        code: 'INVALID_EMAIL',
        message: 'Invalid email format' 
      });
    }
    
    if (!['basic', 'premium', 'enterprise'].includes(subscriptionPlan)) {
      return res.status(400).json({
        status: 'error',
        code: 'INVALID_PLAN',
        message: 'Invalid plan type'
      });
    }

    const tenant = await tenantService.createTenant(
      name,
      subscriptionPlan,
      email,
      password
    );

    console.log('[AUTH] Registration successful:', { 
      requestId,
      tenantId: tenant.tenantId,
      email,
      timestamp: new Date().toISOString()
    });

    return res.status(201).json({
      status: 'success',
      data: {
        message: 'Tenant created successfully',
        tenant: {
          id: tenant.tenantId,
          name,
          subscriptionPlan
        }
      }
    });
  } catch (error) {
    console.error('[AUTH] Registration error:', {
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      email: req.body.email,
      timestamp: new Date().toISOString()
    });
    
    return res.status(500).json({
      status: 'error',
      code: 'SERVER_ERROR',
      message: error instanceof Error ? error.message : 'Registration failed'
    });
  }
};

/**
 * Get current authenticated user
 */
export const getCurrentUser = async (req: Request, res: Response) => {
  const requestId = crypto.randomUUID();
  console.log('[AUTH] Get current user request:', {
    requestId,
    userId: req.user?.id,
    tenantId: req.user?.tenant_id
  });

  try {
    if (!req.user) {
      return res.status(401).json({ 
        status: 'error',
        code: 'NOT_AUTHENTICATED',
        message: 'Not authenticated' 
      });
    }

    // Use direct query instead of UserModel to ensure we use public schema
    const query = `
      SELECT 
        u.*,
        t.name as tenant_name 
      FROM public.users u 
      LEFT JOIN public.tenants t ON t.id = u.tenant_id 
      WHERE u.id = $1 AND u.active = true`;
    
    const { rows } = await pool.query(query, [req.user.id]);
    const user = rows[0];

    if (!user) {
      console.error('[AUTH] Get current user: User not found in DB:', { 
        requestId, 
        userId: req.user.id 
      });
      return res.status(401).json({ 
        status: 'error',
        code: 'USER_NOT_FOUND',
        message: 'User not found' 
      });
    }

    // Verify tenant_id matches
    if (user.tenant_id !== req.user.tenant_id) {
      console.error('[AUTH] Get current user: Tenant mismatch:', {
        requestId,
        tokenTenantId: req.user.tenant_id,
        userTenantId: user.tenant_id
      });
      return res.status(401).json({ 
        status: 'error',
        code: 'TENANT_MISMATCH',
        message: 'Authentication error' 
      });
    }

    // Return user data without password
    const { password_hash, ...userData } = user;
    
    return res.json({
      status: 'success',
      data: {
        user: userData
      }
    });
  } catch (error) {
    console.error('[AUTH] Get current user error:', {
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      userId: req.user?.id,
      timestamp: new Date().toISOString()
    });
    
    return res.status(500).json({
      status: 'error',
      code: 'SERVER_ERROR',
      message: 'Failed to get user information'
    });
  }
};

/**
 * Logout user
 */
export const logout = async (req: Request, res: Response) => {
  const requestId = crypto.randomUUID();
  console.log('[AUTH] Logout request:', {
    requestId,
    userId: req.user?.id,
    timestamp: new Date().toISOString()
  });
  
  try {
    // Clear auth and CSRF cookies
    res.clearCookie('jwt', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
    res.clearCookie('csrfToken', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
    
    return res.status(200).json({
      status: 'success',
      data: {
        message: 'Logged out successfully'
      }
    });
  } catch (error) {
    console.error('[AUTH] Logout error:', {
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      userId: req.user?.id,
      timestamp: new Date().toISOString()
    });
    
    return res.status(500).json({
      status: 'error',
      code: 'SERVER_ERROR',
      message: 'Logout failed'
    });
  }
};