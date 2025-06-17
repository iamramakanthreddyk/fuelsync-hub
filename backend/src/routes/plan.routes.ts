// backend/src/routes/plan.routes.ts
import { Router } from 'express';
import { requireSuperAdmin } from '../middlewares/superadmin';
import * as planController from '../controllers/plan.controller';

const router = Router();

// Get all plans
router.get('/', requireSuperAdmin, planController.getAllPlans);
// Get a tenant's plan (including custom)
router.get('/:tenantId', requireSuperAdmin, planController.getTenantPlan);
// Set a custom plan for a tenant
router.put('/:tenantId', requireSuperAdmin, planController.setCustomPlan);
// Remove a custom plan
router.delete('/:tenantId', requireSuperAdmin, planController.removeCustomPlan);

export default router;
