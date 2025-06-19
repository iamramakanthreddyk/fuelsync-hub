import { Router } from 'express';
import * as creditorController from '../controllers/creditor.controller';
import { authenticateJWT } from '../middlewares/auth';
import { requireRole } from '../middlewares/auth';

const router = Router();

/**
 * @swagger
 * /creditors:
 *   post:
 *     summary: Create a new creditor
 *     tags: [Creditors]
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
 *               - partyName
 *             properties:
 *               stationId:
 *                 type: string
 *               partyName:
 *                 type: string
 *               contactPerson:
 *                 type: string
 *               contactPhone:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               address:
 *                 type: string
 *               creditLimit:
 *                 type: number
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Creditor created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized
 *       500:
 *         description: Internal server error
 */
router.post('/', authenticateJWT, requireRole(['owner', 'manager']), creditorController.createCreditor);

/**
 * @swagger
 * /creditors:
 *   get:
 *     summary: Get all creditors
 *     tags: [Creditors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of creditors
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Internal server error
 */
router.get('/', authenticateJWT, creditorController.getCreditors);

/**
 * @swagger
 * /creditors/{id}:
 *   get:
 *     summary: Get creditor by ID
 *     tags: [Creditors]
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
 *         description: Creditor details
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Creditor not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', authenticateJWT, creditorController.getCreditorById);

/**
 * @swagger
 * /creditors/{id}:
 *   patch:
 *     summary: Update creditor
 *     tags: [Creditors]
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
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               stationId:
 *                 type: string
 *               partyName:
 *                 type: string
 *               contactPerson:
 *                 type: string
 *               contactPhone:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               address:
 *                 type: string
 *               creditLimit:
 *                 type: number
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Creditor updated successfully
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Creditor not found
 *       500:
 *         description: Internal server error
 */
router.patch('/:id', authenticateJWT, requireRole(['owner', 'manager']), creditorController.updateCreditor);

/**
 * @swagger
 * /creditors/{id}/payments:
 *   post:
 *     summary: Record a payment from a creditor
 *     tags: [Creditors]
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
 *               - amount
 *               - paymentMethod
 *             properties:
 *               amount:
 *                 type: number
 *               paymentMethod:
 *                 type: string
 *                 enum: [cash, bank_transfer, check, upi, credit_card, debit_card]
 *               referenceNumber:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Payment recorded successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Creditor not found
 *       500:
 *         description: Internal server error
 */
router.post('/:id/payments', authenticateJWT, requireRole(['owner', 'manager']), creditorController.recordPayment);

/**
 * @swagger
 * /creditors/{id}/payments:
 *   get:
 *     summary: Get payment history for a creditor
 *     tags: [Creditors]
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
 *         description: Payment history
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Creditor not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id/payments', authenticateJWT, creditorController.getPaymentHistory);

export default router;