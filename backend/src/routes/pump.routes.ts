import { Router } from 'express';
import * as pumpController from '../controllers/pump.controller';
import { authenticateJWT } from '../middlewares/auth';
import { setTenantContext } from '../middlewares/tenant';
import { checkPumpLimit } from '../middlewares/planLimits';
import { hasPermission } from '../middlewares/permissions';
import { validate } from '../middlewares/validation';
import { createPumpSchema } from '../models/pump.schema';
import { auditLog } from '../middlewares/auditLog';
import { PLAN_CONFIG, PlanType } from '../config/planConfig';

const router = Router();

// Apply middleware to all routes
router.use(authenticateJWT);
router.use(setTenantContext);
router.use(auditLog);

// Per-plan rate limiting middleware
router.use((req, res, next) => {
  const planType: PlanType = req.user?.planType || 'basic';
  const planLimits = { basic: 100, premium: 500, enterprise: 2000 };
  return require('express-rate-limit')({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: planLimits[planType] || 100,
    message: 'API rate limit exceeded for your plan. Please upgrade or try again later.'
  })(req, res, next);
});

// Enforce permission and plan limit for creating pumps
router.post(
  '/',
  hasPermission('manage_pumps'),
  validate(createPumpSchema),
  checkPumpLimit,
  pumpController.createPump
);

// Enforce permission for getting, updating, deleting pumps
router.get('/:id', hasPermission('manage_pumps'), pumpController.getPumpById);
router.patch('/:id', hasPermission('manage_pumps'), pumpController.updatePump);
router.delete('/:id', hasPermission('manage_pumps'), pumpController.deletePump);

// Get pumps by station ID (view permission)
router.get(
  '/station/:stationId',
  hasPermission('manage_pumps'),
  pumpController.getPumpsByStationId
);

export default router;