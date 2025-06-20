import { Router } from 'express';
import * as tenantController from '../controllers/tenant.controller';
import { authenticateJWT, requireRole } from '../middlewares/auth';
import { auditLog } from '../middlewares/auditLog';
import { PLAN_CONFIG, PlanType } from '../config/planConfig';

const router = Router();

// Apply middleware for all routes in this router
router.use(authenticateJWT);
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

// Admin-only route to get all tenants
router.get('/', requireRole(['superadmin']), tenantController.getTenants);

// Public route to create a tenant (exposed through /auth/register)
router.post('/', tenantController.createTenant);

export default router;