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
export declare class OidcProviderError extends Error {
    readonly error: string;
    readonly errorDescription?: string | undefined;
    constructor(message: string, error: string, errorDescription?: string | undefined);
}
