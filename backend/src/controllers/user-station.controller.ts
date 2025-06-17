import { Request, Response } from 'express';
import * as userStationService from '../services/user-station.service';

interface UserStationAssignmentBody {
  userId: string;
  stationId: string;
  role: 'owner' | 'manager' | 'attendant';
}

export const assignUserToStation = async (req: Request, res: Response) => {
  try {
    const { userId, stationId, role } = req.body as UserStationAssignmentBody;
    
    if (!userId || !stationId || !role) {
      return res.status(400).json({ 
        status: 'error',
        code: 'MISSING_REQUIRED_FIELDS',
        message: 'User ID, station ID, and role are required' 
      });
    }
    
    if (!['owner', 'manager', 'attendant'].includes(role)) {
      return res.status(400).json({ 
        status: 'error',
        code: 'INVALID_ROLE',
        message: 'Invalid role. Must be one of: owner, manager, attendant' 
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
    
    // Check if user has permission to assign users to stations
    const userRole = req.user.role;
    if (userRole !== 'owner' && userRole !== 'manager') {
      return res.status(403).json({ 
        status: 'error',
        code: 'INSUFFICIENT_PERMISSIONS',
        message: 'Only owners and managers can assign users to stations' 
      });
    }
    
    // Managers can only assign attendants
    if (userRole === 'manager' && role !== 'attendant') {
      return res.status(403).json({ 
        status: 'error',
        code: 'INSUFFICIENT_PERMISSIONS',
        message: 'Managers can only assign attendants to stations' 
      });
    }
    
    const assignment = await userStationService.assignUserToStation(
      schemaName,
      userId,
      stationId,
      role
    );
    
    return res.status(201).json({
      status: 'success',
      data: assignment
    });
  } catch (error) {
    console.error('Assign user to station error:', error);
    const message = error instanceof Error ? error.message : 'Failed to assign user to station';
    return res.status(500).json({ 
      status: 'error',
      code: 'SERVER_ERROR',
      message 
    });
  }
};

export const removeUserFromStation = async (req: Request, res: Response) => {
  try {
    const { userId, stationId } = req.params;
    
    if (!userId || !stationId) {
      return res.status(400).json({ 
        status: 'error',
        code: 'MISSING_REQUIRED_FIELDS',
        message: 'User ID and station ID are required' 
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
    
    // Check if user has permission to remove users from stations
    const userRole = req.user.role;
    if (userRole !== 'owner' && userRole !== 'manager') {
      return res.status(403).json({ 
        status: 'error',
        code: 'INSUFFICIENT_PERMISSIONS',
        message: 'Only owners and managers can remove users from stations' 
      });
    }
    
    // Get the assignment to check the role
    const assignment = await userStationService.getUserStationAssignment(
      schemaName,
      userId,
      stationId
    );
    
    if (!assignment) {
      return res.status(404).json({ 
        status: 'error',
        code: 'ASSIGNMENT_NOT_FOUND',
        message: 'User is not assigned to this station' 
      });
    }
    
    // Managers can only remove attendants
    if (userRole === 'manager' && assignment.role !== 'attendant') {
      return res.status(403).json({ 
        status: 'error',
        code: 'INSUFFICIENT_PERMISSIONS',
        message: 'Managers can only remove attendants from stations' 
      });
    }
    
    const success = await userStationService.removeUserFromStation(
      schemaName,
      userId,
      stationId
    );
    
    if (!success) {
      return res.status(404).json({ 
        status: 'error',
        code: 'ASSIGNMENT_NOT_FOUND',
        message: 'User is not assigned to this station' 
      });
    }
    
    return res.status(200).json({
      status: 'success',
      data: {
        message: 'User removed from station successfully'
      }
    });
  } catch (error) {
    console.error('Remove user from station error:', error);
    const message = error instanceof Error ? error.message : 'Failed to remove user from station';
    return res.status(500).json({ 
      status: 'error',
      code: 'SERVER_ERROR',
      message 
    });
  }
};

export const updateUserStationRole = async (req: Request, res: Response) => {
  try {
    const { userId, stationId } = req.params;
    const { role } = req.body;
    
    if (!userId || !stationId || !role) {
      return res.status(400).json({ 
        status: 'error',
        code: 'MISSING_REQUIRED_FIELDS',
        message: 'User ID, station ID, and role are required' 
      });
    }
    
    if (!['owner', 'manager', 'attendant'].includes(role)) {
      return res.status(400).json({ 
        status: 'error',
        code: 'INVALID_ROLE',
        message: 'Invalid role. Must be one of: owner, manager, attendant' 
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
    
    // Only owners can update roles
    const userRole = req.user.role;
    if (userRole !== 'owner') {
      return res.status(403).json({ 
        status: 'error',
        code: 'INSUFFICIENT_PERMISSIONS',
        message: 'Only owners can update user roles at stations' 
      });
    }
    
    const assignment = await userStationService.updateUserStationRole(
      schemaName,
      userId,
      stationId,
      role
    );
    
    if (!assignment) {
      return res.status(404).json({ 
        status: 'error',
        code: 'ASSIGNMENT_NOT_FOUND',
        message: 'User is not assigned to this station' 
      });
    }
    
    return res.status(200).json({
      status: 'success',
      data: assignment
    });
  } catch (error) {
    console.error('Update user station role error:', error);
    const message = error instanceof Error ? error.message : 'Failed to update user station role';
    return res.status(500).json({ 
      status: 'error',
      code: 'SERVER_ERROR',
      message 
    });
  }
};

export const getUserStationAssignments = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    // Get schema name from middleware
    const schemaName = req.schemaName;
    if (!schemaName) {
      return res.status(500).json({ 
        status: 'error',
        code: 'TENANT_CONTEXT_MISSING',
        message: 'Tenant context not set' 
      });
    }
    
    const assignments = await userStationService.getUserStationAssignments(
      schemaName,
      userId
    );
    
    return res.status(200).json({
      status: 'success',
      data: assignments
    });
  } catch (error) {
    console.error('Get user station assignments error:', error);
    const message = error instanceof Error ? error.message : 'Failed to get user station assignments';
    return res.status(500).json({ 
      status: 'error',
      code: 'SERVER_ERROR',
      message 
    });
  }
};

export const getStationUsers = async (req: Request, res: Response) => {
  try {
    const { stationId } = req.params;
    
    // Get schema name from middleware
    const schemaName = req.schemaName;
    if (!schemaName) {
      return res.status(500).json({ 
        status: 'error',
        code: 'TENANT_CONTEXT_MISSING',
        message: 'Tenant context not set' 
      });
    }
    
    const users = await userStationService.getStationUsers(
      schemaName,
      stationId
    );
    
    return res.status(200).json({
      status: 'success',
      data: users
    });
  } catch (error) {
    console.error('Get station users error:', error);
    const message = error instanceof Error ? error.message : 'Failed to get station users';
    return res.status(500).json({ 
      status: 'error',
      code: 'SERVER_ERROR',
      message 
    });
  }
};