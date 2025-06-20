import { Router } from 'express';
import * as stationController from '../controllers/station.controller';
import { authenticateJWT } from '../middlewares/auth';
import { setTenantContext } from '../middlewares/tenant';
import { hasPermission } from '../middlewares/permissions';
import { validate } from '../middlewares/validation';
import { createStationSchema } from '../models/station.schema';
import { apiLimiter } from '../middlewares/rateLimit';
import { PERMISSIONS } from '../config/permissions';
import { checkStationLimit } from '../middlewares/planLimits';


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
 * /stations/{id}:
 *   get:
 *     summary: Get station by ID
 *     tags: [Stations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Station details
 *       404:
 *         description: Station not found
 */
router.get(
  '/:id',
  hasPermission(PERMISSIONS.MANAGE_STATIONS),
  stationController.getStationById
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
    validate(createStationSchema),
    checkStationLimit
  ],
  stationController.createStation
);

/**
 * @swagger
 * /stations/{id}:
 *   put:
 *     summary: Update station
 *     tags: [Stations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Station updated successfully
 *       404:
 *         description: Station not found
 */
router.put(
  '/:id',
  hasPermission(PERMISSIONS.MANAGE_STATIONS),
  stationController.updateStation
);

/**
 * @swagger
 * /stations/{id}:
 *   delete:
 *     summary: Delete station
 *     tags: [Stations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Station deleted successfully
 *       404:
 *         description: Station not found
 */
router.delete(
  '/:id',
  hasPermission(PERMISSIONS.MANAGE_STATIONS),
  stationController.deleteStation
);

export default router;