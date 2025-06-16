import { Router } from 'express';
import * as stationController from '../controllers/station.controller';
import { authenticateJWT } from '../middlewares/auth';
import { setTenantContext } from '../middlewares/tenant';

const router = Router();

// Apply middleware to all routes
router.use(authenticateJWT);
router.use(setTenantContext);

/**
 * @swagger
 * /stations:
 *   get:
 *     summary: Get all stations
 *     tags: [Stations]
 *     responses:
 *       200:
 *         description: A list of stations
 */
router.get('/', stationController.getStations);

/**
 * @swagger
 * /stations:
 *   post:
 *     summary: Create a new station
 *     tags: [Stations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateStationRequest'
 *     responses:
 *       201:
 *         description: Station created successfully
 *       400:
 *         description: Invalid input
 */
router.post('/', stationController.createStation);

/**
 * @swagger
 * /stations/{id}:
 *   get:
 *     summary: Get a station by ID
 *     tags: [Stations]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Station details
 *       404:
 *         description: Station not found
 */
router.get('/:id', stationController.getStationById);

/**
 * @swagger
 * /stations/{id}:
 *   patch:
 *     summary: Update a station
 *     tags: [Stations]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               address:
 *                 type: string
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *               zip:
 *                 type: string
 *               contactPhone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Station updated successfully
 *       404:
 *         description: Station not found
 */
router.patch('/:id', stationController.updateStation);

/**
 * @swagger
 * /stations/{id}:
 *   delete:
 *     summary: Delete a station
 *     tags: [Stations]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: Station deleted successfully
 *       404:
 *         description: Station not found
 */
router.delete('/:id', stationController.deleteStation);

export default router;