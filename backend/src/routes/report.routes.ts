import { Router } from 'express';
import * as reportController from '../controllers/report.controller';
import { authenticateJWT, requireRole } from '../middlewares/auth';
import { setTenantContext } from '../middlewares/tenant';

const router = Router();

// Apply middleware to all routes
router.use(authenticateJWT);
router.use(setTenantContext);

// Get sales summary
router.get('/sales-summary', reportController.getSalesSummary);

// Get detailed sales data
router.get('/sales-detail', reportController.getSalesDetail);

// Get creditors report
router.get('/creditors', reportController.getCreditorsReport);

// Get station performance report (owner only)
router.get('/station-performance', requireRole(['owner']), reportController.getStationPerformance);

export default router;