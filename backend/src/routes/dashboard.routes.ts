// backend/src/routes/dashboard.routes.ts
import { Router } from 'express';
import { authenticateJWT } from '../middlewares/auth';
import { setTenantContext } from '../middlewares/tenant';
import * as dashboardController from '../controllers/dashboard.controller';

const router = Router();

router.use(authenticateJWT);
router.use(setTenantContext);

// Owner/Manager dashboard KPIs and trends
router.get('/dashboard', dashboardController.getDashboardData);

export default router;
