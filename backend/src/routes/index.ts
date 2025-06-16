import { Router } from 'express';
import authRoutes from './auth.routes';
import stationRoutes from './station.routes';
import pumpRoutes from './pump.routes';
import nozzleRoutes from './nozzle.routes';
import saleRoutes from './sale.routes';
import reconciliationRoutes from './reconciliation.routes';
import reportRoutes from './report.routes';
import docsRoutes from './docs.routes';

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

export default router;