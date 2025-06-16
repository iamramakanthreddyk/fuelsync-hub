import { Router } from 'express';
import * as reconciliationController from '../controllers/reconciliation.controller';
import { authenticateJWT, requireRole } from '../middlewares/auth';
import { setTenantContext } from '../middlewares/tenant';

const router = Router();

// Apply middleware to all routes
router.use(authenticateJWT);
router.use(setTenantContext);

// Create/update a reconciliation (manager or owner only)
router.post('/', requireRole(['owner', 'manager']), reconciliationController.createReconciliation);

// Get reconciliations (with optional filters)
router.get('/', reconciliationController.getReconciliations);

// Get reconciliation by ID
router.get('/:id', reconciliationController.getReconciliationById);

// Get daily sales totals for reconciliation
router.get('/daily-totals', reconciliationController.getDailySalesTotals);

export default router;