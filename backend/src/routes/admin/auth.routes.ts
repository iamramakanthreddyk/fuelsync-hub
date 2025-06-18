// src/routes/admin/auth.routes.ts
import { Router } from 'express';
import * as authController from '../../controllers/admin/auth.controller';
import { authenticateAdmin } from '../../middlewares/adminAuth';
import { auditLog } from '../../middlewares/auditLog';

const router = Router();

// Public routes
router.post('/login', authController.login);

// Protected routes
router.post('/logout', authenticateAdmin, auditLog, authController.logout);
router.get('/me', authenticateAdmin, authController.getCurrentAdmin);

export default router;