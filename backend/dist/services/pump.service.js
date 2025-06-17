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
exports.deletePump = exports.updatePump = exports.getPumpById = exports.getPumpsByStationId = exports.createPump = void 0;
const db_service_1 = require("./db.service");
const createPump = (schemaName, stationId, name, serialNumber, installationDate) => __awaiter(void 0, void 0, void 0, function* () {
    return yield (0, db_service_1.insertWithUUID)(schemaName, 'pumps', {
        station_id: stationId,
        name,
        serial_number: serialNumber,
        installation_date: installationDate
    }, 'id, station_id, name, serial_number, installation_date, active, created_at');
});
exports.createPump = createPump;
const getPumpsByStationId = (schemaName, stationId) => __awaiter(void 0, void 0, void 0, function* () {
    const query = `
    SELECT id, station_id, name, serial_number, installation_date, active, created_at, updated_at
    FROM pumps
    WHERE station_id = $1 AND active = true
    ORDER BY name`;
    const result = yield (0, db_service_1.executeQuery)(schemaName, query, [stationId]);
    return result.rows;
});
exports.getPumpsByStationId = getPumpsByStationId;
const getPumpById = (schemaName, pumpId) => __awaiter(void 0, void 0, void 0, function* () {
    const query = `
    SELECT id, station_id, name, serial_number, installation_date, active, created_at, updated_at
    FROM pumps
    WHERE id = $1 AND active = true`;
    const result = yield (0, db_service_1.executeQuery)(schemaName, query, [pumpId]);
    return result.rows.length > 0 ? result.rows[0] : null;
});
exports.getPumpById = getPumpById;
const updatePump = (schemaName, pumpId, updates) => __awaiter(void 0, void 0, void 0, function* () {
    const setClause = Object.keys(updates)
        .map((key, index) => `${key.replace(/([A-Z])/g, '_$1').toLowerCase()} = $${index + 2}`)
        .join(', ');
    const values = Object.values(updates);
    const query = `
    UPDATE pumps
    SET ${setClause}, updated_at = NOW()
    WHERE id = $1 AND active = true
    RETURNING id, station_id, name, serial_number, installation_date, active, created_at, updated_at`;
    const result = yield (0, db_service_1.executeQuery)(schemaName, query, [pumpId, ...values]);
    return result.rows.length > 0 ? result.rows[0] : null;
});
exports.updatePump = updatePump;
const deletePump = (schemaName, pumpId) => __awaiter(void 0, void 0, void 0, function* () {
    const query = `
    UPDATE pumps
    SET active = false, deleted_at = NOW(), updated_at = NOW()
    WHERE id = $1 AND active = true
    RETURNING id`;
    const result = yield (0, db_service_1.executeQuery)(schemaName, query, [pumpId]);
    return result.rows.length > 0;
});
exports.deletePump = deletePump;
