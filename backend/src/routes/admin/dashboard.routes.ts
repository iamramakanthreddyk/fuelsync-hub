// src/routes/admin/dashboard.routes.ts
import { Router } from 'express';
import * as dashboardController from '../../controllers/admin/dashboard.controller';
import { authenticateAdmin } from '../../middlewares/adminAuth';
import { auditLog } from '../../middlewares/auditLog';

const router = Router();

// Apply middleware to all routes
router.use(authenticateAdmin);
router.use(auditLog);

// Get dashboard statistics
router.get('/', dashboardController.getDashboard);

export default router;