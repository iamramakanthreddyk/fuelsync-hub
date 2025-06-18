// src/routes/admin-auth.routes.ts
import { Router } from 'express';
import * as adminAuthController from '../controllers/admin-auth.controller';
import { authenticateAdmin } from '../middlewares/adminAuth';

const router = Router();

// Public routes
router.post('/login', adminAuthController.login);

// Protected routes
router.post('/logout', authenticateAdmin, adminAuthController.logout);
router.get('/me', authenticateAdmin, adminAuthController.getCurrentAdmin);

export default router;