"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
exports.sendError = sendError;
const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    // Handle specific errors
    if (err.code === '23514') { // Check constraint violation
        return res.status(400).json({
            message: 'Data validation error',
            details: err.detail
        });
    }
    // Default error response
    res.status(500).json({
        message: err.message || 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err : undefined
    });
};
exports.errorHandler = errorHandler;
// Standardized error response helper
function sendError(res, status, message, details) {
    return res.status(status).json(Object.assign({ message }, (details ? { details } : {})));
}
