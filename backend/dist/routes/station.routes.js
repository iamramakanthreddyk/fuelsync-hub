"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const stationController = __importStar(require("../controllers/station.controller"));
const auth_1 = require("../middlewares/auth");
const tenant_1 = require("../middlewares/tenant");
const planLimits_1 = require("../middlewares/planLimits");
const permissions_1 = require("../middlewares/permissions");
const validation_1 = require("../middlewares/validation");
const station_schema_1 = require("../models/station.schema");
const auditLog_1 = require("../middlewares/auditLog");
const router = (0, express_1.Router)();
// Apply middleware to all routes
router.use(auth_1.authenticateJWT);
router.use(tenant_1.setTenantContext);
router.use(auditLog_1.auditLog);
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
router.get('/', (0, permissions_1.hasPermission)('manage_stations'), stationController.getStations);
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
router.post('/', (0, permissions_1.hasPermission)('manage_stations'), (0, validation_1.validate)(station_schema_1.createStationSchema), planLimits_1.checkStationLimit, stationController.createStation);
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
// Per-plan rate limiting middleware
router.use((req, res, next) => {
    var _a;
    const planType = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.planType) || 'basic';
    // Example: 100, 500, 2000 requests/hour for basic, premium, enterprise
    const planLimits = { basic: 100, premium: 500, enterprise: 2000 };
    return require('express-rate-limit')({
        windowMs: 60 * 60 * 1000, // 1 hour
        max: planLimits[planType] || 100,
        message: 'API rate limit exceeded for your plan. Please upgrade or try again later.'
    })(req, res, next);
});
exports.default = router;
