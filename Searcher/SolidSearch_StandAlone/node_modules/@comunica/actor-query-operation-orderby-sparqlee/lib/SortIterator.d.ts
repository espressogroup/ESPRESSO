import type { AsyncIterator } from 'asynciterator';
import { TransformIterator } from 'asynciterator';
export declare class SortIterator<T> extends TransformIterator<T, T> {
    private readonly windowLength;
    private readonly sort;
    private readonly sorted;
    constructor(source: AsyncIterator<T>, sort: (left: T, right: T) => number, options?: any);
    _read(count: number, done: () => void): void;
    _flush(done: () => void): void;
}
