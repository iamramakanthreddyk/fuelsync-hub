import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { adminAuth, requireAdminRole } from '../middlewares/adminAuth';
import { auditLog } from '../middlewares/auditLog';
import pool from '../config/database';
import { config } from '../config/environment';
import { JWTPayload } from '../types/jwt-payload';
import * as adminDashboardController from '../controllers/admin-dashboard.controller';

const router = Router();

/**
 * @swagger
 * /admin/login:
 *   post:
 *     summary: Admin login
 *     tags: [Admin]
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
 *               password:
 *                 type: string
 *                 format: password
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
 *                           enum: [superadmin]
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Internal server error
 */
router.post('/login', async (req, res) => {
  const requestId = randomUUID();
  console.log('[ADMIN-AUTH] Login attempt:', { 
    requestId,
    email: req.body.email, 
    timestamp: new Date().toISOString() 
  });

  const { email, password } = req.body;
  
  try {
    const result = await pool.query(
      'SELECT * FROM admin_users WHERE email = $1 AND active = true',
      [email]
    );
    
    const admin = result.rows[0];
    if (!admin || !await bcrypt.compare(password, admin.password_hash)) {
      console.warn('[ADMIN-AUTH] Login failed: Invalid credentials:', { 
        requestId, 
        email 
      });
      return res.status(401).json({ 
        status: 'error',
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid credentials' 
      });
    }

    // Create JWT payload
    const payload: JWTPayload = {
      id: admin.id,
      role: admin.role || 'superadmin',
      email: admin.email,
      isAdmin: true
    };

    // Sign JWT token
    const token = jwt.sign(
      payload,
      config.adminJwt.secret,
      { 
        expiresIn: config.adminJwt.expiresIn,
        algorithm: 'HS256',
        audience: config.adminJwt.audience,
        issuer: config.adminJwt.issuer
      }
    );

    console.log('[ADMIN-AUTH] Login successful:', { 
      requestId,
      adminId: admin.id,
      email: admin.email,
      timestamp: new Date().toISOString()
    });

    res.json({ 
      status: 'success',
      data: {
        token: `Bearer ${token}`, 
        user: { 
          id: admin.id, 
          email: admin.email, 
          role: admin.role || 'superadmin',
          first_name: admin.first_name,
          last_name: admin.last_name
        } 
      }
    });
  } catch (error) {
    console.error('[ADMIN-AUTH] Login error:', {
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      email: req.body.email,
      timestamp: new Date().toISOString()
    });
    
    res.status(500).json({ 
      status: 'error',
      code: 'SERVER_ERROR',
      message: 'Login failed' 
    });
  }
});

// Protected routes
router.use(adminAuth, auditLog);

/**
 * @swagger
 * /admin/dashboard:
 *   get:
 *     summary: Get admin dashboard data
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin dashboard data
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized
 *       500:
 *         description: Internal server error
 */
router.get('/dashboard', adminDashboardController.getAdminDashboardData);

/**
 * @swagger
 * /admin/tenants:
 *   get:
 *     summary: Get all tenants (owners)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of tenants
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized
 *       500:
 *         description: Internal server error
 */
router.get('/tenants', async (req, res) => {
  try {
    const tenants = await pool.query(`
      SELECT u.*, t.name as tenant_name, t.subscription_plan
      FROM users u
      JOIN tenants t ON u.tenant_id = t.id
      WHERE u.role = $1
    `, ['owner']);
    
    res.json({
      status: 'success',
      data: tenants.rows
    });
  } catch (error) {
    console.error('[ADMIN] Error fetching tenants:', error);
    res.status(500).json({ 
      status: 'error',
      code: 'SERVER_ERROR',
      message: 'Failed to fetch tenants' 
    });
  }
});

/**
 * @swagger
 * /admin/impersonate/{userId}:
 *   post:
 *     summary: Impersonate a user
 *     tags: [Admin]
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
 *         description: Impersonation successful
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.post('/impersonate/:userId', async (req, res) => {
  const { userId } = req.params;
  const requestId = randomUUID();
  
  try {
    const user = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    if (!user.rows[0]) {
      return res.status(404).json({ 
        status: 'error',
        code: 'USER_NOT_FOUND',
        message: 'User not found' 
      });
    }

    // Create impersonation token
    const payload: JWTPayload = {
      id: user.rows[0].id, 
      role: user.rows[0].role,
      tenant_id: user.rows[0].tenant_id,
      email: user.rows[0].email,
      isAdmin: false
    };

    const token = jwt.sign(
      payload,
      config.jwt.secret,
      { 
        expiresIn: '1h',
        algorithm: 'HS256',
        audience: config.jwt.audience,
        issuer: config.jwt.issuer
      }
    );

    // Log impersonation
    await pool.query(
      'INSERT INTO admin_activity_logs (id, admin_id, action, entity_type, entity_id, details) VALUES ($1, $2, $3, $4, $5, $6)',
      [
        requestId, 
        req.admin.id, 
        'IMPERSONATE', 
        'USER', 
        userId, 
        JSON.stringify({ 
          userRole: user.rows[0].role,
          userEmail: user.rows[0].email,
          tenantId: user.rows[0].tenant_id
        })
      ]
    );

    console.log('[ADMIN] User impersonation:', {
      requestId,
      adminId: req.admin.id,
      userId: user.rows[0].id,
      userRole: user.rows[0].role,
      timestamp: new Date().toISOString()
    });

    res.json({
      status: 'success',
      data: {
        token: `Bearer ${token}`,
        user: user.rows[0]
      }
    });
  } catch (error) {
    console.error('[ADMIN] Impersonation error:', {
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      adminId: req.admin?.id,
      userId,
      timestamp: new Date().toISOString()
    });
    
    res.status(500).json({ 
      status: 'error',
      code: 'SERVER_ERROR',
      message: 'Failed to impersonate user' 
    });
  }
});

/**
 * @swagger
 * /admin/global-stats:
 *   get:
 *     summary: Get global system statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Global statistics
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized
 *       500:
 *         description: Internal server error
 */
router.get('/global-stats', async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM tenants WHERE active = true) as total_tenants,
        (SELECT COUNT(*) FROM users WHERE active = true) as total_users,
        (SELECT COUNT(*) FROM stations) as total_stations,
        (SELECT COALESCE(SUM(sale_volume * fuel_price), 0) FROM sales 
         WHERE DATE(recorded_at) = CURRENT_DATE) as total_sales
    `);

    // Get recent admin activity
    const activity = await pool.query(`
      SELECT l.*, a.email as admin_email
      FROM admin_activity_logs l
      JOIN admin_users a ON l.admin_id = a.id
      ORDER BY l.created_at DESC
      LIMIT 10
    `);

    res.json({
      status: 'success',
      data: {
        ...stats.rows[0],
        recentActivity: activity.rows
      }
    });
  } catch (error) {
    console.error('[ADMIN] Stats error:', error);
    res.status(500).json({ 
      status: 'error',
      code: 'SERVER_ERROR',
      message: 'Failed to fetch global stats' 
    });
  }
});

/**
 * @swagger
 * /admin/activity-logs:
 *   get:
 *     summary: Get admin activity logs
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Activity logs
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized
 *       500:
 *         description: Internal server error
 */
router.get('/activity-logs', async (req, res) => {
  const { page = 1, limit = 20, action, from, to } = req.query;
  try {
    let query = `
      SELECT l.*, a.email as admin_email
      FROM admin_activity_logs l
      JOIN admin_users a ON l.admin_id = a.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (action) {
      query += ` AND l.action = $${paramCount}`;
      params.push(action);
      paramCount++;
    }

    if (from) {
      query += ` AND l.created_at >= $${paramCount}`;
      params.push(from);
      paramCount++;
    }

    if (to) {
      query += ` AND l.created_at <= $${paramCount}`;
      params.push(to);
      paramCount++;
    }

    // Add pagination
    const offset = (Number(page) - 1) * Number(limit);
    query += ` ORDER BY l.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const logs = await pool.query(query, params);
    const totalCount = await pool.query(
      'SELECT COUNT(*) FROM admin_activity_logs',
      []
    );

    res.json({
      status: 'success',
      data: {
        logs: logs.rows,
        total: parseInt(totalCount.rows[0].count),
        page: Number(page),
        totalPages: Math.ceil(parseInt(totalCount.rows[0].count) / Number(limit))
      }
    });
  } catch (error) {
    console.error('[ADMIN] Logs error:', error);
    res.status(500).json({ 
      status: 'error',
      code: 'SERVER_ERROR',
      message: 'Failed to fetch activity logs' 
    });
  }
});

/**
 * @swagger
 * /admin/users/{userId}/activate:
 *   patch:
 *     summary: Activate or deactivate a user
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
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
 *               - active
 *             properties:
 *               active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: User status updated
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized
 *       500:
 *         description: Internal server error
 */
router.patch('/users/:userId/activate', async (req, res) => {
  const { userId } = req.params;
  const { active } = req.body;
  const requestId = randomUUID();
  
  if (typeof active !== 'boolean') {
    return res.status(400).json({ 
      status: 'error',
      code: 'INVALID_REQUEST',
      message: 'Missing or invalid "active" boolean in body.' 
    });
  }
  
  try {
    // Update user status
    await pool.query(
      'UPDATE users SET active = $1 WHERE id = $2',
      [active, userId]
    );
    
    // Log action
    await pool.query(
      'INSERT INTO admin_activity_logs (id, admin_id, action, entity_type, entity_id, details) VALUES ($1, $2, $3, $4, $5, $6)',
      [
        requestId, 
        req.admin.id, 
        active ? 'ACTIVATE_USER' : 'DEACTIVATE_USER', 
        'USER', 
        userId, 
        JSON.stringify({ active })
      ]
    );
    
    console.log('[ADMIN] User status updated:', {
      requestId,
      adminId: req.admin.id,
      userId,
      active,
      timestamp: new Date().toISOString()
    });
    
    res.json({ 
      status: 'success',
      data: {
        message: `User ${active ? 'activated' : 'deactivated'} successfully.`
      }
    });
  } catch (error) {
    console.error('[ADMIN] User activation error:', {
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      adminId: req.admin?.id,
      userId,
      timestamp: new Date().toISOString()
    });
    
    res.status(500).json({ 
      status: 'error',
      code: 'SERVER_ERROR',
      message: 'Failed to update user status.' 
    });
  }
});

/**
 * @swagger
 * /admin/system-health:
 *   get:
 *     summary: Get system health information
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System health information
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized
 *       500:
 *         description: Internal server error
 */
router.get('/system-health', async (req, res) => {
  try {
    const health = await pool.query(`
      SELECT 
        (pg_database_size(current_database())/1024/1024) as db_size_mb,
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM stations) as total_stations,
        (SELECT COALESCE(SUM(sale_volume * fuel_price), 0) FROM sales WHERE DATE(recorded_at) = CURRENT_DATE) as today_sales
    `);
    
    res.json({
      status: 'success',
      data: health.rows[0]
    });
  } catch (error) {
    console.error('[ADMIN] System health error:', error);
    res.status(500).json({ 
      status: 'error',
      code: 'SERVER_ERROR',
      message: 'Failed to fetch system health' 
    });
  }
});

export default router;