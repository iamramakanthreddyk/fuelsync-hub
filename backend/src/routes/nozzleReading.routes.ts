// backend/src/routes/nozzleReading.routes.ts
import { Router } from 'express';
import { authenticateJWT } from '../middlewares/auth';
import { setTenantContext } from '../middlewares/tenant';
import * as nozzleReadingController from '../controllers/nozzleReading.controller';

const router = Router();

router.use(authenticateJWT);
router.use(setTenantContext);

// Get previous day's readings for all nozzles at a station
router.get('/stations/:stationId/nozzle-readings/previous', nozzleReadingController.getPreviousNozzleReadings);
// Get current fuel prices for all nozzles at a station
router.get('/stations/:stationId/fuel-prices', nozzleReadingController.getCurrentFuelPrices);
// Submit today's readings for all nozzles at a station
router.post('/stations/:stationId/nozzle-readings', nozzleReadingController.submitNozzleReadings);

export default router;
