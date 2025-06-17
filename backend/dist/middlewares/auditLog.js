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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditLog = auditLog;
const database_1 = __importDefault(require("../config/database"));
function auditLog(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        // Capture response status after response is sent
        const start = Date.now();
        res.on('finish', () => __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                yield database_1.default.query(`INSERT INTO public.audit_logs (user_id, tenant_id, action, route, method, status_code, details, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, now())`, [
                    ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || null,
                    req.tenantId || null,
                    req.method + ' ' + req.originalUrl,
                    ((_b = req.route) === null || _b === void 0 ? void 0 : _b.path) || req.originalUrl,
                    req.method,
                    res.statusCode,
                    JSON.stringify({
                        query: req.query,
                        body: req.body,
                        durationMs: Date.now() - start
                    })
                ]);
            }
            catch (err) {
                // Don't block request on audit log failure
                console.error('Audit log error:', err);
            }
        }));
        next();
    });
}
