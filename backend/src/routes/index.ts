import { Router } from 'express';
import authRoutes from './auth.routes';
import stationRoutes from './station.routes';
import pumpRoutes from './pump.routes';
import nozzleRoutes from './nozzle.routes';
import saleRoutes from './sale.routes';
import reconciliationRoutes from './reconciliation.routes';
import reportRoutes from './report.routes';
import docsRoutes from './docs.routes';
import adminRoutes from './admin.routes';
import analyticsRoutes from './analytics.routes';
import planRoutes from './plan.routes';
import nozzleReadingRoutes from './nozzleReading.routes';
import dashboardRoutes from './dashboard.routes';
import creditorRoutes from './creditor.routes';
import tenderRoutes from './tender.routes';
import fuelPriceRoutes from './fuel-price.routes';
import userStationRoutes from './user-station.routes';

const router = Router();

// Register all routes
router.use('/auth', authRoutes);
router.use('/stations', stationRoutes);
router.use('/pumps', pumpRoutes);
router.use('/nozzles', nozzleRoutes);
router.use('/sales', saleRoutes);
router.use('/reconciliations', reconciliationRoutes);
router.use('/reports', reportRoutes);
router.use('/docs', docsRoutes);
router.use('/admin', adminRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/plans', planRoutes);
router.use('/nozzle-readings', nozzleReadingRoutes);
router.use('/creditors', creditorRoutes);
router.use('/tender', tenderRoutes);
router.use('/fuel-prices', fuelPriceRoutes);
router.use('/user-stations', userStationRoutes); // Changed from '/stations' to '/user-stations'
router.use(dashboardRoutes);

export default router;