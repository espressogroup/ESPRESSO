"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClosableTransformIterator = void 0;
const asynciterator_1 = require("asynciterator");
/**
 * A TransformIterator with a callback for when this iterator is closed in any way.
 */
class ClosableTransformIterator extends asynciterator_1.TransformIterator {
    constructor(source, options) {
        super(source, options);
        this.onClose = options.onClose;
    }
    _end(destroy) {
        this.onClose();
        super._end(destroy);
    }
}
exports.ClosableTransformIterator = ClosableTransformIterator;
//# sourceMappingURL=ClosableTransformIterator.js.map