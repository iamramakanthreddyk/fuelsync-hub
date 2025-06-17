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
exports.deletePump = exports.updatePump = exports.getPumpById = exports.getPumpsByStationId = exports.createPump = void 0;
const pumpService = __importStar(require("../services/pump.service"));
const createPump = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { stationId, name, serialNumber, installationDate } = req.body;
        if (!stationId || !name) {
            return res.status(400).json({ message: 'Station ID and name are required' });
        }
        // Get schema name from middleware
        const schemaName = req.schemaName;
        if (!schemaName) {
            return res.status(500).json({ message: 'Tenant context not set' });
        }
        const pump = yield pumpService.createPump(schemaName, stationId, name, serialNumber || '', installationDate || null);
        return res.status(201).json(pump);
    }
    catch (error) {
        console.error('Create pump error:', error);
        return res.status(500).json({ message: error.message || 'Failed to create pump' });
    }
});
exports.createPump = createPump;
const getPumpsByStationId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { stationId } = req.params;
        // Get schema name from middleware
        const schemaName = req.schemaName;
        if (!schemaName) {
            return res.status(500).json({ message: 'Tenant context not set' });
        }
        const pumps = yield pumpService.getPumpsByStationId(schemaName, stationId);
        return res.status(200).json(pumps);
    }
    catch (error) {
        console.error('Get pumps error:', error);
        return res.status(500).json({ message: error.message || 'Failed to get pumps' });
    }
});
exports.getPumpsByStationId = getPumpsByStationId;
const getPumpById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        // Get schema name from middleware
        const schemaName = req.schemaName;
        if (!schemaName) {
            return res.status(500).json({ message: 'Tenant context not set' });
        }
        const pump = yield pumpService.getPumpById(schemaName, id);
        if (!pump) {
            return res.status(404).json({ message: 'Pump not found' });
        }
        return res.status(200).json(pump);
    }
    catch (error) {
        console.error('Get pump error:', error);
        return res.status(500).json({ message: error.message || 'Failed to get pump' });
    }
});
exports.getPumpById = getPumpById;
const updatePump = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const updates = req.body;
        // Get schema name from middleware
        const schemaName = req.schemaName;
        if (!schemaName) {
            return res.status(500).json({ message: 'Tenant context not set' });
        }
        const pump = yield pumpService.updatePump(schemaName, id, updates);
        if (!pump) {
            return res.status(404).json({ message: 'Pump not found' });
        }
        return res.status(200).json(pump);
    }
    catch (error) {
        console.error('Update pump error:', error);
        return res.status(500).json({ message: error.message || 'Failed to update pump' });
    }
});
exports.updatePump = updatePump;
const deletePump = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        // Get schema name from middleware
        const schemaName = req.schemaName;
        if (!schemaName) {
            return res.status(500).json({ message: 'Tenant context not set' });
        }
        const success = yield pumpService.deletePump(schemaName, id);
        if (!success) {
            return res.status(404).json({ message: 'Pump not found' });
        }
        return res.status(204).send();
    }
    catch (error) {
        console.error('Delete pump error:', error);
        return res.status(500).json({ message: error.message || 'Failed to delete pump' });
    }
});
exports.deletePump = deletePump;
