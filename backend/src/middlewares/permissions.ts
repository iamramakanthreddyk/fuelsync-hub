import { Request, Response, NextFunction } from 'express';
import { PERMISSIONS } from '../config/permissions';

type Permission = keyof typeof PERMISSIONS;

// Role-permission mappings
const rolePermissions = {
  superadmin: Object.values(PERMISSIONS),
  admin: Object.values(PERMISSIONS),
  owner: [
    PERMISSIONS.MANAGE_STATIONS,
    PERMISSIONS.MANAGE_PUMPS,
    PERMISSIONS.MANAGE_NOZZLES,
    PERMISSIONS.MANAGE_PRICES,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.RECORD_SALES,
    PERMISSIONS.RECONCILE,
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

export const hasPermission = (permission: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        console.log('[PERMISSION] No user in request');
        return res.status(401).json({ message: 'Authentication required' });
      }

      const userRole = req.user.role as keyof typeof rolePermissions;
      const userPermissions = rolePermissions[userRole] || [];
      
      console.log(`[PERMISSION] User: ${req.user.email}, Role: ${userRole}, Required: ${permission}`);
      console.log(`[PERMISSION] User permissions:`, userPermissions);

      if (!userPermissions.includes(permission)) {
        console.log(`[PERMISSION] Access denied for ${req.user.email} (${userRole}) to ${permission}`);
        return res.status(403).json({ 
          message: 'You do not have permission to perform this action',
          required: permission,
          userRole: userRole,
          userPermissions: userPermissions
        });
      }

      console.log(`[PERMISSION] Access granted for ${req.user.email} (${userRole}) to ${permission}`);
      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({ message: 'Error checking permissions' });
    }
  };
};