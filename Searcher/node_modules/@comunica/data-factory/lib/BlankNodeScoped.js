"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlankNodeScoped = void 0;
/**
 * A blank node that is scoped to a certain source.
 */
class BlankNodeScoped {
    constructor(value, skolemized) {
        this.termType = 'BlankNode';
        this.value = value;
        this.skolemized = skolemized;
    }
    equals(other) {
        // eslint-disable-next-line no-implicit-coercion
        return !!other && other.termType === 'BlankNode' && other.value === this.value;
    }
}
exports.BlankNodeScoped = BlankNodeScoped;
//# sourceMappingURL=BlankNodeScoped.js.map