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
exports.getStationsByCity = exports.deleteStation = exports.updateStation = exports.getStationById = exports.getStations = exports.createStation = void 0;
const db_service_1 = require("./db.service");
const createStation = (schemaName, name, address, city, state, zip, contactPhone, location, operatingHours) => __awaiter(void 0, void 0, void 0, function* () {
    return yield (0, db_service_1.insertWithUUID)(schemaName, 'stations', {
        name,
        address,
        city,
        state,
        zip,
        contact_phone: contactPhone,
        location: JSON.stringify(location),
        operating_hours: JSON.stringify(operatingHours)
    }, 'id, name, address, city, state, zip, contact_phone, active, created_at');
});
exports.createStation = createStation;
const getStations = (schemaName) => __awaiter(void 0, void 0, void 0, function* () {
    const query = `
    SELECT id, name, address, city, state, zip, contact_phone, active, created_at, updated_at
    FROM stations
    WHERE active = true
    ORDER BY name`;
    const result = yield (0, db_service_1.executeQuery)(schemaName, query);
    return result.rows;
});
exports.getStations = getStations;
const getStationById = (schemaName, stationId) => __awaiter(void 0, void 0, void 0, function* () {
    const query = `
    SELECT id, name, address, city, state, zip, contact_phone, location, operating_hours, active, created_at, updated_at
    FROM stations
    WHERE id = $1 AND active = true`;
    const result = yield (0, db_service_1.executeQuery)(schemaName, query, [stationId]);
    return result.rows.length > 0 ? result.rows[0] : null;
});
exports.getStationById = getStationById;
const updateStation = (schemaName, stationId, updates) => __awaiter(void 0, void 0, void 0, function* () {
    const setClause = Object.keys(updates)
        .map((key, index) => `${key.replace(/([A-Z])/g, '_$1').toLowerCase()} = $${index + 2}`)
        .join(', ');
    const values = Object.values(updates);
    const query = `
    UPDATE stations
    SET ${setClause}, updated_at = NOW()
    WHERE id = $1 AND active = true
    RETURNING id, name, address, city, state, zip, contact_phone, active, created_at, updated_at`;
    const result = yield (0, db_service_1.executeQuery)(schemaName, query, [stationId, ...values]);
    return result.rows.length > 0 ? result.rows[0] : null;
});
exports.updateStation = updateStation;
const deleteStation = (schemaName, stationId) => __awaiter(void 0, void 0, void 0, function* () {
    const query = `
    UPDATE stations
    SET active = false, deleted_at = NOW(), updated_at = NOW()
    WHERE id = $1 AND active = true
    RETURNING id`;
    const result = yield (0, db_service_1.executeQuery)(schemaName, query, [stationId]);
    return result.rows.length > 0;
});
exports.deleteStation = deleteStation;
const getStationsByCity = (schemaName, city) => __awaiter(void 0, void 0, void 0, function* () {
    const query = `
    SELECT id, name, address, city, state, zip, contact_phone, active, created_at, updated_at
    FROM stations
    WHERE city = $1 AND active = true
    ORDER BY name`;
    const result = yield (0, db_service_1.executeQuery)(schemaName, query, [city]);
    return result.rows;
});
exports.getStationsByCity = getStationsByCity;
