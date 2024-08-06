/**
 * @hidden
 * @packageDocumentation
 */
/**
 * Error to be triggered when receiving a response missing mandatory elements
 */
/**
 * @hidden
 */
export declare class InvalidResponseError extends Error {
    readonly missingFields: string[];
    constructor(missingFields: string[]);
}
