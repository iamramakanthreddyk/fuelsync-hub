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
exports.recordNozzleReading = exports.updateNozzle = exports.getNozzleById = exports.getNozzlesByStationId = exports.getNozzlesByPumpId = exports.createNozzle = void 0;
const nozzleService = __importStar(require("../services/nozzle.service"));
const createNozzle = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { pumpId, fuelType, initialReading } = req.body;
        if (!pumpId || !fuelType || initialReading === undefined) {
            return res.status(400).json({ message: 'Pump ID, fuel type, and initial reading are required' });
        }
        // Get schema name from middleware
        const schemaName = req.schemaName;
        if (!schemaName) {
            return res.status(500).json({ message: 'Tenant context not set' });
        }
        const nozzle = yield nozzleService.createNozzle(schemaName, pumpId, fuelType, parseFloat(initialReading.toString()));
        return res.status(201).json(nozzle);
    }
    catch (error) {
        console.error('Create nozzle error:', error);
        return res.status(500).json({ message: error.message || 'Failed to create nozzle' });
    }
});
exports.createNozzle = createNozzle;
const getNozzlesByPumpId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { pumpId } = req.params;
        // Get schema name from middleware
        const schemaName = req.schemaName;
        if (!schemaName) {
            return res.status(500).json({ message: 'Tenant context not set' });
        }
        const nozzles = yield nozzleService.getNozzlesByPumpId(schemaName, pumpId);
        return res.status(200).json(nozzles);
    }
    catch (error) {
        console.error('Get nozzles error:', error);
        return res.status(500).json({ message: error.message || 'Failed to get nozzles' });
    }
});
exports.getNozzlesByPumpId = getNozzlesByPumpId;
const getNozzlesByStationId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { stationId } = req.params;
        // Get schema name from middleware
        const schemaName = req.schemaName;
        if (!schemaName) {
            return res.status(500).json({ message: 'Tenant context not set' });
        }
        const nozzles = yield nozzleService.getNozzlesByStationId(schemaName, stationId);
        return res.status(200).json(nozzles);
    }
    catch (error) {
        console.error('Get nozzles by station error:', error);
        return res.status(500).json({ message: error.message || 'Failed to get nozzles' });
    }
});
exports.getNozzlesByStationId = getNozzlesByStationId;
const getNozzleById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        // Get schema name from middleware
        const schemaName = req.schemaName;
        if (!schemaName) {
            return res.status(500).json({ message: 'Tenant context not set' });
        }
        const nozzle = yield nozzleService.getNozzleById(schemaName, id);
        if (!nozzle) {
            return res.status(404).json({ message: 'Nozzle not found' });
        }
        return res.status(200).json(nozzle);
    }
    catch (error) {
        console.error('Get nozzle error:', error);
        return res.status(500).json({ message: error.message || 'Failed to get nozzle' });
    }
});
exports.getNozzleById = getNozzleById;
const updateNozzle = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const updates = req.body;
        // Get schema name from middleware
        const schemaName = req.schemaName;
        if (!schemaName) {
            return res.status(500).json({ message: 'Tenant context not set' });
        }
        const nozzle = yield nozzleService.updateNozzle(schemaName, id, updates);
        if (!nozzle) {
            return res.status(404).json({ message: 'Nozzle not found' });
        }
        return res.status(200).json(nozzle);
    }
    catch (error) {
        console.error('Update nozzle error:', error);
        return res.status(500).json({ message: error.message || 'Failed to update nozzle' });
    }
});
exports.updateNozzle = updateNozzle;
const recordNozzleReading = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { reading, notes } = req.body;
        if (reading === undefined) {
            return res.status(400).json({ message: 'Reading is required' });
        }
        // Get schema name from middleware
        const schemaName = req.schemaName;
        if (!schemaName) {
            return res.status(500).json({ message: 'Tenant context not set' });
        }
        // Get user ID from authenticated request
        const userId = req.user.id;
        const readingRecord = yield nozzleService.recordNozzleReading(schemaName, id, parseFloat(reading.toString()), userId, notes);
        return res.status(200).json(readingRecord);
    }
    catch (error) {
        console.error('Record nozzle reading error:', error);
        return res.status(500).json({ message: error.message || 'Failed to record nozzle reading' });
    }
});
exports.recordNozzleReading = recordNozzleReading;
