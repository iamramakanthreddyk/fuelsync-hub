// src/routes/admin/user.routes.ts
import { Router } from 'express';
import * as userController from '../../controllers/admin/user.controller';
import { authenticateAdmin } from '../../middlewares/adminAuth';
import { auditLog } from '../../middlewares/auditLog';

const router = Router();

// Apply middleware to all routes
router.use(authenticateAdmin);
router.use(auditLog);

// Get all users
router.get('/', userController.getUsers);

// Get user by ID
router.get('/:id', userController.getUserById);

// Create a new user
router.post('/', userController.createUser);

// Update a user
router.put('/:id', userController.updateUser);

// Delete a user
router.delete('/:id', userController.deleteUser);

export default router;