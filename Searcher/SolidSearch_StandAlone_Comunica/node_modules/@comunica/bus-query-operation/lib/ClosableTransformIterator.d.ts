import type { AsyncIterator, TransformIteratorOptions } from 'asynciterator';
import { TransformIterator } from 'asynciterator';
declare type MaybePromise<T> = T | Promise<T>;
declare type SourceExpression<T> = MaybePromise<AsyncIterator<T>> | (() => MaybePromise<AsyncIterator<T>>);
/**
 * A TransformIterator with a callback for when this iterator is closed in any way.
 */
export declare class ClosableTransformIterator<S, D = S> extends TransformIterator<S, D> {
    private readonly onClose;
    constructor(source: SourceExpression<S>, options: TransformIteratorOptions<S> & {
        onClose: () => void;
    });
    protected _end(destroy: boolean): void;
}
export {};
