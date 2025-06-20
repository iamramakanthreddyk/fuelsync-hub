import { Router } from 'express';
import * as nozzleController from '../controllers/nozzle.controller';
import { authenticateJWT } from '../middlewares/auth';
import { setTenantContext } from '../middlewares/tenant';
import { checkNozzleLimit } from '../middlewares/planLimits';
import { hasPermission } from '../middlewares/permissions';
import { validate } from '../middlewares/validation';
import { createNozzleSchema } from '../models/nozzle.schema';
import { auditLog } from '../middlewares/auditLog';
import { PLAN_CONFIG, PlanType } from '../config/planConfig';

const router = Router();

// Apply middleware to all routes
router.use(authenticateJWT);
router.use(setTenantContext);
router.use(auditLog);

// Per-plan rate limiting middleware
router.use((req, res, next) => {
  const planType: PlanType = req.user?.subscriptionPlan || 'basic';
  const planLimits = { basic: 100, premium: 500, enterprise: 2000 };
  return require('express-rate-limit')({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: planLimits[planType] || 100,
    message: 'API rate limit exceeded for your plan. Please upgrade or try again later.'
  })(req, res, next);
});

// Enforce permission and plan limit for creating nozzles
router.post('/', hasPermission('manage_nozzles'), validate(createNozzleSchema), checkNozzleLimit, nozzleController.createNozzle);

// Enforce permission for getting, updating nozzles
router.get('/:id', hasPermission('manage_nozzles'), nozzleController.getNozzleById);
router.patch('/:id', hasPermission('manage_nozzles'), nozzleController.updateNozzle);

// Record nozzle reading (assume sales permission)
router.post('/:id/readings', hasPermission('record_sales'), nozzleController.recordNozzleReading);

// Get nozzles by pump ID (view permission)
router.get('/pump/:pumpId', hasPermission('manage_nozzles'), nozzleController.getNozzlesByPumpId);

// Get nozzles by station ID (view permission)
router.get('/station/:stationId', hasPermission('manage_nozzles'), nozzleController.getNozzlesByStationId);

export default router;