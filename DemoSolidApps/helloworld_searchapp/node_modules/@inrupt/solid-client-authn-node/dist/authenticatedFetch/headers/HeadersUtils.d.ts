/**
 * @hidden
 * @packageDocumentation
 */
/**
 * @hidden
 * This function feels unnecessarily complicated, but is required in order to
 * have Headers according to type definitions in both Node and browser environments.
 * This might require a fix upstream to be cleaned up.
 *
 * @param headersToFlatten A structure containing headers potentially in several formats
 */
export declare function flattenHeaders(headersToFlatten: Headers | Record<string, string> | string[][] | undefined): Record<string, string>;
