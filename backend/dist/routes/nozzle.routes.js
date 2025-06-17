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
const nozzleController = __importStar(require("../controllers/nozzle.controller"));
const auth_1 = require("../middlewares/auth");
const tenant_1 = require("../middlewares/tenant");
const planLimits_1 = require("../middlewares/planLimits");
const permissions_1 = require("../middlewares/permissions");
const validation_1 = require("../middlewares/validation");
const nozzle_schema_1 = require("../models/nozzle.schema");
const auditLog_1 = require("../middlewares/auditLog");
const router = (0, express_1.Router)();
// Apply middleware to all routes
router.use(auth_1.authenticateJWT);
router.use(tenant_1.setTenantContext);
router.use(auditLog_1.auditLog);
// Per-plan rate limiting middleware
router.use((req, res, next) => {
    var _a;
    const planType = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.planType) || 'basic';
    const planLimits = { basic: 100, premium: 500, enterprise: 2000 };
    return require('express-rate-limit')({
        windowMs: 60 * 60 * 1000, // 1 hour
        max: planLimits[planType] || 100,
        message: 'API rate limit exceeded for your plan. Please upgrade or try again later.'
    })(req, res, next);
});
// Enforce permission and plan limit for creating nozzles
router.post('/', (0, permissions_1.hasPermission)('manage_nozzles'), (0, validation_1.validate)(nozzle_schema_1.createNozzleSchema), planLimits_1.checkNozzleLimit, nozzleController.createNozzle);
// Enforce permission for getting, updating nozzles
router.get('/:id', (0, permissions_1.hasPermission)('manage_nozzles'), nozzleController.getNozzleById);
router.patch('/:id', (0, permissions_1.hasPermission)('manage_nozzles'), nozzleController.updateNozzle);
// Record nozzle reading (assume sales permission)
router.post('/:id/readings', (0, permissions_1.hasPermission)('record_sales'), nozzleController.recordNozzleReading);
// Get nozzles by pump ID (view permission)
router.get('/pump/:pumpId', (0, permissions_1.hasPermission)('manage_nozzles'), nozzleController.getNozzlesByPumpId);
// Get nozzles by station ID (view permission)
router.get('/station/:stationId', (0, permissions_1.hasPermission)('manage_nozzles'), nozzleController.getNozzlesByStationId);
exports.default = router;
