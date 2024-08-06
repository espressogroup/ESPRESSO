import type { SolidDataset } from "../interfaces";
/**
 * A function to serialise a Solid Dataset as Turtle
 *
 * @param dataset The Dataset to serialize as Turtle
 * @param options.prefixes The Prefixes to use for Turtle serialisation (defaulting to a set of well known prefixes)
 * @param options.thing Restricts serialisation to the part of a dataset related to the thing
 * @returns RDF serialised as Turtle
 * @since 1.20.0
 */
export declare function solidDatasetAsTurtle(dataset: SolidDataset, options?: {
    prefixes?: Record<string, string>;
    thing?: string;
}): Promise<string>;
