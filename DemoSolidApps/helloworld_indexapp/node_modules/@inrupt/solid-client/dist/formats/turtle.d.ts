import type { Parser } from "../resource/solidDataset";
/**
 * ```{note} This function is still experimental and subject to change, even
 * in a non-major release.
 * ```
 * This returns a parser that transforms a JSON-LD string into a set of RDFJS quads.
 *
 * @returns A Parser object.
 * @since 1.15.0
 */
export declare const getTurtleParser: () => Parser;
