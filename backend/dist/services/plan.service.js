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
exports.getEffectivePlan = getEffectivePlan;
exports.hasPlanFeature = hasPlanFeature;
exports.getPlanType = getPlanType;
exports.getStationCount = getStationCount;
exports.getPumpCount = getPumpCount;
exports.getNozzleCount = getNozzleCount;
const planConfig_1 = require("../config/planConfig");
const database_1 = __importDefault(require("../config/database"));
// Returns the effective plan config (custom or standard)
function getEffectivePlan(user, customPlan) {
    if (customPlan)
        return customPlan;
    if ((user === null || user === void 0 ? void 0 : user.planType) && planConfig_1.PLAN_TYPES.includes(user.planType)) {
        return planConfig_1.PLAN_CONFIG[user.planType];
    }
    return planConfig_1.PLAN_CONFIG['basic'];
}
function hasPlanFeature(user, feature, customPlan) {
    const plan = getEffectivePlan(user, customPlan);
    return !!plan[feature];
}
// If tenant has a custom plan, use it for enforcement
function getPlanType(user, customPlan) {
    if (customPlan)
        return customPlan;
    if ((user === null || user === void 0 ? void 0 : user.planType) && planConfig_1.PLAN_TYPES.includes(user.planType)) {
        return user.planType;
    }
    return 'basic';
}
function getStationCount(schemaName) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield database_1.default.query(`SET search_path TO ${schemaName}; SELECT COUNT(*) FROM stations WHERE active = true AND deleted_at IS NULL`);
        return parseInt(result.rows[0].count);
    });
}
function getPumpCount(schemaName, stationId) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield database_1.default.query(`SET search_path TO ${schemaName}; SELECT COUNT(*) FROM pumps WHERE station_id = $1 AND active = true AND deleted_at IS NULL`, [stationId]);
        return parseInt(result.rows[0].count);
    });
}
function getNozzleCount(schemaName, pumpId) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield database_1.default.query(`SET search_path TO ${schemaName}; SELECT COUNT(*) FROM nozzles WHERE pump_id = $1 AND active = true AND deleted_at IS NULL`, [pumpId]);
        return parseInt(result.rows[0].count);
    });
}
