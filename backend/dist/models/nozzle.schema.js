"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNozzleSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.createNozzleSchema = joi_1.default.object({
    pumpId: joi_1.default.string().uuid().required(),
    name: joi_1.default.string().min(2).max(100).required(),
    fuelType: joi_1.default.string().valid('diesel', 'petrol', 'other').required(),
    status: joi_1.default.string().valid('active', 'inactive').optional()
});
