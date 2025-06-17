import { Request, Response, NextFunction } from 'express';
import * as userStationService from '../services/user-station.service';

/**
 * Middleware to check if a user has access to a station
 * @param requiredRoles Optional array of roles that are allowed to access the station
 */
export const checkStationAccess = (requiredRoles?: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Get station ID from request parameters or query
      const stationId = req.params.stationId || req.query.stationId as string;
      
      if (!stationId) {
        return res.status(400).json({
          status: 'error',
          code: 'MISSING_STATION_ID',
          message: 'Station ID is required'
        });
      }
      
      // Get user ID from authenticated request
      const userId = req.user.id;
      
      // Get schema name from middleware
      const schemaName = req.schemaName;
      if (!schemaName) {
        return res.status(500).json({
          status: 'error',
          code: 'TENANT_CONTEXT_MISSING',
          message: 'Tenant context not set'
        });
      }
      
      // Check if user has access to the station
      const access = await userStationService.checkUserStationAccess(
        schemaName,
        userId,
        stationId
      );
      
      if (!access.hasAccess) {
        return res.status(403).json({
          status: 'error',
          code: 'STATION_ACCESS_DENIED',
          message: 'You do not have access to this station'
        });
      }
      
      // Check if user has required role
      if (requiredRoles && requiredRoles.length > 0 && access.role) {
        if (!requiredRoles.includes(access.role)) {
          return res.status(403).json({
            status: 'error',
            code: 'INSUFFICIENT_STATION_ROLE',
            message: `This action requires one of these roles: ${requiredRoles.join(', ')}`
          });
        }
      }
      
      // Add station role to request for use in controllers
      req.stationRole = access.role;
      
      next();
    } catch (error) {
      console.error('Check station access error:', error);
      return res.status(500).json({
        status: 'error',
        code: 'SERVER_ERROR',
        message: 'Failed to check station access'
      });
    }
  };
};