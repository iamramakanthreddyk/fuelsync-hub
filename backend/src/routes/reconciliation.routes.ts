import { Router } from 'express';
import * as reconciliationController from '../controllers/reconciliation.controller';
import { authenticateJWT, requireRole } from '../middlewares/auth';
import { setTenantContext } from '../middlewares/tenant';
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

// Create/update a reconciliation (manager or owner only)
router.post('/', requireRole(['owner', 'manager']), reconciliationController.createReconciliation);

// Get reconciliations (with optional filters)
router.get('/', reconciliationController.getReconciliations);

// Get reconciliation by ID
router.get('/:id', reconciliationController.getReconciliationById);

// Get daily sales totals for reconciliation
router.get('/daily-totals', reconciliationController.getDailySalesTotals);

export default router;