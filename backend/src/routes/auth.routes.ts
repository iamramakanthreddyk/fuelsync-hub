import { Router } from 'express';
import { authLimiter } from '../middlewares/rateLimit';
import * as authController from '../controllers/auth.controller';
import { validateLoginInput } from '../middlewares/validation';
import { authenticateJWT } from '../middlewares/auth';

const router = Router();

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: User login
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "owner@test.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "owner123"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [success]
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                       description: JWT token for authentication
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           format: uuid
 *                         email:
 *                           type: string
 *                           format: email
 *                         role:
 *                           type: string
 *                           enum: [owner, manager, employee, admin]
 *                         tenant_id:
 *                           type: string
 *                           format: uuid
 *                         tenant_name:
 *                           type: string
 *                         first_name:
 *                           type: string
 *                         last_name:
 *                           type: string
 *       400:
 *         description: Invalid request parameters
 *       401:
 *         description: Invalid credentials
 *       429:
 *         description: Too many login attempts
 *       500:
 *         description: Internal server error
 */
router.post('/login', authLimiter, validateLoginInput, authController.login);

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new tenant and owner
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - subscriptionPlan
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *               subscriptionPlan:
 *                 type: string
 *                 enum: [basic, premium, enterprise]
 *     responses:
 *       201:
 *         description: Tenant created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [success]
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                     tenant:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           format: uuid
 *                         name:
 *                           type: string
 *                         subscriptionPlan:
 *                           type: string
 *                           enum: [basic, premium, enterprise]
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Internal server error
 */
router.post('/register', authController.register);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current authenticated user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [success]
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           format: uuid
 *                         email:
 *                           type: string
 *                           format: email
 *                         role:
 *                           type: string
 *                           enum: [owner, manager, employee]
 *                         tenant_id:
 *                           type: string
 *                           format: uuid
 *                         tenant_name:
 *                           type: string
 *                         first_name:
 *                           type: string
 *                         last_name:
 *                           type: string
 *                         active:
 *                           type: boolean
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Internal server error
 */
router.get('/me', authenticateJWT, authController.getCurrentUser);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout current user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [success]
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Internal server error
 */
router.post('/logout', authenticateJWT, authController.logout);

export default router;