import { Router } from 'express';
import * as pumpController from '../controllers/pump.controller';
import { authenticateJWT } from '../middlewares/auth';
import { setTenantContext } from '../middlewares/tenant';

const router = Router();

// Apply middleware to all routes
router.use(authenticateJWT);
router.use(setTenantContext);

// Create a new pump
router.post('/', pumpController.createPump);

// Get pump by ID
router.get('/:id', pumpController.getPumpById);

// Update pump
router.patch('/:id', pumpController.updatePump);

// Delete pump
router.delete('/:id', pumpController.deletePump);

// Get pumps by station ID
router.get('/station/:stationId', pumpController.getPumpsByStationId);

export default router;