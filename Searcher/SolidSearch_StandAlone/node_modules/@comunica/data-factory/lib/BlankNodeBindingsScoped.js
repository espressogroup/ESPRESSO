"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlankNodeBindingsScoped = void 0;
/**
 * A blank node that is scoped to a set of bindings.
 */
class BlankNodeBindingsScoped {
    constructor(value) {
        this.termType = 'BlankNode';
        this.singleBindingsScope = true;
        this.value = value;
    }
    equals(other) {
        // eslint-disable-next-line no-implicit-coercion
        return !!other && other.termType === 'BlankNode' && other.value === this.value;
    }
}
exports.BlankNodeBindingsScoped = BlankNodeBindingsScoped;
//# sourceMappingURL=BlankNodeBindingsScoped.js.map