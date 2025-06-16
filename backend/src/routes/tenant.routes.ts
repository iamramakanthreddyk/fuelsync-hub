import { Router } from 'express';
import * as tenantController from '../controllers/tenant.controller';
import { authenticateJWT, requireRole } from '../middlewares/auth';

const router = Router();

// Admin-only route to get all tenants
router.get('/', authenticateJWT, requireRole(['superadmin']), tenantController.getTenants);

// Public route to create a tenant (exposed through /auth/register)
router.post('/', tenantController.createTenant);

export default router;