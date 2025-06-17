import { Request, Response, NextFunction } from 'express';
import { PERMISSIONS } from '../config/permissions';

type Permission = keyof typeof PERMISSIONS;

// Role-permission mappings
const rolePermissions = {
  admin: Object.values(PERMISSIONS),
  owner: [
    PERMISSIONS.MANAGE_STATIONS,
    PERMISSIONS.MANAGE_PUMPS,
    PERMISSIONS.MANAGE_NOZZLES,
    PERMISSIONS.MANAGE_PRICES,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.EXPORT_DATA
  ],
  manager: [
    PERMISSIONS.MANAGE_PUMPS,
    PERMISSIONS.MANAGE_NOZZLES,
    PERMISSIONS.MANAGE_PRICES,
    PERMISSIONS.RECORD_SALES,
    PERMISSIONS.RECONCILE,
    PERMISSIONS.VIEW_REPORTS
  ],
  employee: [
    PERMISSIONS.RECORD_SALES,
    PERMISSIONS.RECONCILE
  ]
};

export const hasPermission = (permission: Permission) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const userRole = req.user.role as keyof typeof rolePermissions;
      const userPermissions = rolePermissions[userRole] || [];

      if (!userPermissions.includes(permission)) {
        return res.status(403).json({ 
          message: 'You do not have permission to perform this action' 
        });
      }

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({ message: 'Error checking permissions' });
    }
  };
};
