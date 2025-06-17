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
exports.deleteStation = exports.updateStation = exports.getStationById = exports.getStations = exports.createStation = void 0;
const stationService = __importStar(require("../services/station.service"));
const createStation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, address, city, state, zip, contactPhone, location, operatingHours } = req.body;
        if (!name) {
            return res.status(400).json({ message: 'Station name is required' });
        }
        // Get schema name from middleware
        const schemaName = req.schemaName;
        if (!schemaName) {
            return res.status(500).json({ message: 'Tenant context not set' });
        }
        const station = yield stationService.createStation(schemaName, name, address || '', city || '', state || '', zip || '', contactPhone || '', location || {}, operatingHours || {});
        return res.status(201).json(station);
    }
    catch (error) {
        console.error('Create station error:', error);
        return res.status(500).json({ message: error.message || 'Failed to create station' });
    }
});
exports.createStation = createStation;
const getStations = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get schema name from middleware
        const schemaName = req.schemaName;
        if (!schemaName) {
            return res.status(500).json({ message: 'Tenant context not set' });
        }
        const stations = yield stationService.getStations(schemaName);
        return res.status(200).json(stations);
    }
    catch (error) {
        console.error('Get stations error:', error);
        return res.status(500).json({ message: error.message || 'Failed to get stations' });
    }
});
exports.getStations = getStations;
const getStationById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        // Get schema name from middleware
        const schemaName = req.schemaName;
        if (!schemaName) {
            return res.status(500).json({ message: 'Tenant context not set' });
        }
        const station = yield stationService.getStationById(schemaName, id);
        if (!station) {
            return res.status(404).json({ message: 'Station not found' });
        }
        return res.status(200).json(station);
    }
    catch (error) {
        console.error('Get station error:', error);
        return res.status(500).json({ message: error.message || 'Failed to get station' });
    }
});
exports.getStationById = getStationById;
const updateStation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const updates = req.body;
        // Get schema name from middleware
        const schemaName = req.schemaName;
        if (!schemaName) {
            return res.status(500).json({ message: 'Tenant context not set' });
        }
        const station = yield stationService.updateStation(schemaName, id, updates);
        if (!station) {
            return res.status(404).json({ message: 'Station not found' });
        }
        return res.status(200).json(station);
    }
    catch (error) {
        console.error('Update station error:', error);
        return res.status(500).json({ message: error.message || 'Failed to update station' });
    }
});
exports.updateStation = updateStation;
const deleteStation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        // Get schema name from middleware
        const schemaName = req.schemaName;
        if (!schemaName) {
            return res.status(500).json({ message: 'Tenant context not set' });
        }
        const success = yield stationService.deleteStation(schemaName, id);
        if (!success) {
            return res.status(404).json({ message: 'Station not found' });
        }
        return res.status(204).send();
    }
    catch (error) {
        console.error('Delete station error:', error);
        return res.status(500).json({ message: error.message || 'Failed to delete station' });
    }
});
exports.deleteStation = deleteStation;
