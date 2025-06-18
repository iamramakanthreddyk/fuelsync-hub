// src/routes/admin/index.ts
import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import stationRoutes from './station.routes';
import dashboardRoutes from './dashboard.routes';
// Import other admin routes here

const router = Router();

// Mount admin routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/stations', stationRoutes);
router.use('/dashboard', dashboardRoutes);
// Mount other admin routes here

export default router;