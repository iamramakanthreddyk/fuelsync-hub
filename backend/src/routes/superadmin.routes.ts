// backend/src/routes/superadmin.routes.ts
import { Router } from 'express';
import * as superadminController from '../controllers/superadmin.controller';
import { authenticateAdmin } from '../middlewares/adminAuth';

const router = Router();

// Apply admin authentication middleware
router.use(authenticateAdmin);

// Tenant management
router.get('/tenants', superadminController.getTenants);
router.post('/tenants', superadminController.createTenant);
router.get('/tenants/:id', superadminController.getTenantById);
router.patch('/tenants/:id', superadminController.updateTenant);
router.delete('/tenants/:id', superadminController.deleteTenant);

// User management
router.get('/tenants/:tenantId/users', superadminController.getTenantUsers);
router.get('/tenants/:tenantId/users/:userId', superadminController.getTenantUser);
router.delete('/tenants/:tenantId/users/:userId', superadminController.deleteTenantUser);
router.post('/tenants/:tenantId/users/:userId/reset-password', superadminController.resetUserPassword);

// Platform stats
router.get('/stats', superadminController.getPlatformStats);

// Seeding & testing
router.post('/seed', superadminController.seedTenant);
router.post('/reset', superadminController.resetDevTenant);

export default router;