// src/controllers/admin/user.controller.ts
import { Request, Response } from 'express';
import * as userService from '../../services/admin/user.service';
import { validateEmail } from '../../utils/validators';

/**
 * Get all users
 */
export const getUsers = async (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '10', search = '', tenantId = '' } = req.query;
    
    const pageNumber = parseInt(page as string, 10);
    const limitNumber = parseInt(limit as string, 10);
    
    const users = await userService.getUsers(
      pageNumber,
      limitNumber,
      search as string,
      tenantId as string
    );
    
    return res.status(200).json({
      status: 'success',
      data: users
    });
  } catch (error: any) {
    console.error('Get users error:', error);
    return res.status(500).json({
      status: 'error',
      code: 'SERVER_ERROR',
      message: error.message || 'Failed to get users'
    });
  }
};

/**
 * Get user by ID
 */
export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const user = await userService.getUserById(id);
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        code: 'USER_NOT_FOUND',
        message: 'User not found'
      });
    }
    
    return res.status(200).json({
      status: 'success',
      data: user
    });
  } catch (error: any) {
    console.error('Get user error:', error);
    return res.status(500).json({
      status: 'error',
      code: 'SERVER_ERROR',
      message: error.message || 'Failed to get user'
    });
  }
};

/**
 * Create a new user
 */
export const createUser = async (req: Request, res: Response) => {
  try {
    const { 
      email, 
      password, 
      firstName, 
      lastName, 
      role, 
      tenantId,
      phone
    } = req.body;
    
    // Validate required fields
    if (!email || !password || !firstName || !lastName || !role || !tenantId) {
      return res.status(400).json({
        status: 'error',
        code: 'MISSING_FIELDS',
        message: 'Required fields are missing'
      });
    }
    
    // Validate email
    if (!validateEmail(email)) {
      return res.status(400).json({
        status: 'error',
        code: 'INVALID_EMAIL',
        message: 'Invalid email format'
      });
    }
    
    // Validate role
    if (!['owner', 'manager', 'employee'].includes(role)) {
      return res.status(400).json({
        status: 'error',
        code: 'INVALID_ROLE',
        message: 'Invalid role. Must be one of: owner, manager, employee'
      });
    }
    
    const user = await userService.createUser({
      email,
      password,
      firstName,
      lastName,
      role,
      tenantId,
      phone
    });
    
    return res.status(201).json({
      status: 'success',
      data: user
    });
  } catch (error: any) {
    console.error('Create user error:', error);
    
    // Handle duplicate email
    if (error.code === '23505') {
      return res.status(409).json({
        status: 'error',
        code: 'DUPLICATE_EMAIL',
        message: 'Email already exists'
      });
    }
    
    return res.status(500).json({
      status: 'error',
      code: 'SERVER_ERROR',
      message: error.message || 'Failed to create user'
    });
  }
};

/**
 * Update a user
 */
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { 
      email, 
      password, 
      firstName, 
      lastName, 
      role, 
      phone,
      active
    } = req.body;
    
    // Validate email if provided
    if (email && !validateEmail(email)) {
      return res.status(400).json({
        status: 'error',
        code: 'INVALID_EMAIL',
        message: 'Invalid email format'
      });
    }
    
    // Validate role if provided
    if (role && !['owner', 'manager', 'employee'].includes(role)) {
      return res.status(400).json({
        status: 'error',
        code: 'INVALID_ROLE',
        message: 'Invalid role. Must be one of: owner, manager, employee'
      });
    }
    
    const user = await userService.updateUser(id, {
      email,
      password,
      firstName,
      lastName,
      role,
      phone,
      active
    });
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        code: 'USER_NOT_FOUND',
        message: 'User not found'
      });
    }
    
    return res.status(200).json({
      status: 'success',
      data: user
    });
  } catch (error: any) {
    console.error('Update user error:', error);
    
    // Handle duplicate email
    if (error.code === '23505') {
      return res.status(409).json({
        status: 'error',
        code: 'DUPLICATE_EMAIL',
        message: 'Email already exists'
      });
    }
    
    return res.status(500).json({
      status: 'error',
      code: 'SERVER_ERROR',
      message: error.message || 'Failed to update user'
    });
  }
};

/**
 * Delete a user
 */
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const success = await userService.deleteUser(id);
    
    if (!success) {
      return res.status(404).json({
        status: 'error',
        code: 'USER_NOT_FOUND',
        message: 'User not found'
      });
    }
    
    return res.status(204).send();
  } catch (error: any) {
    console.error('Delete user error:', error);
    return res.status(500).json({
      status: 'error',
      code: 'SERVER_ERROR',
      message: error.message || 'Failed to delete user'
    });
  }
};