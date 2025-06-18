// src/routes/admin-report.routes.ts
import { Router } from 'express';
import * as adminReportController from '../controllers/admin-report.controller';
import { authenticateAdmin } from '../middlewares/adminAuth';
import { auditLog } from '../middlewares/auditLog';

const router = Router();

// Protected routes
router.get('/sales', authenticateAdmin, auditLog, adminReportController.getSalesReport);
router.get('/credits', authenticateAdmin, auditLog, adminReportController.getCreditReport);
router.get('/compliance', authenticateAdmin, auditLog, adminReportController.getComplianceReport);

export default router;