import { Router } from 'express';
import * as saleController from '../controllers/sale.controller';
import { authenticateJWT } from '../middlewares/auth';
import { setTenantContext } from '../middlewares/tenant';
import { requireRole } from '../middlewares/auth';
import { hasPermission } from '../middlewares/permissions';
import { auditLog } from '../middlewares/auditLog';
import { PLAN_CONFIG, PlanType } from '../config/planConfig';
import rateLimit from 'express-rate-limit';

const router = Router();

// Apply middleware to all routes
router.use(authenticateJWT);
router.use(setTenantContext);
router.use(auditLog);

// Per-plan rate limiting middleware
router.use((req, res, next) => {
  const planType: PlanType = req.user?.subscriptionPlan || 'basic';
  const planLimits = { basic: 100, premium: 500, enterprise: 2000 };
  return rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: planLimits[planType] || 100,
    message: 'API rate limit exceeded for your plan. Please upgrade or try again later.'
  })(req, res, next);
});

// Enforce permission for creating sales
router.post('/', hasPermission('record_sales'), saleController.createSale);

// Enforce permission for getting sales
router.get('/', hasPermission('record_sales'), saleController.getSales);

// Enforce permission for daily sales totals
router.get('/daily-totals', hasPermission('record_sales'), saleController.getDailySalesTotals);

// Void a sale (manager or owner only, already enforced)
router.post('/:id/void', requireRole(['owner', 'manager']), saleController.voidSale);

export default router;