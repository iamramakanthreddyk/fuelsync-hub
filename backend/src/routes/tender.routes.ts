import { Router } from 'express';
import * as tenderController from '../controllers/tender.controller';
import { authenticateJWT } from '../middlewares/auth';
import { requireRole } from '../middlewares/auth';

const router = Router();

/**
 * @swagger
 * /shifts:
 *   post:
 *     summary: Open a new shift
 *     tags: [Shifts]
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
 *             properties:
 *               stationId:
 *                 type: string
 *                 format: uuid
 *               openingCash:
 *                 type: number
 *                 default: 0
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Shift opened successfully
 *       400:
 *         description: Invalid input or user already has an active shift
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Internal server error
 */
router.post('/shifts', authenticateJWT, tenderController.openShift);

/**
 * @swagger
 * /shifts/{id}/close:
 *   post:
 *     summary: Close a shift
 *     tags: [Shifts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *             required:
 *               - closingCash
 *             properties:
 *               closingCash:
 *                 type: number
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Shift closed successfully
 *       400:
 *         description: Invalid input or shift already closed
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized to close this shift
 *       404:
 *         description: Shift not found
 *       500:
 *         description: Internal server error
 */
router.post('/shifts/:id/close', authenticateJWT, tenderController.closeShift);

/**
 * @swagger
 * /shifts/active:
 *   get:
 *     summary: Get current user's active shift
 *     tags: [Shifts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Active shift details
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: No active shift found
 *       500:
 *         description: Internal server error
 */
router.get('/shifts/active', authenticateJWT, tenderController.getActiveShift);

/**
 * @swagger
 * /shifts/{id}:
 *   get:
 *     summary: Get shift by ID
 *     tags: [Shifts]
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
 *         description: Shift details
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Shift not found
 *       500:
 *         description: Internal server error
 */
router.get('/shifts/:id', authenticateJWT, tenderController.getShiftById);

/**
 * @swagger
 * /shifts:
 *   get:
 *     summary: Get shifts with optional filters
 *     tags: [Shifts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: stationId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [open, closed, reconciled]
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
 *         description: List of shifts
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Internal server error
 */
router.get('/shifts', authenticateJWT, tenderController.getShifts);

/**
 * @swagger
 * /tender-entries:
 *   post:
 *     summary: Record a tender entry
 *     tags: [Tender Entries]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - shiftId
 *               - tenderType
 *               - amount
 *             properties:
 *               shiftId:
 *                 type: string
 *                 format: uuid
 *               tenderType:
 *                 type: string
 *                 enum: [cash, card, upi, credit]
 *               amount:
 *                 type: number
 *               referenceNumber:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Tender entry recorded successfully
 *       400:
 *         description: Invalid input or shift is closed
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Shift not found
 *       500:
 *         description: Internal server error
 */
router.post('/tender-entries', authenticateJWT, tenderController.recordTenderEntry);

/**
 * @swagger
 * /shifts/{shiftId}/tender-entries:
 *   get:
 *     summary: Get tender entries for a shift
 *     tags: [Tender Entries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: shiftId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: List of tender entries
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Internal server error
 */
router.get('/shifts/:shiftId/tender-entries', authenticateJWT, tenderController.getTenderEntries);

/**
 * @swagger
 * /shifts/{shiftId}/summary:
 *   get:
 *     summary: Get shift summary with tender totals and sales data
 *     tags: [Shifts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: shiftId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Shift summary
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Shift not found
 *       500:
 *         description: Internal server error
 */
router.get('/shifts/:shiftId/summary', authenticateJWT, tenderController.getShiftSummary);

export default router;