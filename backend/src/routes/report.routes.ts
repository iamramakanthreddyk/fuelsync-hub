import { Router } from 'express';
import * as reportController from '../controllers/report.controller';
import { authenticateJWT, requireRole } from '../middlewares/auth';
import { setTenantContext } from '../middlewares/tenant';
import { hasPermission } from '../middlewares/permissions';
import { PLAN_FEATURES } from '../config/planFeatures';
import { auditLog } from '../middlewares/auditLog';
import { PLAN_CONFIG, PlanType } from '../config/planConfig';

const router = Router();

// Apply middleware to all routes
router.use(authenticateJWT);
router.use(setTenantContext);
router.use(auditLog);

// Enforce permission for viewing reports
router.get('/sales-summary', hasPermission('view_reports'), reportController.getSalesSummary);
router.get('/sales-detail', hasPermission('view_reports'), reportController.getSalesDetail);
router.get('/creditors', hasPermission('view_reports'), reportController.getCreditorsReport);

// Enforce permission and plan feature for advanced report (example)
router.get('/station-performance', hasPermission('view_reports'), (req, res, next) => {
  const planType = req.user?.planType as keyof typeof PLAN_FEATURES;
  if (!planType || !PLAN_FEATURES[planType].viewReports) {
    return res.status(403).json({ message: 'Advanced reports are not available on your plan.' });
  }
  next();
}, reportController.getStationPerformance);

export default router;