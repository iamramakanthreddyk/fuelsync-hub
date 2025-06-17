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
exports.getDailySalesTotals = exports.getReconciliationById = exports.getReconciliations = exports.createReconciliation = void 0;
const reconciliationService = __importStar(require("../services/reconciliation.service"));
const createReconciliation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { stationId, date, totalSales, cashTotal, creditTotal, cardTotal, upiTotal, finalized, notes } = req.body;
        // Validate required fields
        if (!stationId || !date) {
            return res.status(400).json({ message: 'Station ID and date are required' });
        }
        if (totalSales === undefined || cashTotal === undefined ||
            creditTotal === undefined || cardTotal === undefined ||
            upiTotal === undefined) {
            return res.status(400).json({ message: 'All payment totals are required' });
        }
        // Validate that totals add up
        const totalPayments = parseFloat(cashTotal) + parseFloat(creditTotal) +
            parseFloat(cardTotal) + parseFloat(upiTotal);
        if (Math.abs(totalPayments - parseFloat(totalSales)) > 0.01) {
            return res.status(400).json({
                message: 'Sum of payment methods does not match total sales',
                totalSales: parseFloat(totalSales),
                totalPayments: totalPayments
            });
        }
        // Get schema name from middleware
        const schemaName = req.schemaName;
        if (!schemaName) {
            return res.status(500).json({ message: 'Tenant context not set' });
        }
        // Get user ID from authenticated request
        const userId = req.user.id;
        const reconciliation = yield reconciliationService.createReconciliation(schemaName, stationId, date, parseFloat(totalSales), parseFloat(cashTotal), parseFloat(creditTotal), parseFloat(cardTotal), parseFloat(upiTotal), !!finalized, userId, notes);
        return res.status(201).json(reconciliation);
    }
    catch (error) {
        console.error('Create reconciliation error:', error);
        return res.status(500).json({ message: error.message || 'Failed to create reconciliation' });
    }
});
exports.createReconciliation = createReconciliation;
const getReconciliations = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { stationId, startDate, endDate } = req.query;
        // Get schema name from middleware
        const schemaName = req.schemaName;
        if (!schemaName) {
            return res.status(500).json({ message: 'Tenant context not set' });
        }
        const reconciliations = yield reconciliationService.getReconciliations(schemaName, stationId, startDate, endDate);
        return res.status(200).json(reconciliations);
    }
    catch (error) {
        console.error('Get reconciliations error:', error);
        return res.status(500).json({ message: error.message || 'Failed to get reconciliations' });
    }
});
exports.getReconciliations = getReconciliations;
const getReconciliationById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        // Get schema name from middleware
        const schemaName = req.schemaName;
        if (!schemaName) {
            return res.status(500).json({ message: 'Tenant context not set' });
        }
        const reconciliation = yield reconciliationService.getReconciliationById(schemaName, id);
        if (!reconciliation) {
            return res.status(404).json({ message: 'Reconciliation not found' });
        }
        return res.status(200).json(reconciliation);
    }
    catch (error) {
        console.error('Get reconciliation error:', error);
        return res.status(500).json({ message: error.message || 'Failed to get reconciliation' });
    }
});
exports.getReconciliationById = getReconciliationById;
const getDailySalesTotals = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { stationId, date } = req.query;
        if (!stationId || !date) {
            return res.status(400).json({ message: 'Station ID and date are required' });
        }
        // Get schema name from middleware
        const schemaName = req.schemaName;
        if (!schemaName) {
            return res.status(500).json({ message: 'Tenant context not set' });
        }
        const totals = yield reconciliationService.getDailySalesTotals(schemaName, stationId, date);
        return res.status(200).json(totals);
    }
    catch (error) {
        console.error('Get daily sales totals error:', error);
        return res.status(500).json({ message: error.message || 'Failed to get daily sales totals' });
    }
});
exports.getDailySalesTotals = getDailySalesTotals;
