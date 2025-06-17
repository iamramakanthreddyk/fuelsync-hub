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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reportController = __importStar(require("../controllers/report.controller"));
const auth_1 = require("../middlewares/auth");
const tenant_1 = require("../middlewares/tenant");
const permissions_1 = require("../middlewares/permissions");
const planFeatures_1 = require("../config/planFeatures");
const auditLog_1 = require("../middlewares/auditLog");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
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
    return (0, express_rate_limit_1.default)({
        windowMs: 60 * 60 * 1000, // 1 hour
        max: planLimits[planType] || 100,
        message: 'API rate limit exceeded for your plan. Please upgrade or try again later.'
    })(req, res, next);
});
// Enforce permission for viewing reports
router.get('/sales-summary', (0, permissions_1.hasPermission)('view_reports'), reportController.getSalesSummary);
router.get('/sales-detail', (0, permissions_1.hasPermission)('view_reports'), reportController.getSalesDetail);
router.get('/creditors', (0, permissions_1.hasPermission)('view_reports'), reportController.getCreditorsReport);
// Enforce permission and plan feature for advanced report (example)
router.get('/station-performance', (0, permissions_1.hasPermission)('view_reports'), (req, res, next) => {
    var _a;
    const planType = (_a = req.user) === null || _a === void 0 ? void 0 : _a.planType;
    if (!planType || !planFeatures_1.PLAN_FEATURES[planType].viewReports) {
        return res.status(403).json({ message: 'Advanced reports are not available on your plan.' });
    }
    next();
}, reportController.getStationPerformance);
exports.default = router;
