/**
 * @hidden
 * @packageDocumentation
 */
/**
 * An abstract class that will select the first handler that can handle certain parameters
 */
import type IHandleable from "./IHandleable";
/**
 * @hidden
 */
export default class AggregateHandler<P extends Array<unknown>, R> implements IHandleable<P, R> {
    private handleables;
    constructor(handleables: IHandleable<P, R>[]);
    /**
     * Helper function that will asynchronously determine the proper handler to use. If multiple
     * handlers can handle, it will choose the first one in the list
     * @param params Paramerters to feed to the handler
     */
    private getProperHandler;
    canHandle(...params: P): Promise<boolean>;
    handle(...params: P): Promise<R>;
}
