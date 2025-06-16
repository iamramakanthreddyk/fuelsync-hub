import { Router } from 'express';
import * as nozzleController from '../controllers/nozzle.controller';
import { authenticateJWT } from '../middlewares/auth';
import { setTenantContext } from '../middlewares/tenant';

const router = Router();

// Apply middleware to all routes
router.use(authenticateJWT);
router.use(setTenantContext);

// Create a new nozzle
router.post('/', nozzleController.createNozzle);

// Get nozzle by ID
router.get('/:id', nozzleController.getNozzleById);

// Update nozzle
router.patch('/:id', nozzleController.updateNozzle);

// Record nozzle reading
router.post('/:id/readings', nozzleController.recordNozzleReading);

// Get nozzles by pump ID
router.get('/pump/:pumpId', nozzleController.getNozzlesByPumpId);

// Get nozzles by station ID
router.get('/station/:stationId', nozzleController.getNozzlesByStationId);

export default router;