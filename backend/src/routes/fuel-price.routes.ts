import { Router } from 'express';
import * as fuelPriceController from '../controllers/fuel-price.controller';
import { authenticateJWT } from '../middlewares/auth';
import { requireRole } from '../middlewares/auth';

const router = Router();

/**
 * @swagger
 * /fuel-prices:
 *   post:
 *     summary: Create a new fuel price
 *     tags: [Fuel Prices]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - stationId
 *               - fuelType
 *               - pricePerUnit
 *             properties:
 *               stationId:
 *                 type: string
 *                 format: uuid
 *               fuelType:
 *                 type: string
 *                 enum: [petrol, diesel, premium, super, cng, lpg]
 *               pricePerUnit:
 *                 type: number
 *               effectiveFrom:
 *                 type: string
 *                 format: date-time
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Fuel price created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized
 *       500:
 *         description: Internal server error
 */
router.post('/', authenticateJWT, requireRole(['owner', 'manager']), fuelPriceController.createFuelPrice);

/**
 * @swagger
 * /fuel-prices/current:
 *   get:
 *     summary: Get current fuel prices for a station
 *     tags: [Fuel Prices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: stationId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Current fuel prices
 *       400:
 *         description: Missing station ID
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Internal server error
 */
router.get('/current', authenticateJWT, fuelPriceController.getCurrentFuelPrices);

/**
 * @swagger
 * /fuel-prices/history:
 *   get:
 *     summary: Get fuel price history for a station
 *     tags: [Fuel Prices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: stationId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: fuelType
 *         schema:
 *           type: string
 *           enum: [petrol, diesel, premium, super, cng, lpg]
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Fuel price history
 *       400:
 *         description: Missing station ID
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Internal server error
 */
router.get('/history', authenticateJWT, fuelPriceController.getFuelPriceHistory);

/**
 * @swagger
 * /fuel-prices/{id}:
 *   get:
 *     summary: Get fuel price by ID
 *     tags: [Fuel Prices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Fuel price details
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Fuel price not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', authenticateJWT, fuelPriceController.getFuelPriceById);

/**
 * @swagger
 * /fuel-prices/at-date:
 *   get:
 *     summary: Get fuel price at a specific date
 *     tags: [Fuel Prices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: stationId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: fuelType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [petrol, diesel, premium, super, cng, lpg]
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *     responses:
 *       200:
 *         description: Fuel price at the specified date
 *       400:
 *         description: Missing required parameters
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: No fuel price found for the specified date
 *       500:
 *         description: Internal server error
 */
router.get('/at-date', authenticateJWT, fuelPriceController.getFuelPriceAtDate);

export default router;