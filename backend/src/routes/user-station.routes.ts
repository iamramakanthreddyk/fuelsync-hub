import { Router } from 'express';
import * as userStationController from '../controllers/user-station.controller';
import { authenticateJWT } from '../middlewares/auth';
import { setTenantContext } from '../middlewares/tenant';
import { hasPermission } from '../middlewares/permissions';
import { PERMISSIONS } from '../config/permissions';

const router = Router();

// Apply authentication and tenant context middleware
router.use(authenticateJWT);
router.use(setTenantContext);

/**
 * @swagger
 * /user-stations/station/{stationId}/users:
 *   get:
 *     summary: Get all users assigned to a station
 *     tags: [User Station Assignments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: stationId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: List of users assigned to the station
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
router.get(
  '/station/:stationId/users',
  hasPermission(PERMISSIONS.MANAGE_STATIONS),
  userStationController.getStationUsers
);

/**
 * @swagger
 * /user-stations/user/{userId}/assignments:
 *   get:
 *     summary: Get all station assignments for a user
 *     tags: [User Station Assignments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: List of station assignments for the user
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
router.get(
  '/user/:userId/assignments',
  hasPermission(PERMISSIONS.MANAGE_STATIONS),
  userStationController.getUserStationAssignments
);

/**
 * @swagger
 * /user-stations/assignments:
 *   post:
 *     summary: Assign a user to a station
 *     tags: [User Station Assignments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - stationId
 *               - role
 *             properties:
 *               userId:
 *                 type: string
 *                 format: uuid
 *               stationId:
 *                 type: string
 *                 format: uuid
 *               role:
 *                 type: string
 *                 enum: [owner, manager, attendant]
 *     responses:
 *       201:
 *         description: User assigned to station successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
router.post(
  '/assignments',
  hasPermission(PERMISSIONS.MANAGE_STATIONS),
  userStationController.assignUserToStation
);

/**
 * @swagger
 * /user-stations/user/{userId}/station/{stationId}:
 *   delete:
 *     summary: Remove a user from a station
 *     tags: [User Station Assignments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: stationId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: User removed from station successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Assignment not found
 *       500:
 *         description: Internal server error
 */
router.delete(
  '/user/:userId/station/:stationId',
  hasPermission(PERMISSIONS.MANAGE_STATIONS),
  userStationController.removeUserFromStation
);

/**
 * @swagger
 * /user-stations/user/{userId}/station/{stationId}/role:
 *   patch:
 *     summary: Update a user's role at a station
 *     tags: [User Station Assignments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: stationId
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
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [owner, manager, attendant]
 *     responses:
 *       200:
 *         description: User role updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Assignment not found
 *       500:
 *         description: Internal server error
 */
router.patch(
  '/user/:userId/station/:stationId/role',
  hasPermission(PERMISSIONS.MANAGE_STATIONS),
  userStationController.updateUserStationRole
);

export default router;