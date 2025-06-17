"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasPermission = hasPermission;
const permissions_1 = require("../config/permissions");
// Example: rolePermissions[role] = [PERMISSIONS.MANAGE_STATIONS, ...]
const rolePermissions = {
    superadmin: Object.values(permissions_1.PERMISSIONS),
    owner: [permissions_1.PERMISSIONS.MANAGE_STATIONS, permissions_1.PERMISSIONS.MANAGE_PUMPS, permissions_1.PERMISSIONS.MANAGE_NOZZLES, permissions_1.PERMISSIONS.MANAGE_PRICES, permissions_1.PERMISSIONS.MANAGE_USERS, permissions_1.PERMISSIONS.RECORD_SALES, permissions_1.PERMISSIONS.RECONCILE, permissions_1.PERMISSIONS.VIEW_REPORTS],
    manager: [permissions_1.PERMISSIONS.MANAGE_PUMPS, permissions_1.PERMISSIONS.MANAGE_NOZZLES, permissions_1.PERMISSIONS.RECORD_SALES, permissions_1.PERMISSIONS.RECONCILE, permissions_1.PERMISSIONS.VIEW_REPORTS],
    employee: [permissions_1.PERMISSIONS.RECORD_SALES],
};
function hasPermission(permission) {
    return (req, res, next) => {
        const user = req.user;
        if (!user || !user.role) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const allowed = rolePermissions[user.role] || [];
        if (!allowed.includes(permission)) {
            return res.status(403).json({ message: 'Insufficient permissions' });
        }
        next();
    };
}
