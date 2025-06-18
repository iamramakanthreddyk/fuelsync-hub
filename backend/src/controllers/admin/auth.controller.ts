// src/controllers/admin/auth.controller.ts
import { Request, Response } from 'express';
import * as authService from '../../services/admin/auth.service';
import { validateEmail } from '../../utils/validators';

/**
 * Handle admin login
 */
export const login = async (req: Request, res: Response) => {
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

    // Authenticate admin
    const result = await authService.authenticateAdmin(email, password);
    
    return res.status(200).json(result);
  } catch (error: any) {
    console.error('Admin login error:', error);
    
    if (error.code === 'INVALID_CREDENTIALS') {
      return res.status(401).json({
        status: 'error',
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password'
      });
    }
    
    return res.status(500).json({
      status: 'error',
      code: 'SERVER_ERROR',
      message: 'An unexpected error occurred during login'
    });
  }
};

/**
 * Handle admin logout
 */
export const logout = async (req: Request, res: Response) => {
  try {
    if (!req.admin) {
      return res.status(401).json({
        status: 'error',
        code: 'UNAUTHORIZED',
        message: 'Not authenticated'
      });
    }

    // Get token from authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        code: 'UNAUTHORIZED',
        message: 'Not authenticated'
      });
    }

    const token = authHeader.split(' ')[1];

    // Logout admin
    await authService.logoutAdmin(req.admin.id, token);
    
    return res.status(200).json({
      status: 'success',
      message: 'Logged out successfully'
    });
  } catch (error: any) {
    console.error('Admin logout error:', error);
    return res.status(500).json({
      status: 'error',
      code: 'SERVER_ERROR',
      message: 'An unexpected error occurred during logout'
    });
  }
};

/**
 * Get current admin
 */
export const getCurrentAdmin = async (req: Request, res: Response) => {
  try {
    if (!req.admin) {
      return res.status(401).json({
        status: 'error',
        code: 'UNAUTHORIZED',
        message: 'Not authenticated'
      });
    }

    const admin = await authService.getAdminById(req.admin.id);
    
    if (!admin) {
      return res.status(401).json({
        status: 'error',
        code: 'ADMIN_NOT_FOUND',
        message: 'Admin not found'
      });
    }

    return res.status(200).json({
      status: 'success',
      data: admin
    });
  } catch (error: any) {
    console.error('Get current admin error:', error);
    return res.status(500).json({
      status: 'error',
      code: 'SERVER_ERROR',
      message: 'An unexpected error occurred'
    });
  }
};