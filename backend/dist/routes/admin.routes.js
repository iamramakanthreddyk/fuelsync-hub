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
const express_1 = require("express");
const superadmin_1 = require("../middlewares/superadmin");
const auditLog_1 = require("../middlewares/auditLog");
const database_1 = __importDefault(require("../config/database")); // Adjust the import based on your project structure
const router = (0, express_1.Router)();
// Apply audit logging middleware to all admin routes
router.use(auditLog_1.auditLog);
// Example admin-only route
router.get('/tenants', superadmin_1.requireSuperAdmin, (req, res) => {
    // TODO: Implement tenant listing
    res.json({ message: 'List of tenants (admin only)' });
});
// Activate or deactivate a user (SuperAdmin only)
router.patch('/users/:userId/activate', superadmin_1.requireSuperAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    const { active } = req.body;
    if (typeof active !== 'boolean') {
        return res.status(400).json({ message: 'Missing or invalid "active" boolean in body.' });
    }
    try {
        // Update user status in the public schema
        yield database_1.default.query('UPDATE public.users SET active = $1 WHERE id = $2', [active, userId]);
        res.json({ message: `User ${active ? 'activated' : 'deactivated'} successfully.` });
    }
    catch (err) {
        console.error('User activation error:', err);
        res.status(500).json({ message: 'Failed to update user status.' });
    }
}));
exports.default = router;
