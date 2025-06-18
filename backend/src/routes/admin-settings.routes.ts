// src/routes/admin-settings.routes.ts
import { Router } from 'express';
import * as adminSettingsController from '../controllers/admin-settings.controller';
import { authenticateAdmin } from '../middlewares/adminAuth';
import { auditLog } from '../middlewares/auditLog';

const router = Router();

// Protected routes
router.get('/', authenticateAdmin, adminSettingsController.getSettings);
router.put('/', authenticateAdmin, auditLog, adminSettingsController.updateSettings);

export default router;