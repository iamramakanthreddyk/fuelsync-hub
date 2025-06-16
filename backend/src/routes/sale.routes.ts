import { Router } from 'express';
import * as saleController from '../controllers/sale.controller';
import { authenticateJWT } from '../middlewares/auth';
import { setTenantContext } from '../middlewares/tenant';
import { requireRole } from '../middlewares/auth';

const router = Router();

// Apply middleware to all routes
router.use(authenticateJWT);
router.use(setTenantContext);

// Create a new sale
router.post('/', saleController.createSale);

// Get sales (with optional filters)
router.get('/', saleController.getSales);

// Get daily sales totals
router.get('/daily-totals', saleController.getDailySalesTotals);

// Void a sale (manager or owner only)
router.post('/:id/void', requireRole(['owner', 'manager']), saleController.voidSale);

export default router;