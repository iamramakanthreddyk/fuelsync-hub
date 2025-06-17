import { Router } from 'express';
import * as stationController from '../controllers/station.controller';
import { authenticateJWT } from '../middlewares/auth';
import { setTenantContext } from '../middlewares/tenant';
import { hasPermission } from '../middlewares/permissions';
import { validate } from '../middlewares/validation';
import { createStationSchema } from '../models/station.schema';
import { apiLimiter } from '../middlewares/rateLimit';
import { PERMISSIONS } from '../config/permissions';

const router = Router();

// Apply authentication and tenant context middleware
router.use(authenticateJWT);
router.use(setTenantContext);

/**
 * @swagger
 * /stations:
 *   get:
 *     summary: Get all stations for the current tenant
 *     tags: [Stations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of stations
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
  '/',
  hasPermission(PERMISSIONS.MANAGE_STATIONS),
  stationController.getStations
);

/**
 * @swagger
 * /stations:
 *   post:
 *     summary: Create a new station
 *     tags: [Stations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateStation'
 *     responses:
 *       201:
 *         description: Station created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post(
  '/',
  [
    hasPermission(PERMISSIONS.MANAGE_STATIONS),
    validate(createStationSchema)
  ],
  stationController.createStation
);

export default router;