"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggerVoid = void 0;
const types_1 = require("@comunica/types");
/**
 * A logger that voids everything.
 */
class LoggerVoid extends types_1.Logger {
    debug() {
        // Void
    }
    error() {
        // Void
    }
    fatal() {
        // Void
    }
    info() {
        // Void
    }
    trace() {
        // Void
    }
    warn() {
        // Void
    }
}
exports.LoggerVoid = LoggerVoid;
//# sourceMappingURL=LoggerVoid.js.map