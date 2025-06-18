// src/routes/admin/station.routes.ts
import { Router } from 'express';
import * as stationController from '../../controllers/admin/station.controller';
import { authenticateAdmin } from '../../middlewares/adminAuth';
import { auditLog } from '../../middlewares/auditLog';

const router = Router();

// Apply middleware to all routes
router.use(authenticateAdmin);
router.use(auditLog);

// Get all stations
router.get('/', stationController.getStations);

// Get station by ID
router.get('/:id', stationController.getStationById);

// Create a new station
router.post('/', stationController.createStation);

// Update a station
router.put('/:id', stationController.updateStation);

// Delete a station
router.delete('/:id', stationController.deleteStation);

export default router;