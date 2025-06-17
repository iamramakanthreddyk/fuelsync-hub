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
exports.getStationPerformance = exports.getCreditorsReport = exports.getSalesDetail = exports.getSalesSummary = void 0;
const reportService = __importStar(require("../services/report.service"));
const getSalesSummary = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { stationId, startDate, endDate } = req.query;
        // Validate required fields
        if (!stationId || !startDate || !endDate) {
            return res.status(400).json({ message: 'Station ID, start date, and end date are required' });
        }
        // Get schema name from middleware
        const schemaName = req.schemaName;
        if (!schemaName) {
            return res.status(500).json({ message: 'Tenant context not set' });
        }
        const summary = yield reportService.getSalesSummary(schemaName, stationId, startDate, endDate);
        return res.status(200).json(summary);
    }
    catch (error) {
        console.error('Get sales summary error:', error);
        return res.status(500).json({ message: error.message || 'Failed to get sales summary' });
    }
});
exports.getSalesSummary = getSalesSummary;
const getSalesDetail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { stationId, startDate, endDate } = req.query;
        // Validate required fields
        if (!stationId || !startDate || !endDate) {
            return res.status(400).json({ message: 'Station ID, start date, and end date are required' });
        }
        // Get schema name from middleware
        const schemaName = req.schemaName;
        if (!schemaName) {
            return res.status(500).json({ message: 'Tenant context not set' });
        }
        const salesDetails = yield reportService.getSalesDetail(schemaName, stationId, startDate, endDate);
        return res.status(200).json(salesDetails);
    }
    catch (error) {
        console.error('Get sales detail error:', error);
        return res.status(500).json({ message: error.message || 'Failed to get sales detail' });
    }
});
exports.getSalesDetail = getSalesDetail;
const getCreditorsReport = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { stationId } = req.query;
        // Get schema name from middleware
        const schemaName = req.schemaName;
        if (!schemaName) {
            return res.status(500).json({ message: 'Tenant context not set' });
        }
        const creditors = yield reportService.getCreditorsReport(schemaName, stationId);
        return res.status(200).json(creditors);
    }
    catch (error) {
        console.error('Get creditors report error:', error);
        return res.status(500).json({ message: error.message || 'Failed to get creditors report' });
    }
});
exports.getCreditorsReport = getCreditorsReport;
const getStationPerformance = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { startDate, endDate } = req.query;
        // Validate required fields
        if (!startDate || !endDate) {
            return res.status(400).json({ message: 'Start date and end date are required' });
        }
        // Get schema name from middleware
        const schemaName = req.schemaName;
        if (!schemaName) {
            return res.status(500).json({ message: 'Tenant context not set' });
        }
        const performance = yield reportService.getStationPerformance(schemaName, startDate, endDate);
        return res.status(200).json(performance);
    }
    catch (error) {
        console.error('Get station performance error:', error);
        return res.status(500).json({ message: error.message || 'Failed to get station performance' });
    }
});
exports.getStationPerformance = getStationPerformance;
