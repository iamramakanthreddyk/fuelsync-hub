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
exports.voidSale = exports.getDailySalesTotals = exports.getSales = exports.createSale = void 0;
const salesService = __importStar(require(".././services/sales.service"));
const createSale = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { stationId, nozzleId, cumulativeReading, saleVolume, cashReceived, creditGiven, creditPartyId, notes } = req.body;
        // Validate required fields
        if (!stationId || !nozzleId || cumulativeReading === undefined) {
            return res.status(400).json({ message: 'Station ID, nozzle ID, and cumulative reading are required' });
        }
        if ((cashReceived === undefined || cashReceived === null) &&
            (creditGiven === undefined || creditGiven === null)) {
            return res.status(400).json({ message: 'Either cash received or credit given must be specified' });
        }
        // Get schema name from middleware
        const schemaName = req.schemaName;
        if (!schemaName) {
            return res.status(500).json({ message: 'Tenant context not set' });
        }
        // Get user ID from authenticated request
        const userId = req.user.id;
        const sale = yield salesService.createSale(schemaName, stationId, nozzleId, userId, parseFloat(cumulativeReading.toString()), saleVolume ? parseFloat(saleVolume.toString()) : null, cashReceived ? parseFloat(cashReceived.toString()) : 0, creditGiven ? parseFloat(creditGiven.toString()) : 0, creditPartyId || null, notes || null);
        return res.status(201).json(sale);
    }
    catch (error) {
        console.error('Create sale error:', error);
        return res.status(500).json({ message: error.message || 'Failed to create sale' });
    }
});
exports.createSale = createSale;
const getSales = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { stationId, startDate, endDate, userId } = req.query;
        // Get schema name from middleware
        const schemaName = req.schemaName;
        if (!schemaName) {
            return res.status(500).json({ message: 'Tenant context not set' });
        }
        const sales = yield salesService.getSales(schemaName, stationId, startDate, endDate, userId);
        return res.status(200).json(sales);
    }
    catch (error) {
        console.error('Get sales error:', error);
        return res.status(500).json({ message: error.message || 'Failed to get sales' });
    }
});
exports.getSales = getSales;
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
        const totals = yield salesService.getDailySalesTotals(schemaName, stationId, date);
        return res.status(200).json(totals);
    }
    catch (error) {
        console.error('Get daily sales totals error:', error);
        return res.status(500).json({ message: error.message || 'Failed to get daily sales totals' });
    }
});
exports.getDailySalesTotals = getDailySalesTotals;
const voidSale = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        if (!reason) {
            return res.status(400).json({ message: 'Reason for voiding is required' });
        }
        // Get schema name from middleware
        const schemaName = req.schemaName;
        if (!schemaName) {
            return res.status(500).json({ message: 'Tenant context not set' });
        }
        // Get user ID from authenticated request
        const userId = req.user.id;
        const updated = yield salesService.voidSale(schemaName, id, userId, reason);
        if (!updated) {
            return res.status(404).json({ message: 'Sale not found or already voided' });
        }
        return res.status(200).json({ message: 'Sale voided successfully' });
    }
    catch (error) {
        console.error('Void sale error:', error);
        return res.status(500).json({ message: error.message || 'Failed to void sale' });
    }
});
exports.voidSale = voidSale;
