"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinkQueueFifo = void 0;
/**
 * A link queue in FIFO (first-in first-out) order.
 */
class LinkQueueFifo {
    constructor() {
        this.links = [];
    }
    push(link) {
        this.links.push(link);
        return true;
    }
    getSize() {
        return this.links.length;
    }
    isEmpty() {
        return this.links.length === 0;
    }
    pop() {
        return this.links.shift();
    }
    peek() {
        return this.links[0];
    }
}
exports.LinkQueueFifo = LinkQueueFifo;
//# sourceMappingURL=LinkQueueFifo.js.map