// src/routes/admin.routes.ts
import { Router } from 'express';
import adminRoutes from './admin';

const router = Router();

// Mount all admin routes
router.use('/', adminRoutes);

export default router;