"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinkQueueWrapper = void 0;
/**
 * A link queue that wraps a given link queue.
 */
class LinkQueueWrapper {
    constructor(linkQueue) {
        this.linkQueue = linkQueue;
    }
    push(link, parent) {
        return this.linkQueue.push(link, parent);
    }
    getSize() {
        return this.linkQueue.getSize();
    }
    isEmpty() {
        return this.linkQueue.isEmpty();
    }
    pop() {
        return this.linkQueue.pop();
    }
    peek() {
        return this.linkQueue.peek();
    }
}
exports.LinkQueueWrapper = LinkQueueWrapper;
//# sourceMappingURL=LinkQueueWrapper.js.map