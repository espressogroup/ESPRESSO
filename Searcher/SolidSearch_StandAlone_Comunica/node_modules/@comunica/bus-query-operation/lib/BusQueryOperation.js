"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusQueryOperation = void 0;
const core_1 = require("@comunica/core");
/**
 * Indexed bus for query operations.
 */
class BusQueryOperation extends core_1.BusIndexed {
    constructor(args) {
        super({
            ...args,
            actorIdentifierFields: ['operationName'],
            actionIdentifierFields: ['operation', 'type'],
        });
    }
}
exports.BusQueryOperation = BusQueryOperation;
//# sourceMappingURL=BusQueryOperation.js.map