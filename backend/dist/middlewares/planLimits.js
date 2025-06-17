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
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkNozzleLimit = exports.checkPumpLimit = exports.checkStationLimit = void 0;
exports.checkPlanFeature = checkPlanFeature;
const planConfig_1 = require("../config/planConfig");
const plan_service_1 = require("../services/plan.service");
const error_1 = require("./error");
// Utility to get plan type safely
function getPlanType(user) {
    if ((user === null || user === void 0 ? void 0 : user.planType) && planConfig_1.PLAN_TYPES.includes(user.planType)) {
        return user.planType;
    }
    return 'basic';
}
// Check if the user has exceeded their station limit
const checkStationLimit = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    // Skip for admins
    if (user === null || user === void 0 ? void 0 : user.isAdmin) {
        return next();
    }
    // Only check on POST to create new stations
    if (req.method !== 'POST') {
        return next();
    }
    try {
        const schemaName = req.schemaName;
        if (!schemaName)
            return (0, error_1.sendError)(res, 400, 'Schema name is required');
        const planType = getPlanType(user);
        const limits = planConfig_1.PLAN_CONFIG[planType];
        const stationCount = yield (0, plan_service_1.getStationCount)(schemaName);
        if (stationCount >= limits.maxStations) {
            return (0, error_1.sendError)(res, 403, `You have reached the maximum number of stations (${limits.maxStations}) allowed on your ${planType} plan.`, {
                limit: limits.maxStations,
                current: stationCount,
                planType
            });
        }
        next();
    }
    catch (error) {
        console.error('Error checking station limit:', error);
        next(error);
    }
});
exports.checkStationLimit = checkStationLimit;
// Check if the user has exceeded their pump limit for a station
const checkPumpLimit = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    // Skip for admins
    if (user === null || user === void 0 ? void 0 : user.isAdmin) {
        return next();
    }
    // Only check on POST to create new pumps
    if (req.method !== 'POST') {
        return next();
    }
    try {
        const schemaName = req.schemaName;
        if (!schemaName)
            return (0, error_1.sendError)(res, 400, 'Schema name is required');
        const planType = getPlanType(user);
        const { stationId } = req.body;
        if (!stationId)
            return (0, error_1.sendError)(res, 400, 'Station ID is required');
        const limits = planConfig_1.PLAN_CONFIG[planType];
        const pumpCount = yield (0, plan_service_1.getPumpCount)(schemaName, stationId);
        if (pumpCount >= limits.maxPumpsPerStation) {
            return (0, error_1.sendError)(res, 403, `You have reached the maximum number of pumps (${limits.maxPumpsPerStation}) per station allowed on your ${planType} plan.`, {
                limit: limits.maxPumpsPerStation,
                current: pumpCount,
                planType
            });
        }
        next();
    }
    catch (error) {
        console.error('Error checking pump limit:', error);
        next(error);
    }
});
exports.checkPumpLimit = checkPumpLimit;
// Check if the user has exceeded their nozzle limit for a pump
const checkNozzleLimit = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    // Skip for admins
    if (user === null || user === void 0 ? void 0 : user.isAdmin) {
        return next();
    }
    // Only check on POST to create new nozzles
    if (req.method !== 'POST') {
        return next();
    }
    try {
        const schemaName = req.schemaName;
        if (!schemaName)
            return (0, error_1.sendError)(res, 400, 'Schema name is required');
        const planType = getPlanType(user);
        const { pumpId } = req.body;
        if (!pumpId)
            return (0, error_1.sendError)(res, 400, 'Pump ID is required');
        const limits = planConfig_1.PLAN_CONFIG[planType];
        const nozzleCount = yield (0, plan_service_1.getNozzleCount)(schemaName, pumpId);
        if (nozzleCount >= limits.maxNozzlesPerPump) {
            return (0, error_1.sendError)(res, 403, `You have reached the maximum number of nozzles (${limits.maxNozzlesPerPump}) per pump allowed on your ${planType} plan.`, {
                limit: limits.maxNozzlesPerPump,
                current: nozzleCount,
                planType
            });
        }
        next();
    }
    catch (error) {
        console.error('Error checking nozzle limit:', error);
        next(error);
    }
});
exports.checkNozzleLimit = checkNozzleLimit;
// Generic plan feature enforcement middleware
function checkPlanFeature(feature) {
    return (req, res, next) => {
        const user = req.user;
        if (!(0, plan_service_1.hasPlanFeature)(user, feature)) {
            return (0, error_1.sendError)(res, 403, `Upgrade required for ${feature.replace(/([A-Z])/g, ' $1').toLowerCase()}.`);
        }
        next();
    };
}
