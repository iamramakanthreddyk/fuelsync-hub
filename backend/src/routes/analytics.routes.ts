// backend/src/routes/analytics.routes.ts
import { Router } from 'express';
import { authenticateJWT } from '../middlewares/auth';
import { setTenantContext } from '../middlewares/tenant';
import { requireSuperAdmin } from '../middlewares/superadmin';
import * as analyticsController from '../controllers/analytics.controller';

const router = Router();

// Tenant owner/manager: sales analytics dashboard
router.get('/tenant', authenticateJWT, setTenantContext, analyticsController.getTenantSalesAnalytics);

// SuperAdmin: global analytics dashboard
router.get('/global', authenticateJWT, requireSuperAdmin, analyticsController.getGlobalAnalytics);

export default router;
