"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeCustomPlan = exports.setCustomPlan = exports.getTenantPlan = exports.getAllPlans = void 0;
const database_1 = __importDefault(require("../config/database"));
const planConfig_1 = require("../config/planConfig");
// Get all plans (for SuperAdmin UI)
const getAllPlans = (_req, res) => {
    res.json(planConfig_1.PLAN_CONFIG);
};
exports.getAllPlans = getAllPlans;
// Get a tenant's plan (including custom override)
const getTenantPlan = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { tenantId } = req.params;
    try {
        const result = yield database_1.default.query('SELECT custom_plan FROM tenants WHERE id = $1', [tenantId]);
        if (result.rows.length && result.rows[0].custom_plan) {
            return res.json(result.rows[0].custom_plan);
        }
        // Fallback: return standard plan
        const planType = result.rows.length ? result.rows[0].plan_type : 'basic';
        res.json(planConfig_1.PLAN_CONFIG[planType]);
    }
    catch (err) {
        res.status(500).json({ message: 'Failed to fetch tenant plan.' });
    }
});
exports.getTenantPlan = getTenantPlan;
// Set a custom plan for a tenant (SuperAdmin only)
const setCustomPlan = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { tenantId } = req.params;
    const customPlan = req.body;
    try {
        yield database_1.default.query('UPDATE tenants SET custom_plan = $1 WHERE id = $2', [customPlan, tenantId]);
        res.json({ message: 'Custom plan set successfully.' });
    }
    catch (err) {
        res.status(500).json({ message: 'Failed to set custom plan.' });
    }
});
exports.setCustomPlan = setCustomPlan;
// Remove a custom plan (revert to standard)
const removeCustomPlan = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { tenantId } = req.params;
    try {
        yield database_1.default.query('UPDATE tenants SET custom_plan = NULL WHERE id = $1', [tenantId]);
        res.json({ message: 'Custom plan removed.' });
    }
    catch (err) {
        res.status(500).json({ message: 'Failed to remove custom plan.' });
    }
});
exports.removeCustomPlan = removeCustomPlan;
